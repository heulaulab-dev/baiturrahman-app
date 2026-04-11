package handlers

import (
	"bytes"
	"encoding/csv"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"masjid-baiturrahim-backend/internal/models"
	"masjid-baiturrahim-backend/internal/services"
	"masjid-baiturrahim-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jung-kurt/gofpdf"
	"gorm.io/gorm"
)

type createFinanceTransactionRequest struct {
	FundType     models.FinanceFundType `json:"fund_type" binding:"required"`
	TxType       models.FinanceTxType   `json:"tx_type" binding:"required"`
	TxDate       string                 `json:"tx_date" binding:"required"`
	Amount       float64                `json:"amount" binding:"required"`
	Category     string                 `json:"category" binding:"required"`
	Description  string                 `json:"description" binding:"required"`
	ReferenceNo  *string                `json:"reference_no"`
	DisplayBelow bool                   `json:"display_below"`
}

type createFinanceTransferRequest struct {
	Amount      float64 `json:"amount" binding:"required"`
	TxDate      string  `json:"tx_date" binding:"required"`
	Description string  `json:"description" binding:"required"`
}

type financeReportRow struct {
	ID             uuid.UUID            `json:"id"`
	TxDate         string               `json:"tx_date"`
	TxType         models.FinanceTxType `json:"tx_type"`
	Category       string               `json:"category"`
	Description    string               `json:"description"`
	Amount         float64              `json:"amount"`
	RunningBalance float64              `json:"running_balance"`
	DisplayBelow   bool                 `json:"display_below"`
	ReferenceNo    *string              `json:"reference_no,omitempty"`
}

func userIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	userIDRaw, ok := c.Get("userID")
	if !ok {
		return uuid.Nil, false
	}
	userID, ok := userIDRaw.(uuid.UUID)
	return userID, ok
}

func resolveFinancePermissionMap(c *gin.Context, db *gorm.DB) (map[string]bool, error) {
	role, ok := c.Get("userRole")
	if !ok {
		return nil, errors.New("role not in context")
	}
	userRole := models.UserRole(role.(string))
	if userRole == models.RoleSuperAdmin || userRole == models.RoleAdmin {
		return map[string]bool{
			models.PermissionFinanceCreateTx:      true,
			models.PermissionFinanceAdjustOpening: true,
		}, nil
	}
	userID, ok := userIDFromContext(c)
	if !ok {
		return nil, errors.New("user not in context")
	}
	var user models.User
	if err := db.Select("org_role").First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return models.ResolvePermissionMapForOrgRole(db, user.OrgRole)
}

func (h *Handler) GetFinanceTransactions(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)
	query := h.DB.Model(&models.FinanceTransaction{})

	if fundType := c.Query("fund_type"); fundType != "" {
		query = query.Where("fund_type = ?", fundType)
	}
	if txType := c.Query("tx_type"); txType != "" {
		query = query.Where("tx_type = ?", txType)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("tx_date >= ?", t)
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("tx_date <= ?", t)
		}
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to count finance transactions")
		return
	}

	var rows []models.FinanceTransaction
	if err := query.
		Order("tx_date DESC, created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&rows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load finance transactions")
		return
	}

	utils.PaginatedSuccessResponse(c, rows, page, limit, total)
}

