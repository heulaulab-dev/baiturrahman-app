package main

import (
	"context"
	"log"
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/database"
	"masjid-baiturrahim-backend/internal/handlers"
	"masjid-baiturrahim-backend/internal/middleware"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Seed default admin user if not exists
	if err := database.SeedDefaultAdmin(db); err != nil {
		log.Printf("Warning: Failed to seed default admin: %v", err)
	}
	if err := database.SeedDefaultPermissions(db); err != nil {
		log.Printf("Warning: Failed to seed default permissions: %v", err)
	}

	minioSvc, err := services.NewMinioService(cfg)
	if err != nil {
		log.Fatal("MinIO: ", err)
	}
	if err := minioSvc.EnsureBucketAndPolicy(context.Background()); err != nil {
		log.Fatal("MinIO bucket setup: ", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 3600, // 12 hours
	}))

	// Global middleware
	r.Use(middleware.Logger())
	r.Use(middleware.RateLimit())
	r.Use(middleware.ErrorHandler())

	// Add DB to context
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// Initialize handlers
	h := handlers.New(db, minioSvc)

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Public routes
		public := v1.Group("")
		{
			// Auth (public)
			auth := public.Group("/auth")
			{
				auth.POST("/login", h.Login)
				auth.POST("/refresh", h.Refresh)
			}

			// Public endpoints
			public.GET("/mosque", h.GetMosqueInfo)
			public.GET("/mosque-info", h.GetMosqueInfo) // Backward-compatible alias
			public.GET("/structure", h.GetStructures)
			public.GET("/strukturs", h.GetPublicStrukturs)
			public.GET("/prayer-times", h.GetPrayerTimesByDate)
			public.GET("/prayer-times/month", h.GetPrayerTimesByMonth)
			public.GET("/content", h.GetContentSections)
			public.GET("/content/tentang-kami", h.GetTentangKami)
			public.GET("/events", h.GetEvents)
			public.GET("/events/:slug", h.GetEventBySlug)
			public.GET("/announcements", h.GetAnnouncements)
			public.POST("/donations", h.CreateDonation)
			public.GET("/payment-methods", h.GetPaymentMethods)
			public.GET("/khutbahs/latest", h.GetLatestKhutbah)
			public.GET("/khutbahs/archive", h.GetKhutbahArchive)
			public.GET("/history-entries", h.GetPublishedEntries)
			public.GET("/history-entries/date-range", h.GetHistoryEntriesByDateRange)
			public.GET("/gallery/items", h.GetPublicGalleryItems)
			public.POST("/reservations", h.CreateReservation)
		}

		// Protected routes (require authentication)
		protected := v1.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/auth/me", h.GetMe)
			protected.POST("/auth/logout", h.Logout)
		}

		// Admin routes (require authentication + admin role)
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthRequired())
		{
			// Mosque Info
			admin.PUT("/mosque", h.UpdateMosqueInfo)

			// Structure
			admin.GET("/structure", h.GetStructures)
			admin.POST("/structure", h.CreateStructure)
			admin.PUT("/structure/:id", h.UpdateStructure)
			admin.DELETE("/structure/:id", h.DeleteStructure)
			admin.PUT("/structure/reorder", h.ReorderStructures)

			// Struktur (legacy dashboard API paths)
			admin.GET("/strukturs", h.GetStrukturs)
			admin.GET("/strukturs/:id", h.GetStrukturByID)
			admin.POST("/strukturs", h.CreateStruktur)
			admin.PUT("/strukturs/:id", h.UpdateStruktur)
			admin.DELETE("/strukturs/:id", h.DeleteStruktur)
			admin.PUT("/strukturs/reorder", h.ReorderStrukturs)
			admin.PUT("/strukturs/:id/toggle", h.ToggleStrukturStatus)
			admin.GET("/strukturs/active-count", h.GetActiveStruktursCount)

			// Prayer Times
			admin.POST("/prayer-times", h.CreatePrayerTimes)
			admin.POST("/prayer-times/bulk", h.BulkCreatePrayerTimes)
			admin.PUT("/prayer-times/:id", h.UpdatePrayerTimes)
			admin.DELETE("/prayer-times/:id", h.DeletePrayerTimes)
			admin.POST("/prayer-times/generate", h.GeneratePrayerTimes)

			// Content
			admin.GET("/content", h.GetContentSections)
			admin.GET("/content/:id", h.GetContentSection)
			admin.PUT("/content/:id", h.UpdateContentSection)
			admin.PUT("/content/reorder", h.ReorderContentSections)
			admin.PUT("/content/:id/toggle", h.ToggleContentSection)

			// Events
			admin.GET("/events", h.GetEvents)
			admin.POST("/events", h.CreateEvent)
			admin.PUT("/events/:id", h.UpdateEvent)
			admin.DELETE("/events/:id", h.DeleteEvent)

			// Announcements
			admin.GET("/announcements", h.GetAnnouncements)
			admin.POST("/announcements", h.CreateAnnouncement)
			admin.PUT("/announcements/:id", h.UpdateAnnouncement)
			admin.DELETE("/announcements/:id", h.DeleteAnnouncement)

			// Khutbah
			admin.GET("/khutbahs", h.GetKhutbahs)
			admin.GET("/khutbahs/:id", h.GetKhutbahByID)
			admin.POST("/khutbahs", h.CreateKhutbah)
			admin.PUT("/khutbahs/:id", h.UpdateKhutbah)
			admin.DELETE("/khutbahs/:id", h.DeleteKhutbah)
			admin.PUT("/khutbahs/:id/toggle", h.ToggleKhutbahStatus)

			// History Entries
			admin.GET("/history-entries", h.GetHistoryEntries)
			admin.GET("/history-entries/:id", h.GetHistoryEntryByID)
			admin.POST("/history-entries", h.CreateHistoryEntry)
			admin.PUT("/history-entries/:id", h.UpdateHistoryEntry)
			admin.DELETE("/history-entries/:id", h.DeleteHistoryEntry)
			admin.PUT("/history-entries/:id/toggle", h.ToggleHistoryEntryStatus)

			// Reservations
			admin.GET("/reservations", h.GetReservations)
			admin.POST("/reservations/create", h.CreateReservationAdmin)
			admin.GET("/reservations/:id", h.GetReservationByID)
			admin.PUT("/reservations/:id", h.UpdateReservation)
			admin.DELETE("/reservations/:id", h.DeleteReservation)

			// Donations
			admin.GET("/donations", middleware.RequirePermission(models.PermissionViewDonationReports), h.GetDonations)
			admin.PUT("/donations/:id/confirm", h.ConfirmDonation)
			admin.GET("/donations/stats", middleware.RequirePermission(models.PermissionViewDonationStats), h.GetDonationStats)
			admin.GET("/donations/export", middleware.RequirePermission(models.PermissionExportDonations), h.ExportDonations)

			// Payment Methods
			admin.GET("/payment-methods", h.GetPaymentMethods)
			admin.POST("/payment-methods", h.CreatePaymentMethod)
			admin.PUT("/payment-methods/:id", h.UpdatePaymentMethod)
			admin.DELETE("/payment-methods/:id", h.DeletePaymentMethod)
			admin.PUT("/payment-methods/reorder", h.ReorderPaymentMethods)

			// Upload
			admin.POST("/upload", h.UploadImage)
			admin.DELETE("/upload", h.DeleteImage)

			// Gallery
			admin.GET("/gallery/items", h.GetAdminGalleryItems)
			admin.POST("/gallery/items", h.CreateGalleryItem)
			admin.PUT("/gallery/items/:id", h.UpdateGalleryItem)
			admin.DELETE("/gallery/items/:id", h.DeleteGalleryItem)
			admin.PUT("/gallery/items/reorder", h.ReorderGalleryItems)
			admin.PUT("/gallery/items/:id/toggle", h.ToggleGalleryItemPublished)

			// Settings
			admin.GET("/settings", h.GetSettings)
			admin.PUT("/settings/:key", h.UpdateSetting)

			// RBAC config
			admin.GET("/rbac/permissions", h.GetRBACPermissions)
			admin.GET("/rbac/roles", h.GetRBACRoles)
			admin.GET("/rbac/roles/:orgRole/permissions", h.GetRBACRolePermissions)
			admin.PUT("/rbac/roles/:orgRole/permissions", h.UpdateRBACRolePermissions)

			// Users
			admin.GET("/users", h.GetUsers)
			admin.POST("/users", h.CreateUser)
			admin.PUT("/users/:id", h.UpdateUser)
			admin.DELETE("/users/:id", h.DeleteUser)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "masjid-baiturrahim-api"})
	})

	// Start server
	log.Printf("Server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
