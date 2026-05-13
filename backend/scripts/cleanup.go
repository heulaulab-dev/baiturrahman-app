package main

import (
	"flag"
	"fmt"
	"log"
	"strings"

	"masjid-baiturrahim-backend/config"
	"masjid-baiturrahim-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Tables to clean (everything except users admin and permissions)
var tablesToClean = []string{
	"organization_structures",
	"prayer_times",
	"content_sections",
	"events",
	"announcements",
	"donations",
	"payment_methods",
	"khutbahs",
	"settings",
	"history_entries",
	"strukturs",
	"aset_tetaps",
	"barang_tidak_tetaps",
	"reservations",
	"gallery_items",
	"hero_slides",
	"sponsors",
	"finance_transactions",
	"qurban_settings",
	"qurban_animals",
	"qurban_participants",
}

// Tables to preserve entirely
var tablesToPreserve = []string{
	"permissions",
	"role_permissions",
	"mosque_infos",
}

func main() {
	dryRun := flag.Bool("dry-run", false, "Preview what will be deleted without making changes")
	force := flag.Bool("force", false, "Skip environment check")
	flag.Parse()

	cfg := config.Load()

	// Safety check
	if cfg.Environment != "development" && !*force {
		log.Fatal("ERROR: This script is only for development databases. Use --force to bypass.")
	}

	// Connect to database
	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}

	fmt.Println("\n========================================")
	fmt.Println("  DATABASE CLEANUP SCRIPT")
	fmt.Println("========================================\n")

	// Get admin user info for confirmation
	var adminUsers []models.User
	db.Where("role = ?", models.RoleAdmin).Find(&adminUsers)
	fmt.Printf("Found %d admin user(s) that will be preserved:\n", len(adminUsers))
	for _, u := range adminUsers {
		fmt.Printf("  - %s (%s)\n", u.Username, u.Email)
	}
	fmt.Println()

	// Count records in each table
	fmt.Println("Current record counts:")
	fmt.Println(strings.Repeat("-", 40))

	totalRecords := 0
	for _, table := range tablesToClean {
		var count int64
		db.Table(table).Count(&count)
		fmt.Printf("  %-30s %6d\n", table, count)
		totalRecords += int(count)
	}

	fmt.Println(strings.Repeat("-", 40))
	fmt.Printf("  %-30s %6d (TOTAL)\n", "TOTAL", totalRecords)
	fmt.Println()

	if *dryRun {
		fmt.Println(">>> DRY RUN MODE - No changes made <<<\n")
		fmt.Println("To execute the cleanup, run without --dry-run:")
		fmt.Println("  go run scripts/cleanup.go")
		return
	}

	// Confirm before proceeding
	fmt.Println("WARNING: This will DELETE all data from the tables above!")
	fmt.Println("The following will be preserved:")
	fmt.Println("  - Admin users (role = 'admin')")
	fmt.Println("  - Permissions and role_permissions tables")
	fmt.Println("  - Mosque info table")
	fmt.Println()

	if !*force {
		fmt.Print("Type 'yes' to confirm: ")
		var confirm string
		fmt.Scanln(&confirm)
		if confirm != "yes" {
			fmt.Println("Aborted.")
			return
		}
	} else {
		fmt.Println("(--force flag set, skipping confirmation)")
	}

	fmt.Println("\nStarting cleanup...")

	// Disable foreign key constraints temporarily
	_, _ = sqlDB.Exec("SET CONSTRAINTS ALL DEFERRED")

	// Clean each table
	for _, table := range tablesToClean {
		result := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table))
		if result.Error != nil {
			log.Printf("Warning: Failed to truncate %s: %v", table, result.Error)
		} else {
			fmt.Printf("  Cleaned: %s\n", table)
		}
	}

	// Delete non-admin users (keep admin role users only)
	deleteResult := db.Where("role != ?", models.RoleAdmin).Delete(&models.User{})
	if deleteResult.Error != nil {
		log.Printf("Warning: Failed to delete non-admin users: %v", deleteResult.Error)
	} else {
		fmt.Printf("  Deleted %d non-admin users\n", deleteResult.RowsAffected)
	}

	fmt.Println("\n========================================")
	fmt.Println("  CLEANUP COMPLETE")
	fmt.Println("========================================\n")

	// Verify admin still exists
	var remainingUsers int64
	db.Model(&models.User{}).Count(&remainingUsers)
	fmt.Printf("Remaining users: %d (should be %d admin)\n", remainingUsers, len(adminUsers))
}