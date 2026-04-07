package handlers

import (
	"net/http"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *Handler) GetKhutbahs(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var khutbahs []models.Khutbah
	var total int64

	query := h.DB.Model(&models.Khutbah{})

	// Admin list: all statuses unless filtered
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Preload("Creator").
		Order("date DESC").
		Offset(offset).
		Limit(limit).
		Find(&khutbahs)

	utils.PaginatedSuccessResponse(c, khutbahs, page, limit, total)
}

func (h *Handler) GetLatestKhutbah(c *gin.Context) {
	var khutbah models.Khutbah

	// Get the latest published khutbah (by date, descending)
	if err := h.DB.Where("status = ?", models.KhutbahStatusPublished).
		Order("date DESC").
		First(&khutbah).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "No khutbah found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, khutbah, "")
}

func (h *Handler) GetKhutbahByID(c *gin.Context) {
	id := c.Param("id")
	var khutbah models.Khutbah

	if err := h.DB.Preload("Creator").Where("id = ?", id).First(&khutbah).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Khutbah not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, khutbah, "")
}

func (h *Handler) CreateKhutbah(c *gin.Context) {
	var khutbah models.Khutbah
	if err := c.ShouldBindJSON(&khutbah); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("userID")
	khutbah.CreatedBy = userID.(uuid.UUID)

	if err := h.DB.Create(&khutbah).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create khutbah")
		return
	}

	h.DB.Preload("Creator").First(&khutbah, khutbah.ID)
	utils.SuccessResponse(c, http.StatusCreated, khutbah, "Khutbah created successfully")
}

func (h *Handler) UpdateKhutbah(c *gin.Context) {
	id := c.Param("id")
	var khutbah models.Khutbah

	if err := h.DB.First(&khutbah, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Khutbah not found")
		return
	}

	if err := c.ShouldBindJSON(&khutbah); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Save(&khutbah).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update khutbah")
		return
	}

	h.DB.Preload("Creator").First(&khutbah, khutbah.ID)
	utils.SuccessResponse(c, http.StatusOK, khutbah, "Khutbah updated successfully")
}

func (h *Handler) DeleteKhutbah(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.Khutbah{}, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete khutbah")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Khutbah deleted successfully")
}

func (h *Handler) ToggleKhutbahStatus(c *gin.Context) {
	id := c.Param("id")
	var khutbah models.Khutbah

	if err := h.DB.First(&khutbah, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Khutbah not found")
		return
	}

	// Toggle status
	if khutbah.Status == models.KhutbahStatusPublished {
		khutbah.Status = models.KhutbahStatusDraft
	} else {
		khutbah.Status = models.KhutbahStatusPublished
	}

	if err := h.DB.Save(&khutbah).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to toggle khutbah status")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, khutbah, "Khutbah status updated successfully")
}

func (h *Handler) GetKhutbahArchive(c *gin.Context) {
	// Get khutbahs for archive (published, excluding latest)
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var khutbahs []models.Khutbah
	var total int64

	query := h.DB.Model(&models.Khutbah{}).
		Where("status = ?", models.KhutbahStatusPublished)

	// Exclude latest khutbah
	var latestKhutbah models.Khutbah
	if err := query.Order("date DESC").First(&latestKhutbah).Error; err == nil {
		query = query.Where("id != ?", latestKhutbah.ID)
	}

	query.Count(&total)
	query.Order("date DESC").
		Offset(offset).
		Limit(limit).
		Find(&khutbahs)

	utils.PaginatedSuccessResponse(c, khutbahs, page, limit, total)
}

func (h *Handler) GetKhutbahByDate(c *gin.Context) {
	dateStr := c.Query("date")
	if dateStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Date parameter is required")
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD")
		return
	}

	var khutbah models.Khutbah

	// Find khutbah for the specific date
	if err := h.DB.Where("date = ? AND status = ?", date, models.KhutbahStatusPublished).
		Preload("Creator").
		First(&khutbah).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Khutbah not found for this date")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, khutbah, "")
}
