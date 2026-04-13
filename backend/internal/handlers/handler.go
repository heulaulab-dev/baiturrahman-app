package handlers

import (
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/services"

	"gorm.io/gorm"
)

type Handler struct {
	DB    *gorm.DB
	Minio *services.MinioService
	Cfg   *config.Config
}

func New(db *gorm.DB, minio *services.MinioService, cfg *config.Config) *Handler {
	return &Handler{DB: db, Minio: minio, Cfg: cfg}
}
