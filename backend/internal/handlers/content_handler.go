package handlers

import (
	"net/http"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type ReorderContentRequest struct {
	Items []struct {
		ID          string `json:"id"`
		DisplayOrder int   `json:"display_order"`
	} `json:"items" binding:"required"`
}

func (h *Handler) GetContentSections(c *gin.Context) {
	var sections []models.ContentSection
	query := h.DB.Where("is_active = ?", true)

	if c.Query("active") == "false" {
		query = h.DB
	}

	query.Order("display_order ASC").Find(&sections)
	utils.SuccessResponse(c, http.StatusOK, sections, "")
}

func (h *Handler) GetContentSection(c *gin.Context) {
	id := c.Param("id")
	var section models.ContentSection

	if err := h.DB.First(&section, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Content section not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, section, "")
}

func (h *Handler) UpdateContentSection(c *gin.Context) {
	id := c.Param("id")
	var section models.ContentSection

	if err := h.DB.First(&section, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Content section not found")
		return
	}

	if err := c.ShouldBindJSON(&section); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Save(&section).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update content section")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, section, "Content section updated successfully")
}

func (h *Handler) ReorderContentSections(c *gin.Context) {
	var req ReorderContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	for _, item := range req.Items {
		h.DB.Model(&models.ContentSection{}).
			Where("id = ?", item.ID).
			Update("display_order", item.DisplayOrder)
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Content sections reordered successfully")
}

func (h *Handler) ToggleContentSection(c *gin.Context) {
	id := c.Param("id")
	var section models.ContentSection

	if err := h.DB.First(&section, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Content section not found")
		return
	}

	section.IsActive = !section.IsActive
	h.DB.Save(&section)

	utils.SuccessResponse(c, http.StatusOK, section, "Content section status updated")
}

// GetTentangKami fetches or creates the "tentang_kami" content section
func (h *Handler) GetTentangKami(c *gin.Context) {
	var section models.ContentSection

	// Try to find existing section
	err := h.DB.Where("section_key = ?", "tentang_kami").First(&section).Error
	if err != nil {
		// If not found, return empty structure
		utils.SuccessResponse(c, http.StatusOK, gin.H{
			"section_key": "tentang_kami",
			"title":       "Tentang Kami",
			"body":        "",
			"is_active":   false,
		}, "")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, section, "")
}

// UpdateTentangKami updates or creates the "tentang_kami" content section
func (h *Handler) UpdateTentangKami(c *gin.Context) {
	var req struct {
		Title     *string `json:"title"`
		Subtitle  *string `json:"subtitle"`
		Body      string  `json:"body" binding:"required"`
		ImageURL  *string `json:"image_url,omitempty"`
		VideoURL  *string `json:"video_url,omitempty"`
		IsActive  bool    `json:"is_active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var section models.ContentSection

	// Try to find existing section
	err := h.DB.Where("section_key = ?", "tentang_kami").First(&section).Error

	if err != nil {
		// Create new section
		section = models.ContentSection{
			SectionKey:   "tentang_kami",
			Title:        req.Title,
			Subtitle:     req.Subtitle,
			Body:         req.Body,
			ImageURL:     req.ImageURL,
			VideoURL:     req.VideoURL,
			IsActive:     req.IsActive,
			DisplayOrder: 0,
		}
		if err := h.DB.Create(&section).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create content section")
			return
		}
	} else {
		// Update existing section
		section.Title = req.Title
		section.Subtitle = req.Subtitle
		section.Body = req.Body
		section.ImageURL = req.ImageURL
		section.VideoURL = req.VideoURL
		section.IsActive = req.IsActive
		if err := h.DB.Save(&section).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update content section")
			return
		}
	}

	utils.SuccessResponse(c, http.StatusOK, section, "Tentang Kami content updated successfully")
}

