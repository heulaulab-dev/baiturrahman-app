package exportxlsx

import (
	"github.com/xuri/excelize/v2"
)

// NewBoldStyleID returns style ID for bold text.
func NewBoldStyleID(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true}})
}

// NewHeaderRowStyleID bold + optional bottom border.
func NewHeaderRowStyleID(f *excelize.File) (int, error) {
	return f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Alignment: &excelize.Alignment{Horizontal: "center", Vertical: "center", WrapText: true},
		Border: []excelize.Border{
			{Type: "bottom", Color: "000000", Style: 1},
		},
	})
}

// NewIDRStyleID numeric cell with Rupiah-style display.
func NewIDRStyleID(f *excelize.File) (int, error) {
	s := `"Rp" #,##0`
	return f.NewStyle(&excelize.Style{
		CustomNumFmt: &s,
		Alignment:    &excelize.Alignment{Horizontal: "right", Vertical: "center"},
	})
}

// ApplyFreezeTopRow sets freeze pane below row 1.
func ApplyFreezeTopRow(f *excelize.File, sheet string) error {
	return f.SetPanes(sheet, &excelize.Panes{
		Freeze:      true,
		Split:       false,
		XSplit:      0,
		YSplit:      1,
		TopLeftCell: "A2",
		ActivePane:  "bottomLeft",
	})
}
