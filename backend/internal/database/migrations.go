package database

import (
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
		&models.Setting{},
	)
}

func SeedDefaultAdmin(db *gorm.DB) error {
	var count int64
	db.Model(&models.User{}).Count(&count)
	
	// Only create default admin if no users exist
	if count > 0 {
		return nil
	}

	// Hash password: "admin123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), 12)
	if err != nil {
		return err
	}

	adminUser := models.User{
		Username:     "admin",
		Email:        "admin@masjidbaiturrahim.com",
		PasswordHash: string(hashedPassword),
		FullName:     "Administrator",
		Role:         models.RoleAdmin,
		IsActive:     true,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return err
	}

	return nil
}
