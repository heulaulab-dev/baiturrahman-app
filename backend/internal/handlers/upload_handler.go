package handlers

import (
	"errors"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path"
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

	if file.Size > MaxUploadSize {
		utils.ErrorResponse(c, http.StatusBadRequest, "File size exceeds 5MB limit")
		return
	}

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

	tmp, err := os.CreateTemp("", "upload-*"+ext)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create temp file")
		return
	}
	tmpPath := tmp.Name()
	if err := tmp.Close(); err != nil {
		_ = os.Remove(tmpPath)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to prepare temp file")
		return
	}
	defer func() { _ = os.Remove(tmpPath) }()

	if err := c.SaveUploadedFile(file, tmpPath); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to save file")
		return
	}

	optimizedPath, err := services.OptimizeImage(tmpPath)
	if err != nil {
		optimizedPath = tmpPath
	} else {
		defer func() { _ = os.Remove(optimizedPath) }()
	}

	objectKey := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	ctx := c.Request.Context()
	if err := h.Minio.PutObject(ctx, objectKey, optimizedPath, contentType); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to upload to storage")
		return
	}

	publicURL := h.Minio.PublicObjectURL(objectKey)
	utils.SuccessResponse(c, http.StatusOK, gin.H{"url": publicURL}, "Image uploaded successfully")
}

func objectKeyFromImageURL(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", errors.New("empty url")
	}

	if u, err := url.Parse(raw); err == nil && u.Path != "" {
		key := path.Base(u.Path)
		if key != "" && key != "." && key != "/" {
			return key, nil
		}
	}

	beforeQuery := raw
	if i := strings.IndexByte(beforeQuery, '?'); i >= 0 {
		beforeQuery = beforeQuery[:i]
	}
	if i := strings.IndexByte(beforeQuery, '#'); i >= 0 {
		beforeQuery = beforeQuery[:i]
	}
	key := path.Base(strings.ReplaceAll(beforeQuery, "\\", "/"))
	if key == "" || key == "." {
		return "", errors.New("could not derive object key")
	}
	return key, nil
}

func (h *Handler) DeleteImage(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	objectKey, err := objectKeyFromImageURL(req.URL)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid image URL")
		return
	}

	ctx := c.Request.Context()
	if err := h.Minio.RemoveObject(ctx, objectKey); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete object")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Image deleted successfully")
}
