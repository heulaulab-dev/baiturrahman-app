package handlers

import (
	"errors"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const MaxUploadSize = 5 * 1024 * 1024 // 5MB

// allowedUploadModules are storage prefixes inside the MinIO bucket (e.g. donate/uuid.jpg).
var allowedUploadModules = map[string]struct{}{
	"general":         {},
	"gallery":         {},
	"donate":          {},
	"konten":          {},
	"profile":         {},
	"announcements":   {},
	"events":          {},
	"struktur":        {},
	"khutbah":         {},
	"history":         {},
	"mosque":          {},
	"payment-methods": {},
}

func normalizeUploadModule(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	if s == "" {
		return "general"
	}
	b := strings.Builder{}
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == '-' || r == '_':
			b.WriteRune('-')
		case r == ' ':
			b.WriteRune('-')
		default:
			// skip other chars
		}
	}
	out := strings.Trim(b.String(), "-")
	if out == "" {
		return "general"
	}
	if len(out) > 40 {
		out = out[:40]
	}
	return out
}

func (h *Handler) UploadImage(c *gin.Context) {
	if h.Minio == nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Storage not configured")
		return
	}

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

	mod := normalizeUploadModule(c.PostForm("module"))
	if _, ok := allowedUploadModules[mod]; !ok {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid or disallowed storage module")
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
	}

	objectKey := fmt.Sprintf("%s/%s%s", mod, uuid.New().String(), ext)
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

func objectKeyFromImageURL(raw string, bucket string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", errors.New("empty url")
	}
	if bucket == "" {
		return "", errors.New("bucket not configured")
	}

	var urlPath string
	if u, err := url.Parse(raw); err == nil && u.Path != "" {
		urlPath = u.Path
	}

	if urlPath == "" {
		beforeQuery := raw
		if i := strings.IndexByte(beforeQuery, '?'); i >= 0 {
			beforeQuery = beforeQuery[:i]
		}
		if i := strings.IndexByte(beforeQuery, '#'); i >= 0 {
			beforeQuery = beforeQuery[:i]
		}
		urlPath = strings.ReplaceAll(beforeQuery, "\\", "/")
	}
	if urlPath != "" && !strings.HasPrefix(urlPath, "/") {
		urlPath = "/" + urlPath
	}

	prefix := "/" + bucket + "/"
	if strings.HasPrefix(urlPath, prefix) {
		key := strings.TrimPrefix(urlPath, prefix)
		key = strings.TrimSuffix(key, "/")
		if key == "" || key == "." || strings.Contains(key, "..") {
			return "", errors.New("could not derive object key")
		}
		return key, nil
	}

	return "", errors.New("could not derive object key")
}

func (h *Handler) DeleteImage(c *gin.Context) {
	if h.Minio == nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Storage not configured")
		return
	}

	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	objectKey, err := objectKeyFromImageURL(req.URL, h.Minio.BucketName())
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
