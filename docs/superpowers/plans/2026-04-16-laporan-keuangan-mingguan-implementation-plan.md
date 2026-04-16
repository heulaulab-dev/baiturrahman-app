# Weekly Financial Report Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add weekly finance reports (Monday-Sunday, combined funds) with full parity to monthly preview/PDF/CSV, without breaking existing monthly behavior.

**Architecture:** Keep monthly endpoints and contracts intact, add weekly endpoints that reuse one shared report engine in backend service. Reuse existing frontend report page by adding a period-mode toggle so monthly and weekly share rendering/export flow.

**Tech Stack:** Go (Gin, GORM), Next.js App Router + TypeScript, TanStack Query, existing finance PDF/CSV services.

---

## File Structure Map

- Modify: `backend/internal/services/finance_service.go` (shared period engine + weekly range helpers)
- Modify: `backend/internal/handlers/finance_handler.go` (weekly handlers + query validation)
- Modify: `backend/cmd/server/main.go` (register weekly routes)
- Modify: `frontend/src/services/financeApiService.ts` (weekly API + export calls)
- Modify: `frontend/src/services/financeHooks.ts` (weekly query/mutation hooks and keys)
- Modify: `frontend/src/app/(dashboard)/keuangan/laporan/page.tsx` (toggle Bulanan/Mingguan + weekly controls)
- Optional split file if needed: `frontend/src/components/dashboard/finance/*` (period selector extraction)
- Test: backend finance service/handler tests, frontend component/hook tests if available

---

### Task 1: Add Backend Weekly Period Engine

**Files:**
- Modify: `backend/internal/services/finance_service.go`
- Test: `backend/internal/services/finance_service_test.go` (or existing finance service test file)

- [ ] **Step 1: Write failing tests for week boundary and weekly aggregate scope**
  - Add test cases:
    - `anchor_date=2026-04-17` returns `week_start=2026-04-13`, `week_end=2026-04-19`
    - weekly report includes only `approved` transactions
    - weekly report with `fund_scope=all` combines `kas_besar` + `kas_kecil`

- [ ] **Step 2: Run targeted test to confirm failure**
  - Run: `cd backend && go test ./internal/services -run Weekly -v`
  - Expected: fail with missing weekly period function/report builder support.

- [ ] **Step 3: Implement minimal weekly period helpers and shared report params**
  - Add helper to derive Monday-Sunday from `anchor_date`.
  - Extend report params with `period_type`, `anchor_date`, and `fund_scope`.
  - Reuse existing aggregate logic so weekly and monthly share one path.

- [ ] **Step 4: Run targeted test to confirm pass**
  - Run: `cd backend && go test ./internal/services -run Weekly -v`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git add backend/internal/services/finance_service.go backend/internal/services/finance_service_test.go`
  - `git commit -m "feat(finance): add shared weekly period engine for reports"`

---

### Task 2: Expose Weekly API Endpoints

**Files:**
- Modify: `backend/internal/handlers/finance_handler.go`
- Modify: `backend/cmd/server/main.go`
- Test: `backend/internal/handlers/finance_handler_test.go` (or existing handler test file)

- [ ] **Step 1: Write failing handler tests for weekly preview/pdf/csv endpoints**
  - Cover:
    - `GET /api/v1/admin/finance/reports/weekly`
    - `GET /api/v1/admin/finance/reports/weekly/pdf`
    - `GET /api/v1/admin/finance/reports/weekly/csv`
    - invalid `anchor_date` returns 400
    - permission check for `finance.view_reports`/`finance.export_reports`

- [ ] **Step 2: Run handler tests to confirm failure**
  - Run: `cd backend && go test ./internal/handlers -run FinanceWeekly -v`
  - Expected: FAIL (routes/handlers missing).

- [ ] **Step 3: Implement handlers + route registration**
  - Add weekly query parsing (`anchor_date` mandatory).
  - Call shared service with `period_type=weekly` and `fund_scope=all`.
  - Register three weekly routes under admin finance group.

- [ ] **Step 4: Run handler tests to confirm pass**
  - Run: `cd backend && go test ./internal/handlers -run FinanceWeekly -v`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git add backend/internal/handlers/finance_handler.go backend/cmd/server/main.go backend/internal/handlers/finance_handler_test.go`
  - `git commit -m "feat(finance): add weekly report API endpoints"`

