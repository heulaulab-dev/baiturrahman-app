package exportxlsx

import (
	"fmt"

	"masjid-baiturrahim-backend/internal/models"

	"github.com/xuri/excelize/v2"
)

// BuildInventarisXLSX writes aset tetap and barang tidak tetap sheets.
func BuildInventarisXLSX(aset []models.AsetTetap, barang []models.BarangTidakTetap) ([]byte, error) {
	f := excelize.NewFile()
	defer func() { _ = f.Close() }()
	defaultName := f.GetSheetName(0)
	_ = f.SetSheetName(defaultName, "Aset_tetap")
	if _, err := f.NewSheet("Barang"); err != nil {
		return nil, err
	}

	hdrID, _ := NewHeaderRowStyleID(f)

	shA := "Aset_tetap"
	hA := []string{"no", "nama_aset", "luas", "updated_at"}
	for i, x := range hA {
		c, _ := excelize.CoordinatesToCellName(i+1, 1)
		_ = f.SetCellValue(shA, c, x)
		_ = f.SetCellStyle(shA, c, c, hdrID)
	}
	for i, a := range aset {
		r := i + 2
		luas := ""
		if a.Luas != nil {
			luas = *a.Luas
		}
		_ = f.SetCellValue(shA, fmt.Sprintf("A%d", r), i+1)
		_ = f.SetCellValue(shA, fmt.Sprintf("B%d", r), a.NamaAset)
		_ = f.SetCellValue(shA, fmt.Sprintf("C%d", r), luas)
		_ = f.SetCellValue(shA, fmt.Sprintf("D%d", r), a.UpdatedAt.Format("2006-01-02 15:04:05"))
	}
	lastA := len(aset) + 1
	if lastA < 2 {
		lastA = 2
	}
	_ = f.AutoFilter(shA, fmt.Sprintf("A1:D%d", lastA), []excelize.AutoFilterOptions{})
	_ = ApplyFreezeTopRow(f, shA)

	shB := "Barang"
	hB := []string{"no", "kategori", "nama_barang", "jumlah", "satuan", "kondisi", "keterangan", "updated_at"}
	for i, x := range hB {
		c, _ := excelize.CoordinatesToCellName(i+1, 1)
		_ = f.SetCellValue(shB, c, x)
		_ = f.SetCellStyle(shB, c, c, hdrID)
	}
	for i, b := range barang {
		r := i + 2
		kondisi := "Rusak"
		if b.KondisiBaik {
			kondisi = "Baik"
		}
		ket := ""
		if b.Keterangan != nil {
			ket = *b.Keterangan
		}
		sat := ""
		if b.Satuan != nil {
			sat = *b.Satuan
		}
		_ = f.SetCellValue(shB, fmt.Sprintf("A%d", r), i+1)
		_ = f.SetCellValue(shB, fmt.Sprintf("B%d", r), b.Kategori)
		_ = f.SetCellValue(shB, fmt.Sprintf("C%d", r), b.NamaBarang)
		if b.Jumlah != nil {
			_ = f.SetCellValue(shB, fmt.Sprintf("D%d", r), *b.Jumlah)
		}
		_ = f.SetCellValue(shB, fmt.Sprintf("E%d", r), sat)
		_ = f.SetCellValue(shB, fmt.Sprintf("F%d", r), kondisi)
		_ = f.SetCellValue(shB, fmt.Sprintf("G%d", r), ket)
		_ = f.SetCellValue(shB, fmt.Sprintf("H%d", r), b.UpdatedAt.Format("2006-01-02 15:04:05"))
	}
	lastB := len(barang) + 1
	if lastB < 2 {
		lastB = 2
	}
	_ = f.AutoFilter(shB, fmt.Sprintf("A1:H%d", lastB), []excelize.AutoFilterOptions{})
	_ = ApplyFreezeTopRow(f, shB)

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
