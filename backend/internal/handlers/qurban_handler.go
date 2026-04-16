package handlers

import (
	"errors"
	"net/http"
	"strings"

	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type qurbanAnimalResponse struct {
	models.QurbanAnimal
	ParticipantCount int64 `json:"participant_count"`
	EffectiveMax     int   `json:"effective_max_participants"`
}

func normalizeAnimalType(value string) models.QurbanAnimalType {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case string(models.QurbanAnimalTypeSapi):
		return models.QurbanAnimalTypeSapi
	case string(models.QurbanAnimalTypeKambing):
		return models.QurbanAnimalTypeKambing
	default:
		return models.QurbanAnimalType("")
	}
}

func ensureQurbanSetting(tx *gorm.DB) (models.QurbanSetting, error) {
	var setting models.QurbanSetting
	err := tx.First(&setting).Error
	if err == nil {
		return setting, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return setting, err
	}

	setting = models.QurbanSetting{
		DefaultMaxParticipantsSapi:    7,
		DefaultMaxParticipantsKambing: 1,
	}
	if err := tx.Create(&setting).Error; err != nil {
		return setting, err
	}
	return setting, nil
}

func effectiveCapacity(setting models.QurbanSetting, animal models.QurbanAnimal) int {
	if animal.MaxParticipantsOverride != nil && *animal.MaxParticipantsOverride > 0 {
		return *animal.MaxParticipantsOverride
	}
	if animal.AnimalType == models.QurbanAnimalTypeKambing {
		return setting.DefaultMaxParticipantsKambing
	}
	return setting.DefaultMaxParticipantsSapi
}

func (h *Handler) GetQurbanSettings(c *gin.Context) {
	setting, err := ensureQurbanSetting(h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil pengaturan qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, setting, "")
}

func (h *Handler) UpdateQurbanSettings(c *gin.Context) {
	var payload struct {
		DefaultMaxParticipantsSapi    int `json:"default_max_participants_sapi"`
		DefaultMaxParticipantsKambing int `json:"default_max_participants_kambing"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	if payload.DefaultMaxParticipantsSapi <= 0 || payload.DefaultMaxParticipantsKambing <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Kapasitas default harus lebih besar dari 0")
		return
	}

	setting, err := ensureQurbanSetting(h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memuat pengaturan qurban")
		return
	}
	setting.DefaultMaxParticipantsSapi = payload.DefaultMaxParticipantsSapi
	setting.DefaultMaxParticipantsKambing = payload.DefaultMaxParticipantsKambing

	if err := h.DB.Save(&setting).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menyimpan pengaturan qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, setting, "Pengaturan qurban diperbarui")
}

func (h *Handler) GetQurbanAnimals(c *gin.Context) {
	setting, err := ensureQurbanSetting(h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memuat pengaturan qurban")
		return
	}

	var animals []models.QurbanAnimal
	if err := h.DB.Order("created_at ASC").Find(&animals).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil daftar hewan qurban")
		return
	}

	responses := make([]qurbanAnimalResponse, 0, len(animals))
	for _, animal := range animals {
		var count int64
		if err := h.DB.Model(&models.QurbanParticipant{}).Where("qurban_animal_id = ?", animal.ID).Count(&count).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menghitung peserta qurban")
			return
		}
		responses = append(responses, qurbanAnimalResponse{
			QurbanAnimal:     animal,
			ParticipantCount: count,
			EffectiveMax:     effectiveCapacity(setting, animal),
		})
	}

	utils.SuccessResponse(c, http.StatusOK, responses, "")
}

func (h *Handler) CreateQurbanAnimal(c *gin.Context) {
	var payload struct {
		Label                   string `json:"label" binding:"required"`
		AnimalType              string `json:"animal_type" binding:"required"`
		MaxParticipantsOverride *int   `json:"max_participants_override"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	animalType := normalizeAnimalType(payload.AnimalType)
	if animalType == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "animal_type harus sapi atau kambing")
		return
	}
	label := strings.TrimSpace(payload.Label)
	if label == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Label hewan wajib diisi")
		return
	}
	if payload.MaxParticipantsOverride != nil && *payload.MaxParticipantsOverride <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Override kapasitas harus lebih besar dari 0")
		return
	}

	animal := models.QurbanAnimal{
		Label:                   label,
		AnimalType:              animalType,
		MaxParticipantsOverride: payload.MaxParticipantsOverride,
	}
	if err := h.DB.Create(&animal).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal membuat data hewan qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, animal, "Hewan qurban berhasil ditambahkan")
}

