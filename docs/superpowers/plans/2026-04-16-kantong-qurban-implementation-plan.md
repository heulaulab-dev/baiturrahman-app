# Kantong Qurban Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement admin-managed kantong qurban with dynamic participant capacity per animal type (`sapi`, `kambing`), including global defaults, per-animal override, participant assignment, and slot safety validations.

**Architecture:** Add dedicated qurban domain entities in backend (`settings`, `animals`, `participants`) with transactional capacity checks. Expose admin-only REST endpoints consumed by new dashboard screens in frontend. Effective capacity is computed from override first, then global defaults by animal type.

**Tech Stack:** Go (Gin + GORM), PostgreSQL, Next.js App Router, TypeScript, TanStack Query, existing dashboard UI patterns.

---

## File Structure Map

- Create: `backend/internal/models/qurban_setting.go`
- Create: `backend/internal/models/qurban_animal.go`
- Create: `backend/internal/models/qurban_participant.go`
- Modify: `backend/internal/database/migrate.go` (or migration wiring location)
- Create: `backend/internal/handlers/admin_qurban_settings_handler.go`
- Create: `backend/internal/handlers/admin_qurban_animals_handler.go`
- Create: `backend/internal/handlers/admin_qurban_participants_handler.go`
- Modify: `backend/cmd/server/main.go` (or router registration location)
- Create: `frontend/src/app/(dashboard)/dashboard/qurban/page.tsx` (or matching dashboard route group)
- Create: `frontend/src/components/dashboard/qurban/*` (settings form, animal table, participant drawer/modal)
- Modify: `frontend/src/lib/types` or `frontend/src/types/index.ts` for qurban interfaces
- Create/Modify: frontend query hooks/services for qurban endpoints

---

### Task 1: Backend Data Models and Constraints

**Files:**
- Create: `backend/internal/models/qurban_setting.go`
- Create: `backend/internal/models/qurban_animal.go`
- Create: `backend/internal/models/qurban_participant.go`
- Modify: migration/AutoMigrate registration file

- [ ] **Step 1: Write model acceptance checklist**

```txt
Models must support:
1) Global defaults by animal type
2) Per-animal override (nullable)
3) Participant relation per animal
4) Timestamps and soft-delete behavior consistent with existing models
```

- [ ] **Step 2: Implement models with explicit validation-friendly fields**

```go
// high-level shape only
type QurbanSetting struct {
  DefaultMaxParticipantsSapi    int
  DefaultMaxParticipantsKambing int
}

type QurbanAnimal struct {
  Label                   string
  AnimalType              string // sapi|kambing
  MaxParticipantsOverride *int
}

type QurbanParticipant struct {
  QurbanAnimalID uint
  Name           string
  Phone          *string
  Notes          *string
}
```

- [ ] **Step 3: Register migrations and boot validation**

Run: `cd backend && go build ./...`  
Expected: build passes and models are included in migration path.

- [ ] **Step 4: Add DB-level safety where feasible**

- index/constraint for participant uniqueness in same animal (minimum on `qurban_animal_id + name`)
- not-null and positive number checks as applicable

- [ ] **Step 5: Commit**

```bash
git add backend/internal/models backend/internal/database backend/cmd/server
git commit -m "feat(qurban): add qurban settings, animal, and participant models"
```

---

### Task 2: Backend Services/Logic for Effective Capacity

**Files:**
- Create: `backend/internal/services/qurban_service.go` (or existing service file strategy)

- [ ] **Step 1: Define effective capacity behavior tests/checklist**

```txt
effectiveMaxParticipants:
- use override if present
- otherwise use global default by animal type
```

- [ ] **Step 2: Implement capacity resolver and reusable guards**

Core helper functions:
- resolve effective capacity
- count active participants
- assert slot availability
- assert override update is not below current participants

- [ ] **Step 3: Add transactional guard for concurrent writes**

When adding/moving participant, run capacity check and write in one DB transaction.

- [ ] **Step 4: Verify behavior with focused tests (or manual service checks if no test harness)**

Run: `cd backend && go test ./...`  
Expected: pass, or document any pre-existing unrelated failures.

- [ ] **Step 5: Commit**

```bash
git add backend/internal/services
git commit -m "feat(qurban): add effective capacity and slot guard logic"
```

---

### Task 3: Admin API Endpoints (Settings + Animals + Participants)

**Files:**
- Create: `backend/internal/handlers/admin_qurban_settings_handler.go`
- Create: `backend/internal/handlers/admin_qurban_animals_handler.go`
- Create: `backend/internal/handlers/admin_qurban_participants_handler.go`
- Modify: router registration in server bootstrap

- [ ] **Step 1: Define endpoint contract checklist**

```txt
Required admin endpoints:
- GET/PUT qurban settings
- CRUD qurban animals
- CRUD qurban participants
- move participant endpoint (or equivalent update flow)
```

- [ ] **Step 2: Implement handlers using existing response helpers**

Use existing API response conventions (`success`, `error`) and admin auth middleware.

- [ ] **Step 3: Enforce validation and error messages**

Examples:
- slot penuh -> "Slot hewan ini sudah penuh (X/Y)"
- override invalid -> "Kapasitas tidak boleh kurang dari jumlah peserta saat ini"

