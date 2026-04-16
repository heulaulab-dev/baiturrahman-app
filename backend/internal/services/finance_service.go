package services

import (
	"time"

	"masjid-baiturrahim-backend/internal/models"
)

// ComputeFundBalance calculates approved balance for one fund from in-memory rows.
func ComputeFundBalance(transactions []models.FinanceTransaction, fund models.FinanceFundType) float64 {
	var balance float64
	for _, tx := range transactions {
		if tx.FundType != fund || tx.ApprovalStatus != models.FinanceApprovalApproved {
			continue
		}
		switch tx.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening:
			balance += tx.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			balance -= tx.Amount
		case models.FinanceTxAdjustment:
			balance += tx.Amount
		}
	}
	return balance
}

func HasSufficientBalance(balance float64, amount float64) bool {
	return balance >= amount
}

type FinancePeriodType string

const (
	FinancePeriodMonthly FinancePeriodType = "monthly"
	FinancePeriodWeekly  FinancePeriodType = "weekly"
)

type FinanceFundScope string

const (
	FinanceFundScopeKasBesar FinanceFundScope = "kas_besar"
	FinanceFundScopeKasKecil FinanceFundScope = "kas_kecil"
	FinanceFundScopeAll      FinanceFundScope = "all"
)

type FinanceReportRow struct {
	Transaction    models.FinanceTransaction
	RunningBalance float64
}

type FinanceReportSummary struct {
	OpeningBalance float64
	ClosingBalance float64
	TotalIncome    float64
	TotalExpense   float64
	Rows           []FinanceReportRow
	DisplayBelow   []FinanceReportRow
}

func GetWeekRange(anchorDate time.Time) (time.Time, time.Time) {
	loc := anchorDate.Location()
	normalized := time.Date(anchorDate.Year(), anchorDate.Month(), anchorDate.Day(), 0, 0, 0, 0, loc)
	weekday := int(normalized.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	weekStart := normalized.AddDate(0, 0, -(weekday - 1))
	weekEnd := weekStart.AddDate(0, 0, 7)
	return weekStart, weekEnd
}

func ComputeCombinedBalance(transactions []models.FinanceTransaction) float64 {
	var balance float64
	for _, tx := range transactions {
		if tx.ApprovalStatus != models.FinanceApprovalApproved {
			continue
		}
		switch tx.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening, models.FinanceTxAdjustment:
			balance += tx.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			balance -= tx.Amount
		}
	}
	return balance
}

func BuildFinanceReportSummary(openingBalance float64, transactions []models.FinanceTransaction) FinanceReportSummary {
	running := openingBalance
	rows := make([]FinanceReportRow, 0, len(transactions))
	displayBelow := make([]FinanceReportRow, 0)
	var income, expense float64

	for _, tx := range transactions {
		switch tx.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening, models.FinanceTxAdjustment:
			running += tx.Amount
			income += tx.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			running -= tx.Amount
			expense += tx.Amount
		}

		row := FinanceReportRow{
			Transaction:    tx,
			RunningBalance: running,
		}
		rows = append(rows, row)
		if tx.DisplayBelow {
			displayBelow = append(displayBelow, row)
		}
	}

	return FinanceReportSummary{
		OpeningBalance: openingBalance,
		ClosingBalance: running,
		TotalIncome:    income,
		TotalExpense:   expense,
		Rows:           rows,
		DisplayBelow:   displayBelow,
	}
}
