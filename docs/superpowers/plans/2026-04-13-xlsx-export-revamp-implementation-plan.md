# XLSX Export Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all user-facing CSV exports with `.xlsx` files generated on the Go backend (excelize), including a DKI-style monthly kas ledger and tabular workbooks for donations, donation summary, konten, and inventaris.

**Architecture:** Keep HTTP handlers thin; add a small internal package (e.g. `internal/exportxlsx/`) for excelize work—tabular builders (freeze row, autofilter, column widths) plus one dedicated builder for the monthly finance DKI layout. Handlers load models via existing services/DB, call builders, write bytes with correct headers. Frontend switches to blob download only; client-side CSV modules are removed.

**Tech Stack:** Go 1.21+, `github.com/xuri/excelize/v2`, Gin, GORM, existing `MosqueInfo` and finance/donation/inventaris services.

**Based on spec:** `docs/superpowers/specs/2026-04-13-xlsx-export-revamp-design.md`

---

## File map (create / modify)

| Path | Responsibility |
|------|----------------|
| `backend/go.mod` | Add excelize v2 require |
| `backend/config/config.go` | Optional `FinanceReportBankLine` from `FINANCE_REPORT_BANK_LINE` |
| `backend/internal/exportxlsx/tabular.go` | Shared: new sheet, header row style, autofilter, freeze, IDR number format helper |
| `backend/internal/exportxlsx/donations_detail.go` | Rows from filtered donations query (mirror current CSV columns) |
| `backend/internal/exportxlsx/donations_summary.go` | Period-based summary sheets (mirror `laporan-csv.ts`) |
| `backend/internal/exportxlsx/content_summary.go` | Events + announcements + khutbah sections (mirror `konten-csv.ts`) |
| `backend/internal/exportxlsx/inventaris.go` | Aset tetap + barang sheets (mirror `inventaris-csv.ts`) |
| `backend/internal/exportxlsx/finance_monthly_dki.go` | Header merges, logo embed, six-column ledger, saldo awal, yellow fill for `display_below` |
| `backend/internal/exportxlsx/logo.go` | Fetch `LogoURL` HTTP GET with timeout; fallback `embed` PNG |
| `backend/assets/export/fallback-logo.png` | Placeholder logo if mosque has no URL (add real asset in implementation) |
| `backend/internal/handlers/donation_handler.go` | Replace CSV with xlsx in export handler; add summary export handler |
| `backend/internal/handlers/finance_handler.go` | Add `ExportFinanceMonthlyXLSX`; remove or stop registering CSV |
| `backend/internal/handlers/content_export_handler.go` (or extend `content_handler.go`) | `ExportContentSummaryXLSX` |
| `backend/internal/handlers/inventaris_handler.go` | `ExportInventarisXLSX` |
| `backend/cmd/server/main.go` | Register new routes; remove `/finance/reports/monthly/csv`; **register inventaris CRUD routes if missing** (handlers exist but routes may be absent) |
| `backend/internal/models/permission.go` | Update permission descriptions (CSV → Excel) |
| `frontend/src/services/financeApiService.ts` | `exportFinanceMonthlyXlsx`, drop or redirect CSV |
| `frontend/src/services/financeHooks.ts` | Mutation for xlsx |
| `frontend/src/services/adminApiService.ts` | `exportDonationsXlsx`, `exportDonationSummaryXlsx` |
| `frontend/src/services/adminHooks.ts` | Hooks for new exports if needed |
| `frontend/src/services/inventaris.ts` | `exportInventarisXlsx` blob GET |
| `frontend/src/app/(app)/keuangan/laporan/page.tsx` | Button label + hook |
| `frontend/src/app/(app)/laporan/page.tsx` | Replace `laporan-csv` with API + period query |
| `frontend/src/app/(app)/konten/page.tsx` | Replace `konten-csv` with API |
| `frontend/src/app/(app)/inventaris/page.tsx` | Replace `inventaris-csv` with API |
| `frontend/src/app/(app)/donasi/...` | Export button → xlsx |
| `frontend/src/app/(app)/bantuan/page.tsx` | Wording |
| Delete | `frontend/src/lib/laporan-csv.ts`, `konten-csv.ts`, `inventaris-csv.ts` after migration |

