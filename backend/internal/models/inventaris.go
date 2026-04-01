package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AsetTetap struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	NamaAset  string         `gorm:"type:varchar(100);not null;index" json:"nama_aset"`
	Luas      *string        `gorm:"type:varchar(255)" json:"luas,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type BarangTidakTetap struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Kategori    string         `gorm:"type:varchar(100);not null;index" json:"kategori"`
	NamaBarang  string         `gorm:"type:varchar(255);not null;index" json:"nama_barang"`
	Jumlah      *int           `json:"jumlah,omitempty"`
	Satuan      *string        `gorm:"type:varchar(100)" json:"satuan,omitempty"`
	KondisiBaik bool           `gorm:"default:true;not null" json:"kondisi_baik"`
	Keterangan  *string        `gorm:"type:text" json:"keterangan,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (a *AsetTetap) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

func (b *BarangTidakTetap) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
