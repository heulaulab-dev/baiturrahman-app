package handlers

import (
	"net/http"
	"time"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *Handler) CreateDonation(c *gin.Context) {
	var donation models.Donation
	if err := c.ShouldBindJSON(&donation); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Generate donation code
	donation.DonationCode = services.GenerateDonationCode()

	if err := h.DB.Create(&donation).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create donation")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, donation, "Donation submitted successfully")
}

func (h *Handler) GetDonations(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var donations []models.Donation
	var total int64

	query := h.DB.Model(&models.Donation{})

	// Filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if from := c.Query("from"); from != "" {
		if date, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("created_at >= ?", date)
		}
	}
	if to := c.Query("to"); to != "" {
		if date, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("created_at <= ?", date.Add(24*time.Hour))
		}
	}

	query.Count(&total)
	query.Preload("PaymentMethod").Preload("Confirmer").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&donations)

	utils.PaginatedSuccessResponse(c, donations, page, limit, total)
}

func (h *Handler) ConfirmDonation(c *gin.Context) {
	id := c.Param("id")
	var donation models.Donation

	if err := h.DB.First(&donation, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Donation not found")
		return
	}

	userID, _ := c.Get("userID")
	userUUID := userID.(uuid.UUID)
	now := time.Now()
	donation.Status = models.DonationStatusConfirmed
	donation.ConfirmedBy = &userUUID
	donation.ConfirmedAt = &now

	if err := h.DB.Save(&donation).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to confirm donation")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, donation, "Donation confirmed successfully")
}

func (h *Handler) GetDonationStats(c *gin.Context) {
	stats, err := services.GetDonationStats(h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get donation statistics")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, stats, "")
}

func (h *Handler) ExportDonations(c *gin.Context) {
	_ = c.DefaultQuery("format", "excel") // TODO: Use format when implementing export
	// TODO: Implement export functionality
	utils.ErrorResponse(c, http.StatusNotImplemented, "Export functionality not yet implemented")
}

