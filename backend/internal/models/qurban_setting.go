package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type QurbanSetting struct {
	ID                            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	DefaultMaxParticipantsSapi    int            `gorm:"not null;default:7" json:"default_max_participants_sapi"`
	DefaultMaxParticipantsKambing int            `gorm:"not null;default:1" json:"default_max_participants_kambing"`
	CreatedAt                     time.Time      `json:"created_at"`
	UpdatedAt                     time.Time      `json:"updated_at"`
	DeletedAt                     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *QurbanSetting) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
