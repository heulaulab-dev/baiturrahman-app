package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HistoryCategory string

const (
	HistoryCategoryMilestone HistoryCategory = "milestone"
	HistoryCategoryAchievement HistoryCategory = "achievement"
	HistoryCategoryEvent     HistoryCategory = "event"
)

type HistoryStatus string

const (
	HistoryStatusDraft     HistoryStatus = "draft"
	HistoryStatusPublished HistoryStatus = "published"
)

type HistoryEntry struct {
	ID         uuid.UUID       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title      string        `gorm:"type:varchar(255);not null" json:"title"`
	Content    string        `gorm:"type:text" json:"content"`
	EntryDate  time.Time     `gorm:"type:date;not null;index" json:"entry_date"`
	Category   HistoryCategory `gorm:"type:varchar(50);not null" json:"category"`
	ImageURL   *string       `gorm:"type:varchar(500)" json:"image_url,omitempty"`
	IsPublished bool          `gorm:"default:false;not null;index" json:"is_published"`
	CreatedBy  uuid.UUID       `gorm:"type:uuid;not null;index" json:"created_by"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`

	Creator User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

func (h *HistoryEntry) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}

// IsPublishedEntry returns true if entry is published
func (h *HistoryEntry) IsPublishedEntry() bool {
	return h.IsPublished
}
