package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type QurbanAnimalType string

const (
	QurbanAnimalTypeSapi    QurbanAnimalType = "sapi"
	QurbanAnimalTypeKambing QurbanAnimalType = "kambing"
)

type QurbanAnimal struct {
	ID                      uuid.UUID           `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Label                   string              `gorm:"type:varchar(120);not null" json:"label"`
	AnimalType              QurbanAnimalType    `gorm:"type:varchar(20);not null;index" json:"animal_type"`
	MaxParticipantsOverride *int                `gorm:"type:int" json:"max_participants_override"`
	CreatedAt               time.Time           `json:"created_at"`
	UpdatedAt               time.Time           `json:"updated_at"`
	DeletedAt               gorm.DeletedAt      `gorm:"index" json:"-"`
	Participants            []QurbanParticipant `gorm:"foreignKey:QurbanAnimalID" json:"participants,omitempty"`
}

func (a *QurbanAnimal) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
