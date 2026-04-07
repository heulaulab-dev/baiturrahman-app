package handlers

import (
	"encoding/csv"
	"fmt"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (h *Handler) CreateDonation(c *gin.Context) {
	var donation models.Donation
	if err := c.ShouldBindJSON(&donation); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	// Generate donation code
	donation.DonationCode = services.GenerateDonationCode()

	if err := h.DB.Create(&donation).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create donation")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, donation, "Donation submitted successfully")
}

// donationsFilteredQuery applies list/export filters (no pagination).
func (h *Handler) donationsFilteredQuery(c *gin.Context) *gorm.DB {
	query := h.DB.Model(&models.Donation{})

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse(time.RFC3339, from); err == nil {
			query = query.Where("created_at >= ?", t)
		} else if date, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("created_at >= ?", date)
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse(time.RFC3339, to); err == nil {
			query = query.Where("created_at <= ?", t)
		} else if date, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("created_at <= ?", date.Add(24*time.Hour))
		}
	}
	if name := strings.TrimSpace(c.Query("donor_name")); name != "" {
		like := "%" + strings.ToLower(name) + "%"
		query = query.Where("LOWER(donor_name) LIKE ?", like)
	}
	return query
}

func (h *Handler) GetDonations(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)

	var donations []models.Donation
	var total int64

	q := h.donationsFilteredQuery(c)
	q.Count(&total)
	h.donationsFilteredQuery(c).Preload("PaymentMethod").Preload("Confirmer").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&donations)

	utils.PaginatedSuccessResponse(c, donations, page, limit, total)
}

func (h *Handler) ConfirmDonation(c *gin.Context) {
	id := c.Param("id")
	var donation models.Donation

	if err := h.DB.First(&donation, "id = ?", id).Error; err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Donation not found")
		return
	}

	userID, _ := c.Get("userID")
	userUUID := userID.(uuid.UUID)
	now := time.Now()
	donation.Status = models.DonationStatusConfirmed
	donation.ConfirmedBy = &userUUID
	donation.ConfirmedAt = &now

	if err := h.DB.Save(&donation).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to confirm donation")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, donation, "Donation confirmed successfully")
}

func (h *Handler) GetDonationStats(c *gin.Context) {
	stats, err := services.GetDonationStats(h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get donation statistics")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, stats, "")
}

func strPtr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func categoryCSVLabel(c models.DonationCategory) string {
	switch c {
	case models.DonationCategoryInfaq:
		return "Infaq Jumat"
	case models.DonationCategorySedekah:
		return "Donasi Umum"
	case models.DonationCategoryZakat:
		return "Zakat"
	case models.DonationCategoryWakaf:
		return "Wakaf"
	case models.DonationCategoryOperasional:
		return "Operasional"
	default:
		return string(c)
	}
}

func statusCSVLabel(s models.DonationStatus) string {
	switch s {
	case models.DonationStatusConfirmed:
		return "Terkonfirmasi"
	case models.DonationStatusCancelled:
		return "Ditolak"
	default:
		return "Pending"
	}
}

func (h *Handler) ExportDonations(c *gin.Context) {
	var donations []models.Donation
	if err := h.donationsFilteredQuery(c).Preload("PaymentMethod").Order("created_at DESC").Find(&donations).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengekspor data donasi")
		return
	}

	filename := fmt.Sprintf("donasi-%s.csv", time.Now().Format("2006-01-02-150405"))
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))

	w := csv.NewWriter(c.Writer)
	// UTF-8 BOM for Excel
	_, _ = c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})

	header := []string{
		"kode",
		"nama_donatur",
		"email",
		"telepon",
		"nominal",
		"kategori",
		"metode_pembayaran",
		"status",
		"catatan",
		"url_bukti",
		"tanggal_dibuat",
		"tanggal_dikonfirmasi",
	}
	if err := w.Write(header); err != nil {
		return
	}

	for _, d := range donations {
		pmName := ""
		if d.PaymentMethodID != nil && d.PaymentMethod.Name != "" {
			pmName = d.PaymentMethod.Name
		}
		confirmedAt := ""
		if d.ConfirmedAt != nil {
			confirmedAt = d.ConfirmedAt.In(time.Local).Format(time.RFC3339)
		}
		row := []string{
			d.DonationCode,
			d.DonorName,
			strPtr(d.DonorEmail),
			strPtr(d.DonorPhone),
			strconv.FormatFloat(d.Amount, 'f', 2, 64),
			categoryCSVLabel(d.Category),
			pmName,
			statusCSVLabel(d.Status),
			d.Notes,
			strPtr(d.ProofURL),
			d.CreatedAt.In(time.Local).Format(time.RFC3339),
			confirmedAt,
		}
		if err := w.Write(row); err != nil {
			return
		}
	}
	w.Flush()
}
