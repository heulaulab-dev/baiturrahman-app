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

const (
	MaxImageUploadSize = 5 * 1024 * 1024  // 5MB
	MaxPDFUploadSize   = 15 * 1024 * 1024 // 15MB
)

// uploadModuleAliases normalize Indonesian / synonym labels to canonical folder names.
var uploadModuleAliases = map[string]string{
	"donations":  "donate",
	"donation":   "donate",
	"pengumuman": "announcements",
	"kegiatan":   "events",
	"news":       "berita",
	"sections":   "content",
	"konten":     "content",
	"masjid":     "mosque",
	"struktur":   "structure",
	"payment":    "donate",
	"qris":       "donate",
	"qr":         "donate",
}

var allowedUploadModules = map[string]struct{}{
	"general": {}, "donate": {}, "content": {}, "berita": {}, "events": {},
	"announcements": {}, "structure": {}, "mosque": {}, "khutbah": {}, "gallery": {},
}

func normalizeUploadModule(raw string) string {
	s := strings.ToLower(strings.TrimSpace(raw))
	var b strings.Builder
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9', r == '-':
			b.WriteRune(r)
		}
	}
	out := b.String()
	if out == "" {
		return "general"
	}
	if alias, ok := uploadModuleAliases[out]; ok {
		out = alias
	}
	if _, ok := allowedUploadModules[out]; !ok {
		return "general"
	}
	return out
}

func isImageExt(ext string) bool {
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp":
		return true
	default:
		return false
	}
}

func (h *Handler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "No file provided")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	var maxSize int64
	switch {
	case ext == ".pdf":
		maxSize = MaxPDFUploadSize
	case isImageExt(ext):
		maxSize = MaxImageUploadSize
	default:
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid file type. Allowed: JPG, PNG, GIF, WebP, or PDF")
		return
	}

	if file.Size > maxSize {
		limitMB := maxSize / (1024 * 1024)
		utils.ErrorResponse(c, http.StatusBadRequest, fmt.Sprintf("File size exceeds %dMB limit", limitMB))
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

	if isImageExt(ext) {
		if _, err := services.OptimizeImage(tmpPath); err != nil {
			// keep original bytes if optimization fails
		}
	}

	module := normalizeUploadModule(c.PostForm("module"))
	objectKey := fmt.Sprintf("%s/%s%s", module, uuid.New().String(), ext)
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	ctx := c.Request.Context()
	if err := h.Minio.PutObject(ctx, objectKey, tmpPath, contentType); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to upload to storage")
		return
	}

	publicURL := h.Minio.PublicObjectURL(objectKey)
	utils.SuccessResponse(c, http.StatusOK, gin.H{"url": publicURL}, "File uploaded successfully")
}

func extractObjectKeyFromURLPath(p string, bucket string) (string, error) {
	p = strings.Trim(path.Clean("/"+strings.ReplaceAll(p, "\\", "/")), "/")
	if p == "" || p == "." {
		return "", errors.New("empty path")
	}
	parts := strings.Split(p, "/")
	if len(parts) >= 2 && parts[0] == bucket {
		return strings.Join(parts[1:], "/"), nil
	}
	if len(parts) == 1 {
		return parts[0], nil
	}
	return strings.Join(parts, "/"), nil
}

func objectKeyFromImageURL(raw string, bucket string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", errors.New("empty url")
	}

	if u, err := url.Parse(raw); err == nil && u.Path != "" {
		key, err := extractObjectKeyFromURLPath(u.Path, bucket)
		if err == nil && key != "" {
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
	key, err := extractObjectKeyFromURLPath(beforeQuery, bucket)
	if err != nil || key == "" {
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

	objectKey, err := objectKeyFromImageURL(req.URL, h.Minio.Bucket())
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
