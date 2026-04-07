package main

import (
	"log"
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/database"
	"masjid-baiturrahim-backend/internal/handlers"
	"masjid-baiturrahim-backend/internal/middleware"

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
	}-

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
	h := handlers.New(db)

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
			public.GET("/structure", h.GetStructures)
			public.GET("/prayer-times", h.GetPrayerTimesByDate)
			public.GET("/prayer-times/month", h.GetPrayerTimesByMonth)
			public.GET("/content", h.GetContentSections)
			public.GET("/events", h.GetEvents)
			public.GET("/events/:slug", h.GetEventBySlug)
			public.GET("/announcements", h.GetAnnouncements)
			public.POST("/donations", h.CreateDonation)
			public.GET("/payment-methods", h.GetPaymentMethods)
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

			// Donations
			admin.GET("/donations", h.GetDonations)
			admin.PUT("/donations/:id/confirm", h.ConfirmDonation)
			admin.GET("/donations/stats", h.GetDonationStats)
			admin.GET("/donations/export", h.ExportDonations)

			// Payment Methods
			admin.GET("/payment-methods", h.GetPaymentMethods)
			admin.POST("/payment-methods", h.CreatePaymentMethod)
			admin.PUT("/payment-methods/:id", h.UpdatePaymentMethod)
			admin.DELETE("/payment-methods/:id", h.DeletePaymentMethod)
			admin.PUT("/payment-methods/reorder", h.ReorderPaymentMethods)

			// Upload
			admin.POST("/upload", h.UploadImage)
			admin.DELETE("/upload", h.DeleteImage)

			// Settings
			admin.GET("/settings", h.GetSettings)
			admin.PUT("/settings/:key", h.UpdateSetting)

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