---

### Task 3: Keep PDF/CSV Output Parity for Weekly

**Files:**
- Modify: backend finance PDF/CSV service files currently used by monthly exports
- Test: corresponding export tests (or add focused tests)

- [ ] **Step 1: Write failing tests for weekly export parity**
  - Validate weekly export uses same column order/sections as monthly.
  - Validate weekly PDF period header shows Monday-Sunday range.

- [ ] **Step 2: Run export tests to confirm failure**
  - Run: `cd backend && go test ./internal/services -run FinanceExportWeekly -v`
  - Expected: FAIL due to missing weekly formatting path.

- [ ] **Step 3: Implement weekly export path by reusing existing formatter**
  - Reuse monthly table/summary renderer.
  - Inject only period label and weekly metadata differences.

- [ ] **Step 4: Run export tests to confirm pass**
  - Run: `cd backend && go test ./internal/services -run FinanceExportWeekly -v`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git add backend/internal/services`
  - `git commit -m "feat(finance): support weekly pdf and csv export parity"`

---

### Task 4: Add Weekly Mode in Frontend Report Page

**Files:**
- Modify: `frontend/src/app/(dashboard)/keuangan/laporan/page.tsx`
- Modify: `frontend/src/services/financeApiService.ts`
- Modify: `frontend/src/services/financeHooks.ts`
- Test: relevant frontend tests (or add small targeted tests)

- [ ] **Step 1: Write failing frontend tests for period toggle behavior**
  - Cases:
    - toggle shows monthly controls for Bulanan
    - toggle shows anchor date picker for Mingguan
    - default Mingguan resolves to current week
    - export action chooses weekly endpoints in Mingguan mode

- [ ] **Step 2: Run targeted frontend tests to confirm failure**
  - Run: `cd frontend && bun test laporan --runInBand` (or repo-equivalent test command)
  - Expected: FAIL due to missing weekly UI logic.

- [ ] **Step 3: Implement API + hooks + page toggle**
  - Add weekly fetch/export methods in API service.
  - Add weekly query keys/hooks in finance hooks.
  - Add `Bulanan | Mingguan` toggle and weekly date picker in report page.

- [ ] **Step 4: Run targeted frontend tests to confirm pass**
  - Run: `cd frontend && bun test laporan --runInBand`
  - Expected: PASS.

- [ ] **Step 5: Commit**
  - `git add frontend/src/app/(dashboard)/keuangan/laporan/page.tsx frontend/src/services/financeApiService.ts frontend/src/services/financeHooks.ts`
  - `git commit -m "feat(finance-ui): add weekly mode to report page and exports"`

---

### Task 5: Regression Verification and Final Hardening

**Files:**
- Verify only (no required new file)

- [ ] **Step 1: Run backend full/targeted validation**
  - Run: `cd backend && go test ./...`
  - Expected: PASS.

- [ ] **Step 2: Run frontend lint/build validation**
  - Run: `cd frontend && bun run lint && bun run build`
  - Expected: PASS.

- [ ] **Step 3: Execute manual smoke scenario**
  - Use sample data across two weeks:
    - verify weekly preview shows correct Monday-Sunday range
    - verify weekly numbers match PDF and CSV exports
    - verify monthly behavior unchanged

- [ ] **Step 4: Commit any final fixes**
  - `git add <touched-files>`
  - `git commit -m "fix(finance): finalize weekly report parity and regressions"`

---

## Spec Coverage Check

- Weekly mode with Monday-Sunday range: covered by Tasks 1, 2, 4.
- Combined fund scope (`all`) for weekly: covered by Tasks 1, 2.
- Parity with monthly JSON/PDF/CSV: covered by Tasks 1, 3, 4.
- Keep monthly backward compatible: covered by Tasks 1, 2, 5.
- Error handling and permission checks: covered by Tasks 2, 5.

## Placeholder Scan

- No `TODO`/`TBD` placeholders.
- Every task has explicit files, commands, and expected outcome.

## Type/Interface Consistency Check

- `period_type`, `anchor_date`, and `fund_scope` are used consistently across service, handler, API client, and hooks.

