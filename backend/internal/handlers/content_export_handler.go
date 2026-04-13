package handlers

import (
	"fmt"
	"net/http"
	"time"

	"masjid-baiturrahim-backend/internal/exportxlsx"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

func (h *Handler) ExportContentSummaryXLSX(c *gin.Context) {
	var events []models.Event
	if err := h.DB.Order("event_date DESC").Limit(500).Find(&events).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load events")
		return
	}
	var announcements []models.Announcement
	if err := h.DB.Order("created_at DESC").Limit(500).Find(&announcements).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load announcements")
		return
	}
	var khutbahs []models.Khutbah
	if err := h.DB.Order("date DESC").Limit(500).Find(&khutbahs).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load khutbahs")
		return
	}

	buf, err := exportxlsx.BuildContentSummaryXLSX(events, announcements, khutbahs)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	now := time.Now()
	filename := fmt.Sprintf("konten-ringkasan_%04d-%02d-%02d.xlsx", now.Year(), now.Month(), now.Day())
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
}
