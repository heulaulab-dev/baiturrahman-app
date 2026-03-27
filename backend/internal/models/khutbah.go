package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type KhutbahStatus string

const (
	KhutbahStatusDraft     KhutbahStatus = "draft"
	KhutbahStatusPublished KhutbahStatus = "published"
)

type Khutbah struct {
	ID          uuid.UUID     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Khatib      string        `gorm:"type:varchar(255);not null" json:"khatib"`
	Tema        string        `gorm:"type:varchar(500);not null" json:"tema"`
	Imam        *string       `gorm:"type:varchar(255)" json:"imam,omitempty"`
	Muadzin     *string       `gorm:"type:varchar(255)" json:"muadzin,omitempty"`
	Date        time.Time     `gorm:"type:date;not null;index" json:"date"`
	Content     *string       `gorm:"type:text" json:"content,omitempty"`
	FileURL     *string       `gorm:"type:varchar(500)" json:"file_url,omitempty"`
	Status      KhutbahStatus  `gorm:"type:varchar(50);default:'draft';not null;index" json:"status"`
	CreatedBy   uuid.UUID     `gorm:"type:uuid;not null;index" json:"created_by"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`

	Creator User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

func (k *Khutbah) BeforeCreate(tx *gorm.DB) error {
	if k.ID == uuid.Nil {
		k.ID = uuid.New()
	}
	return nil
}

// IsPublished returns true if khutbah is published
func (k *Khutbah) IsPublished() bool {
	return k.Status == KhutbahStatusPublished
}
