package services

import "masjid-baiturrahim-backend/internal/models"

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
