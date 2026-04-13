package handlers

import "masjid-baiturrahim-backend/internal/models"

type excelExportSettings struct {
	BankLine       string
	HeaderImageURL string
	SignerLeftName string
	SignerRightName string
}

func (h *Handler) getExcelExportSettings() excelExportSettings {
	out := excelExportSettings{
		SignerLeftName:  "H. MUHAMMAD YAHYA ZUBIR",
		SignerRightName: "MOHAMAD DJOKO SANTOSO",
	}
	if h.Cfg != nil {
		out.BankLine = h.Cfg.FinanceReportBankLine
		if h.Cfg.ExcelSignerLeftName != "" {
			out.SignerLeftName = h.Cfg.ExcelSignerLeftName
		}
		if h.Cfg.ExcelSignerRightName != "" {
			out.SignerRightName = h.Cfg.ExcelSignerRightName
		}
	}

	var settings []models.Setting
	_ = h.DB.Where("key IN ?", []string{
		"excel.bank_line",
		"excel.header_image_url",
		"excel.signer_left_name",
		"excel.signer_right_name",
	}).Find(&settings).Error

	for _, s := range settings {
		switch s.Key {
		case "excel.bank_line":
			out.BankLine = s.Value
		case "excel.header_image_url":
			out.HeaderImageURL = s.Value
		case "excel.signer_left_name":
			if s.Value != "" {
				out.SignerLeftName = s.Value
			}
		case "excel.signer_right_name":
			if s.Value != "" {
				out.SignerRightName = s.Value
			}
		}
	}

	return out
}

