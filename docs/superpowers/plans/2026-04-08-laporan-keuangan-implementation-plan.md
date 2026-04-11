# Implementation Plan: Modul Laporan Keuangan

**Date:** 2026-04-08  
**Based on spec:** `docs/superpowers/specs/2026-04-07-laporan-keuangan-design.md`  
**Goal:** Implement Kas Besar + Kas Kecil ledger, transfer approval via RBAC, and monthly PDF/CSV report export.

## Scope Boundaries

- In scope:
  - New finance ledger module (backend + frontend).
  - Transfer request/approval flow.
  - Monthly report JSON + PDF rangkap 2 + CSV.
  - New finance permissions in RBAC seed.
- Out of scope:
  - Reworking existing donation report module.
  - Bi-directional transfer (only `kas_besar -> kas_kecil` in v1).
  - Large refactor outside touched modules.

## Phase 0 - Preflight

1. Verify current branch and working tree clean.
2. Update spec status to approved.
3. Confirm migration approach (AutoMigrate + model registration).
4. Identify existing RBAC seed location and route registration points.

**Checkpoint:** codebase ready, implementation order locked.

## Phase 1 - Backend Data Model + RBAC Seed

1. Create `backend/internal/models/finance_transaction.go`:
   - enums: `fund_type`, `tx_type`, `approval_status`
   - `FinanceTransaction` struct with indexes for `fund_type`, `tx_date`, `approval_status`, `linked_transfer_id`
2. Register model in startup AutoMigrate path.
3. Add `finance.*` permissions in `backend/internal/models/permission.go` seed logic.
4. Ensure permission module names and descriptions align with existing RBAC format.

**Checkpoint:** backend starts successfully and permissions seeded.

## Phase 2 - Backend Service Layer

1. Create `backend/internal/services/finance_service.go` with:
   - balance computation by fund and date range
   - monthly opening/closing balance calculator
   - validation helpers (insufficient balance, date checks, immutable approved transaction)
2. Implement transfer workflow functions:
   - create transfer request (pending)
   - approve transfer (atomic DB transaction, `FOR UPDATE` lock)
   - reject transfer
3. Implement monthly report assembler:
   - transaction rows with running balance
   - `display_below` rows extraction
   - total kas computation

**Checkpoint:** service functions tested via focused unit tests and pass.

## Phase 3 - Backend Handlers + Routes

1. Create `backend/internal/handlers/finance_handler.go`:
   - transactions CRUD handlers
   - balance endpoints
   - transfers endpoints
   - monthly report JSON endpoint
   - adjustments endpoint
2. Add export handlers:
   - CSV export
   - PDF export
3. Register routes in `backend/cmd/server/main.go` under `/api/v1/admin/finance`.
4. Attach RBAC permission checks per endpoint.

**Checkpoint:** endpoints available and return expected response formats.

## Phase 4 - PDF/CSV Generation

1. Add Go PDF dependency (`gofpdf` or `gopdf`) in backend module.
2. Implement `backend/internal/services/finance_pdf.go`:
   - paper-like layout from approved format
   - two identical pages per requested report
   - optional combined report (kas besar + kas kecil)
3. Implement CSV writer with stable headers and UTF-8 BOM for Excel.
4. Pull signer names (Ketua + Bendahara) from `strukturs`; fallback blank lines when missing.

**Checkpoint:** generated PDF visually matches template and CSV opens cleanly in Excel.

## Phase 5 - Frontend Types + API Client + Hooks

1. Add finance types in `frontend/src/types`:
   - transaction DTOs
   - transfer DTOs
   - report DTOs
2. Add `frontend/src/services/financeApiService.ts`:
   - all finance endpoints
   - blob download handlers for PDF/CSV
3. Add `frontend/src/services/financeHooks.ts` using TanStack Query:
   - list/query hooks
   - mutation hooks with invalidation strategy

**Checkpoint:** API layer consumed without TypeScript errors.

## Phase 6 - Frontend Pages and UI

1. Add pages:
   - `frontend/src/app/(app)/keuangan/kas-besar/page.tsx`
   - `frontend/src/app/(app)/keuangan/kas-kecil/page.tsx`
   - `frontend/src/app/(app)/keuangan/transfer/page.tsx`
   - `frontend/src/app/(app)/keuangan/laporan/page.tsx`
2. Add transaction modal/form with validation.
3. Add transfer request + approval table with permission-gated actions.
4. Add monthly report preview and export buttons.
5. Update `frontend/src/components/app-sidebar.tsx` with new "Keuangan" menu items.

**Checkpoint:** end-to-end UI flow works against backend locally.

## Phase 7 - Verification and Hardening

1. Backend checks:
   - run `go test ./...` (or targeted packages if suite is large)
   - run server and test key endpoints manually
2. Frontend checks:
   - run `bun run lint`
   - run `bun run build` for type/build validation
3. Functional scenario verification:
   - opening balance setup
   - add pemasukan/pengeluaran
   - transfer request and approval
   - monthly PDF/CSV export
4. Access control verification:
   - user without finance permission cannot access endpoints/pages
   - approver-only actions hidden and blocked by backend

**Checkpoint:** all critical flows verified with evidence.

## Phase 8 - Delivery

1. Prepare concise changelog summary.
2. Capture known limitations for v1.
3. Optionally split into 2 commits:
   - backend foundation
   - frontend and exports

## Execution Notes

- Prefer small, reversible commits while implementing.
- Keep approved transactions immutable; corrections via `adjustment`.
- Do not break existing donation reporting routes or UI.
- Maintain existing response helper style (`utils.SuccessResponse`, etc.).

## Definition of Done

- Finance ledger module supports Kas Besar and Kas Kecil transactions.
- Transfer approval flow works with RBAC permission gating.
- Monthly report can be downloaded as PDF (rangkap 2) and CSV.
- UI pages for kas, transfer, and laporan are functional and permission-aware.
- Backend and frontend validation checks pass.
