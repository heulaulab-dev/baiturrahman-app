package handlers

import (
	"net/http"
	"strings"
	"time"

	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type reorderSponsorsRequest struct {
	Items []struct {
		ID        string `json:"id" binding:"required"`
		SortOrder int    `json:"sort_order" binding:"required"`
	} `json:"items" binding:"required"`
}

// publicSponsorResponse is returned from public APIs (no contract dates).
type publicSponsorResponse struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	LogoURL         string  `json:"logo_url"`
	WebsiteURL      string  `json:"website_url"`
	Description     string  `json:"description"`
	VisibilityStart *string `json:"visibility_start"`
	VisibilityEnd   *string `json:"visibility_end"`
	ShowOnLanding   bool    `json:"show_on_landing"`
	SortOrder       int     `json:"sort_order"`
	CreatedAt       string  `json:"created_at"`
}

func formatDatePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := utils.JakartaCalendarDate(*t).Format("2006-01-02")
	return &s
}

func sponsorToPublic(s models.Sponsor) publicSponsorResponse {
	return publicSponsorResponse{
		ID:              s.ID.String(),
		Name:            s.Name,
		LogoURL:         s.LogoURL,
		WebsiteURL:      s.WebsiteURL,
		Description:     s.Description,
		VisibilityStart: formatDatePtr(s.VisibilityStart),
		VisibilityEnd:   formatDatePtr(s.VisibilityEnd),
		ShowOnLanding:   s.ShowOnLanding,
		SortOrder:       s.SortOrder,
		CreatedAt:       s.CreatedAt.UTC().Format(time.RFC3339),
	}
}

func parseOptionalDateString(s *string) (*time.Time, error) {
	if s == nil {
		return nil, nil
	}
	t := strings.TrimSpace(*s)
	if t == "" {
		return nil, nil
	}
	pt, err := time.ParseInLocation("2006-01-02", t, utils.AsiaJakarta)
	if err != nil {
		return nil, err
	}
	return &pt, nil
}

func validateSponsorDateRanges(visStart, visEnd, conStart, conEnd *time.Time) string {
	if visEnd != nil {
		if visStart == nil {
			return "Tanggal akhir visibilitas memerlukan tanggal mulai"
		}
		if utils.JakartaCalendarDate(*visEnd).Before(utils.JakartaCalendarDate(*visStart)) {
			return "Tanggal akhir visibilitas harus sama atau setelah tanggal mulai"
		}
	}
	if conEnd != nil {
		if conStart == nil {
			return "Tanggal akhir kontrak memerlukan tanggal mulai"
		}
		if utils.JakartaCalendarDate(*conEnd).Before(utils.JakartaCalendarDate(*conStart)) {
			return "Tanggal akhir kontrak harus sama atau setelah tanggal mulai"
		}
	}
	return ""
}

// GetPublicSponsors returns sponsors visible to the public today (Asia/Jakarta).
// Query for_landing=1 limits to show_on_landing.
func (h *Handler) GetPublicSponsors(c *gin.Context) {
	landingOnly := c.Query("for_landing") == "1" || strings.EqualFold(c.Query("landing"), "true")

	var rows []models.Sponsor
	if err := h.DB.Order("sort_order ASC, created_at ASC").Find(&rows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load sponsors")
		return
	}

	now := time.Now()
	out := make([]publicSponsorResponse, 0, len(rows))
	for _, s := range rows {
		if !utils.PublicSponsorVisible(s.VisibilityStart, s.VisibilityEnd, now) {
			continue
		}
		if landingOnly && !s.ShowOnLanding {
			continue
		}
		out = append(out, sponsorToPublic(s))
	}
	utils.SuccessResponse(c, http.StatusOK, out, "")
}

