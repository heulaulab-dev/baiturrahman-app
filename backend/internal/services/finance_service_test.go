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
