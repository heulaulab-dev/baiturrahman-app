# Keuangan UI Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dashboard UI for creating finance transactions (income, expense, opening, adjustment), transfer requests, and approve/reject; align backend RBAC and validation with `docs/superpowers/specs/2026-04-11-keuangan-ui-actions-design.md`.

**Architecture:** Backend gains `RequireAnyPermission` plus stricter `CreateFinanceTransaction` (whitelist `tx_type`, per-type permission, balance check for expenses). Frontend adds a shared `FinanceFundLedgerPanel` used by both kas pages, shadcn dialogs with react-hook-form + zod, and a rebuilt transfer page wired to existing hooks after fixing query invalidation.

**Tech Stack:** Go 1.21+, Gin, GORM; Next.js App Router, TanStack Query, react-hook-form, zod, shadcn/ui (Dialog, Button, Input, Table, Select).

---

## File map

| File | Responsibility |
|------|----------------|
| `backend/internal/middleware/auth.go` | `RequireAnyPermission` |
| `backend/cmd/server/main.go` | Wire middleware on `POST /finance/transactions` |
| `backend/internal/handlers/finance_handler.go` | Whitelist, RBAC in handler, balance guard for `pengeluaran` |
| `frontend/src/services/financeHooks.ts` | Invalidate transfers + balances on transfer mutations |
| `frontend/src/components/dashboard/finance/FinanceFundLedgerPanel.tsx` | Ledger UI + open dialogs |
| `frontend/src/components/dashboard/finance/FinanceTransactionDialog.tsx` | Single dialog for all manual tx types |
| `frontend/src/components/dashboard/finance/FinanceTransferSection.tsx` | Transfer form + table + approve/reject |
| `frontend/src/app/(app)/keuangan/kas-besar/page.tsx` | Thin wrapper → panel `kas_besar` |
| `frontend/src/app/(app)/keuangan/kas-kecil/page.tsx` | Thin wrapper → panel `kas_kecil` |
| `frontend/src/app/(app)/keuangan/transfer/page.tsx` | Compose `FinanceTransferSection` |

---

### Task 1: Middleware `RequireAnyPermission`

**Files:**

- Modify: `backend/internal/middleware/auth.go`

- [ ] **Step 1: Add `RequireAnyPermission` after `RequirePermission`**

Insert the following function at the end of `auth.go` (same package imports; no new imports needed):

```go
// RequireAnyPermission allows the request if the user's org role grants at least one of the given permissions.
// Super-admin and admin roles bypass (same as RequirePermission).
func RequireAnyPermission(permissionKeys ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Role not found in context")
			c.Abort()
			return
		}

		userRole := models.UserRole(role.(string))
		if userRole == models.RoleSuperAdmin || userRole == models.RoleAdmin {
			c.Next()
			return
		}

		userID, exists := c.Get("userID")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "User ID not found in context")
			c.Abort()
			return
		}

		db := c.MustGet("db").(*gorm.DB)

		var user models.User
		if err := db.Select("org_role").First(&user, "id = ?", userID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusForbidden, "Failed to resolve user permission")
			c.Abort()
			return
		}

		permissionMap, err := models.ResolvePermissionMapForOrgRole(db, user.OrgRole)
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to resolve permissions")
			c.Abort()
			return
		}

		for _, key := range permissionKeys {
			if permissionMap[key] {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
		c.Abort()
	}
}
```

- [ ] **Step 2: Compile backend**

