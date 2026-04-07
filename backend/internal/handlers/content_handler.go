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

