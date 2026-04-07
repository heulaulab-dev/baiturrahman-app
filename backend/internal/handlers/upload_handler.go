package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const MaxUploadSize = 5 * 1024 * 1024 // 5MB

func (h *Handler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "No file provided")
		return
	}

	// Check file size
	if file.Size > MaxUploadSize {
		utils.ErrorResponse(c, http.StatusBadRequest, "File size exceeds 5MB limit")
		return
	}

	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	allowed := false
	for _, allowedExt := range allowedExts {
		if ext == allowedExt {
			allowed = true
			break
		}
	}
	if !allowed {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid file type. Only images are allowed")
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create upload directory")
		return
	}

	filePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to save file")
		return
	}

	// Optimize image
	optimizedPath, err := services.OptimizeImage(filePath)
	if err != nil {
		// If optimization fails, use original
		optimizedPath = filePath
	}

	// Generate URL (in production, use CDN or storage service URL)
	url := fmt.Sprintf("/uploads/%s", filepath.Base(optimizedPath))

	utils.SuccessResponse(c, http.StatusOK, gin.H{"url": url}, "Image uploaded successfully")
}

func (h *Handler) DeleteImage(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Extract filename from URL
	filename := filepath.Base(req.URL)
	filePath := filepath.Join("uploads", filename)

	if err := os.Remove(filePath); err != nil {
		if os.IsNotExist(err) {
			utils.ErrorResponse(c, http.StatusNotFound, "File not found")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete file")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Image deleted successfully")
}

