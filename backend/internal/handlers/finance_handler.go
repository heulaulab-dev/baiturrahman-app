package handlers

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"masjid-baiturrahim-backend/internal/exportxlsx"
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

type financeReportQuery struct {
	PeriodType services.FinancePeriodType
	FundType   models.FinanceFundType
	FundScope  services.FinanceFundScope
	Start      time.Time
	End        time.Time
	AnchorDate time.Time
	Year       int
	Month      int
}

func toFinanceReportRows(rows []services.FinanceReportRow) []financeReportRow {
	items := make([]financeReportRow, 0, len(rows))
	for _, row := range rows {
		tx := row.Transaction
		items = append(items, financeReportRow{
			ID:             tx.ID,
			TxDate:         tx.TxDate.Format("2006-01-02"),
			TxType:         tx.TxType,
			Category:       tx.Category,
			Description:    tx.Description,
			Amount:         tx.Amount,
			RunningBalance: row.RunningBalance,
			DisplayBelow:   tx.DisplayBelow,
			ReferenceNo:    tx.ReferenceNo,
		})
	}
	return items
}

func parseFinanceMonthlyQuery(c *gin.Context) (financeReportQuery, error) {
	fundType := models.FinanceFundType(c.Query("fund_type"))
	if fundType != models.FinanceFundKasBesar && fundType != models.FinanceFundKasKecil {
		return financeReportQuery{}, errors.New("fund_type must be kas_besar or kas_kecil")
	}
	year, err := time.Parse("2006", c.DefaultQuery("year", ""))
	if err != nil {
		return financeReportQuery{}, errors.New("year must use YYYY")
	}
	monthParsed, err := time.Parse("01", c.DefaultQuery("month", ""))
	if err != nil {
		return financeReportQuery{}, errors.New("month must use MM")
	}
	start := time.Date(year.Year(), monthParsed.Month(), 1, 0, 0, 0, 0, time.Local)
	return financeReportQuery{
		PeriodType: services.FinancePeriodMonthly,
		FundType:   fundType,
		FundScope:  services.FinanceFundScope(fundType),
		Start:      start,
		End:        start.AddDate(0, 1, 0),
		Year:       year.Year(),
		Month:      int(monthParsed.Month()),
	}, nil
}

func parseFinanceWeeklyQuery(c *gin.Context) (financeReportQuery, error) {
	anchorDate, err := time.ParseInLocation("2006-01-02", c.Query("anchor_date"), time.Local)
	if err != nil {
		return financeReportQuery{}, errors.New("anchor_date must use format YYYY-MM-DD")
	}
	weekStart, weekEnd := services.GetWeekRange(anchorDate)
	return financeReportQuery{
		PeriodType: services.FinancePeriodWeekly,
		FundScope:  services.FinanceFundScopeAll,
		Start:      weekStart,
		End:        weekEnd,
		AnchorDate: anchorDate,
	}, nil
}

func (h *Handler) loadFinanceReportRows(query financeReportQuery) (services.FinanceReportSummary, error) {
	base := h.DB.Model(&models.FinanceTransaction{}).Where("approval_status = ?", models.FinanceApprovalApproved)
	if query.FundScope != services.FinanceFundScopeAll {
		base = base.Where("fund_type = ?", query.FundType)
	}

	var previous []models.FinanceTransaction
	if err := base.Session(&gorm.Session{}).
		Where("tx_date < ?", query.Start).
		Order("tx_date ASC, created_at ASC").
		Find(&previous).Error; err != nil {
		return services.FinanceReportSummary{}, err
	}

	var opening float64
	if query.FundScope == services.FinanceFundScopeAll {
		opening = services.ComputeCombinedBalance(previous)
	} else {
		opening = services.ComputeFundBalance(previous, query.FundType)
	}

	var approvedRows []models.FinanceTransaction
	if err := base.Session(&gorm.Session{}).
		Where("tx_date >= ? AND tx_date < ?", query.Start, query.End).
		Order("tx_date ASC, created_at ASC").
		Find(&approvedRows).Error; err != nil {
		return services.FinanceReportSummary{}, err
	}

	return services.BuildFinanceReportSummary(opening, approvedRows), nil
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
	query, err := parseFinanceMonthlyQuery(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	report, err := h.loadFinanceReportRows(query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly report")
		return
	}
	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"period_type":     query.PeriodType,
		"fund_type":       query.FundType,
		"fund_scope":      query.FundScope,
		"year":            query.Year,
		"month":           query.Month,
		"opening_balance": report.OpeningBalance,
		"closing_balance": report.ClosingBalance,
		"total_income":    report.TotalIncome,
		"total_expense":   report.TotalExpense,
		"rows":            toFinanceReportRows(report.Rows),
		"display_below":   toFinanceReportRows(report.DisplayBelow),
	}, "")
}