---

## API routes (final names)

| Method | Path | Permission |
|--------|------|------------|
| GET | `/api/v1/admin/donations/export/xlsx` | `export_donations` |
| GET | `/api/v1/admin/reports/donations/summary/xlsx?period=bulan-ini\|3-bulan\|tahun-ini` | `view_donation_reports` |
| GET | `/api/v1/admin/finance/reports/monthly/xlsx` | `finance.export_reports` (same as CSV today) |
| GET | `/api/v1/admin/content/summary/xlsx` | `access_konten` |
| GET | `/api/v1/admin/inventaris/export/xlsx` | `access_inventaris` |

Remove: `GET /api/v1/admin/finance/reports/monthly/csv`, `GET /api/v1/admin/donations/export` (CSV).

---

## Period algorithm (donation summary — match `laporan/page.tsx`)

Server `now := time.Now()` in local TZ:

- `bulan-ini`: month keys = `[ YYYY-MM for now ]`
- `3-bulan`: keys = current month + two previous calendar months
- `tahun-ini`: keys = all months from `YYYY-01` through `YYYY-MM` for `now.Year()` up to `now.Month()`

`periodIncome` / `periodCount`: sum `by_month[key].total` and `.count` from `GetDonationStats` maps for keys in the set (missing key → 0). Global counts (`pending_count`, etc.) stay full-database like today’s stats endpoint.

---

## Task 1: Dependency and config

**Files:**
- Modify: `backend/go.mod`, `backend/config/config.go`

- [ ] **Step 1:** In `backend/`, run:

```bash
go get github.com/xuri/excelize/v2@latest
go mod tidy
```

Expected: `go.mod` lists `github.com/xuri/excelize/v2`.

- [ ] **Step 2:** Extend `Config` and `Load()`:

```go
// in Config struct
FinanceReportBankLine string

// in Load() return struct
FinanceReportBankLine: getEnv("FINANCE_REPORT_BANK_LINE", ""),
```

- [ ] **Step 3:** Pass `cfg` into `handlers.New` if handlers need bank line for exports (or read `os.Getenv` inside export only—prefer injecting `Config` for testability). Adjust `handler.go` and `main.go` constructor accordingly.

- [ ] **Step 4:** Commit: `chore(backend): add excelize and FINANCE_REPORT_BANK_LINE config`

---

## Task 2: Package `exportxlsx` — tabular helpers

**Files:**
- Create: `backend/internal/exportxlsx/tabular.go`

- [ ] **Step 1:** Implement helpers:

