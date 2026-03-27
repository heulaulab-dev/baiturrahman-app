package handlers

import (
	"net/http"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReorderStrukturRequest struct {
	Items []struct {
		ID          string `json:"id" binding:"required"`
		DisplayOrder int    `json:"display_order" binding:"required"`
	} `json:"items" binding:"required"`
}

func (h *Handler) GetStrukturs(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var strukturs []models.Struktur
	var total int64

	query := h.DB.Model(&models.Struktur{})

	query.Count(&total)
	query.Preload("Creator").
		Order("display_order ASC").
		Offset(offset).
		Limit(limit).
		Find(&strukturs)

	utils.PaginatedSuccessResponse(c, strukturs, page, limit, total)
}

func (h *Handler) GetStrukturByID(c *gin.Context) {
	id := c.Param("id")
	var struktur models.Struktur

	if err := h.DB.Preload("Creator").Where("id = ?", id).First(&struktur).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Struktur not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, struktur, "")
}

func (h *Handler) CreateStruktur(c *gin.Context) {
	var struktur models.Struktur
	if err := c.ShouldBindJSON(&struktur); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("userID")
	struktur.CreatedBy = userID.(uuid.UUID)

	if err := h.DB.Create(&struktur).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create struktur")
		return
	}

	h.DB.Preload("Creator").First(&struktur, struktur.ID)
	utils.SuccessResponse(c, http.StatusCreated, struktur, "Struktur created successfully")
}

func (h *Handler) UpdateStruktur(c *gin.Context) {
	id := c.Param("id")
	var struktur models.Struktur

	if err := h.DB.First(&struktur, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Struktur not found")
		return
	}

	if err := c.ShouldBindJSON(&struktur); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Save(&struktur).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update struktur")
		return
	}

	h.DB.Preload("Creator").First(&struktur, struktur.ID)
	utils.SuccessResponse(c, http.StatusOK, struktur, "Struktur updated successfully")
}

func (h *Handler) DeleteStruktur(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.Struktur{}, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete struktur")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Struktur deleted successfully")
}

func (h *Handler) ReorderStrukturs(c *gin.Context) {
	var req ReorderStrukturRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	for _, item := range req.Items {
		h.DB.Model(&models.Struktur{}).Where("id = ?", item.ID).Update("display_order", item.DisplayOrder)
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Strukturs reordered successfully")
}

func (h *Handler) ToggleStrukturStatus(c *gin.Context) {
	id := c.Param("id")
	var struktur models.Struktur

	if err := h.DB.First(&struktur, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Struktur not found")
		return
	}

	// Toggle status
	if struktur.IsActive {
		struktur.IsActive = false
	} else {
		struktur.IsActive = true
	}

	if err := h.DB.Save(&struktur).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to toggle struktur status")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, struktur, "Struktur status updated successfully")
}

func (h *Handler) GetPublicStrukturs(c *gin.Context) {
	// Public endpoint to get active strukturs
	var strukturs []models.Struktur

	h.DB.Model(&models.Struktur{}).
		Where("is_active = ?", true).
		Order("display_order ASC").
		Find(&strukturs)

	utils.SuccessResponse(c, http.StatusOK, strukturs, "")
}

func (h *Handler) GetActiveStruktursCount(c *gin.Context) {
	// Returns count of active strukturs for dashboard
	var count int64

	h.DB.Model(&models.Struktur{}).
		Where("is_active = ?", true).
		Count(&count)

	utils.SuccessResponse(c, http.StatusOK, count, "")
}
