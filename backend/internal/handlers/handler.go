package handlers

import (
	"masjid-baiturrahim-backend/internal/services"

	"gorm.io/gorm"
)

type Handler struct {
	DB    *gorm.DB
	Minio *services.MinioService
}

func New(db *gorm.DB, minio *services.MinioService) *Handler {
	return &Handler{DB: db, Minio: minio}
}