func (h *Handler) GetFinanceWeeklyReport(c *gin.Context) {
	query, err := parseFinanceWeeklyQuery(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	report, err := h.loadFinanceReportRows(query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load weekly report")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{
		"period_type":     query.PeriodType,
		"fund_scope":      query.FundScope,
		"anchor_date":     query.AnchorDate.Format("2006-01-02"),
		"week_start":      query.Start.Format("2006-01-02"),
		"week_end":        query.End.Add(-time.Nanosecond).Format("2006-01-02"),
		"period_label":    fmt.Sprintf("%s - %s", query.Start.Format("2006-01-02"), query.End.Add(-time.Nanosecond).Format("2006-01-02")),
		"opening_balance": report.OpeningBalance,
		"closing_balance": report.ClosingBalance,
		"total_income":    report.TotalIncome,
		"total_expense":   report.TotalExpense,
		"rows":            toFinanceReportRows(report.Rows),
		"display_below":   toFinanceReportRows(report.DisplayBelow),
	}, "")
}

func (h *Handler) ExportFinanceMonthlyXLSX(c *gin.Context) {
	query, err := parseFinanceMonthlyQuery(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	report, err := h.loadFinanceReportRows(query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly transactions")
		return
	}
	var approvedRows []models.FinanceTransaction
	for _, row := range report.Rows {
		approvedRows = append(approvedRows, row.Transaction)
	}

	var mosque models.MosqueInfo
	_ = h.DB.First(&mosque).Error

	excelCfg := h.getExcelExportSettings()

	var logoBytes []byte
	headerImageURL := strings.TrimSpace(excelCfg.HeaderImageURL)
	if headerImageURL == "" && mosque.LogoURL != nil {
		headerImageURL = strings.TrimSpace(*mosque.LogoURL)
	}
	if headerImageURL != "" {
		b, _ := exportxlsx.FetchLogoBytes(context.Background(), headerImageURL)
		logoBytes = b
	}
	if len(logoBytes) == 0 {
		logoBytes = exportxlsx.FallbackLogoPNG()
	}

	buf, err := exportxlsx.BuildFinanceMonthlyDKIXLSX(
		query.FundType, query.Year, query.Month,
		"",
		report.OpeningBalance, approvedRows, mosque, excelCfg.BankLine, logoBytes,
		excelCfg.SignerLeftName, excelCfg.SignerRightName,
	)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	filename := fmt.Sprintf("laporan-%s-%04d-%02d.xlsx", query.FundType, query.Year, query.Month)
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
}

func (h *Handler) ExportFinanceWeeklyXLSX(c *gin.Context) {
	query, err := parseFinanceWeeklyQuery(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	report, err := h.loadFinanceReportRows(query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load weekly transactions")
		return
	}
	var approvedRows []models.FinanceTransaction
	for _, row := range report.Rows {
		approvedRows = append(approvedRows, row.Transaction)
	}

	var mosque models.MosqueInfo
	_ = h.DB.First(&mosque).Error
	excelCfg := h.getExcelExportSettings()

	var logoBytes []byte
	headerImageURL := strings.TrimSpace(excelCfg.HeaderImageURL)
	if headerImageURL == "" && mosque.LogoURL != nil {
		headerImageURL = strings.TrimSpace(*mosque.LogoURL)
	}
	if headerImageURL != "" {
		b, _ := exportxlsx.FetchLogoBytes(context.Background(), headerImageURL)
		logoBytes = b
	}
	if len(logoBytes) == 0 {
		logoBytes = exportxlsx.FallbackLogoPNG()
	}

	periodLabel := fmt.Sprintf(
		"Periode %s - %s",
		query.Start.Format("02/01/2006"),
		query.End.Add(-time.Nanosecond).Format("02/01/2006"),
	)
	buf, err := exportxlsx.BuildFinanceMonthlyDKIXLSX(
		models.FinanceFundType("all"), query.Start.Year(), int(query.Start.Month()),
		periodLabel,
		report.OpeningBalance, approvedRows, mosque, excelCfg.BankLine, logoBytes,
		excelCfg.SignerLeftName, excelCfg.SignerRightName,
	)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	filename := fmt.Sprintf("laporan-weekly-%s-to-%s.xlsx", query.Start.Format("2006-01-02"), query.End.Add(-time.Nanosecond).Format("2006-01-02"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
}

func (h *Handler) ExportFinanceMonthlyPDF(c *gin.Context) {
	query, err := parseFinanceMonthlyQuery(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	report, err := h.loadFinanceReportRows(query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load monthly transactions")
		return
	}
	h.exportFinanceReportPDF(c, query, report)
}

func (h *Handler) ExportFinanceWeeklyPDF(c *gin.Context) {
	query, err := parseFinanceWeeklyQuery(c)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	report, err := h.loadFinanceReportRows(query)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to load weekly transactions")
		return
	}
	h.exportFinanceReportPDF(c, query, report)
}

func (h *Handler) exportFinanceReportPDF(c *gin.Context, query financeReportQuery, report services.FinanceReportSummary) {
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

	rows := toFinanceReportRows(report.Rows)
	displayBelow := toFinanceReportRows(report.DisplayBelow)
	var belowTotal float64
	for _, b := range displayBelow {
		belowTotal += b.Amount
	}
	totalKas := report.ClosingBalance + belowTotal

	formatMoney := func(v float64) string {
		return strconv.FormatFloat(v, 'f', 0, 64)
	}

	pdf := gofpdf.New("L", "mm", "A4", "")
	pdf.SetMargins(10, 8, 10)
	pdf.SetAutoPageBreak(true, 8)
	periodLabel := ""
	fundLabel := "KAS KECIL"
	if query.PeriodType == services.FinancePeriodWeekly {
		periodLabel = fmt.Sprintf("%s - %s", query.Start.Format("02 Jan 2006"), query.End.Add(-time.Nanosecond).Format("02 Jan 2006"))
		fundLabel = "GABUNGAN"
	} else {
		periodLabel = query.Start.Format("JANUARY 2006")
	}
	if query.FundType == models.FinanceFundKasBesar {
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
		pdf.CellFormat(widths[1], 6, query.Start.Format("2006-01-02"), "1", 0, "C", false, 0, "")
		pdf.CellFormat(widths[2], 6, fmt.Sprintf("Saldo Awal Periode %s", periodLabel), "1", 0, "", false, 0, "")
		pdf.CellFormat(widths[3], 6, "", "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[4], 6, "", "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[5], 6, formatMoney(report.OpeningBalance), "1", 0, "R", false, 0, "")
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
		pdf.CellFormat(widths[0]+widths[1]+widths[2]+widths[3]+widths[4], 7, fmt.Sprintf("Saldo Akhir %s", query.End.Add(-time.Nanosecond).Format("2 January 2006")), "1", 0, "R", false, 0, "")
		pdf.CellFormat(widths[5], 7, formatMoney(report.ClosingBalance), "1", 0, "R", false, 0, "")
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

	filename := "laporan-keuangan.pdf"
	if query.PeriodType == services.FinancePeriodMonthly {
		filename = fmt.Sprintf("laporan-%s-%04d-%02d.pdf", query.FundType, query.Year, query.Month)
	}
	if query.PeriodType == services.FinancePeriodWeekly {
		filename = fmt.Sprintf("laporan-weekly-%s-to-%s.pdf", query.Start.Format("2006-01-02"), query.End.Add(-time.Nanosecond).Format("2006-01-02"))
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
	c.Data(http.StatusOK, "application/pdf", out.Bytes())
}