func (h *Handler) CreateFinanceTransaction(c *gin.Context) {
	var req createFinanceTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	if req.Amount <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "amount must be greater than zero")
		return
	}

	switch req.TxType {
	case models.FinanceTxPemasukan, models.FinanceTxPengeluaran, models.FinanceTxOpening, models.FinanceTxAdjustment:
	default:
		utils.ErrorResponse(c, http.StatusBadRequest, "invalid tx_type for manual create")
		return
	}

	permMap, err := resolveFinancePermissionMap(c, h.DB)
	if err != nil {
		utils.ErrorResponse(c, http.StatusForbidden, "Failed to resolve permissions")
		return
	}
	switch req.TxType {
	case models.FinanceTxPemasukan, models.FinanceTxPengeluaran:
		if !permMap[models.PermissionFinanceCreateTx] {
			utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
			return
		}
	case models.FinanceTxOpening, models.FinanceTxAdjustment:
		if !permMap[models.PermissionFinanceAdjustOpening] {
			utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
			return
		}
	}

	txDate, err := time.Parse("2006-01-02", req.TxDate)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "tx_date must use format YYYY-MM-DD")
		return
	}

	if req.TxType == models.FinanceTxPengeluaran {
		var fundRows []models.FinanceTransaction
		if err := h.DB.Where("fund_type = ? AND approval_status = ?", req.FundType, models.FinanceApprovalApproved).
			Order("tx_date ASC, created_at ASC").Find(&fundRows).Error; err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to validate balance")
			return
		}
		bal := services.ComputeFundBalance(fundRows, req.FundType)
		if !services.HasSufficientBalance(bal, req.Amount) {
			utils.ErrorResponse(c, http.StatusBadRequest, "Insufficient balance for this fund")
			return
		}
	}

	creatorID, ok := userIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	item := models.FinanceTransaction{
		FundType:       req.FundType,
		TxType:         req.TxType,
		TxDate:         txDate,
		Amount:         req.Amount,
		Category:       req.Category,
		Description:    req.Description,
		ReferenceNo:    req.ReferenceNo,
		DisplayBelow:   req.DisplayBelow,
		ApprovalStatus: models.FinanceApprovalApproved,
		CreatedBy:      creatorID,
	}

	if err := h.DB.Create(&item).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create finance transaction")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, item, "Finance transaction created successfully")
}

func (h *Handler) GetFinanceBalance(c *gin.Context) {
	fundType := models.FinanceFundType(c.Query("fund_type"))
	if fundType != models.FinanceFundKasBesar && fundType != models.FinanceFundKasKecil {
		utils.ErrorResponse(c, http.StatusBadRequest, "fund_type must be kas_besar or kas_kecil")
		return
	}

	var rows []models.FinanceTransaction
	if err := h.DB.
		Where("fund_type = ? AND approval_status = ?", fundType, models.FinanceApprovalApproved).
		Order("tx_date ASC, created_at ASC").
		Find(&rows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load balance data")
		return
	}

	balance := services.ComputeFundBalance(rows, fundType)
	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"fund_type": fundType,
		"balance":   balance,
	}, "")
}

func (h *Handler) CreateFinanceTransfer(c *gin.Context) {
	var req createFinanceTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	if req.Amount <= 0 {
		utils.ErrorResponse(c, http.StatusBadRequest, "amount must be greater than zero")
		return
	}
	txDate, err := time.Parse("2006-01-02", req.TxDate)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "tx_date must use format YYYY-MM-DD")
		return
	}
	creatorID, ok := userIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	linkID := uuid.New()
	txOut := models.FinanceTransaction{
		FundType:         models.FinanceFundKasBesar,
		TxType:           models.FinanceTxTransferOut,
		TxDate:           txDate,
		Amount:           req.Amount,
		Category:         "transfer_kas",
		Description:      req.Description,
		ApprovalStatus:   models.FinanceApprovalPending,
		LinkedTransferID: &linkID,
		CreatedBy:        creatorID,
	}
	txIn := models.FinanceTransaction{
		FundType:         models.FinanceFundKasKecil,
		TxType:           models.FinanceTxTransferIn,
		TxDate:           txDate,
		Amount:           req.Amount,
		Category:         "transfer_kas",
		Description:      req.Description,
		ApprovalStatus:   models.FinanceApprovalPending,
		LinkedTransferID: &linkID,
		CreatedBy:        creatorID,
	}

	if err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&txOut).Error; err != nil {
			return err
		}
		if err := tx.Create(&txIn).Error; err != nil {
			return err
		}
		return nil
	}); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create transfer request")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, gin.H{
		"linked_transfer_id": linkID,
		"status":             models.FinanceApprovalPending,
	}, "Transfer request created")
}