```go
package exportxlsx

import "github.com/xuri/excelize/v2"

const SheetMain = "Data"

// NewFileWithSheet returns file with one sheet named SheetMain, first row bold, freeze top row.
func NewFileWithSheet() (*excelize.File, error)

// ApplyTableStyle sets autofilter from row1Col to rowNCol, column widths, wrap where needed.
func ApplyDataTable(f *excelize.File, sheet string, headerRow int, lastDataRow int, lastCol string) error

// FormatIDR returns excel built-in or custom format string for Indonesian-style thousands (plan: custom `"Rp" #,##0` variant per excelize docs).
func FormatIDR() string
```

Use `excelize` `SetCellValue`, `SetCellStyle`, `SetColWidth`, `AutoFilter`, `SetPanes` for freeze.

- [ ] **Step 2:** `go build ./...` from `backend/` — expect success.

- [ ] **Step 3:** Commit: `feat(backend): add exportxlsx tabular helpers`

---

## Task 3: Donations detail XLSX

**Files:**
- Create: `backend/internal/exportxlsx/donations_detail.go`
- Modify: `backend/internal/handlers/donation_handler.go`

- [ ] **Step 1:** Add `BuildDonationsDetailXLSX(donations []models.Donation, preload done) ([]byte, error)` — columns match current CSV: `kode`, `nama_donatur`, `email`, `telepon`, `nominal`, `kategori` (Indonesian labels reuse `categoryCSVLabel` / `statusCSVLabel` logic—move shared label funcs to a small `donation_export_labels.go` in handlers or exportxlsx to avoid import cycles).

- [ ] **Step 2:** Add `ExportDonationsXLSX` gin handler: same filter query as `ExportDonations`, then build bytes, set headers:

```go
filename := fmt.Sprintf("donasi-%s.xlsx", time.Now().Format("2006-01-02-150405"))
c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
c.Header("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename))
c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf)
```

- [ ] **Step 3:** Remove `ExportDonations` CSV implementation (delete `encoding/csv` usage in that handler).

- [ ] **Step 4:** Register `admin.GET("/donations/export/xlsx", ..., h.ExportDonationsXLSX)`; remove old `/donations/export`.

- [ ] **Step 5:** Commit: `feat(backend): export donations as xlsx`

---

## Task 4: Donation summary XLSX (Laporan page)

**Files:**
- Create: `backend/internal/exportxlsx/donations_summary.go`
- Modify: `backend/internal/handlers/donation_handler.go`

- [ ] **Step 1:** Implement `BuildDonationSummaryXLSX(period string, stats *services.DonationStats, now time.Time) ([]byte, error)` with sheets or blocks:

  - Title `LAPORAN KEUANGAN — DONASI`, row with period label
  - Block RINGKASAN (headers + one data row)
  - Table PER BULAN with columns `bulan_key`, `label`, `total`, `jumlah_transaksi` for computed keys
  - Table PER KATEGORI from `stats.ByCategory`

Month labels: use Indonesian month names same as frontend `ID_MONTHS`.

- [ ] **Step 2:** Add `ExportDonationSummaryXLSX(c *gin.Context)` — validate `period` query, call `GetDonationStats`, compute keys and sums, return xlsx.

- [ ] **Step 3:** Register `admin.GET("/reports/donations/summary/xlsx", middleware.RequirePermission(models.PermissionViewDonationReports), h.ExportDonationSummaryXLSX)`.

- [ ] **Step 4:** Commit: `feat(backend): donation summary xlsx export`

---

## Task 5: Finance monthly DKI XLSX

**Files:**
- Create: `backend/internal/exportxlsx/finance_monthly_dki.go`, `backend/internal/exportxlsx/logo.go`
- Modify: `backend/internal/handlers/finance_handler.go`
- Create: `backend/assets/export/fallback-logo.png` (minimal valid PNG)

- [ ] **Step 1:** Implement `BuildFinanceMonthlyDKIXLSX(params)` accepting: `fundType`, `year`, `month`, `opening float64`, `rows []models.FinanceTransaction`, `mosque models.MosqueInfo`, `bankLine string`, `logoBytes []byte`. Layout:

  - Rows 1–N: merged title area — mosque name (large), address line, optional `bankLine`, then centered bold underlined report title: `LAPORAN KEUANGAN KAS <BESAR|KECIL> ... PERIODE <Bulan ID> <YYYY>`
  - Embed logo top-left if `logoBytes` non-empty
  - Table: columns A–F = NO, TGL, RINCIAN KEGIATAN, PEMASUKAN, PENGELUARAN, SALDO
  - Before first data row: row “Saldo awal” with value in SALDO column only
  - Transaction loop: same income/expense/running rules as `ExportFinanceMonthlyCSV`; `TxDate` format `dd/MM/yyyy`; rincian from `Description` + category + tx type (Indonesian)
  - If `DisplayBelow`: set fill `#FFF2CC` (or similar) on A–F for that row
  - Thick outer border around table; header row bold/centered per spec

