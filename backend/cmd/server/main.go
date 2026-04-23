package main

import (
	"context"
	"fmt"
	"log"
	"time"
	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/database"
	"masjid-baiturrahim-backend/internal/handlers"
	"masjid-baiturrahim-backend/internal/middleware"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/penglongli/gin-metrics/ginmetrics"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize Sentry
	if err := sentry.Init(sentry.ClientOptions{
		Dsn:              cfg.SentryDSN,
		Environment:      cfg.Environment,
		EnableTracing:    true,
		TracesSampleRate: 1.0,
	}); err != nil {
		fmt.Printf("Sentry initialization failed: %v\n", err)
	}
	defer sentry.Flush(2 * time.Second)

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
		ExposeHeaders:    []string{"Content-Length", "Content-Disposition"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	m := ginmetrics.GetMonitor()
	m.SetMetricPath("/metrics")
	m.SetSlowTime(10)
	m.SetDuration([]float64{0.1, 0.3, 0.5, 1.0, 2.0})
	m.Use(r)

	// Sentry middleware (after CORS, before other middleware)
	r.Use(sentrygin.New(sentrygin.Options{Repanic: true}))

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
	h := handlers.New(db, minioSvc, cfg)

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Public routes
		public := v1.Group("")
		{
			auth := public.Group("/auth")
			{
				auth.POST("/login", h.Login)
				auth.POST("/refresh", h.Refresh)
			}

			public.GET("/mosque", h.GetMosqueInfo)
			public.GET("/mosque-info", h.GetMosqueInfo)
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
			public.GET("/hero/slides", h.GetPublicHeroSlides)
			public.GET("/sponsors", h.GetPublicSponsors)
			public.GET("/qurban/summary", h.GetPublicQurbanSummary)
			public.POST("/reservations", h.CreateReservation)
		}

		// Protected routes
		protected := v1.Group("")
		protected.Use(middleware.AuthRequired())
		{
			protected.GET("/auth/me", h.GetMe)
			protected.POST("/auth/logout", h.Logout)
		}

		// Admin routes
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthRequired())
		{
			admin.PUT("/mosque", h.UpdateMosqueInfo)

			admin.GET("/structure", h.GetStructures)
			admin.POST("/structure", h.CreateStructure)
			admin.PUT("/structure/:id", h.UpdateStructure)
			admin.DELETE("/structure/:id", h.DeleteStructure)
			admin.PUT("/structure/reorder", h.ReorderStructures)

			admin.GET("/strukturs", h.GetStrukturs)
			admin.GET("/strukturs/:id", h.GetStrukturByID)
			admin.POST("/strukturs", h.CreateStruktur)
			admin.PUT("/strukturs/:id", h.UpdateStruktur)
			admin.DELETE("/strukturs/:id", h.DeleteStruktur)
			admin.PUT("/strukturs/reorder", h.ReorderStrukturs)
			admin.PUT("/strukturs/:id/toggle", h.ToggleStrukturStatus)
			admin.GET("/strukturs/active-count", h.GetActiveStruktursCount)

			admin.POST("/prayer-times", h.CreatePrayerTimes)
			admin.POST("/prayer-times/bulk", h.BulkCreatePrayerTimes)
			admin.PUT("/prayer-times/:id", h.UpdatePrayerTimes)
			admin.DELETE("/prayer-times/:id", h.DeletePrayerTimes)
			admin.POST("/prayer-times/generate", h.GeneratePrayerTimes)

			admin.GET("/content", h.GetContentSections)
			admin.GET("/content/summary/xlsx", middleware.RequirePermission(models.PermissionAccessKonten), h.ExportContentSummaryXLSX)
			admin.GET("/content/:id", h.GetContentSection)
			admin.PUT("/content/:id", h.UpdateContentSection)
			admin.PUT("/content/reorder", h.ReorderContentSections)
			admin.PUT("/content/:id/toggle", h.ToggleContentSection)

			admin.GET("/events", h.GetEvents)
			admin.POST("/events", h.CreateEvent)
			admin.PUT("/events/:id", h.UpdateEvent)
			admin.DELETE("/events/:id", h.DeleteEvent)

			admin.GET("/announcements", h.GetAnnouncements)
			admin.POST("/announcements", h.CreateAnnouncement)
			admin.PUT("/announcements/:id", h.UpdateAnnouncement)
			admin.DELETE("/announcements/:id", h.DeleteAnnouncement)

			admin.GET("/khutbahs", h.GetKhutbahs)
			admin.GET("/khutbahs/:id", h.GetKhutbahByID)
			admin.POST("/khutbahs", h.CreateKhutbah)
			admin.PUT("/khutbahs/:id", h.UpdateKhutbah)
			admin.DELETE("/khutbahs/:id", h.DeleteKhutbah)
			admin.PUT("/khutbahs/:id/toggle", h.ToggleKhutbahStatus)

			admin.GET("/history-entries", h.GetHistoryEntries)
			admin.GET("/history-entries/:id", h.GetHistoryEntryByID)
			admin.POST("/history-entries", h.CreateHistoryEntry)
			admin.PUT("/history-entries/:id", h.UpdateHistoryEntry)
			admin.DELETE("/history-entries/:id", h.DeleteHistoryEntry)
			admin.PUT("/history-entries/:id/toggle", h.ToggleHistoryEntryStatus)

			admin.GET("/reservations", h.GetReservations)
			admin.POST("/reservations/create", h.CreateReservationAdmin)
			admin.GET("/reservations/:id", h.GetReservationByID)
			admin.PUT("/reservations/:id", h.UpdateReservation)
			admin.DELETE("/reservations/:id", h.DeleteReservation)

			admin.GET("/donations", middleware.RequirePermission(models.PermissionViewDonationReports), h.GetDonations)
			admin.PUT("/donations/:id/confirm", h.ConfirmDonation)
			admin.GET("/donations/stats", middleware.RequirePermission(models.PermissionViewDonationStats), h.GetDonationStats)
			admin.GET("/donations/export/xlsx", middleware.RequirePermission(models.PermissionExportDonations), h.ExportDonationsXLSX)
			admin.GET("/reports/donations/summary/xlsx", middleware.RequirePermission(models.PermissionViewDonationReports), h.ExportDonationSummaryXLSX)

			admin.GET("/finance/transactions", middleware.RequirePermission(models.PermissionFinanceViewReports), h.GetFinanceTransactions)
			admin.POST("/finance/transactions", middleware.RequireAnyPermission(models.PermissionFinanceCreateTx, models.PermissionFinanceAdjustOpening), h.CreateFinanceTransaction)
			admin.GET("/finance/balance", middleware.RequirePermission(models.PermissionFinanceViewReports), h.GetFinanceBalance)
			admin.POST("/finance/transfers", middleware.RequirePermission(models.PermissionFinanceRequestTransfer), h.CreateFinanceTransfer)
			admin.GET("/finance/transfers", middleware.RequirePermission(models.PermissionFinanceViewReports), h.GetFinanceTransfers)
			admin.PUT("/finance/transfers/:id/approve", middleware.RequirePermission(models.PermissionFinanceApproveTransfer), h.ApproveFinanceTransfer)
			admin.PUT("/finance/transfers/:id/reject", middleware.RequirePermission(models.PermissionFinanceApproveTransfer), h.RejectFinanceTransfer)
			admin.GET("/finance/reports/monthly", middleware.RequirePermission(models.PermissionFinanceViewReports), h.GetFinanceMonthlyReport)
			admin.GET("/finance/reports/monthly/xlsx", middleware.RequirePermission(models.PermissionFinanceExportReports), h.ExportFinanceMonthlyXLSX)
			admin.GET("/finance/reports/monthly/pdf", middleware.RequirePermission(models.PermissionFinanceExportReports), h.ExportFinanceMonthlyPDF)
			admin.GET("/finance/reports/weekly", middleware.RequirePermission(models.PermissionFinanceViewReports), h.GetFinanceWeeklyReport)
			admin.GET("/finance/reports/weekly/xlsx", middleware.RequirePermission(models.PermissionFinanceExportReports), h.ExportFinanceWeeklyXLSX)
			admin.GET("/finance/reports/weekly/pdf", middleware.RequirePermission(models.PermissionFinanceExportReports), h.ExportFinanceWeeklyPDF)

			admin.GET("/inventaris/aset-tetap", middleware.RequirePermission(models.PermissionAccessInventaris), h.GetAsetTetap)
			admin.POST("/inventaris/aset-tetap", middleware.RequirePermission(models.PermissionAccessInventaris), h.CreateAsetTetap)
			admin.PUT("/inventaris/aset-tetap/:id", middleware.RequirePermission(models.PermissionAccessInventaris), h.UpdateAsetTetap)
			admin.DELETE("/inventaris/aset-tetap/:id", middleware.RequirePermission(models.PermissionAccessInventaris), h.DeleteAsetTetap)
			admin.GET("/inventaris/barang", middleware.RequirePermission(models.PermissionAccessInventaris), h.GetBarangTidakTetap)
			admin.POST("/inventaris/barang", middleware.RequirePermission(models.PermissionAccessInventaris), h.CreateBarangTidakTetap)
			admin.PUT("/inventaris/barang/:id", middleware.RequirePermission(models.PermissionAccessInventaris), h.UpdateBarangTidakTetap)
			admin.DELETE("/inventaris/barang/:id", middleware.RequirePermission(models.PermissionAccessInventaris), h.DeleteBarangTidakTetap)
			admin.GET("/inventaris/export/xlsx", middleware.RequirePermission(models.PermissionAccessInventaris), h.ExportInventarisXLSX)

			admin.GET("/payment-methods", h.GetPaymentMethods)
			admin.POST("/payment-methods", h.CreatePaymentMethod)
			admin.PUT("/payment-methods/:id", h.UpdatePaymentMethod)
			admin.DELETE("/payment-methods/:id", h.DeletePaymentMethod)
			admin.PUT("/payment-methods/reorder", h.ReorderPaymentMethods)

			admin.POST("/upload", h.UploadImage)
			admin.DELETE("/upload", h.DeleteImage)

			admin.GET("/gallery/items", h.GetAdminGalleryItems)
			admin.POST("/gallery/items", h.CreateGalleryItem)
			admin.PUT("/gallery/items/:id", h.UpdateGalleryItem)
			admin.DELETE("/gallery/items/:id", h.DeleteGalleryItem)
			admin.PUT("/gallery/items/reorder", h.ReorderGalleryItems)
			admin.PUT("/gallery/items/:id/toggle", h.ToggleGalleryItemPublished)

			admin.GET("/hero/slides", h.GetAdminHeroSlides)
			admin.POST("/hero/slides", h.CreateHeroSlide)
			admin.PUT("/hero/slides/:id", h.UpdateHeroSlide)
			admin.DELETE("/hero/slides/:id", h.DeleteHeroSlide)
			admin.PUT("/hero/slides/reorder", h.ReorderHeroSlides)
			admin.PUT("/hero/slides/:id/toggle", h.ToggleHeroSlidePublished)

			admin.GET("/sponsors", middleware.RequirePermission(models.PermissionAccessSponsors), h.GetAdminSponsors)
			admin.POST("/sponsors", middleware.RequirePermission(models.PermissionAccessSponsors), h.CreateSponsor)
			admin.PUT("/sponsors/:id", middleware.RequirePermission(models.PermissionAccessSponsors), h.UpdateSponsor)
			admin.DELETE("/sponsors/:id", middleware.RequirePermission(models.PermissionAccessSponsors), h.DeleteSponsor)
			admin.PUT("/sponsors/reorder", middleware.RequirePermission(models.PermissionAccessSponsors), h.ReorderSponsors)

			admin.GET("/settings", h.GetSettings)
			admin.PUT("/settings/:key", h.UpdateSetting)

			admin.GET("/qurban/settings", h.GetQurbanSettings)
			admin.PUT("/qurban/settings", h.UpdateQurbanSettings)
			admin.GET("/qurban/animals", h.GetQurbanAnimals)
			admin.POST("/qurban/animals", h.CreateQurbanAnimal)
			admin.PUT("/qurban/animals/:id", h.UpdateQurbanAnimal)
			admin.DELETE("/qurban/animals/:id", h.DeleteQurbanAnimal)
			admin.GET("/qurban/animals/:animalId/participants", h.GetQurbanParticipants)
			admin.POST("/qurban/animals/:animalId/participants", h.CreateQurbanParticipant)
			admin.PUT("/qurban/participants/:id", h.UpdateQurbanParticipant)
			admin.PUT("/qurban/participants/:id/move", h.MoveQurbanParticipant)
			admin.DELETE("/qurban/participants/:id", h.DeleteQurbanParticipant)

			admin.GET("/rbac/permissions", h.GetRBACPermissions)
			admin.GET("/rbac/roles", h.GetRBACRoles)
			admin.GET("/rbac/roles/:orgRole/permissions", h.GetRBACRolePermissions)
			admin.PUT("/rbac/roles/:orgRole/permissions", h.UpdateRBACRolePermissions)

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