func (h *Handler) ApproveFinanceTransfer(c *gin.Context) {
	linkID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transfer ID")
		return
	}
	approverID, ok := userIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}
	now := time.Now()

	if err := h.DB.Transaction(func(tx *gorm.DB) error {
		var pending []models.FinanceTransaction
		if err := tx.Where("linked_transfer_id = ? AND approval_status = ?", linkID, models.FinanceApprovalPending).
			Find(&pending).Error; err != nil {
			return err
		}
		if len(pending) != 2 {
			return gorm.ErrRecordNotFound
		}

		var kasBesarRows []models.FinanceTransaction
		if err := tx.Where("fund_type = ? AND approval_status = ?", models.FinanceFundKasBesar, models.FinanceApprovalApproved).
			Order("tx_date ASC, created_at ASC").Find(&kasBesarRows).Error; err != nil {
			return err
		}
		current := services.ComputeFundBalance(kasBesarRows, models.FinanceFundKasBesar)
		if !services.HasSufficientBalance(current, pending[0].Amount) {
			return errors.New("insufficient kas besar balance")
		}

		return tx.Model(&models.FinanceTransaction{}).
			Where("linked_transfer_id = ? AND approval_status = ?", linkID, models.FinanceApprovalPending).
			Updates(map[string]interface{}{
				"approval_status": models.FinanceApprovalApproved,
				"approved_by":     approverID,
				"approved_at":     now,
				"updated_at":      now,
			}).Error
	}); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.ErrorResponse(c, http.StatusNotFound, "Transfer request not found")
			return
		}
		if err.Error() == "insufficient kas besar balance" {
			utils.ErrorResponse(c, http.StatusBadRequest, "Insufficient kas besar balance")
			return
		}
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to approve transfer")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"linked_transfer_id": linkID,
		"status":             models.FinanceApprovalApproved,
	}, "Transfer approved")
}

func (h *Handler) RejectFinanceTransfer(c *gin.Context) {
	linkID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid transfer ID")
		return
	}
	approverID, ok := userIDFromContext(c)
	if !ok {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}
	now := time.Now()

	result := h.DB.Model(&models.FinanceTransaction{}).
		Where("linked_transfer_id = ? AND approval_status = ?", linkID, models.FinanceApprovalPending).
		Updates(map[string]interface{}{
			"approval_status": models.FinanceApprovalRejected,
			"approved_by":     approverID,
			"approved_at":     now,
			"updated_at":      now,
		})
	if result.Error != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to reject transfer")
		return
	}
	if result.RowsAffected == 0 {
		utils.ErrorResponse(c, http.StatusNotFound, "Transfer request not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"linked_transfer_id": linkID,
		"status":             models.FinanceApprovalRejected,
	}, "Transfer rejected")
}

func (h *Handler) GetFinanceTransfers(c *gin.Context) {
	page, limit := utils.GetPaginationParams(c)
	offset := utils.GetOffset(page, limit)
	query := h.DB.Model(&models.FinanceTransaction{}).Where("tx_type = ?", models.FinanceTxTransferOut)

	if status := c.Query("status"); status != "" {
		query = query.Where("approval_status = ?", status)
	}
	if from := c.Query("from"); from != "" {
		if t, err := time.Parse("2006-01-02", from); err == nil {
			query = query.Where("tx_date >= ?", t)
		}
	}
	if to := c.Query("to"); to != "" {
		if t, err := time.Parse("2006-01-02", to); err == nil {
			query = query.Where("tx_date <= ?", t)
		}
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to count transfers")
		return
	}
	var rows []models.FinanceTransaction
	if err := query.Order("tx_date DESC, created_at DESC").Offset(offset).Limit(limit).Find(&rows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load transfers")
		return
	}

	utils.PaginatedSuccessResponse(c, rows, page, limit, total)
}