- [ ] **Step 2:** `logo.go`: `FetchLogo(ctx context.Context, url string) ([]byte, error)` with 10s timeout; on error return nil, nil.

- [ ] **Step 3:** `ExportFinanceMonthlyXLSX` handler: duplicate query block from `ExportFinanceMonthlyCSV`, load `MosqueInfo` first, fetch logo, read `bankLine` from config, call builder, respond with `.xlsx`.

- [ ] **Step 4:** Register `GET /finance/reports/monthly/xlsx`; delete CSV route and `ExportFinanceMonthlyCSV` (or leave function unused and delete in same commit).

- [ ] **Step 5:** Commit: `feat(backend): finance monthly report as DKI-style xlsx`

---

## Task 6: Content summary XLSX

**Files:**
- Create: `backend/internal/exportxlsx/content_summary.go`
- Create or modify: `backend/internal/handlers/content_export_handler.go` (or `event_handler.go` if you prefer grouping)

- [ ] **Step 1:** Handler loads: all events (limit same as konten page 100 or no limit with caution), announcements, khutbahs — reuse existing list queries / service methods used by `GetEvents`, `GetAnnouncements`, `GetKhutbahs` admin handlers.

- [ ] **Step 2:** Build workbook with three sections (separate sheets **or** one sheet with title rows — spec allows two sheets; prefer **one sheet** named `Ringkasan` with section headers `EVENT`, `BERITA`, `KHUTBAH` and tables matching `konten-csv.ts` columns). Apply autofilter per section if single sheet is awkward; **prefer three sheets** `Event`, `Berita`, `Khutbah` for simpler autofilter.

- [ ] **Step 3:** Register `admin.GET("/content/summary/xlsx", middleware.RequirePermission(models.PermissionAccessKonten), h.ExportContentSummaryXLSX)`.

- [ ] **Step 4:** Commit: `feat(backend): content summary xlsx export`

---

## Task 7: Inventaris XLSX + routes

**Files:**
- Create: `backend/internal/exportxlsx/inventaris.go`
- Modify: `backend/internal/handlers/inventaris_handler.go`, `backend/cmd/server/main.go`

- [ ] **Step 1:** If `main.go` has **no** `admin.GET("/inventaris/...")` lines, register full inventaris CRUD with `middleware.RequirePermission(models.PermissionAccessInventaris)`:

```go
admin.GET("/inventaris/aset-tetap", middleware.RequirePermission(models.PermissionAccessInventaris), h.GetAsetTetap)
admin.POST("/inventaris/aset-tetap", ...)
// ... mirror frontend paths in inventaris_handler.go
admin.GET("/inventaris/barang", ...)
// etc.
```

Verify against `frontend/src/services/inventaris.ts` paths.

- [ ] **Step 2:** Add `ExportInventarisXLSX`: load all aset tetap + all barang (all categories), build two-sheet workbook `Aset_tetap`, `Barang` matching `inventaris-csv.ts` columns.

- [ ] **Step 3:** Register `admin.GET("/inventaris/export/xlsx", middleware.RequirePermission(models.PermissionAccessInventaris), h.ExportInventarisXLSX)`.

- [ ] **Step 4:** Commit: `feat(backend): inventaris xlsx export and route registration`

---

## Task 8: RBAC copy updates

**Files:**
- Modify: `backend/internal/models/permission.go`

- [ ] **Step 1:** Update descriptions for `PermissionExportDonations` and `PermissionFinanceExportReports` to say **Excel (.xlsx)** instead of CSV only.

- [ ] **Step 2:** Commit: `docs(rbac): mention xlsx in export permission descriptions`

---

## Task 9: Frontend — API clients and hooks

**Files:**
- Modify: `frontend/src/services/financeApiService.ts`, `financeHooks.ts`, `adminApiService.ts`, `adminHooks.ts`, `inventaris.ts`

- [ ] **Step 1:** `exportFinanceMonthlyXlsx`: `api.get(.../finance/reports/monthly/xlsx, { params, responseType: 'blob' })`, trigger download `laporan-{fund}-{y}-{m}.xlsx`.

