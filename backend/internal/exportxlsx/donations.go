package exportxlsx

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/xuri/excelize/v2"
)

// DonationDetailRow is one exported donation line (pre-formatted strings + amount).
type DonationDetailRow struct {
	Kode, Nama, Email, Telepon string
	Nominal                    float64
	Kategori, Metode, Status   string
	Catatan, URLBukti          string
	TanggalDibuat              string
	TanggalKonfirmasi          string
}

// BuildDonationsDetailXLSX writes the admin donations export workbook.
func BuildDonationsDetailXLSX(rows []DonationDetailRow) ([]byte, error) {
	f := excelize.NewFile()
	defer func() { _ = f.Close() }()
	defaultSheet := f.GetSheetName(0)
	sheet := "Donasi"
	_ = f.SetSheetName(defaultSheet, sheet)

	hdrID, err := NewHeaderRowStyleID(f)
	if err != nil {
		return nil, err
	}
	idrID, err := NewIDRStyleID(f)
	if err != nil {
		return nil, err
	}

	headers := []string{
		"kode", "nama_donatur", "email", "telepon", "nominal", "kategori",
		"metode_pembayaran", "status", "catatan", "url_bukti", "tanggal_dibuat", "tanggal_dikonfirmasi",
	}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		if err := f.SetCellValue(sheet, cell, h); err != nil {
			return nil, err
		}
		_ = f.SetCellStyle(sheet, cell, cell, hdrID)
	}

	for ri, r := range rows {
		row := ri + 2
		_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", row), r.Kode)
		_ = f.SetCellValue(sheet, fmt.Sprintf("B%d", row), r.Nama)
		_ = f.SetCellValue(sheet, fmt.Sprintf("C%d", row), r.Email)
		_ = f.SetCellValue(sheet, fmt.Sprintf("D%d", row), r.Telepon)
		nc := fmt.Sprintf("E%d", row)
		_ = f.SetCellValue(sheet, nc, r.Nominal)
		_ = f.SetCellStyle(sheet, nc, nc, idrID)
		_ = f.SetCellValue(sheet, fmt.Sprintf("F%d", row), r.Kategori)
		_ = f.SetCellValue(sheet, fmt.Sprintf("G%d", row), r.Metode)
		_ = f.SetCellValue(sheet, fmt.Sprintf("H%d", row), r.Status)
		_ = f.SetCellValue(sheet, fmt.Sprintf("I%d", row), r.Catatan)
		_ = f.SetCellValue(sheet, fmt.Sprintf("J%d", row), r.URLBukti)
		_ = f.SetCellValue(sheet, fmt.Sprintf("K%d", row), r.TanggalDibuat)
		_ = f.SetCellValue(sheet, fmt.Sprintf("L%d", row), r.TanggalKonfirmasi)
	}

	lastRow := len(rows) + 1
	if lastRow < 1 {
		lastRow = 1
	}
	_ = f.SetColWidth(sheet, "A", "A", 14)
	_ = f.SetColWidth(sheet, "B", "B", 22)
	_ = f.SetColWidth(sheet, "C", "C", 24)
	_ = f.SetColWidth(sheet, "D", "D", 16)
	_ = f.SetColWidth(sheet, "E", "E", 16)
	_ = f.SetColWidth(sheet, "F", "F", 18)
	_ = f.SetColWidth(sheet, "G", "G", 18)
	_ = f.SetColWidth(sheet, "H", "H", 14)
	_ = f.SetColWidth(sheet, "I", "I", 28)
	_ = f.SetColWidth(sheet, "J", "J", 36)
	_ = f.SetColWidth(sheet, "K", "L", 22)

	if err := f.AutoFilter(sheet, fmt.Sprintf("A1:L%d", max(2, lastRow)), []excelize.AutoFilterOptions{}); err != nil {
		return nil, err
	}
	if err := ApplyFreezeTopRow(f, sheet); err != nil {
		return nil, err
	}

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// DonationSummaryParams drives the Laporan-page style summary workbook.
type DonationSummaryParams struct {
	PeriodLabel   string
	PeriodKeys    []string
	MonthLabels   []string
	PeriodIncome  float64
	PeriodCount   int64
	PendingCount  int64
	ConfirmedCount int64
	CancelledCount int64
	ByMonth       map[string]struct{ Total float64; Count int64 }
	ByCategory    map[string]struct{ Total float64; Count int64 }
}