func (h *Handler) GetFinanceMonthlyReport(c *gin.Context) {
	fundType := models.FinanceFundType(c.Query("fund_type"))
	if fundType != models.FinanceFundKasBesar && fundType != models.FinanceFundKasKecil {
		utils.ErrorResponse(c, http.StatusBadRequest, "fund_type must be kas_besar or kas_kecil")
		return
	}
	year, err := time.Parse("2006", c.DefaultQuery("year", ""))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "year must use YYYY")
		return
	}
	monthParsed, err := time.Parse("01", c.DefaultQuery("month", ""))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "month must use MM")
		return
	}

	start := time.Date(year.Year(), monthParsed.Month(), 1, 0, 0, 0, 0, time.Local)
	end := start.AddDate(0, 1, 0)

	var previous []models.FinanceTransaction
	if err := h.DB.Where("fund_type = ? AND approval_status = ? AND tx_date < ?", fundType, models.FinanceApprovalApproved, start).
		Order("tx_date ASC, created_at ASC").Find(&previous).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load opening balance")
		return
	}
	opening := services.ComputeFundBalance(previous, fundType)

	var approvedRows []models.FinanceTransaction
	if err := h.DB.Where(
		"fund_type = ? AND approval_status = ? AND tx_date >= ? AND tx_date < ?",
		fundType, models.FinanceApprovalApproved, start, end,
	).Order("tx_date ASC, created_at ASC").Find(&approvedRows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly transactions")
		return
	}

	running := opening
	reportRows := make([]financeReportRow, 0, len(approvedRows))
	belowRows := make([]financeReportRow, 0)
	var income, expense float64

	for _, row := range approvedRows {
		switch row.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening, models.FinanceTxAdjustment:
			running += row.Amount
			income += row.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			running -= row.Amount
			expense += row.Amount
		}
		item := financeReportRow{
			ID:             row.ID,
			TxDate:         row.TxDate.Format("2006-01-02"),
			TxType:         row.TxType,
			Category:       row.Category,
			Description:    row.Description,
			Amount:         row.Amount,
			RunningBalance: running,
			DisplayBelow:   row.DisplayBelow,
			ReferenceNo:    row.ReferenceNo,
		}
		if row.DisplayBelow {
			belowRows = append(belowRows, item)
		}
		reportRows = append(reportRows, item)
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"fund_type":       fundType,
		"year":            start.Year(),
		"month":           int(start.Month()),
		"opening_balance": opening,
		"closing_balance": running,
		"total_income":    income,
		"total_expense":   expense,
		"rows":            reportRows,
		"display_below":   belowRows,
	}, "")
}

func (h *Handler) ExportFinanceMonthlyCSV(c *gin.Context) {
	fundType := models.FinanceFundType(c.Query("fund_type"))
	if fundType != models.FinanceFundKasBesar && fundType != models.FinanceFundKasKecil {
		utils.ErrorResponse(c, http.StatusBadRequest, "fund_type must be kas_besar or kas_kecil")
		return
	}
	year, err := time.Parse("2006", c.DefaultQuery("year", ""))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "year must use YYYY")
		return
	}
	monthParsed, err := time.Parse("01", c.DefaultQuery("month", ""))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "month must use MM")
		return
	}

	start := time.Date(year.Year(), monthParsed.Month(), 1, 0, 0, 0, 0, time.Local)
	end := start.AddDate(0, 1, 0)

	var previous []models.FinanceTransaction
	if err := h.DB.Where("fund_type = ? AND approval_status = ? AND tx_date < ?", fundType, models.FinanceApprovalApproved, start).
		Order("tx_date ASC, created_at ASC").Find(&previous).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load opening balance")
		return
	}
	opening := services.ComputeFundBalance(previous, fundType)

	var approvedRows []models.FinanceTransaction
	if err := h.DB.Where(
		"fund_type = ? AND approval_status = ? AND tx_date >= ? AND tx_date < ?",
		fundType, models.FinanceApprovalApproved, start, end,
	).Order("tx_date ASC, created_at ASC").Find(&approvedRows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly transactions")
		return
	}

	filename := fmt.Sprintf("laporan-%s-%04d-%02d.csv", fundType, start.Year(), int(start.Month()))
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	_, _ = c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})

	w := csv.NewWriter(c.Writer)
	_ = w.Write([]string{"fund_type", "periode", string(fundType), start.Format("2006-01")})
	_ = w.Write([]string{"saldo_awal", strconv.FormatFloat(opening, 'f', 0, 64)})
	_ = w.Write([]string{})
	_ = w.Write([]string{"no", "tanggal", "tipe", "kategori", "uraian", "pemasukan", "pengeluaran", "saldo_berjalan", "display_below"})

	running := opening
	for i, row := range approvedRows {
		var income, expense float64
		switch row.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening, models.FinanceTxAdjustment:
			income = row.Amount
			running += row.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			expense = row.Amount
			running -= row.Amount
		}
		_ = w.Write([]string{
			strconv.Itoa(i + 1),
			row.TxDate.Format("2006-01-02"),
			string(row.TxType),
			row.Category,
			row.Description,
			strconv.FormatFloat(income, 'f', 0, 64),
			strconv.FormatFloat(expense, 'f', 0, 64),
			strconv.FormatFloat(running, 'f', 0, 64),
			strconv.FormatBool(row.DisplayBelow),
		})
	}
	_ = w.Write([]string{})
	_ = w.Write([]string{"saldo_akhir", strconv.FormatFloat(running, 'f', 0, 64)})
	w.Flush()
}