func (h *Handler) UpdateQurbanAnimal(c *gin.Context) {
	id := c.Param("id")
	var animal models.QurbanAnimal
	if err := h.DB.First(&animal, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Hewan qurban tidak ditemukan")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memuat data hewan qurban")
		return
	}

	var payload struct {
		Label                   *string `json:"label"`
		AnimalType              *string `json:"animal_type"`
		MaxParticipantsOverride *int    `json:"max_participants_override"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if payload.Label != nil {
		label := strings.TrimSpace(*payload.Label)
		if label == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "Label hewan wajib diisi")
			return
		}
		animal.Label = label
	}
	if payload.AnimalType != nil {
		animalType := normalizeAnimalType(*payload.AnimalType)
		if animalType == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "animal_type harus sapi atau kambing")
			return
		}
		animal.AnimalType = animalType
	}
	if payload.MaxParticipantsOverride != nil {
		if *payload.MaxParticipantsOverride <= 0 {
			utils.ErrorResponse(c, http.StatusBadRequest, "Override kapasitas harus lebih besar dari 0")
			return
		}
		var currentCount int64
		if err := h.DB.Model(&models.QurbanParticipant{}).Where("qurban_animal_id = ?", animal.ID).Count(&currentCount).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memvalidasi jumlah peserta")
			return
		}
		if int64(*payload.MaxParticipantsOverride) < currentCount {
			utils.ErrorResponse(c, http.StatusBadRequest, "Kapasitas tidak boleh kurang dari jumlah peserta saat ini")
			return
		}
		animal.MaxParticipantsOverride = payload.MaxParticipantsOverride
	}

	if err := h.DB.Save(&animal).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memperbarui data hewan qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, animal, "Hewan qurban berhasil diperbarui")
}

func (h *Handler) DeleteQurbanAnimal(c *gin.Context) {
	id := c.Param("id")

	var count int64
	if err := h.DB.Model(&models.QurbanParticipant{}).Where("qurban_animal_id = ?", id).Count(&count).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memeriksa peserta qurban")
		return
	}
	if count > 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "Hewan tidak bisa dihapus karena masih memiliki peserta")
		return
	}

	res := h.DB.Delete(&models.QurbanAnimal{}, "id = ?", id)
	if res.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menghapus hewan qurban")
		return
	}
	if res.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Hewan qurban tidak ditemukan")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Hewan qurban berhasil dihapus")
}

func (h *Handler) GetQurbanParticipants(c *gin.Context) {
	animalID := c.Param("animalId")
	var participants []models.QurbanParticipant
	if err := h.DB.Where("qurban_animal_id = ?", animalID).Order("created_at ASC").Find(&participants).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengambil peserta qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, participants, "")
}

func (h *Handler) CreateQurbanParticipant(c *gin.Context) {
	animalID := c.Param("animalId")
	var payload struct {
		Name  string `json:"name" binding:"required"`
		Phone string `json:"phone"`
		Notes string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	name := strings.TrimSpace(payload.Name)
	if name == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Nama peserta wajib diisi")
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		setting, err := ensureQurbanSetting(tx)
		if err != nil {
			return err
		}

		var animal models.QurbanAnimal
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&animal, "id = ?", animalID).Error; err != nil {
			return err
		}

		var duplicate int64
		if err := tx.Model(&models.QurbanParticipant{}).
			Where("qurban_animal_id = ? AND LOWER(name) = LOWER(?)", animal.ID, name).
			Count(&duplicate).Error; err != nil {
			return err
		}
		if duplicate > 0 {
			return errors.New("Peserta dengan nama yang sama sudah terdaftar di hewan ini")
		}

		var currentCount int64
		if err := tx.Model(&models.QurbanParticipant{}).Where("qurban_animal_id = ?", animal.ID).Count(&currentCount).Error; err != nil {
			return err
		}
		maxParticipants := effectiveCapacity(setting, animal)
		if currentCount >= int64(maxParticipants) {
			return errors.New("Slot hewan ini sudah penuh")
		}

		p := models.QurbanParticipant{
			QurbanAnimalID: animal.ID,
			Name:           name,
			Phone:          strings.TrimSpace(payload.Phone),
			Notes:          strings.TrimSpace(payload.Notes),
		}
		return tx.Create(&p).Error
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Hewan qurban tidak ditemukan")
			return
		}
		if strings.Contains(err.Error(), "penuh") || strings.Contains(err.Error(), "sama") {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menambah peserta qurban")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, nil, "Peserta qurban berhasil ditambahkan")
}

func (h *Handler) UpdateQurbanParticipant(c *gin.Context) {
	id := c.Param("id")
	var participant models.QurbanParticipant
	if err := h.DB.First(&participant, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Peserta qurban tidak ditemukan")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memuat data peserta")
		return
	}

	var payload struct {
		Name  *string `json:"name"`
		Phone *string `json:"phone"`
		Notes *string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if payload.Name != nil {
		name := strings.TrimSpace(*payload.Name)
		if name == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "Nama peserta wajib diisi")
			return
		}
		participant.Name = name
	}
	if payload.Phone != nil {
		participant.Phone = strings.TrimSpace(*payload.Phone)
	}
	if payload.Notes != nil {
		participant.Notes = strings.TrimSpace(*payload.Notes)
	}

	if err := h.DB.Save(&participant).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memperbarui peserta qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, participant, "Peserta qurban berhasil diperbarui")
}

func (h *Handler) MoveQurbanParticipant(c *gin.Context) {
	id := c.Param("id")
	var payload struct {
		TargetAnimalID string `json:"target_animal_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		setting, err := ensureQurbanSetting(tx)
		if err != nil {
			return err
		}

		var participant models.QurbanParticipant
		if err := tx.First(&participant, "id = ?", id).Error; err != nil {
			return err
		}

		var target models.QurbanAnimal
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&target, "id = ?", payload.TargetAnimalID).Error; err != nil {
			return err
		}

		var count int64
		if err := tx.Model(&models.QurbanParticipant{}).Where("qurban_animal_id = ?", target.ID).Count(&count).Error; err != nil {
			return err
		}
		if count >= int64(effectiveCapacity(setting, target)) {
			return errors.New("Hewan tujuan sudah penuh")
		}

		participant.QurbanAnimalID = target.ID
		return tx.Save(&participant).Error
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Data tidak ditemukan")
			return
		}
		if strings.Contains(err.Error(), "penuh") {
			utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memindahkan peserta qurban")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Peserta qurban berhasil dipindahkan")
}

func (h *Handler) DeleteQurbanParticipant(c *gin.Context) {
	id := c.Param("id")
	res := h.DB.Delete(&models.QurbanParticipant{}, "id = ?", id)
	if res.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menghapus peserta qurban")
		return
	}
	if res.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Peserta qurban tidak ditemukan")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Peserta qurban berhasil dihapus")
}