// BuildDonationSummaryXLSX builds donation stats summary for selected period.
func BuildDonationSummaryXLSX(p DonationSummaryParams) ([]byte, error) {
	f := excelize.NewFile()
	defer func() { _ = f.Close() }()
	defaultSheet := f.GetSheetName(0)
	sheet := "Ringkasan"
	_ = f.SetSheetName(defaultSheet, sheet)

	boldID, _ := f.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true, Size: 14}})
	hdrID, _ := NewHeaderRowStyleID(f)
	idrID, _ := NewIDRStyleID(f)

	r := 1
	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), "LAPORAN KEUANGAN — DONASI")
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", r), fmt.Sprintf("A%d", r), boldID)
	r++
	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), "periode_filter")
	_ = f.SetCellValue(sheet, fmt.Sprintf("B%d", r), p.PeriodLabel)
	r += 2

	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), "RINGKASAN")
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", r), fmt.Sprintf("A%d", r), boldID)
	r++
	h1 := []string{"total_pemasukan_periode", "jumlah_transaksi_periode", "pending", "confirmed", "cancelled"}
	for i, h := range h1 {
		c, _ := excelize.CoordinatesToCellName(i+1, r)
		_ = f.SetCellValue(sheet, c, h)
		_ = f.SetCellStyle(sheet, c, c, hdrID)
	}
	r++
	v1 := []interface{}{p.PeriodIncome, float64(p.PeriodCount), float64(p.PendingCount), float64(p.ConfirmedCount), float64(p.CancelledCount)}
	for i, v := range v1 {
		c, _ := excelize.CoordinatesToCellName(i+1, r)
		_ = f.SetCellValue(sheet, c, v)
		if i == 0 {
			_ = f.SetCellStyle(sheet, c, c, idrID)
		}
	}
	r += 2

	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), "PER BULAN (DALAM PERIODE)")
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", r), fmt.Sprintf("A%d", r), boldID)
	r++
	h2 := []string{"bulan_key", "label", "total", "jumlah_transaksi"}
	for i, h := range h2 {
		c, _ := excelize.CoordinatesToCellName(i+1, r)
		_ = f.SetCellValue(sheet, c, h)
		_ = f.SetCellStyle(sheet, c, c, hdrID)
	}
	r++
	for i, key := range p.PeriodKeys {
		label := key
		if i < len(p.MonthLabels) {
			label = p.MonthLabels[i]
		}
		bm := p.ByMonth[key]
		_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), key)
		_ = f.SetCellValue(sheet, fmt.Sprintf("B%d", r), label)
		tc := fmt.Sprintf("C%d", r)
		_ = f.SetCellValue(sheet, tc, bm.Total)
		_ = f.SetCellStyle(sheet, tc, tc, idrID)
		_ = f.SetCellValue(sheet, fmt.Sprintf("D%d", r), bm.Count)
		r++
	}
	r++

	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), "PER KATEGORI (TERKONFIRMASI, AKUMULASI)")
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", r), fmt.Sprintf("A%d", r), boldID)
	r++
	h3 := []string{"kategori", "total", "jumlah_transaksi"}
	for i, h := range h3 {
		c, _ := excelize.CoordinatesToCellName(i+1, r)
		_ = f.SetCellValue(sheet, c, h)
		_ = f.SetCellStyle(sheet, c, c, hdrID)
	}
	r++
	for cat, v := range p.ByCategory {
		_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), cat)
		tc := fmt.Sprintf("B%d", r)
		_ = f.SetCellValue(sheet, tc, v.Total)
		_ = f.SetCellStyle(sheet, tc, tc, idrID)
		_ = f.SetCellValue(sheet, fmt.Sprintf("C%d", r), v.Count)
		r++
	}

	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", r), "diekspor")
	_ = f.SetCellValue(sheet, fmt.Sprintf("B%d", r), time.Now().Format(time.RFC3339))

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// ParseDonationSummaryPeriod returns label and month keys matching frontend Laporan page.
func ParseDonationSummaryPeriod(period string, now time.Time) (label string, keys []string, err error) {
	if period != "bulan-ini" && period != "3-bulan" && period != "tahun-ini" {
		return "", nil, errors.New("invalid period")
	}
	y, m, _ := now.Date()
	loc := now.Location()
	cur := time.Date(y, m, 1, 0, 0, 0, 0, loc)
	key := func(t time.Time) string {
		return fmt.Sprintf("%04d-%02d", t.Year(), t.Month())
	}
	switch period {
	case "bulan-ini":
		return "Bulan ini", []string{key(cur)}, nil
	case "3-bulan":
		ks := make([]string, 3)
		for i := 0; i < 3; i++ {
			d := cur.AddDate(0, -i, 0)
			ks[i] = key(d)
		}
		return "3 bulan terakhir", ks, nil
	case "tahun-ini":
		var ks []string
		for mo := time.January; mo <= m; mo++ {
			ks = append(ks, fmt.Sprintf("%04d-%02d", y, mo))
		}
		return "Tahun ini", ks, nil
	default:
		return "", nil, errors.New("invalid period")
	}
}

var idMonths = []string{
	"", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
	"Juli", "Agustus", "September", "Oktober", "November", "Desember",
}

// MonthKeyToIDLabel turns "2026-04" into "April 2026".
func MonthKeyToIDLabel(monthKey string) string {
	parts := strings.SplitN(monthKey, "-", 3)
	if len(parts) != 2 {
		return monthKey
	}
	year, err1 := strconv.Atoi(parts[0])
	mo, err2 := strconv.Atoi(parts[1])
	if err1 != nil || err2 != nil || mo < 1 || mo > 12 {
		return monthKey
	}
	return fmt.Sprintf("%s %d", idMonths[mo], year)
}
