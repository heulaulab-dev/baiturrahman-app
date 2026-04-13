package exportxlsx

import (
	"fmt"
	"strings"
	"time"

	"masjid-baiturrahim-backend/internal/models"

	"github.com/xuri/excelize/v2"
)

func financeTxTypeLabel(t models.FinanceTxType) string {
	switch t {
	case models.FinanceTxPemasukan:
		return "Pemasukan"
	case models.FinanceTxPengeluaran:
		return "Pengeluaran"
	case models.FinanceTxTransferOut:
		return "Transfer keluar"
	case models.FinanceTxTransferIn:
		return "Transfer masuk"
	case models.FinanceTxOpening:
		return "Saldo awal"
	case models.FinanceTxAdjustment:
		return "Penyesuaian"
	default:
		return string(t)
	}
}

func fundTitleWord(ft models.FinanceFundType) string {
	if ft == models.FinanceFundKasBesar {
		return "BESAR"
	}
	return "KECIL"
}

type dkiStyles struct {
	hdr           int
	openLabel     int
	openNum       int
	rowCenter     int
	rowCenterY    int
	rowLeft       int
	rowLeftY      int
	rowNum        int
	rowNumY       int
	rowEmptyMoney int
	rowEmptyMoneyY int
	closeLabel    int
	closeNum      int
}

func buildDKIStyles(f *excelize.File) (dkiStyles, error) {
	s := `"Rp" #,##0`
	border := []excelize.Border{
		{Type: "left", Color: "000000", Style: 1},
		{Type: "right", Color: "000000", Style: 1},
		{Type: "top", Color: "000000", Style: 1},
		{Type: "bottom", Color: "000000", Style: 1},
	}
	borderHdr := []excelize.Border{
		{Type: "left", Color: "000000", Style: 1},
		{Type: "right", Color: "000000", Style: 1},
		{Type: "top", Color: "000000", Style: 2},
		{Type: "bottom", Color: "000000", Style: 2},
	}
	yellow := excelize.Fill{Type: "pattern", Color: []string{"#FFF2CC"}, Pattern: 1}

	var out dkiStyles
	var err error
	out.hdr, err = f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Border:    borderHdr,
	})
	if err != nil {
		return out, err
	}
	out.openLabel, err = f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center", WrapText: true},
		Border:    border,
	})
	if err != nil {
		return out, err
	}
	out.openNum, err = f.NewStyle(&excelize.Style{
		CustomNumFmt: &s,
		Alignment:    &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border:       border,
	})
	if err != nil {
		return out, err
	}
	out.rowCenter, err = f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border:    border,
	})
	if err != nil {
		return out, err
	}
	out.rowCenterY, err = f.NewStyle(&excelize.Style{
		Fill:      yellow,
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
		Border:    border,
	})
	if err != nil {
		return out, err
	}
	out.rowLeft, err = f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center", WrapText: true},
		Border:    border,
	})
	if err != nil {
		return out, err
	}
	out.rowLeftY, err = f.NewStyle(&excelize.Style{
		Fill:      yellow,
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center", WrapText: true},
		Border:    border,
	})
	if err != nil {
		return out, err
	}
	out.rowNum, err = f.NewStyle(&excelize.Style{
		CustomNumFmt: &s,
		Alignment:    &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border:       border,
	})
	if err != nil {
		return out, err
	}
	out.rowNumY, err = f.NewStyle(&excelize.Style{
		Fill:         yellow,
		CustomNumFmt: &s,
		Alignment:    &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border:       border,
	})
	if err != nil {
		return out, err
	}
	out.rowEmptyMoney, err = f.NewStyle(&excelize.Style{
		Border: border,
	})
	if err != nil {
		return out, err
	}
	out.rowEmptyMoneyY, err = f.NewStyle(&excelize.Style{
		Fill:   yellow,
		Border: border,
	})
	if err != nil {
		return out, err
	}
	out.closeLabel, err = f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center"},
		Border:    border,
	})
	if err != nil {
		return out, err
	}
	out.closeNum, err = f.NewStyle(&excelize.Style{
		Font:         &excelize.Font{Bold: true},
		CustomNumFmt: &s,
		Alignment:    &excelize.Alignment{Horizontal: "right", Vertical: "center"},
		Border:       border,
	})
	return out, err
}

