package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleSuperAdmin UserRole = "super_admin"
	RoleAdmin      UserRole = "admin"
	RoleEditor     UserRole = "editor"
)

type User struct {
	ID                uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Username          string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"username"`
	Email             string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash      string         `gorm:"type:varchar(255);not null" json:"-"`
	FullName          string         `gorm:"type:varchar(255);not null" json:"full_name"`
	Role              UserRole       `gorm:"type:varchar(20);default:'editor';not null" json:"role"`
	OrgRole           StrukturRole   `gorm:"type:varchar(50);default:'lainnya';not null;index" json:"org_role"`
	StrukturID        *uuid.UUID     `gorm:"type:uuid;index" json:"struktur_id,omitempty"`
	AvatarURL         *string        `gorm:"type:varchar(500)" json:"avatar_url,omitempty"`
	IsActive          bool           `gorm:"default:false;not null" json:"is_active"`
	LastLoginAt       *time.Time     `json:"last_login_at,omitempty"`
	ResetToken        *string        `gorm:"type:varchar(255)" json:"-"`
	ResetTokenExpires *time.Time     `json:"-"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