- [ ] **Step 2:** `exportDonationsXlsx`: GET `/v1/admin/donations/export/xlsx` with same query params as current export (check `adminApiService` for filters).

- [ ] **Step 3:** `exportDonationSummaryXlsx(period)`: GET `/v1/admin/reports/donations/summary/xlsx?period=...`

- [ ] **Step 4:** `exportContentSummaryXlsx`: GET `/v1/admin/content/summary/xlsx`

- [ ] **Step 5:** `exportInventarisXlsx`: GET `/v1/admin/inventaris/export/xlsx`

- [ ] **Step 6:** Commit: `feat(frontend): xlsx export API clients`

---

## Task 10: Frontend — pages and cleanup

**Files:**
- Modify: pages listed in file map
- Delete: `frontend/src/lib/laporan-csv.ts`, `konten-csv.ts`, `inventaris-csv.ts`

- [ ] **Step 1:** Keuangan laporan: replace CSV button with xlsx; toast “Excel berhasil diunduh”.

- [ ] **Step 2:** Laporan page: pass `period` state to `exportDonationSummaryXlsx(period)`; remove import of `laporan-csv`.

- [ ] **Step 3:** Konten page: on export, call API (no need to wait for events loading if server loads data—**prefer server-side** so button only triggers download; remove client list dependency or keep disabled until mutation idle).

- [ ] **Step 4:** Inventaris page: call `exportInventarisXlsx` on click.

- [ ] **Step 5:** Donasi tab: update export to xlsx client.

- [ ] **Step 6:** Bantuan page: replace “CSV” with “Excel” where relevant.

- [ ] **Step 7:** Run `cd frontend && bun run lint` — fix issues.

- [ ] **Step 8:** Delete the three `*-csv.ts` files; `rg` for `laporan-csv|konten-csv|inventaris-csv` should be empty.

- [ ] **Step 9:** Commit: `feat(frontend): switch exports to xlsx downloads`

---

## Task 11: CORS and headers

**Files:**
- Modify: `backend/cmd/server/main.go` (CORS config) if browser blocks filename from `Content-Disposition` (usually fine with existing `ExposeHeaders`).

- [ ] **Step 1:** If frontend cannot read `Content-Disposition`, add `ExposeHeaders: []string{"Content-Length", "Content-Disposition"}`.

- [ ] **Step 2:** Commit if changed: `fix(api): expose Content-Disposition for downloads`

---

## Task 12: Verification (manual)

- [ ] **Step 1:** `cd backend && go build -o /tmp/server ./cmd/server/main.go` — success.

- [ ] **Step 2:** Start stack; login as admin; download each of five files; open in Excel: no `########`, UTF-8 Indonesian text intact, kas report matches UI totals for same month.

- [ ] **Step 3:** Hit each new URL without permission user → 403 JSON.

- [ ] **Step 4:** Document in PR description: env `FINANCE_REPORT_BANK_LINE`, new routes, removed CSV routes.

---

## Spec coverage checklist (self-review)

| Spec section | Task(s) |
|--------------|---------|
| §2 Replace all CSV with xlsx | 3–7, 9–10 |
| §5 DKI kas layout | 5 |
| §6 Tabular exports | 2–4, 6–7 |
| §7 excelize, MIME | 1–7 |
| §8 Routes | 3–7, 10 |
| §9 Frontend | 9–10 |
| §10 RBAC text | 8 |
| §11 Verification | 12 |
| Mosque header + bank line | 5, 1 |
| Logo fetch + fallback | 5 |

**Placeholder scan:** None intentional; `fallback-logo.png` must be a real binary added at implementation time.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-13-xlsx-export-revamp-implementation-plan.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration (skill: subagent-driven-development).

2. **Inline execution** — run tasks in this session with checkpoints (skill: executing-plans).

**Which approach do you want?**
