package services

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"masjid-baiturrahim-backend/internal/models"
)

func TestFinanceBalance_DebitCreditAndFundIsolation(t *testing.T) {
	actor := uuid.New()
	transactions := []models.FinanceTransaction{
		{
			FundType:       models.FinanceFundKasKecil,
			TxType:         models.FinanceTxOpening,
			Amount:         100000,
			ApprovalStatus: models.FinanceApprovalApproved,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
		{
			FundType:       models.FinanceFundKasKecil,
			TxType:         models.FinanceTxPemasukan,
			Amount:         25000,
			ApprovalStatus: models.FinanceApprovalApproved,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
		{
			FundType:       models.FinanceFundKasKecil,
			TxType:         models.FinanceTxPengeluaran,
			Amount:         30000,
			ApprovalStatus: models.FinanceApprovalApproved,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
		{
			FundType:       models.FinanceFundKasBesar,
			TxType:         models.FinanceTxPemasukan,
			Amount:         500000,
			ApprovalStatus: models.FinanceApprovalApproved,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
		{
			FundType:       models.FinanceFundKasKecil,
			TxType:         models.FinanceTxPemasukan,
			Amount:         99999,
			ApprovalStatus: models.FinanceApprovalPending,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
	}

	got := ComputeFundBalance(transactions, models.FinanceFundKasKecil)
	want := 95000.0
	if got != want {
		t.Fatalf("expected kas kecil balance %.0f, got %.0f", want, got)
	}
}

func TestFinanceBalance_HasSufficientBalance(t *testing.T) {
	if !HasSufficientBalance(150000, 149999) {
		t.Fatalf("expected sufficient balance check to pass")
	}
	if HasSufficientBalance(150000, 150001) {
		t.Fatalf("expected sufficient balance check to fail")
	}
}

func TestFinanceService_GetWeekRange(t *testing.T) {
	anchor := time.Date(2026, 4, 17, 9, 0, 0, 0, time.Local) // Friday
	start, end := GetWeekRange(anchor)

	if start.Format("2006-01-02") != "2026-04-13" {
		t.Fatalf("expected week start 2026-04-13, got %s", start.Format("2006-01-02"))
	}
	if end.Format("2006-01-02") != "2026-04-20" {
		t.Fatalf("expected exclusive week end 2026-04-20, got %s", end.Format("2006-01-02"))
	}
}

func TestFinanceService_BuildFinanceReportSummary(t *testing.T) {
	actor := uuid.New()
	rows := []models.FinanceTransaction{
		{
			FundType:       models.FinanceFundKasBesar,
			TxType:         models.FinanceTxPemasukan,
			Amount:         100000,
			ApprovalStatus: models.FinanceApprovalApproved,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
		{
			FundType:       models.FinanceFundKasKecil,
			TxType:         models.FinanceTxPengeluaran,
			Amount:         25000,
			ApprovalStatus: models.FinanceApprovalApproved,
			CreatedBy:      actor,
			TxDate:         time.Now(),
		},
	}

	report := BuildFinanceReportSummary(50000, rows)
	if report.OpeningBalance != 50000 {
		t.Fatalf("expected opening 50000, got %.0f", report.OpeningBalance)
	}
	if report.TotalIncome != 100000 {
		t.Fatalf("expected income 100000, got %.0f", report.TotalIncome)
	}
	if report.TotalExpense != 25000 {
		t.Fatalf("expected expense 25000, got %.0f", report.TotalExpense)
	}
	if report.ClosingBalance != 125000 {
		t.Fatalf("expected closing 125000, got %.0f", report.ClosingBalance)
	}
}
