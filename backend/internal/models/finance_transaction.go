package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FinanceFundType string

const (
	FinanceFundKasBesar FinanceFundType = "kas_besar"
	FinanceFundKasKecil FinanceFundType = "kas_kecil"
)

type FinanceTxType string

const (
	FinanceTxPemasukan   FinanceTxType = "pemasukan"
	FinanceTxPengeluaran FinanceTxType = "pengeluaran"
	FinanceTxTransferOut FinanceTxType = "transfer_out"
	FinanceTxTransferIn  FinanceTxType = "transfer_in"
	FinanceTxOpening     FinanceTxType = "opening_balance"
	FinanceTxAdjustment  FinanceTxType = "adjustment"
)

type FinanceApprovalStatus string

const (
	FinanceApprovalPending  FinanceApprovalStatus = "pending"
	FinanceApprovalApproved FinanceApprovalStatus = "approved"
	FinanceApprovalRejected FinanceApprovalStatus = "rejected"
)

type FinanceTransaction struct {
	ID               uuid.UUID             `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FundType         FinanceFundType       `gorm:"type:varchar(20);not null;index:idx_finance_fund_date,priority:1" json:"fund_type"`
	TxType           FinanceTxType         `gorm:"type:varchar(30);not null;index" json:"tx_type"`
	TxDate           time.Time             `gorm:"type:date;not null;index:idx_finance_fund_date,priority:2" json:"tx_date"`
	Amount           float64               `gorm:"type:decimal(15,2);not null" json:"amount"`
	Category         string                `gorm:"type:varchar(100);not null;index" json:"category"`
	Description      string                `gorm:"type:text;not null" json:"description"`
	ReferenceNo      *string               `gorm:"type:varchar(100)" json:"reference_no,omitempty"`
	DisplayBelow     bool                  `gorm:"default:false;not null" json:"display_below"`
	ApprovalStatus   FinanceApprovalStatus `gorm:"type:varchar(20);default:'approved';not null;index" json:"approval_status"`
	LinkedTransferID *uuid.UUID            `gorm:"type:uuid;index" json:"linked_transfer_id,omitempty"`
	CreatedBy        uuid.UUID             `gorm:"type:uuid;not null;index" json:"created_by"`
	ApprovedBy       *uuid.UUID            `gorm:"type:uuid;index" json:"approved_by,omitempty"`
	ApprovedAt       *time.Time            `json:"approved_at,omitempty"`
	CreatedAt        time.Time             `json:"created_at"`
	UpdatedAt        time.Time             `json:"updated_at"`
	DeletedAt        gorm.DeletedAt        `gorm:"index" json:"-"`

	Creator  User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Approver User `gorm:"foreignKey:ApprovedBy" json:"approver,omitempty"`
}

func (f *FinanceTransaction) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}