// BuildFinanceMonthlyDKIXLSX builds the formal kas ledger workbook.
func BuildFinanceMonthlyDKIXLSX(
	fundType models.FinanceFundType,
	year, month int,
	opening float64,
	rows []models.FinanceTransaction,
	mosque models.MosqueInfo,
	bankLine string,
	logoBytes []byte,
) ([]byte, error) {
	f := excelize.NewFile()
	defer func() { _ = f.Close() }()
	defaultSheet := f.GetSheetName(0)
	sheet := "Laporan"
	_ = f.SetSheetName(defaultSheet, sheet)

	loc := time.Local
	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
	moName := idMonths[int(start.Month())]
	titlePeriod := fmt.Sprintf("PERIODE %s %d", strings.ToUpper(moName), year)
	reportTitle := fmt.Sprintf("LAPORAN KEUANGAN KAS %s %s — %s", fundTitleWord(fundType), strings.ToUpper(strings.TrimSpace(mosque.Name)), titlePeriod)

	addrParts := []string{strings.TrimSpace(mosque.Address)}
	if c := strings.TrimSpace(mosque.City); c != "" {
		addrParts = append(addrParts, c)
	}
	if p := strings.TrimSpace(mosque.Province); p != "" {
		addrParts = append(addrParts, p)
	}
	addressLine := strings.Join(addrParts, ", ")

	boldLarge, _ := f.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true, Size: 14}})
	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true, Size: 12},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
	})
	addrStyle, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "left", Vertical: "center", WrapText: true},
	})

	const (
		rowName  = 1
		rowAddr  = 2
		rowBank  = 3
		rowBlank = 4
		rowTitle = 5
		rowGap   = 6
		rowHdr   = 7
	)

	_ = f.MergeCell(sheet, "A1", "F1")
	_ = f.SetCellValue(sheet, "A1", strings.TrimSpace(mosque.Name))
	_ = f.SetCellStyle(sheet, "A1", "F1", boldLarge)

	_ = f.MergeCell(sheet, "A2", "F2")
	_ = f.SetCellValue(sheet, "A2", addressLine)
	_ = f.SetCellStyle(sheet, "A2", "F2", addrStyle)

	if strings.TrimSpace(bankLine) != "" {
		_ = f.MergeCell(sheet, "A3", "F3")
		_ = f.SetCellValue(sheet, "A3", bankLine)
		_ = f.SetCellStyle(sheet, "A3", "F3", addrStyle)
	}

	_ = f.MergeCell(sheet, "A5", "F5")
	_ = f.SetCellValue(sheet, "A5", reportTitle)
	_ = f.SetCellStyle(sheet, "A5", "F5", titleStyle)

	if len(logoBytes) > 0 {
		pic := &excelize.Picture{
			File:       logoBytes,
			Extension:  ".png",
			InsertType: excelize.PictureInsertTypePlaceOverCells,
			Format:     &excelize.GraphicOptions{ScaleX: 0.2, ScaleY: 0.2, OffsetX: 2, OffsetY: 2},
		}
		_ = f.AddPictureFromBytes(sheet, "A1", pic)
	}

	st, err := buildDKIStyles(f)
	if err != nil {
		return nil, err
	}

	headers := []string{"NO", "TGL", "RINCIAN KEGIATAN", "PEMASUKAN", "PENGELUARAN", "SALDO"}
	for i, h := range headers {
		c, _ := excelize.CoordinatesToCellName(i+1, rowHdr)
		_ = f.SetCellValue(sheet, c, h)
		_ = f.SetCellStyle(sheet, c, c, st.hdr)
	}

	openRow := rowHdr + 1
	for col := 1; col <= 6; col++ {
		c, _ := excelize.CoordinatesToCellName(col, openRow)
		switch col {
		case 3:
			_ = f.SetCellValue(sheet, c, "Saldo awal")
			_ = f.SetCellStyle(sheet, c, c, st.openLabel)
		case 6:
			_ = f.SetCellValue(sheet, c, opening)
			_ = f.SetCellStyle(sheet, c, c, st.openNum)
		default:
			_ = f.SetCellStyle(sheet, c, c, st.rowEmptyMoney)
		}
	}

	running := opening
	curRow := openRow + 1
	for i, row := range rows {
		var income, expense float64
		switch row.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening, models.FinanceTxAdjustment:
			income = row.Amount
			running += row.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			expense = row.Amount
			running -= row.Amount
		}
		rincian := strings.TrimSpace(row.Description)
		if cat := strings.TrimSpace(row.Category); cat != "" {
			rincian = cat + "\n" + rincian
		}
		rincian = financeTxTypeLabel(row.TxType) + " — " + rincian

		y := row.DisplayBelow
		cA, _ := excelize.CoordinatesToCellName(1, curRow)
		cB, _ := excelize.CoordinatesToCellName(2, curRow)
		cC, _ := excelize.CoordinatesToCellName(3, curRow)
		cD, _ := excelize.CoordinatesToCellName(4, curRow)
		cE, _ := excelize.CoordinatesToCellName(5, curRow)
		cF, _ := excelize.CoordinatesToCellName(6, curRow)

		_ = f.SetCellValue(sheet, cA, i+1)
		_ = f.SetCellValue(sheet, cB, row.TxDate.In(loc).Format("02/01/2006"))
		_ = f.SetCellValue(sheet, cC, rincian)
		if income > 0 {
			_ = f.SetCellValue(sheet, cD, income)
		}
		if expense > 0 {
			_ = f.SetCellValue(sheet, cE, expense)
		}
		_ = f.SetCellValue(sheet, cF, running)

		if y {
			_ = f.SetCellStyle(sheet, cA, cA, st.rowCenterY)
			_ = f.SetCellStyle(sheet, cB, cB, st.rowCenterY)
			_ = f.SetCellStyle(sheet, cC, cC, st.rowLeftY)
			if income > 0 {
				_ = f.SetCellStyle(sheet, cD, cD, st.rowNumY)
			} else {
				_ = f.SetCellStyle(sheet, cD, cD, st.rowEmptyMoneyY)
			}
			if expense > 0 {
				_ = f.SetCellStyle(sheet, cE, cE, st.rowNumY)
			} else {
				_ = f.SetCellStyle(sheet, cE, cE, st.rowEmptyMoneyY)
			}
			_ = f.SetCellStyle(sheet, cF, cF, st.rowNumY)
		} else {
			_ = f.SetCellStyle(sheet, cA, cA, st.rowCenter)
			_ = f.SetCellStyle(sheet, cB, cB, st.rowCenter)
			_ = f.SetCellStyle(sheet, cC, cC, st.rowLeft)
			if income > 0 {
				_ = f.SetCellStyle(sheet, cD, cD, st.rowNum)
			} else {
				_ = f.SetCellStyle(sheet, cD, cD, st.rowEmptyMoney)
			}
			if expense > 0 {
				_ = f.SetCellStyle(sheet, cE, cE, st.rowNum)
			} else {
				_ = f.SetCellStyle(sheet, cE, cE, st.rowEmptyMoney)
			}
			_ = f.SetCellStyle(sheet, cF, cF, st.rowNum)
		}
		curRow++
	}

	_ = f.SetCellValue(sheet, fmt.Sprintf("C%d", curRow), "Saldo akhir")
	_ = f.SetCellValue(sheet, fmt.Sprintf("F%d", curRow), running)
	for col := 1; col <= 6; col++ {
		c, _ := excelize.CoordinatesToCellName(col, curRow)
		switch col {
		case 3:
			_ = f.SetCellStyle(sheet, c, c, st.closeLabel)
		case 6:
			_ = f.SetCellStyle(sheet, c, c, st.closeNum)
		default:
			_ = f.SetCellStyle(sheet, c, c, st.rowEmptyMoney)
		}
	}

	_ = f.SetColWidth(sheet, "A", "A", 6)
	_ = f.SetColWidth(sheet, "B", "B", 12)
	_ = f.SetColWidth(sheet, "C", "C", 44)
	_ = f.SetColWidth(sheet, "D", "F", 18)

	buf, err := f.WriteToBuffer()
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
