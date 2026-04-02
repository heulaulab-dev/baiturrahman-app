package database

import (
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.MosqueInfo{},
		&models.OrganizationStructure{},
		&models.PrayerTimes{},
		&models.ContentSection{},
		&models.Event{},
		&models.Announcement{},
		&models.Donation{},
		&models.PaymentMethod{},
		&models.Khutbah{},
		&models.Setting{},
		&models.HistoryEntry{},
		&models.Struktur{},
		&models.AsetTetap{},
		&models.BarangTidakTetap{},
		&models.Reservation{},
	)
}

func SeedDefaultAdmin(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Count(&count)

	// Only create default admin if no users exist
	if count > 0 {
		return nil
	}

	cfg := config.Load()

	// Hash password from config
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(cfg.DefaultAdminPassword), 12)
	if err != nil {
		return err
	}

	adminUser := models.User{
		Username:     cfg.DefaultAdminUsername,
		Email:        cfg.DefaultAdminEmail,
		PasswordHash: string(hashedPassword),
		FullName:     cfg.DefaultAdminFullName,
		Role:         models.RoleAdmin,
		IsActive:     true,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return err
	}

	return nil
}

// SeedDefaultMosqueInfo inserts a placeholder row so GET /mosque returns 200 on a fresh database.
func SeedDefaultMosqueInfo(db *gorm.DB) error {
	var count int64
	db.Model(&models.MosqueInfo{}).Count(&count)
	if count > 0 {
		return nil
	}

	placeholder := models.MosqueInfo{
		Name:        "Masjid Baiturrahim",
		Address:     "—",
		City:        "—",
		Province:    "—",
		Description: "Silakan lengkapi informasi masjid melalui panel admin.",
	}
	return db.Create(&placeholder).Error
}
