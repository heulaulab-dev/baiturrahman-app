package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StrukturRole string

const (
	StrukturRoleKetua       StrukturRole = "ketua"
	StrukturRoleSekretaris  StrukturRole = "sekretaris"
	StrukturRoleBendahara   StrukturRole = "bendahara"
	StrukturRoleHumas         StrukturRole = "humas"
	StrukturRoleImamSyah     StrukturRole = "imam_syah"
	StrukturRoleMuadzin       StrukturRole = "muadzin"
	StrukturRoleDaiAmil       StrukturRole = "dai_amil"
	StrukturRoleMarbot         StrukturRole = "marbot"
	StrukturRoleLainnya       StrukturRole = "lainnya"
)

type Struktur struct {
	ID           uuid.UUID     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name         string       `gorm:"type:varchar(255);not null" json:"name"`
	Role         StrukturRole   `gorm:"type:varchar(50);not null;json:"role"`
	PhotoURL     *string       `gorm:"type:varchar(500)" json:"photo_url,omitempty"`
	Email        *string       `gorm:"type:varchar(255)" json:"email,omitempty"`
	Phone        *string       `gorm:"type:varchar(20)" json:"phone,omitempty"`
	Department   string       `gorm:"type:varchar(255)" json:"department,omitempty"`
	Bio          string       `gorm:"type:text" json:"bio,omitempty"`
	SocialMedia  *string       `gorm:"type:jsonb" json:"social_media,omitempty"`
	DisplayOrder int           `gorm:"default:0;not null;index" json:"display_order"`
	IsActive     bool          `gorm:"default:true;not null;index" json:"is_active"`
	CreatedBy    uuid.UUID     `gorm:"type:uuid;not null;index" json:"created_by"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`

	Creator User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

func (s *Struktur) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// IsStrukturActive returns true if struktur is active
func (s *Struktur) IsStrukturActive() bool {
	return s.IsActive
}
