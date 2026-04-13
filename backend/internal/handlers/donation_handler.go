package handlers

import (
	"fmt"
	"masjid-baiturrahim-backend/internal/exportxlsx"
	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"
	"net/http"
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

func (h *Handler) ExportDonationsXLSX(c *gin.Context) {
	var donations []models.Donation
	if err := h.donationsFilteredQuery(c).Preload("PaymentMethod").Order("created_at DESC").Find(&donations).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Gagal mengekspor data donasi")
		return
	}

	rows := make([]exportxlsx.DonationDetailRow, 0, len(donations))
	for _, d := range donations {
		pmName := ""
		if d.PaymentMethodID != nil && d.PaymentMethod.Name != "" {
			pmName = d.PaymentMethod.Name
		}
		confirmedAt := ""
		if d.ConfirmedAt != nil {
			confirmedAt = d.ConfirmedAt.In(time.Local).Format(time.RFC3339)
		}
		rows = append(rows, exportxlsx.DonationDetailRow{
			Kode:              d.DonationCode,
			Nama:              d.DonorName,
			Email:             strPtr(d.DonorEmail),
			Telepon:           strPtr(d.DonorPhone),
			Nominal:           d.Amount,
			Kategori:          categoryCSVLabel(d.Category),
			Metode:            pmName,
			Status:            statusCSVLabel(d.Status),
			Catatan:           d.Notes,
			URLBukti:          strPtr(d.ProofURL),
			TanggalDibuat:     d.CreatedAt.In(time.Local).Format(time.RFC3339),
			TanggalKonfirmasi: confirmedAt,
		})
	}

	buf, err := exportxlsx.BuildDonationsDetailXLSX(rows)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	filename := fmt.Sprintf("donasi-%s.xlsx", time.Now().Format("2006-01-02-150405"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
}

func donationAggFromMap(v interface{}) (total float64, count int64) {
	m, ok := v.(map[string]interface{})
	if !ok {
		return 0, 0
	}
	switch t := m["total"].(type) {
	case float64:
		total = t
	}
	switch n := m["count"].(type) {
	case float64:
		count = int64(n)
	case int64:
		count = n
	case int:
		count = int64(n)
	}
	return total, count
}

func (h *Handler) ExportDonationSummaryXLSX(c *gin.Context) {
	period := c.DefaultQuery("period", "bulan-ini")
	now := time.Now()
	label, keys, err := exportxlsx.ParseDonationSummaryPeriod(period, now)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "period must be bulan-ini, 3-bulan, or tahun-ini")
		return
	}

	stats, err := services.GetDonationStats(h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to get donation statistics")
		return
	}

	byMonth := make(map[string]struct{ Total float64; Count int64 })
	for k, v := range stats.ByMonth {
		t, n := donationAggFromMap(v)
		byMonth[k] = struct{ Total float64; Count int64 }{Total: t, Count: n}
	}
	byCategory := make(map[string]struct{ Total float64; Count int64 })
	for k, v := range stats.ByCategory {
		t, n := donationAggFromMap(v)
		byCategory[k] = struct{ Total float64; Count int64 }{Total: t, Count: n}
	}

	var periodIncome float64
	var periodCount int64
	monthLabels := make([]string, len(keys))
	for i, k := range keys {
		e := byMonth[k]
		periodIncome += e.Total
		periodCount += e.Count
		monthLabels[i] = exportxlsx.MonthKeyToIDLabel(k)
	}

	params := exportxlsx.DonationSummaryParams{
		PeriodLabel:    label,
		PeriodKeys:     keys,
		MonthLabels:    monthLabels,
		PeriodIncome:   periodIncome,
		PeriodCount:    periodCount,
		PendingCount:   stats.PendingCount,
		ConfirmedCount: stats.ConfirmedCount,
		CancelledCount: stats.CancelledCount,
		ByMonth:        byMonth,
		ByCategory:     byCategory,
	}

	buf, err := exportxlsx.BuildDonationSummaryXLSX(params)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	safe := strings.Map(func(r rune) rune {
		if r == ' ' {
			return '_'
		}
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' {
			return r
		}
		return -1
	}, label)
	filename := fmt.Sprintf("laporan-donasi-ringkasan_%s_%s.xlsx", safe, now.Format("2006-01-02"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
}
