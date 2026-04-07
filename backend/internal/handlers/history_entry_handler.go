package handlers

import (
	"net/http"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (h *Handler) GetHistoryEntries(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var entries []models.HistoryEntry
	var total int64

	query := h.DB.Model(&models.HistoryEntry{})

	// Filters
	if status := c.Query("status"); status != "" {
		query = query.Where("is_published = ?", status == "published")
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	query.Preload("Creator").
		Order("entry_date DESC").
		Offset(offset).
		Limit(limit).
		Find(&entries)

	utils.PaginatedSuccessResponse(c, entries, page, limit, total)
}

// GetPublishedEntries returns only published history entries (for public timeline)
func (h *Handler) GetPublishedEntries(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var entries []models.HistoryEntry
	var total int64

	query := h.DB.Model(&models.HistoryEntry{}).
		Where("is_published = ?", true)

	query.Count(&total)
	query.Preload("Creator").
		Order("entry_date DESC").
		Offset(offset).
		Limit(limit).
		Find(&entries)

	utils.PaginatedSuccessResponse(c, entries, page, limit, total)
}

func (h *Handler) GetHistoryEntryByID(c *gin.Context) {
	id := c.Param("id")
	var entry models.HistoryEntry

	if err := h.DB.Preload("Creator").Where("id = ?", id).First(&entry).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "History entry not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, entry, "")
}

func (h *Handler) CreateHistoryEntry(c *gin.Context) {
	var entry models.HistoryEntry
	if err := c.ShouldBindJSON(&entry); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("userID")
	entry.CreatedBy = userID.(uuid.UUID)

	if err := h.DB.Create(&entry).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create history entry")
		return
	}

	h.DB.Preload("Creator").First(&entry, entry.ID)
	utils.SuccessResponse(c, http.StatusCreated, entry, "History entry created successfully")
}

func (h *Handler) UpdateHistoryEntry(c *gin.Context) {
	id := c.Param("id")
	var entry models.HistoryEntry

	if err := h.DB.First(&entry, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "History entry not found")
		return
	}

	if err := c.ShouldBindJSON(&entry); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Save(&entry).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update history entry")
		return
	}

	h.DB.Preload("Creator").First(&entry, entry.ID)
	utils.SuccessResponse(c, http.StatusOK, entry, "History entry updated successfully")
}

func (h *Handler) DeleteHistoryEntry(c *gin.Context) {
	id := c.Param("id")

	if err := h.DB.Delete(&models.HistoryEntry{}, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete history entry")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "History entry deleted successfully")
}

func (h *Handler) ToggleHistoryEntryStatus(c *gin.Context) {
	id := c.Param("id")
	var entry models.HistoryEntry

	if err := h.DB.First(&entry, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "History entry not found")
		return
	}

	// Toggle status
	if entry.IsPublished {
		entry.IsPublished = false
	} else {
		entry.IsPublished = true
	}

	if err := h.DB.Save(&entry).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to toggle history entry status")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, entry, "History entry status updated successfully")
}

func (h *Handler) GetHistoryEntriesByDateRange(c *gin.Context) {
	// Public endpoint to get history entries within a date range
	fromDateStr := c.Query("from")
	toDateStr := c.Query("to")

	if fromDateStr == "" || toDateStr == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Both from and to dates are required")
		return
	}

	fromDate, err := time.Parse("2006-01-02", fromDateStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid from date format. Use YYYY-MM-DD")
		return
	}

	toDate, err := time.Parse("2006-01-02", toDateStr)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid to date format. Use YYYY-MM-DD")
		return
	}

	var entries []models.HistoryEntry

	h.DB.Model(&models.HistoryEntry{}).
		Where("is_published = ? AND entry_date >= ? AND entry_date <= ?", true, fromDate, toDate).
		Order("entry_date DESC").
		Find(&entries)

	utils.SuccessResponse(c, http.StatusOK, entries, "")
}