func (h *Handler) ExportFinanceMonthlyPDF(c *gin.Context) {
	fundType := models.FinanceFundType(c.Query("fund_type"))
	if fundType != models.FinanceFundKasBesar && fundType != models.FinanceFundKasKecil {
		utils.ErrorResponse(c, http.StatusBadRequest, "fund_type must be kas_besar or kas_kecil")
		return
	}
	year, err := time.Parse("2006", c.DefaultQuery("year", ""))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "year must use YYYY")
		return
	}
	monthParsed, err := time.Parse("01", c.DefaultQuery("month", ""))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "month must use MM")
		return
	}

	start := time.Date(year.Year(), monthParsed.Month(), 1, 0, 0, 0, 0, time.Local)
	end := start.AddDate(0, 1, 0)

	var previous []models.FinanceTransaction
	if err := h.DB.Where("fund_type = ? AND approval_status = ? AND tx_date < ?", fundType, models.FinanceApprovalApproved, start).
		Order("tx_date ASC, created_at ASC").Find(&previous).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load opening balance")
		return
	}
	opening := services.ComputeFundBalance(previous, fundType)

	var approvedRows []models.FinanceTransaction
	if err := h.DB.Where(
		"fund_type = ? AND approval_status = ? AND tx_date >= ? AND tx_date < ?",
		fundType, models.FinanceApprovalApproved, start, end,
	).Order("tx_date ASC, created_at ASC").Find(&approvedRows).Error; err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly transactions")
		return
	}

	rows := make([]financeReportRow, 0, len(approvedRows))
	running := opening
	for _, row := range approvedRows {
		switch row.TxType {
		case models.FinanceTxPemasukan, models.FinanceTxTransferIn, models.FinanceTxOpening, models.FinanceTxAdjustment:
			running += row.Amount
		case models.FinanceTxPengeluaran, models.FinanceTxTransferOut:
			running -= row.Amount
		}
		rows = append(rows, financeReportRow{
			ID:             row.ID,
			TxDate:         row.TxDate.Format("2006-01-02"),
			TxType:         row.TxType,
			Category:       row.Category,
			Description:    row.Description,
			Amount:         row.Amount,
			RunningBalance: running,
			DisplayBelow:   row.DisplayBelow,
			ReferenceNo:    row.ReferenceNo,
		})
	}

	var ketuaName = "________________________"
	var bendaharaName = "________________________"
	var strukturs []models.Struktur
	if err := h.DB.Where("role IN ?", []models.StrukturRole{models.StrukturRoleKetua, models.StrukturRoleBendahara}).
		Where("is_active = ?", true).Find(&strukturs).Error; err == nil {
		for _, s := range strukturs {
			if s.Role == models.StrukturRoleKetua {
				ketuaName = s.Name
			}
			if s.Role == models.StrukturRoleBendahara {
				bendaharaName = s.Name
			}
		}
	}

	displayBelow := make([]financeReportRow, 0)
	for _, r := range rows {
		if r.DisplayBelow {
			displayBelow = append(displayBelow, r)
		}
	}
	var belowTotal float64
	for _, b := range displayBelow {
		belowTotal += b.Amount
	}
	totalKas := running + belowTotal

	formatMoney := func(v float64) string {
		return strconv.FormatFloat(v, 'f', 0, 64)
	}

	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(10, 8, 10)
	pdf.SetAutoPageBreak(true, 8)
	periodLabel := start.Format("JANUARY 2006")
	fundLabel := "KAS KECIL"
	if fundType == models.FinanceFundKasBesar {
		fundLabel = "KAS BESAR"
	}
	addPage := func(copyLabel string) {
		pdf.AddPage()
		pdf.SetFont("Arial", "B", 14)
		pdf.CellFormat(0, 7, "LAPORAN KEUANGAN MASJID BAITURRAHIM", "", 1, "C", false, 0, "")
		pdf.SetFont("Arial", "B", 12)
		pdf.CellFormat(0, 7, fmt.Sprintf("PERIODE : %s (%s)", periodLabel, fundLabel), "", 1, "C", false, 0, "")
		pdf.SetFont("Arial", "", 9)
		pdf.CellFormat(0, 5, copyLabel, "", 1, "C", false, 0, "")
		pdf.Ln(1)

		pdf.SetFont("Arial", "B", 9)
		headers := []string{"NO", "Tanggal", "Uraian Kegiatan", "Pemasukan", "Pengeluaran", "Jumlah"}
		widths := []float64{10, 33, 132, 34, 34, 34}
		for i, h := range headers {
			pdf.CellFormat(widths[i], 7, h, "1", 0, "C", false, 0, "")
		}
		pdf.Ln(-1)

		pdf.SetFont("Arial", "", 8.5)
		pdf.CellFormat(widths[0], 6, "", "1", 0, "C", false, 0, "")
		pdf.CellFormat(widths[1], 6, start.Format("2006-01-02"), "1", 0, "C", false, 0, "")
		pdf.CellFormat(widths[2], 6, fmt.Sprintf("Saldo Bulan %s", start.AddDate(0, -1, 0).Format("January 2006")), "1", 0, "", false, 0, "")
		pdf.CellFormat(widths[3], 6, "", "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[4], 6, "", "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[5], 6, formatMoney(opening), "1", 0, "R", false, 0, "")
		pdf.Ln(-1)

		for i, r := range rows {
			var in, out string
			if r.TxType == models.FinanceTxPemasukan || r.TxType == models.FinanceTxTransferIn || r.TxType == models.FinanceTxOpening || r.TxType == models.FinanceTxAdjustment {
				in = formatMoney(r.Amount)
			} else {
				out = formatMoney(r.Amount)
			}
			pdf.CellFormat(widths[0], 6, strconv.Itoa(i+1), "1", 0, "C", false, 0, "")
			pdf.CellFormat(widths[1], 6, r.TxDate, "1", 0, "C", false, 0, "")
			pdf.CellFormat(widths[2], 6, r.Description, "1", 0, "", false, 0, "")
			pdf.CellFormat(widths[3], 6, in, "1", 0, "R", false, 0, "")
			pdf.CellFormat(widths[4], 6, out, "1", 0, "R", false, 0, "")
			pdf.CellFormat(widths[5], 6, formatMoney(r.RunningBalance), "1", 0, "R", false, 0, "")
			pdf.Ln(-1)
		}

		pdf.SetFont("Arial", "B", 9)
		pdf.CellFormat(widths[0]+widths[1]+widths[2]+widths[3]+widths[4], 7, fmt.Sprintf("Saldo Akhir %s", start.Format("2 January 2006")), "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[5], 7, formatMoney(running), "1", 0, "R", false, 0, "")
		pdf.Ln(-1)

		pdf.SetFont("Arial", "", 8.5)
		for _, b := range displayBelow {
			pdf.CellFormat(widths[0]+widths[1]+widths[2]+widths[3]+widths[4], 6, b.Description, "1", 0, "R", false, 0, "")
			pdf.CellFormat(widths[5], 6, formatMoney(b.Amount), "1", 0, "R", false, 0, "")
			pdf.Ln(-1)
		}

		pdf.SetFont("Arial", "B", 10)
		pdf.CellFormat(widths[0]+widths[1]+widths[2]+widths[3]+widths[4], 7, "TOTAL KAS", "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[5], 7, formatMoney(totalKas), "1", 0, "R", false, 0, "")
		pdf.Ln(12)

		pdf.SetFont("Arial", "", 9)
		pdf.CellFormat(0, 5, "Jakarta, "+time.Now().Format("2 January 2006"), "", 1, "R", false, 0, "")
		pdf.Ln(4)
		pdf.CellFormat(0, 5, "Ketua DKM Baiturrahim                                  Bendahara", "", 1, "C", false, 0, "")
		pdf.Ln(10)
		pdf.CellFormat(0, 5, ketuaName+"                                            "+bendaharaName, "", 1, "C", false, 0, "")
	}

	addPage("Salinan 1/2 - Arsip Bendahara")
	addPage("Salinan 2/2 - Tempel Mading")

	var out bytes.Buffer
	if err := pdf.Output(&out); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate PDF")
		return
	}

	filename := fmt.Sprintf("laporan-%s-%04d-%02d.pdf", fundType, start.Year(), int(start.Month()))
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/pdf", out.Bytes())
}
