package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Sponsor is a partner logo/link shown on the public site within a visibility window.
type Sponsor struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name            string         `gorm:"type:varchar(255);not null" json:"name"`
	LogoURL         string         `gorm:"type:varchar(1000)" json:"logo_url"`
	WebsiteURL      string         `gorm:"type:varchar(1000)" json:"website_url"`
	Description     string         `gorm:"type:text" json:"description"`
	VisibilityStart *time.Time     `gorm:"type:date" json:"visibility_start"`
	VisibilityEnd   *time.Time     `gorm:"type:date" json:"visibility_end"`
	ContractStart   *time.Time     `gorm:"type:date" json:"contract_start"`
	ContractEnd     *time.Time     `gorm:"type:date" json:"contract_end"`
	ShowOnLanding   bool           `gorm:"default:false;not null;index" json:"show_on_landing"`
	SortOrder       int            `gorm:"not null;default:0;index" json:"sort_order"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Sponsor) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
