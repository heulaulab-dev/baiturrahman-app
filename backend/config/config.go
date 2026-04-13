package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	FrontendURL string
	Environment string

	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioBucket    string
	MinioObjectURL string

	// Default Admin Account
	DefaultAdminUsername string
	DefaultAdminEmail    string
	DefaultAdminPassword string
	DefaultAdminFullName string

	// Optional line on finance monthly Excel header (rekening bank, dll.)
	FinanceReportBankLine string
}

func Load() *Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://masjid_user:masjid_password@localhost:5432/masjid_db?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production-min-32-characters"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		Environment: getEnv("ENVIRONMENT", "development"),

		MinioEndpoint:  getEnv("MINIO_ENDPOINT", ""),
		MinioAccessKey: getEnv("MINIO_ACCESS_KEY", ""),
		MinioSecretKey: getEnv("MINIO_SECRET_KEY", ""),
		MinioBucket:    getEnv("MINIO_BUCKET", ""),
		MinioObjectURL: getEnv("MINIO_OBJECT_URL", ""),

		DefaultAdminUsername: getEnv("DEFAULT_ADMIN_USERNAME", "admin"),
		DefaultAdminEmail:    getEnv("DEFAULT_ADMIN_EMAIL", "admin@masjidbaiturrahim.com"),
		DefaultAdminPassword: getEnv("DEFAULT_ADMIN_PASSWORD", "admin123"),
		DefaultAdminFullName: getEnv("DEFAULT_ADMIN_FULL_NAME", "Administrator"),

		FinanceReportBankLine: getEnv("FINANCE_REPORT_BANK_LINE", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
