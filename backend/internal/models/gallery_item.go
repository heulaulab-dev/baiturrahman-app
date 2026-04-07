package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// GalleryItem is a curated photo for the public gallery carousel and full gallery page.
type GalleryItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title       string    `gorm:"type:varchar(255);not null" json:"title"`
	Summary     string    `gorm:"type:text" json:"summary"`
	ImageURL    string    `gorm:"type:varchar(1000);not null" json:"image_url"`
	LinkURL     string    `gorm:"type:varchar(1000)" json:"link_url"`
	SortOrder   int       `gorm:"not null;default:0;index" json:"sort_order"`
	IsPublished bool      `gorm:"default:false;not null;index" json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (g *GalleryItem) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}
