package handlers

import (
	"crypto/rand"
	"encoding/hex"
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
		"id":           user.ID,
		"username":     user.Username,
		"email":        user.Email,
		"full_name":    user.FullName,
		"role":         user.Role,
		"avatar_url":    user.AvatarURL,
		"is_active":     user.IsActive,
		"last_login_at": user.LastLoginAt,
		"created_at":   user.CreatedAt,
	}, "")
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Check if user already exists
	var existingUser models.User
	err := h.DB.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error
	if err == nil {
		utils.ErrorResponse(c, http.StatusConflict, "Username or email already exists")
		return
	}
	if err != gorm.ErrRecordNotFound {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Create user with inactive status (pending approval)
	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Role:         models.RoleEditor,
		IsActive:     false, // Pending admin approval
	}

	if err := h.DB.Create(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create user")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, gin.H{
		"id":       user.ID,
		"username": user.Username,
		"email":    user.Email,
		"is_active": user.IsActive,
	}, "Registration successful. Please wait for admin approval.")
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func (h *Handler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	err := h.DB.Where("email = ?", req.Email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Don't reveal if email exists for security
			utils.SuccessResponse(c, http.StatusOK, nil, "If the email exists, a reset link has been sent.")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Generate reset token
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate reset token")
		return
	}
	resetToken := hex.EncodeToString(tokenBytes)

	// Set token expiration (1 hour)
	expiresAt := time.Now().Add(1 * time.Hour)

	// Store token in database
	user.ResetToken = &resetToken
	user.ResetTokenExpires = &expiresAt
	if err := h.DB.Save(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to store reset token")
		return
	}

	// TODO: Send email with reset link
	// For now, return the token for testing
	resetLink := c.Request.Host + "/reset-password?token=" + resetToken

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"reset_link": resetLink,
	}, "If the email exists, a reset link has been sent.")
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func (h *Handler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	err := h.DB.Where("reset_token = ?", req.Token).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid or expired reset token")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Database error")
		return
	}

	// Check if token is expired
	if user.ResetTokenExpires == nil || user.ResetTokenExpires.Before(time.Now()) {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid or expired reset token")
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Update password and clear reset token
	user.PasswordHash = string(hashedPassword)
	user.ResetToken = nil
	user.ResetTokenExpires = nil
	if err := h.DB.Save(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update password")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "Password reset successfully. You can now login with your new password.")
}

