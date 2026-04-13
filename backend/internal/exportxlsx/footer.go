package exportxlsx

import (
	"fmt"

	"github.com/xuri/excelize/v2"
)

// AppendStandardFooter writes signature blocks below exported tables.
// Returns the last row written.
func AppendStandardFooter(f *excelize.File, sheet string, startRow int, lastCol string, leftName, rightName string) int {
	if leftName == "" {
		leftName = "H. MUHAMMAD YAHYA ZUBIR"
	}
	if rightName == "" {
		rightName = "MOHAMAD DJOKO SANTOSO"
	}

	titleStyle, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})
	centerStyle, _ := f.NewStyle(&excelize.Style{
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center"},
	})
	signLineStyle, _ := f.NewStyle(&excelize.Style{
		Border: []excelize.Border{
			{Type: "top", Color: "000000", Style: 1},
		},
	})

	leftEnd := "C"
	rightStart := "D"
	if lastCol == "E" {
		leftEnd = "B"
		rightStart = "C"
	}

	row := startRow
	_ = f.MergeCell(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", leftEnd, row))
	_ = f.MergeCell(sheet, fmt.Sprintf("%s%d", rightStart, row), fmt.Sprintf("%s%d", lastCol, row))
	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", row), "MENGETAHUI")
	_ = f.SetCellValue(sheet, fmt.Sprintf("%s%d", rightStart, row), "DIBUAT OLEH")
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", leftEnd, row), titleStyle)
	_ = f.SetCellStyle(sheet, fmt.Sprintf("%s%d", rightStart, row), fmt.Sprintf("%s%d", lastCol, row), titleStyle)

	row++
	_ = f.MergeCell(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", leftEnd, row))
	_ = f.MergeCell(sheet, fmt.Sprintf("%s%d", rightStart, row), fmt.Sprintf("%s%d", lastCol, row))
	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", row), "KETUA DKM")
	_ = f.SetCellValue(sheet, fmt.Sprintf("%s%d", rightStart, row), "BENDAHARA I")
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", lastCol, row), centerStyle)

	row += 3
	_ = f.MergeCell(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", leftEnd, row))
	_ = f.MergeCell(sheet, fmt.Sprintf("%s%d", rightStart, row), fmt.Sprintf("%s%d", lastCol, row))
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", leftEnd, row), signLineStyle)
	_ = f.SetCellStyle(sheet, fmt.Sprintf("%s%d", rightStart, row), fmt.Sprintf("%s%d", lastCol, row), signLineStyle)

	row++
	_ = f.MergeCell(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", leftEnd, row))
	_ = f.MergeCell(sheet, fmt.Sprintf("%s%d", rightStart, row), fmt.Sprintf("%s%d", lastCol, row))
	_ = f.SetCellValue(sheet, fmt.Sprintf("A%d", row), leftName)
	_ = f.SetCellValue(sheet, fmt.Sprintf("%s%d", rightStart, row), rightName)
	_ = f.SetCellStyle(sheet, fmt.Sprintf("A%d", row), fmt.Sprintf("%s%d", lastCol, row), centerStyle)

	return row
}

