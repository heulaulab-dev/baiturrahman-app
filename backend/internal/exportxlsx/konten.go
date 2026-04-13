package exportxlsx

import (
	"fmt"
	"strings"
	"time"
	"unicode/utf8"

	"masjid-baiturrahim-backend/internal/models"

	"github.com/xuri/excelize/v2"
)

func clipRunes(s string, max int) string {
	s = strings.TrimSpace(strings.ReplaceAll(s, "\n", " "))
	if utf8.RuneCountInString(s) <= max {
		return s
	}
	r := []rune(s)
	if len(r) > max {
		return string(r[:max]) + "…"
	}
	return s
}

// BuildContentSummaryXLSX exports events, announcements, khutbahs on separate sheets.
func BuildContentSummaryXLSX(events []models.Event, announcements []models.Announcement, khutbahs []models.Khutbah, leftSigner, rightSigner string) ([]byte, error) {
	f := excelize.NewFile()
	defer func() { _ = f.Close() }()
	defaultName := f.GetSheetName(0)
	_ = f.SetSheetName(defaultName, "Event")

	if _, err := f.NewSheet("Berita"); err != nil {
		return nil, err
	}
	if _, err := f.NewSheet("Khutbah"); err != nil {
		return nil, err
	}

	hdrID, _ := NewHeaderRowStyleID(f)

	writeEventSheet := func() error {
		sh := "Event"
		h := []string{"id", "judul", "tanggal", "status", "deskripsi_ringkas"}
		for i, x := range h {
			c, _ := excelize.CoordinatesToCellName(i+1, 1)
			_ = f.SetCellValue(sh, c, x)
			_ = f.SetCellStyle(sh, c, c, hdrID)
		}
		for ri, e := range events {
			r := ri + 2
			_ = f.SetCellValue(sh, fmt.Sprintf("A%d", r), e.ID.String())
			_ = f.SetCellValue(sh, fmt.Sprintf("B%d", r), e.Title)
			_ = f.SetCellValue(sh, fmt.Sprintf("C%d", r), e.EventDate.Format("2006-01-02"))
			_ = f.SetCellValue(sh, fmt.Sprintf("D%d", r), string(e.Status))
			_ = f.SetCellValue(sh, fmt.Sprintf("E%d", r), clipRunes(e.Description, 200))
		}
		last := len(events) + 1
		if last < 2 {
			last = 2
		}
		_ = f.AutoFilter(sh, fmt.Sprintf("A1:E%d", last), []excelize.AutoFilterOptions{})
		AppendStandardFooter(f, sh, last+2, "E", leftSigner, rightSigner)
		return ApplyFreezeTopRow(f, sh)
	}

	writeBeritaSheet := func() error {
		sh := "Berita"
		h := []string{"id", "judul", "terbit", "kategori", "ringkas"}
		for i, x := range h {
			c, _ := excelize.CoordinatesToCellName(i+1, 1)
			_ = f.SetCellValue(sh, c, x)
			_ = f.SetCellStyle(sh, c, c, hdrID)
		}
		for ri, a := range announcements {
			r := ri + 2
			pub := a.CreatedAt.Format(time.RFC3339)
			if a.PublishedAt != nil {
				pub = a.PublishedAt.Format(time.RFC3339)
			}
			_ = f.SetCellValue(sh, fmt.Sprintf("A%d", r), a.ID.String())
			_ = f.SetCellValue(sh, fmt.Sprintf("B%d", r), a.Title)
			_ = f.SetCellValue(sh, fmt.Sprintf("C%d", r), pub)
			_ = f.SetCellValue(sh, fmt.Sprintf("D%d", r), string(a.Category))
			_ = f.SetCellValue(sh, fmt.Sprintf("E%d", r), clipRunes(a.Content, 200))
		}
		last := len(announcements) + 1
		if last < 2 {
			last = 2
		}
		_ = f.AutoFilter(sh, fmt.Sprintf("A1:E%d", last), []excelize.AutoFilterOptions{})
		AppendStandardFooter(f, sh, last+2, "E", leftSigner, rightSigner)
		return ApplyFreezeTopRow(f, sh)
	}

	writeKhutbahSheet := func() error {
		sh := "Khutbah"
		h := []string{"id", "tema", "khatib", "tanggal", "status", "file_url"}
		for i, x := range h {
			c, _ := excelize.CoordinatesToCellName(i+1, 1)
			_ = f.SetCellValue(sh, c, x)
			_ = f.SetCellStyle(sh, c, c, hdrID)
		}
		for ri, k := range khutbahs {
			r := ri + 2
			fu := ""
			if k.FileURL != nil {
				fu = *k.FileURL
			}
			_ = f.SetCellValue(sh, fmt.Sprintf("A%d", r), k.ID.String())
			_ = f.SetCellValue(sh, fmt.Sprintf("B%d", r), k.Tema)
			_ = f.SetCellValue(sh, fmt.Sprintf("C%d", r), k.Khatib)
			_ = f.SetCellValue(sh, fmt.Sprintf("D%d", r), k.Date.Format("2006-01-02"))
			_ = f.SetCellValue(sh, fmt.Sprintf("E%d", r), string(k.Status))
			_ = f.SetCellValue(sh, fmt.Sprintf("F%d", r), fu)
		}
		last := len(khutbahs) + 1
		if last < 2 {
			last = 2
		}
		_ = f.AutoFilter(sh, fmt.Sprintf("A1:F%d", last), []excelize.AutoFilterOptions{})
		AppendStandardFooter(f, sh, last+2, "F", leftSigner, rightSigner)
		return ApplyFreezeTopRow(f, sh)
	}

	if err := writeEventSheet(); err != nil {
		return nil, err
	}
	if err := writeBeritaSheet(); err != nil {
		return nil, err
	}
	if err := writeKhutbahSheet(); err != nil {
		return nil, err
	}

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
