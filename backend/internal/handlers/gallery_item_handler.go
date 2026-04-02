package handlers

import (
	"net/http"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type reorderGalleryItemsRequest struct {
	Items []struct {
		ID         string `json:"id" binding:"required"`
		SortOrder  int    `json:"sort_order" binding:"required"`
	} `json:"items" binding:"required"`
}

// GetPublicGalleryItems returns published gallery items for the landing page and public gallery.
func (h *Handler) GetPublicGalleryItems(c *gin.Context) {
	var items []models.GalleryItem
	if err := h.DB.Where("is_published = ?", true).
		Order("sort_order ASC, created_at ASC").
		Find(&items).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load gallery")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, items, "")
}

// GetAdminGalleryItems returns all gallery items (admin).
func (h *Handler) GetAdminGalleryItems(c *gin.Context) {
	var items []models.GalleryItem
	if err := h.DB.Order("sort_order ASC, created_at ASC").Find(&items).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load gallery")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, items, "")
}

func (h *Handler) CreateGalleryItem(c *gin.Context) {
	var body struct {
		Title       string `json:"title" binding:"required"`
		Summary     string `json:"summary"`
		ImageURL    string `json:"image_url" binding:"required"`
		LinkURL     string `json:"link_url"`
		SortOrder   *int   `json:"sort_order"`
		IsPublished *bool  `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	item := models.GalleryItem{
		Title:    body.Title,
		Summary:  body.Summary,
		ImageURL: body.ImageURL,
		LinkURL:  body.LinkURL,
	}
	if body.SortOrder != nil {
		item.SortOrder = *body.SortOrder
	} else {
		var cnt int64
		h.DB.Model(&models.GalleryItem{}).Count(&cnt)
		item.SortOrder = int(cnt)
	}
	if body.IsPublished != nil {
		item.IsPublished = *body.IsPublished
	}

	if err := h.DB.Create(&item).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create gallery item")
		return
	}
	utils.SuccessResponse(c, http.StatusCreated, item, "Gallery item created")
}

func (h *Handler) UpdateGalleryItem(c *gin.Context) {
	id := c.Param("id")
	var existing models.GalleryItem
	if err := h.DB.First(&existing, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusNotFound, "Gallery item not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load gallery item")
		return
	}

	var body struct {
		Title       *string `json:"title"`
		Summary     *string `json:"summary"`
		ImageURL    *string `json:"image_url"`
		LinkURL     *string `json:"link_url"`
		SortOrder   *int    `json:"sort_order"`
		IsPublished *bool   `json:"is_published"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if body.Title != nil {
		existing.Title = *body.Title
	}
	if body.Summary != nil {
		existing.Summary = *body.Summary
	}
	if body.ImageURL != nil {
		existing.ImageURL = *body.ImageURL
	}
	if body.LinkURL != nil {
		existing.LinkURL = *body.LinkURL
	}
	if body.SortOrder != nil {
		existing.SortOrder = *body.SortOrder
	}
	if body.IsPublished != nil {
		existing.IsPublished = *body.IsPublished
	}

	if err := h.DB.Save(&existing).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update gallery item")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, existing, "Gallery item updated")
}

func (h *Handler) DeleteGalleryItem(c *gin.Context) {
	id := c.Param("id")
	res := h.DB.Delete(&models.GalleryItem{}, "id = ?", id)
	if res.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete gallery item")
		return
	}
	if res.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Gallery item not found")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Gallery item deleted")
}

func (h *Handler) ReorderGalleryItems(c *gin.Context) {
	var req reorderGalleryItemsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	for _, it := range req.Items {
		if _, err := uuid.Parse(it.ID); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid id")
			return
		}
		h.DB.Model(&models.GalleryItem{}).Where("id = ?", it.ID).Update("sort_order", it.SortOrder)
	}
	utils.SuccessResponse(c, http.StatusOK, nil, "Gallery reordered")
}

func (h *Handler) ToggleGalleryItemPublished(c *gin.Context) {
	id := c.Param("id")
	var item models.GalleryItem
	if err := h.DB.First(&item, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Gallery item not found")
		return
	}
	item.IsPublished = !item.IsPublished
	if err := h.DB.Save(&item).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to toggle publish status")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, item, "Gallery item status updated")
}