// GetAdminSponsors returns all sponsors for the dashboard.
func (h *Handler) GetAdminSponsors(c *gin.Context) {
	var rows []models.Sponsor
	if err := h.DB.Order("sort_order ASC, created_at ASC").Find(&rows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load sponsors")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, rows, "")
}

func (h *Handler) CreateSponsor(c *gin.Context) {
	var body struct {
		Name            string  `json:"name" binding:"required"`
		LogoURL         string  `json:"logo_url"`
		WebsiteURL      string  `json:"website_url"`
		Description     string  `json:"description"`
		VisibilityStart *string `json:"visibility_start"`
		VisibilityEnd   *string `json:"visibility_end"`
		ContractStart   *string `json:"contract_start"`
		ContractEnd     *string `json:"contract_end"`
		ShowOnLanding   *bool   `json:"show_on_landing"`
		SortOrder       *int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	name := strings.TrimSpace(body.Name)
	if name == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Nama wajib diisi")
		return
	}

	vs, err := parseOptionalDateString(body.VisibilityStart)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal visibilitas mulai tidak valid (YYYY-MM-DD)")
		return
	}
	ve, err := parseOptionalDateString(body.VisibilityEnd)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal visibilitas akhir tidak valid (YYYY-MM-DD)")
		return
	}
	cs, err := parseOptionalDateString(body.ContractStart)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal kontrak mulai tidak valid (YYYY-MM-DD)")
		return
	}
	ce, err := parseOptionalDateString(body.ContractEnd)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal kontrak akhir tidak valid (YYYY-MM-DD)")
		return
	}
	if msg := validateSponsorDateRanges(vs, ve, cs, ce); msg != "" {
		utils.ErrorResponse(c, http.StatusBadRequest, msg)
		return
	}

	var cnt int64
	if err := h.DB.Model(&models.Sponsor{}).Count(&cnt).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menghitung sponsor")
		return
	}

	sp := models.Sponsor{
		Name:            name,
		LogoURL:         strings.TrimSpace(body.LogoURL),
		WebsiteURL:      strings.TrimSpace(body.WebsiteURL),
		Description:     strings.TrimSpace(body.Description),
		VisibilityStart: vs,
		VisibilityEnd:   ve,
		ContractStart:   cs,
		ContractEnd:     ce,
	}
	if body.SortOrder != nil {
		sp.SortOrder = *body.SortOrder
	} else {
		sp.SortOrder = int(cnt)
	}
	if body.ShowOnLanding != nil {
		sp.ShowOnLanding = *body.ShowOnLanding
	}

	if err := h.DB.Create(&sp).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal membuat sponsor")
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, sp, "Sponsor dibuat")
}

func (h *Handler) UpdateSponsor(c *gin.Context) {
	id := c.Param("id")
	var existing models.Sponsor
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Sponsor tidak ditemukan")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memuat sponsor")
		return
	}

	var body struct {
		Name            *string `json:"name"`
		LogoURL         *string `json:"logo_url"`
		WebsiteURL      *string `json:"website_url"`
		Description     *string `json:"description"`
		VisibilityStart *string `json:"visibility_start"`
		VisibilityEnd   *string `json:"visibility_end"`
		ContractStart   *string `json:"contract_start"`
		ContractEnd     *string `json:"contract_end"`
		ShowOnLanding   *bool   `json:"show_on_landing"`
		SortOrder       *int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if body.Name != nil {
		n := strings.TrimSpace(*body.Name)
		if n == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "Nama wajib diisi")
			return
		}
		existing.Name = n
	}
	if body.LogoURL != nil {
		existing.LogoURL = strings.TrimSpace(*body.LogoURL)
	}
	if body.WebsiteURL != nil {
		existing.WebsiteURL = strings.TrimSpace(*body.WebsiteURL)
	}
	if body.Description != nil {
		existing.Description = strings.TrimSpace(*body.Description)
	}
	if body.ShowOnLanding != nil {
		existing.ShowOnLanding = *body.ShowOnLanding
	}
	if body.SortOrder != nil {
		existing.SortOrder = *body.SortOrder
	}

	apply := func(target **time.Time, raw *string) error {
		if raw == nil {
			return nil
		}
		if strings.TrimSpace(*raw) == "" {
			*target = nil
			return nil
		}
		pt, err := time.ParseInLocation("2006-01-02", strings.TrimSpace(*raw), utils.AsiaJakarta)
		if err != nil {
			return err
		}
		*target = &pt
		return nil
	}

	if err := apply(&existing.VisibilityStart, body.VisibilityStart); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal visibilitas mulai tidak valid")
		return
	}
	if err := apply(&existing.VisibilityEnd, body.VisibilityEnd); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal visibilitas akhir tidak valid")
		return
	}
	if err := apply(&existing.ContractStart, body.ContractStart); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal kontrak mulai tidak valid")
		return
	}
	if err := apply(&existing.ContractEnd, body.ContractEnd); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Format tanggal kontrak akhir tidak valid")
		return
	}

	if msg := validateSponsorDateRanges(existing.VisibilityStart, existing.VisibilityEnd, existing.ContractStart, existing.ContractEnd); msg != "" {
		utils.ErrorResponse(c, http.StatusBadRequest, msg)
		return
	}

	if err := h.DB.Save(&existing).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal memperbarui sponsor")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, existing, "Sponsor diperbarui")
}

func (h *Handler) DeleteSponsor(c *gin.Context) {
	id := c.Param("id")
	res := h.DB.Delete(&models.Sponsor{}, "id = ?", id)
	if res.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal menghapus sponsor")
		return
	}
	if res.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Sponsor tidak ditemukan")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Sponsor dihapus")
}

func (h *Handler) ReorderSponsors(c *gin.Context) {
	var req reorderSponsorsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	for _, it := range req.Items {
		if _, err := uuid.Parse(it.ID); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "ID tidak valid")
			return
		}
		if err := h.DB.Model(&models.Sponsor{}).Where("id = ?", it.ID).Update("sort_order", it.SortOrder).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengubah urutan")
			return
		}
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Urutan sponsor diperbarui")
}
