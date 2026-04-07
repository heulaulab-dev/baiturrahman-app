package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReservationStatus string

const (
	ReservationStatusPending   ReservationStatus = "pending"
	ReservationStatusApproved  ReservationStatus = "approved"
	ReservationStatusRejected  ReservationStatus = "rejected"
	ReservationStatusCancelled ReservationStatus = "cancelled"
)

// Reservation is a facility / event booking request for the mosque.
type Reservation struct {
	ID               uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	RequesterName    string            `gorm:"type:varchar(255);not null" json:"requester_name"`
	RequesterPhone   *string           `gorm:"type:varchar(30)" json:"requester_phone,omitempty"`
	RequesterEmail   *string           `gorm:"type:varchar(255)" json:"requester_email,omitempty"`
	Facility         string            `gorm:"type:varchar(100);not null;index" json:"facility"`
	EventTitle       *string           `gorm:"type:varchar(255)" json:"event_title,omitempty"`
	StartAt          time.Time         `gorm:"not null;index" json:"start_at"`
	EndAt            time.Time         `gorm:"not null;index" json:"end_at"`
	ParticipantCount *int              `json:"participant_count,omitempty"`
	Notes            *string           `gorm:"type:text" json:"notes,omitempty"`
	Status           ReservationStatus `gorm:"type:varchar(30);default:'pending';not null;index" json:"status"`
	AdminNotes       *string           `gorm:"type:text" json:"admin_notes,omitempty"`
	ReviewedBy       *uuid.UUID        `gorm:"type:uuid;index" json:"reviewed_by,omitempty"`
	ReviewedAt       *time.Time        `json:"reviewed_at,omitempty"`
	Reviewer         *User             `gorm:"foreignKey:ReviewedBy" json:"reviewer,omitempty"`
	CreatedAt        time.Time         `json:"created_at"`
	UpdatedAt        time.Time         `json:"updated_at"`
	DeletedAt        gorm.DeletedAt    `gorm:"index" json:"-"`
}

func (r *Reservation) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
