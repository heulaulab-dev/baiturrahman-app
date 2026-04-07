package handlers

import (
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (h *Handler) GetMosqueInfo(c *gin.Context) {
	var mosque models.MosqueInfo
	if err := h.DB.First(&mosque).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Landing and shared sections can render fallback content when mosque profile is not set yet.
			utils.SuccessResponse(c, http.StatusOK, nil, "")
			return
		}
		utils.ErrorResponse(c, http.StatusNotFound, "Mosque information not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, mosque, "")
}

func (h *Handler) UpdateMosqueInfo(c *gin.Context) {
	var mosque models.MosqueInfo
	if err := h.DB.First(&mosque).Error; err != nil {
		// Create if doesn't exist
		mosque = models.MosqueInfo{}
	}

	if err := c.ShouldBindJSON(&mosque); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.DB.Save(&mosque).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update mosque information")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, mosque, "Mosque information updated successfully")
}
