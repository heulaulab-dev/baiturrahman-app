package handlers

import (
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) GetUsers(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var users []models.User
	var total int64

	query := h.DB.Model(&models.User{})

	if role := c.Query("role"); role != "" {
		query = query.Where("role = ?", role)
	}
	if isActive := c.Query("is_active"); isActive != "" {
		query = query.Where("is_active = ?", isActive == "true")
	}

	query.Count(&total)
	query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&users)

	utils.PaginatedSuccessResponse(c, users, page, limit, total)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req struct {
		Username   string              `json:"username" binding:"required"`
		Email      string              `json:"email" binding:"required,email"`
		Password   string              `json:"password" binding:"required,min=6"`
		FullName   string              `json:"full_name" binding:"required"`
		Role       models.UserRole     `json:"role" binding:"required"`
		OrgRole    models.StrukturRole `json:"org_role"`
		StrukturID *uuid.UUID          `json:"struktur_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	if req.OrgRole == "" {
		req.OrgRole = models.StrukturRoleLainnya
	}
	if !models.IsValidOrgRole(req.OrgRole) {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid org_role")
		return
	}
	if req.StrukturID != nil {
		var struktur models.Struktur
		if err := h.DB.Select("id").First(&struktur, "id = ?", *req.StrukturID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid struktur_id")
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Role:         req.Role,
		OrgRole:      req.OrgRole,
		StrukturID:   req.StrukturID,
		IsActive:     true,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Username or email already exists")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, user, "User created successfully")
}

func (h *Handler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	if err := h.DB.First(&user, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "User not found")
		return
	}

	var req struct {
		Username   string              `json:"username"`
		Email      string              `json:"email"`
		FullName   string              `json:"full_name"`
		Role       models.UserRole     `json:"role"`
		OrgRole    models.StrukturRole `json:"org_role"`
		StrukturID *uuid.UUID          `json:"struktur_id"`
		IsActive   *bool               `json:"is_active"`
		AvatarURL  *string             `json:"avatar_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.OrgRole != "" {
		if !models.IsValidOrgRole(req.OrgRole) {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid org_role")
			return
		}
		user.OrgRole = req.OrgRole
	}
	if req.StrukturID != nil {
		var struktur models.Struktur
		if err := h.DB.Select("id").First(&struktur, "id = ?", *req.StrukturID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid struktur_id")
			return
		}
		user.StrukturID = req.StrukturID
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.AvatarURL != nil {
		user.AvatarURL = req.AvatarURL
	}

	if err := h.DB.Save(&user).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update user")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, user, "User updated successfully")
}

func (h *Handler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Delete(&models.User{}, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, nil, "User deleted successfully")
}
