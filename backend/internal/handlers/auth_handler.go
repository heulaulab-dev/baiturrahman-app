package handlers

import (
	"net/http"
	"time"
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	if err := h.DB.Where("email = ? AND is_active = ?", req.Email, true).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid credentials")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	cfg := config.Load()
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, string(user.Role), cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate access token")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, string(user.Role), cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate refresh token")
		return
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	h.DB.Save(&user)

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"username":  user.Username,
			"full_name": user.FullName,
			"role":      user.Role,
			"avatar_url": user.AvatarURL,
		},
	}, "Login successful")
}

func (h *Handler) Refresh(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	cfg := config.Load()
	claims, err := utils.ParseToken(req.RefreshToken, cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid refresh token")
		return
	}

	if claims.TokenType != utils.TokenTypeRefresh {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid token type")
		return
	}

	// Verify user still exists and is active
	var user models.User
	if err := h.DB.Where("id = ? AND is_active = ?", claims.UserID, true).First(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not found or inactive")
		return
	}

	// Generate new tokens
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, string(user.Role), cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate access token")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, string(user.Role), cfg.JWTSecret)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate refresh token")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	}, "Token refreshed successfully")
}

func (h *Handler) Logout(c *gin.Context) {
	// In a stateless JWT system, logout is handled client-side by removing the token
	// For enhanced security, you could implement a token blacklist in Redis
	utils.SuccessResponse(c, http.StatusOK, nil, "Logout successful")
}

func (h *Handler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"full_name":  user.FullName,
		"role":       user.Role,
		"avatar_url": user.AvatarURL,
		"is_active":  user.IsActive,
		"last_login_at": user.LastLoginAt,
		"created_at": user.CreatedAt,
	}, "")
}