- [ ] **Step 4: Wire routes under admin namespace**

Run: `cd backend && go build ./...`  
Expected: route compile and server boot success.

- [ ] **Step 5: Commit**

```bash
git add backend/internal/handlers backend/cmd/server/main.go
git commit -m "feat(qurban): add admin APIs for settings, animals, and participants"
```

---

### Task 4: Frontend Types, API Client, and Query Hooks

**Files:**
- Modify: `frontend/src/types/index.ts` (or equivalent)
- Create/Modify: `frontend/src/lib/api` / `frontend/src/services/hooks.ts` entries for qurban

- [ ] **Step 1: Add typed contracts for qurban domain**

```ts
interface QurbanSettings { ... }
interface QurbanAnimal { ... }
interface QurbanParticipant { ... }
```

- [ ] **Step 2: Add API functions for all required admin actions**

- fetch/update settings
- list/create/update/delete animals
- list/create/update/delete/move participants

- [ ] **Step 3: Add TanStack Query hooks with invalidate strategy**

On mutation success:
- invalidate settings query when needed
- invalidate animal list and participant list

- [ ] **Step 4: Verify type/build health**

Run: `cd frontend && bun run build`  
Expected: compile passes with no type errors from qurban contracts.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types frontend/src/lib frontend/src/services
git commit -m "feat(qurban): add typed API client and query hooks"
```

---

### Task 5: Dashboard UI - Pengaturan Qurban

**Files:**
- Create: `frontend/src/components/dashboard/qurban/QurbanSettingsForm.tsx`
- Create/Modify: dashboard qurban page container

- [ ] **Step 1: Build settings form for default capacities**

Fields:
- default kapasitas sapi
- default kapasitas kambing

- [ ] **Step 2: Add UX safeguards**

- numeric-only positive validation
- helper text: perubahan default berlaku untuk hewan baru
- toast/alert success and failure states

- [ ] **Step 3: Hook form to query/mutation layer**

- load current settings
- save updates
- refresh dependent views if necessary

- [ ] **Step 4: Manual verify settings behavior**

Checklist:
1) save valid values -> success  
2) invalid values -> blocked + message  
3) refresh page -> persisted values displayed

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/dashboard/qurban frontend/src/app
git commit -m "feat(qurban): add admin settings form for dynamic capacities"
```

---

### Task 6: Dashboard UI - Kantong/Hewan dan Peserta

**Files:**
- Create: `frontend/src/components/dashboard/qurban/QurbanAnimalsTable.tsx`
- Create: `frontend/src/components/dashboard/qurban/QurbanParticipantsPanel.tsx`
- Modify: qurban dashboard page composition

- [ ] **Step 1: Implement animal list with slot status**

Columns:
- label
- jenis hewan
- kapasitas efektif
- terisi `X/Y`
- status badge `Open/Full`

- [ ] **Step 2: Implement participant management interactions**

- open detail peserta per hewan
- tambah/edit/hapus peserta
- edit override kapasitas
- move peserta antar hewan

- [ ] **Step 3: Reflect backend validation messages in UI**

Show actionable error text for:
- slot penuh
- override invalid
- target hewan penuh saat pemindahan

- [ ] **Step 4: Manual smoke test**

```txt
1) Buat hewan sapi
2) Tambah peserta sampai penuh
3) Coba tambah peserta lagi -> gagal dengan pesan jelas
4) Ubah override di bawah jumlah peserta -> gagal
5) Pindah peserta ke hewan penuh -> gagal
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/dashboard/qurban frontend/src/app
git commit -m "feat(qurban): add kantong qurban UI for animal slots and participants"
```

---

### Task 7: End-to-End Verification and Regression Safety

**Files:**
- Verify touched backend/frontend files

- [ ] **Step 1: Run backend validation**

Run: `cd backend && go test ./... && go build ./...`  
Expected: pass (or document unrelated pre-existing failures).

- [ ] **Step 2: Run frontend validation**

Run: `cd frontend && bun run build`  
Expected: pass.

- [ ] **Step 3: Manual admin flow verification**

```txt
1) Update default sapi/kambing values
2) Create animals and verify effective capacity
3) Add participants and verify slot counters
4) Confirm Open/Full badge changes correctly
5) Confirm no changes/regression on unrelated dashboard modules
```

- [ ] **Step 4: Final stabilization commit**

```bash
git add <touched-files>
git commit -m "fix(qurban): finalize dynamic capacity kantong qurban flow"
```

---

## Spec Coverage Check

- Dynamic capacity via dashboard settings: Tasks 1, 3, 5.
- Override per animal: Tasks 1, 2, 6.
- Slot status and participant list per animal: Task 6.
- Over-capacity, duplicate, and move guards: Tasks 2, 3, 6.
- Transaction safety for concurrent writes: Task 2.
- Testing strategy and release hardening: Task 7.

## Placeholder Scan

- No `TODO`/`TBD` placeholders.
- All tasks include concrete files, commands, and expected outcomes.

## Consistency Check

- Effective capacity rule is consistent across backend logic, API behavior, and UI display:
  `override` -> fallback to type default.
