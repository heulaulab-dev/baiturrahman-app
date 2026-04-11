package middleware

import (
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization header required")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header")
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(tokenString, config.Load().JWTSecret)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		if claims.TokenType != utils.TokenTypeAccess {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid token type")
			c.Abort()
			return
		}

		// Store claims in context
		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)

		c.Next()
	}
}

func RequireRole(roles ...models.UserRole) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Role not found in context")
			c.Abort()
			return
		}

		userRole := models.UserRole(role.(string))
		allowed := false
		for _, r := range roles {
			if userRole == r {
				allowed = true
				break
			}
		}

		if !allowed {
			utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
			c.Abort()
			return
		}

		c.Next()
	}
}

func RequirePermission(permissionKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Role not found in context")
			c.Abort()
			return
		}

		// Keep technical admin roles as global bypass while RBAC is rolled out.
		userRole := models.UserRole(role.(string))
		if userRole == models.RoleSuperAdmin || userRole == models.RoleAdmin {
			c.Next()
			return
		}

		userID, exists := c.Get("userID")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "User ID not found in context")
			c.Abort()
			return
		}

		db := c.MustGet("db").(*gorm.DB)

		var user models.User
		if err := db.Select("org_role").First(&user, "id = ?", userID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusForbidden, "Failed to resolve user permission")
			c.Abort()
			return
		}

		permissionMap, err := models.ResolvePermissionMapForOrgRole(db, user.OrgRole)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to resolve permissions")
			c.Abort()
			return
		}

		if !permissionMap[permissionKey] {
			utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAnyPermission allows the request if the user's org role grants at least one of the given permissions.
// Super-admin and admin roles bypass (same as RequirePermission).
func RequireAnyPermission(permissionKeys ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Role not found in context")
			c.Abort()
			return
		}

		userRole := models.UserRole(role.(string))
		if userRole == models.RoleSuperAdmin || userRole == models.RoleAdmin {
			c.Next()
			return
		}

		userID, exists := c.Get("userID")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "User ID not found in context")
			c.Abort()
			return
		}

		db := c.MustGet("db").(*gorm.DB)

		var user models.User
		if err := db.Select("org_role").First(&user, "id = ?", userID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusForbidden, "Failed to resolve user permission")
			c.Abort()
			return
		}

		permissionMap, err := models.ResolvePermissionMapForOrgRole(db, user.OrgRole)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to resolve permissions")
			c.Abort()
			return
		}

		for _, key := range permissionKeys {
			if permissionMap[key] {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
		c.Abort()
	}
}