Run:

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add backend/internal/middleware/auth.go
git commit -m "feat(auth): add RequireAnyPermission middleware for finance routes"
```

---

### Task 2: Route + `CreateFinanceTransaction` hardening

**Files:**

- Modify: `backend/cmd/server/main.go`
- Modify: `backend/internal/handlers/finance_handler.go`

- [ ] **Step 1: Swap middleware on POST transactions**

In `main.go`, find:

```go
admin.POST("/finance/transactions", middleware.RequirePermission(models.PermissionFinanceCreateTx), h.CreateFinanceTransaction)
```

Replace with:

```go
admin.POST("/finance/transactions", middleware.RequireAnyPermission(models.PermissionFinanceCreateTx, models.PermissionFinanceAdjustOpening), h.CreateFinanceTransaction)
```

- [ ] **Step 2: Add helper on handler file**

At top of `finance_handler.go` (after imports block), ensure these imports exist: `masjid-baiturrahim-backend/internal/models` already present; add nothing if `userIDFromContext` already exists.

Add this unexported helper in the same file as the handler methods (before or after `userIDFromContext`):

```go
func resolveFinancePermissionMap(c *gin.Context, db *gorm.DB) (map[string]bool, error) {
	role, ok := c.Get("userRole")
	if !ok {
		return nil, errors.New("role not in context")
	}
	userRole := models.UserRole(role.(string))
	if userRole == models.RoleSuperAdmin || userRole == models.RoleAdmin {
		return map[string]bool{
			models.PermissionFinanceCreateTx:      true,
			models.PermissionFinanceAdjustOpening:   true,
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
```

Add imports if missing: `"errors"` and `"gorm.io/gorm"` (gorm likely already imported).

- [ ] **Step 3: Replace body of `CreateFinanceTransaction` after JSON bind**

Immediately after successful `ShouldBindJSON` and `req.Amount <= 0` check, **before** parsing `txDate`, insert:

```go
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
```

After parsing `txDate` and before building `item`, if `req.TxType == models.FinanceTxPengeluaran`, load approved rows and validate balance:

```go
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
```

Keep the existing `item` construction and `h.DB.Create` unchanged.

- [ ] **Step 4: Build and smoke-test**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/backend && go build -o /tmp/server ./cmd/server/main.go
```

Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add backend/cmd/server/main.go backend/internal/handlers/finance_handler.go
git commit -m "feat(finance): gate manual transactions by tx_type and fund balance"
```

---

### Task 3: TanStack Query invalidation for transfers

**Files:**

- Modify: `frontend/src/services/financeHooks.ts`

- [ ] **Step 1: Extend `useCreateFinanceTransfer` `onSuccess`**

Change `onSuccess` to also invalidate:

```ts
queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transfers'] })
queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_besar'] })
queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_kecil'] })
```

(Keep existing `transactions` invalidation.)

- [ ] **Step 2: Extend `useRejectFinanceTransfer` `onSuccess`**

Mirror the same invalidations as `useApproveFinanceTransfer` (which already invalidates both balances and transactions). Add `transfers` query key to **both** approve and reject if missing:

```ts
queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transfers'] })
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/services/financeHooks.ts
git commit -m "fix(finance): invalidate transfer and balance queries after mutations"
```

---

### Task 4: `FinanceTransactionDialog` component

**Files:**

- Create: `frontend/src/components/dashboard/finance/FinanceTransactionDialog.tsx`

- [ ] **Step 1: Implement dialog**

Requirements:

- Props: `open`, `onOpenChange`, `fundType: FinanceFundType`, `mode: 'pemasukan' | 'pengeluaran' | 'opening_balance' | 'adjustment'`, `onSuccess?: () => void`.
- Use `useCreateFinanceTransaction` from `@/services/financeHooks`.
- `useForm` + `zodResolver` with schema:
  - `tx_date`: string, refine as valid date `YYYY-MM-DD`
  - `amount`: number, positive (use `z.coerce.number().positive()`)
  - `category`: `z.string().min(1)`
  - `description`: `z.string().min(1)`
  - `reference_no`: `z.string().optional()`
  - `display_below`: `z.boolean().default(false)` — show checkbox only when `mode === 'pemasukan'`.
- On submit, call `create` with `fund_type`, `tx_type` from `mode`, and map fields to `CreateFinanceTransactionRequest`.
- On success: `onOpenChange(false)`, reset form, call `onSuccess`, toast optional (match project pattern — grep `sonner` or `toast` in `frontend/src`).
- On error: surface `error.response?.data?.error` or message from axios.

Use shadcn `Dialog`, `Button`, `Input`, `Label`, and `Form` primitives from `@/components/ui/*`.

- [ ] **Step 2: Lint**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
```

Fix any issues in the new file.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/finance/FinanceTransactionDialog.tsx
git commit -m "feat(finance): dialog form for manual ledger transactions"
```

---

### Task 5: `FinanceFundLedgerPanel`

**Files:**

- Create: `frontend/src/components/dashboard/finance/FinanceFundLedgerPanel.tsx`

- [ ] **Step 1: Implement panel**

Props: `fundType: FinanceFundType`, `title: string` (e.g. `"Kas Besar"`).

- `useAuth()` → `hasPermission('finance.create_transaction')`, `hasPermission('finance.adjust_opening_balance')`, `hasPermission('finance.view_reports')` — if no view permission, render short forbidden message (defensive).
- Local state: `page` (default 1), `from`, `to` optional strings for API filters.
- `useFinanceBalance(fundType)` for header saldo (format IDR like existing pages).
- `useFinanceTransactions({ fund_type: fundType, page, limit: 20, from, to })` for table.
- Toolbar: date inputs type `date` → format to `YYYY-MM-DD` for query params; Prev/Next pagination using `total_pages` from response (check `PaginatedResponse` shape in `@/types`).
- Table columns: `tx_date`, `tx_type`, `category`, `description`, `amount` (formatted IDR), `approval_status`.
- Buttons opening `FinanceTransactionDialog` with appropriate `mode` (four dialog instances or one with state `dialogMode` — either is fine).
- Pass `onSuccess` to refetch: `queryClient.invalidateQueries` for transactions + balance for this fund, or rely on mutation `onSuccess` from hook (already invalidates).

- [ ] **Step 2: Lint**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/finance/FinanceFundLedgerPanel.tsx
git commit -m "feat(finance): shared ledger panel for kas besar and kas kecil"
```

---

### Task 6: Kas pages + transfer section

**Files:**

- Modify: `frontend/src/app/(app)/keuangan/kas-besar/page.tsx`
- Modify: `frontend/src/app/(app)/keuangan/kas-kecil/page.tsx`
- Create: `frontend/src/components/dashboard/finance/FinanceTransferSection.tsx`
- Modify: `frontend/src/app/(app)/keuangan/transfer/page.tsx`

- [ ] **Step 1: Replace kas page bodies**

`kas-besar/page.tsx`:

```tsx
import { FinanceFundLedgerPanel } from '@/components/dashboard/finance/FinanceFundLedgerPanel'

export default function KasBesarPage() {
  return <FinanceFundLedgerPanel fundType="kas_besar" title="Kas Besar" />
}
```

`kas-kecil/page.tsx`: same with `kas_kecil` and title `"Kas Kecil"`.

- [ ] **Step 2: Implement `FinanceTransferSection`**

- Top card: form with `tx_date`, `amount`, `description` — `useCreateFinanceTransfer`, enabled if `hasPermission('finance.request_transfer')`.
- Below: filters for `status` (select: all / pending / approved / rejected) and optional date range; `useFinanceTransfers({ page, limit: 20, status, from, to })`.
- Table: each row shows `tx_date`, `amount`, `description`, `approval_status`, `linked_transfer_id` (as truncated copy id if needed).
- If row `approval_status === 'pending'` and `hasPermission('finance.approve_transfer')`, show **Setujui** and **Tolak** calling `useApproveFinanceTransfer` / `useRejectFinanceTransfer` with `linked_transfer_id` string (API expects UUID string in URL).
- Map API error strings: if message contains `Insufficient`, show Indonesian helper text.

- [ ] **Step 3: Transfer page**

```tsx
import { FinanceTransferSection } from '@/components/dashboard/finance/FinanceTransferSection'

export default function TransferKasPage() {
  return (
    <div className="p-6">
      <FinanceTransferSection />
    </div>
  )
}
```

- [ ] **Step 4: Lint and build**

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint && bun run build
```

Expected: lint clean, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/(app)/keuangan/kas-besar/page.tsx \
  frontend/src/app/(app)/keuangan/kas-kecil/page.tsx \
  frontend/src/app/(app)/keuangan/transfer/page.tsx \
  frontend/src/components/dashboard/finance/FinanceTransferSection.tsx
git commit -m "feat(finance): wire kas pages and transfer UI"
```

---

### Task 7: Manual verification (no automated test suite in repo)

- [ ] **Step 1: Run stack**

Docker or local: backend on 8080, frontend on 3000; login as admin and as a test org role with split permissions if available.

- [ ] **Step 2: Checklist**

1. Kas Besar: create pemasukan → saldo naik, baris muncul.
2. Kas Kecil: create pengeluaran dengan saldo cukup → saldo turun; dengan saldo tidak cukup → error backend tampil.
3. User tanpa `adjust_opening_balance`: tombol adjustment tidak tampil atau submit tertolak 403.
4. User tanpa `create_transaction`: tidak bisa pemasukan/pengeluaran.
5. Transfer: ajuan → pending; approve → saldo KB turun KK naik; reject → tidak berubah.
6. Approve dengan saldo KB tidak cukup → pesan jelas.

- [ ] **Step 3: Final commit if any fixes**

Only if adjustments needed from verification.

---

## Plan self-review

**Spec coverage:** Middleware OR permission (spec §4.2.1) → Task 1–2. Whitelist + per-type RBAC (§4.2.2) → Task 2. Balance for expense (§4.3) → Task 2. Shared ledger + dialogs (§3.1–3.3) → Tasks 4–5. Transfer UI + linked id (§3.2) → Task 6. Query invalidation (§3.2 last bullet) → Task 3. Manual tests (spec §7) → Task 7.

**Placeholder scan:** None intentional.

**Type consistency:** `PermissionFinanceAdjustOpening` matches `models.PermissionFinanceAdjustOpening` in Go; frontend permission strings match `permission.go` keys.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-11-keuangan-ui-actions-implementation-plan.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks.  
2. **Inline execution** — run tasks in this session with checkpoints.

**Which approach do you want?**
