package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MaxHeroSlides caps total hero banner rows (published or draft).
const MaxHeroSlides = 10

// HeroSlide is a landing hero background image managed from the dashboard (Konten → Banner).
type HeroSlide struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ImageURL    string    `gorm:"type:varchar(1000);not null" json:"image_url"`
	AltText     string    `gorm:"type:varchar(500)" json:"alt_text"`
	SortOrder   int       `gorm:"not null;default:0;index" json:"sort_order"`
	IsPublished bool      `gorm:"default:false;not null;index" json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (h *HeroSlide) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}
