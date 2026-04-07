package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SocialMedia struct {
	Facebook  *string `json:"facebook,omitempty"`
	Instagram *string `json:"instagram,omitempty"`
	YouTube   *string `json:"youtube,omitempty"`
	Twitter   *string `json:"twitter,omitempty"`
}

func (sm SocialMedia) Value() (driver.Value, error) {
	return json.Marshal(sm)
}

func (sm *SocialMedia) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, sm)
}

type MosqueInfo struct {
	ID            uuid.UUID    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name          string       `gorm:"type:varchar(255);not null" json:"name"`
	Address       string       `gorm:"type:text;not null" json:"address"`
	City          string       `gorm:"type:varchar(100);not null" json:"city"`
	Province      string       `gorm:"type:varchar(100);not null" json:"province"`
	PostalCode    string       `gorm:"type:varchar(10)" json:"postal_code"`
	Phone         string       `gorm:"type:varchar(20)" json:"phone"`
	Email         string       `gorm:"type:varchar(255)" json:"email"`
	Website       *string       `gorm:"type:varchar(255)" json:"website,omitempty"`
	Description   string        `gorm:"type:text" json:"description"`
	LogoURL       *string       `gorm:"type:varchar(500)" json:"logo_url,omitempty"`
	BannerURL     *string       `gorm:"type:varchar(500)" json:"banner_url,omitempty"`
	Latitude      *float64      `gorm:"type:decimal(10,8)" json:"latitude,omitempty"`
	Longitude     *float64      `gorm:"type:decimal(11,8)" json:"longitude,omitempty"`
	MapsEmbedURL  *string       `gorm:"type:text" json:"maps_embed_url,omitempty"`
	SocialMedia   SocialMedia   `gorm:"type:jsonb" json:"social_media"`
	EstablishedYear *int        `json:"established_year,omitempty"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
}

func (m *MosqueInfo) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

