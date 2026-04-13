package handlers

import (
	"net/http"

	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type reorderHeroSlidesRequest struct {
	Items []struct {
		ID        string `json:"id" binding:"required"`
		SortOrder int    `json:"sort_order" binding:"required"`
	} `json:"items" binding:"required"`
}

// GetPublicHeroSlides returns published hero slides for the landing page.
func (h *Handler) GetPublicHeroSlides(c *gin.Context) {
	var slides []models.HeroSlide
	if err := h.DB.Where("is_published = ?", true).
		Order("sort_order ASC, created_at ASC").
		Find(&slides).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load hero slides")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, slides, "")
}

// GetAdminHeroSlides returns all hero slides for the admin dashboard.
func (h *Handler) GetAdminHeroSlides(c *gin.Context) {
	var slides []models.HeroSlide
	if err := h.DB.Order("sort_order ASC, created_at ASC").Find(&slides).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load hero slides")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, slides, "")
}

func (h *Handler) CreateHeroSlide(c *gin.Context) {
	var body struct {
		ImageURL    string `json:"image_url" binding:"required"`
		AltText     string `json:"alt_text"`
		SortOrder   *int   `json:"sort_order"`
		IsPublished *bool  `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var cnt int64
	if err := h.DB.Model(&models.HeroSlide{}).Count(&cnt).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to validate hero slide limit")
		return
	}
	if cnt >= models.MaxHeroSlides {
		utils.ErrorResponse(c, http.StatusBadRequest, "Maksimal 10 slide hero")
		return
	}

	slide := models.HeroSlide{
		ImageURL: body.ImageURL,
		AltText:  body.AltText,
	}
	if body.SortOrder != nil {
		slide.SortOrder = *body.SortOrder
	} else {
		slide.SortOrder = int(cnt)
	}
	if body.IsPublished != nil {
		slide.IsPublished = *body.IsPublished
	}

	if err := h.DB.Create(&slide).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create hero slide")
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, slide, "Hero slide created")
}

func (h *Handler) UpdateHeroSlide(c *gin.Context) {
	id := c.Param("id")
	var existing models.HeroSlide
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Hero slide not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load hero slide")
		return
	}

	var body struct {
		ImageURL    *string `json:"image_url"`
		AltText     *string `json:"alt_text"`
		SortOrder   *int    `json:"sort_order"`
		IsPublished *bool   `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if body.ImageURL != nil {
		existing.ImageURL = *body.ImageURL
	}
	if body.AltText != nil {
		existing.AltText = *body.AltText
	}
	if body.SortOrder != nil {
		existing.SortOrder = *body.SortOrder
	}
	if body.IsPublished != nil {
		existing.IsPublished = *body.IsPublished
	}

	if err := h.DB.Save(&existing).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update hero slide")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, existing, "Hero slide updated")
}

func (h *Handler) DeleteHeroSlide(c *gin.Context) {
	id := c.Param("id")
	res := h.DB.Delete(&models.HeroSlide{}, "id = ?", id)
	if res.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete hero slide")
		return
	}
	if res.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Hero slide not found")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Hero slide deleted")
}

func (h *Handler) ReorderHeroSlides(c *gin.Context) {
	var req reorderHeroSlidesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	for _, it := range req.Items {
		if _, err := uuid.Parse(it.ID); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid id")
			return
		}
		h.DB.Model(&models.HeroSlide{}).Where("id = ?", it.ID).Update("sort_order", it.SortOrder)
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Hero slides reordered")
}

func (h *Handler) ToggleHeroSlidePublished(c *gin.Context) {
	id := c.Param("id")
	var slide models.HeroSlide
	if err := h.DB.First(&slide, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Hero slide not found")
		return
	}
	slide.IsPublished = !slide.IsPublished
	if err := h.DB.Save(&slide).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to toggle publish status")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, slide, "Hero slide status updated")
}
