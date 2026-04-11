package handlers

import (
	"net/http"

	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (h *Handler) GetRBACPermissions(c *gin.Context) {
	var permissions []models.Permission
	if err := h.DB.Order("module ASC, key ASC").Find(&permissions).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch permissions")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, permissions, "")
}

func (h *Handler) GetRBACRoles(c *gin.Context) {
	type roleItem struct {
		Value string `json:"value"`
		Label string `json:"label"`
	}

	roleLabels := map[models.StrukturRole]string{
		models.StrukturRoleKetua:      "Ketua",
		models.StrukturRoleSekretaris: "Sekretaris",
		models.StrukturRoleBendahara:  "Bendahara",
		models.StrukturRoleHumas:      "Humas",
		models.StrukturRoleImamSyah:   "Imam Syah",
		models.StrukturRoleMuadzin:    "Muadzin",
		models.StrukturRoleDaiAmil:    "Dai Amil",
		models.StrukturRoleMarbot:     "Marbot",
		models.StrukturRoleLainnya:    "Lainnya",
	}

	roles := make([]roleItem, 0, len(models.AllOrgRoles()))
	for _, role := range models.AllOrgRoles() {
		roles = append(roles, roleItem{
			Value: string(role),
			Label: roleLabels[role],
		})
	}

	utils.SuccessResponse(c, http.StatusOK, roles, "")
}

func (h *Handler) GetRBACRolePermissions(c *gin.Context) {
	orgRole := models.StrukturRole(c.Param("orgRole"))
	if !models.IsValidOrgRole(orgRole) {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid org role")
		return
	}

	var permissions []models.Permission
	if err := h.DB.Order("module ASC, key ASC").Find(&permissions).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch permissions")
		return
	}

	resolvedMap, err := models.ResolvePermissionMapForOrgRole(h.DB, orgRole)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to resolve role permissions")
		return
	}

	type permissionItem struct {
		Key         string `json:"key"`
		Name        string `json:"name"`
		Description string `json:"description"`
		Module      string `json:"module"`
		IsActive    bool   `json:"is_active"`
		Allowed     bool   `json:"allowed"`
	}

	items := make([]permissionItem, 0, len(permissions))
	for _, permission := range permissions {
		items = append(items, permissionItem{
			Key:         permission.Key,
			Name:        permission.Name,
			Description: permission.Description,
			Module:      permission.Module,
			IsActive:    permission.IsActive,
			Allowed:     resolvedMap[permission.Key],
		})
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"org_role":    orgRole,
		"permissions": items,
	}, "")
}

func (h *Handler) UpdateRBACRolePermissions(c *gin.Context) {
	orgRole := models.StrukturRole(c.Param("orgRole"))
	if !models.IsValidOrgRole(orgRole) {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid org role")
		return
	}

	var req struct {
		PermissionKeys []string `json:"permission_keys"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var permissions []models.Permission
	if err := h.DB.Select("key").Find(&permissions).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch permissions")
		return
	}

	validKeys := map[string]struct{}{}
	for _, permission := range permissions {
		validKeys[permission.Key] = struct{}{}
	}

	allowSet := map[string]bool{}
	for _, key := range req.PermissionKeys {
		if _, ok := validKeys[key]; !ok {
			utils.ErrorResponse(c, http.StatusBadRequest, "Unknown permission key: "+key)
			return
		}
		allowSet[key] = true
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("org_role = ?", orgRole).Delete(&models.RolePermission{}).Error; err != nil {
			return err
		}

		for key := range validKeys {
			record := models.RolePermission{
				OrgRole:       orgRole,
				PermissionKey: key,
				Allowed:       allowSet[key],
			}
			if err := tx.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "org_role"}, {Name: "permission_key"}},
				DoUpdates: clause.AssignmentColumns([]string{"allowed"}),
			}).Create(&record).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update role permissions")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"org_role":        orgRole,
		"permission_keys": req.PermissionKeys,
	}, "Role permissions updated successfully")
}
