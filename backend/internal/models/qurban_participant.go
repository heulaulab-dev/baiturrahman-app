package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type QurbanParticipant struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	QurbanAnimalID uuid.UUID      `gorm:"type:uuid;not null;index" json:"qurban_animal_id"`
	Name           string         `gorm:"type:varchar(160);not null" json:"name"`
	Phone          string         `gorm:"type:varchar(40)" json:"phone"`
	Notes          string         `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *QurbanParticipant) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
