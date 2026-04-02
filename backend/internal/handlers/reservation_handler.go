package handlers

import (
	"errors"
	"net/http"
	"time"

	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type createReservationRequest struct {
	RequesterName    string    `json:"requester_name" binding:"required"`
	RequesterPhone   *string   `json:"requester_phone"`
	RequesterEmail   string    `json:"requester_email" binding:"omitempty,email"`
	Facility         string    `json:"facility" binding:"required,max=100"`
	EventTitle       *string   `json:"event_title" binding:"omitempty,max=255"`
	StartAt          time.Time `json:"start_at" binding:"required"`
	EndAt            time.Time `json:"end_at" binding:"required"`
	ParticipantCount *int      `json:"participant_count"`
	Notes            *string   `json:"notes"`
}

func validateReservationWindow(startAt, endAt time.Time) string {
	if !endAt.After(startAt) {
		return "End time must be after start time"
	}
	if startAt.Before(time.Now().Add(-2 * time.Minute)) {
		return "Start time cannot be in the past"
	}
	return ""
}

// CreateReservation is a public endpoint for submitting a booking request.
func (h *Handler) CreateReservation(c *gin.Context) {
	var req createReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if msg := validateReservationWindow(req.StartAt, req.EndAt); msg != "" {
		utils.ErrorResponse(c, http.StatusBadRequest, msg)
		return
	}

	var emailPtr *string
	if req.RequesterEmail != "" {
		emailPtr = &req.RequesterEmail
	}

	r := models.Reservation{
		RequesterName:    req.RequesterName,
		RequesterPhone:   req.RequesterPhone,
		RequesterEmail:   emailPtr,
		Facility:         req.Facility,
		EventTitle:       req.EventTitle,
		StartAt:          req.StartAt,
		EndAt:            req.EndAt,
		ParticipantCount: req.ParticipantCount,
		Notes:            req.Notes,
		Status:           models.ReservationStatusPending,
	}

	if err := h.DB.Create(&r).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create reservation")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, r, "Reservation request submitted successfully")
}

// CreateReservationAdmin creates a reservation from the dashboard (JWT admin). No "must be future" rule.
func (h *Handler) CreateReservationAdmin(c *gin.Context) {
	var req createReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if msg := validateReservationWindowForAdmin(req.StartAt, req.EndAt); msg != "" {
		utils.ErrorResponse(c, http.StatusBadRequest, msg)
		return
	}

	var emailPtr *string
	if req.RequesterEmail != "" {
		emailPtr = &req.RequesterEmail
	}

	r := models.Reservation{
		RequesterName:    req.RequesterName,
		RequesterPhone:   req.RequesterPhone,
		RequesterEmail:   emailPtr,
		Facility:         req.Facility,
		EventTitle:       req.EventTitle,
		StartAt:          req.StartAt,
		EndAt:            req.EndAt,
		ParticipantCount: req.ParticipantCount,
		Notes:            req.Notes,
		Status:           models.ReservationStatusPending,
	}

	if err := h.DB.Create(&r).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create reservation")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, r, "Reservation created successfully")
}

func (h *Handler) GetReservations(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var rows []models.Reservation
	var total int64

	q := h.DB.Model(&models.Reservation{})

	if status := c.Query("status"); status != "" {
		q = q.Where("status = ?", status)
	}
	if facility := c.Query("facility"); facility != "" {
		q = q.Where("facility = ?", facility)
	}
	if from := c.Query("from"); from != "" {
		if date, err := time.Parse("2006-01-02", from); err == nil {
			q = q.Where("start_at >= ?", date)
		}
	}
	if to := c.Query("to"); to != "" {
		if date, err := time.Parse("2006-01-02", to); err == nil {
			q = q.Where("start_at < ?", date.Add(24*time.Hour))
		}
	}

	q.Count(&total)
	q.Preload("Reviewer").
		Order("start_at ASC").
		Offset(offset).
		Limit(limit).
		Find(&rows)

	utils.PaginatedSuccessResponse(c, rows, page, limit, total)
}

func (h *Handler) GetReservationByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	var r models.Reservation
	if err := h.DB.Preload("Reviewer").First(&r, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Reservation not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load reservation")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, r, "")
}

type updateReservationRequest struct {
	RequesterName    *string                   `json:"requester_name"`
	RequesterPhone   *string                   `json:"requester_phone"`
	RequesterEmail   *string                   `json:"requester_email"`
	Facility         *string                   `json:"facility"`
	EventTitle       *string                   `json:"event_title"`
	StartAt          *time.Time                `json:"start_at"`
	EndAt            *time.Time                `json:"end_at"`
	ParticipantCount *int                      `json:"participant_count"`
	Notes            *string                   `json:"notes"`
	Status           *models.ReservationStatus `json:"status"`
	AdminNotes       *string                   `json:"admin_notes"`
}

func (h *Handler) UpdateReservation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	var r models.Reservation
	if err := h.DB.First(&r, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Reservation not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load reservation")
		return
	}

	var req updateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	start := r.StartAt
	end := r.EndAt
	if req.StartAt != nil {
		start = *req.StartAt
	}
	if req.EndAt != nil {
		end = *req.EndAt
	}
	if req.StartAt != nil || req.EndAt != nil {
		if msg := validateReservationWindowForAdmin(start, end); msg != "" {
			utils.ErrorResponse(c, http.StatusBadRequest, msg)
			return
		}
	}

	if req.RequesterName != nil {
		r.RequesterName = *req.RequesterName
	}
	if req.RequesterPhone != nil {
		r.RequesterPhone = req.RequesterPhone
	}
	if req.RequesterEmail != nil {
		r.RequesterEmail = req.RequesterEmail
	}
	if req.Facility != nil {
		r.Facility = *req.Facility
	}
	if req.EventTitle != nil {
		r.EventTitle = req.EventTitle
	}
	if req.StartAt != nil {
		r.StartAt = *req.StartAt
	}
	if req.EndAt != nil {
		r.EndAt = *req.EndAt
	}
	if req.ParticipantCount != nil {
		r.ParticipantCount = req.ParticipantCount
	}
	if req.Notes != nil {
		r.Notes = req.Notes
	}
	if req.AdminNotes != nil {
		r.AdminNotes = req.AdminNotes
	}

	prevStatus := r.Status
	if req.Status != nil {
		switch *req.Status {
		case models.ReservationStatusPending,
			models.ReservationStatusApproved,
			models.ReservationStatusRejected,
			models.ReservationStatusCancelled:
			r.Status = *req.Status
		default:
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid status")
			return
		}
	}

	if req.Status != nil && *req.Status != prevStatus &&
		(*req.Status == models.ReservationStatusApproved || *req.Status == models.ReservationStatusRejected) {
		userID, ok := c.Get("userID")
		if ok {
			if uid, ok := userID.(uuid.UUID); ok {
				r.ReviewedBy = &uid
				now := time.Now()
				r.ReviewedAt = &now
			}
		}
	}

	if err := h.DB.Save(&r).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update reservation")
		return
	}

	h.DB.Preload("Reviewer").First(&r, "id = ?", r.ID)
	utils.SuccessResponse(c, http.StatusOK, r, "Reservation updated successfully")
}

// Admin may set historical schedules; only enforce end > start.
func validateReservationWindowForAdmin(startAt, endAt time.Time) string {
	if !endAt.After(startAt) {
		return "End time must be after start time"
	}
	return ""
}

func (h *Handler) DeleteReservation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, invalidIDFormatMessage)
		return
	}

	res := h.DB.Delete(&models.Reservation{}, "id = ?", id)
	if res.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete reservation")
		return
	}
	if res.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Reservation not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Reservation deleted successfully")
}
