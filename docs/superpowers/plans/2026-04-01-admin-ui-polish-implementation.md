# Admin UI Polish and Shadcn Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the full admin surface by replacing ad-hoc UI with shadcn-first composition and aligning to landing-page palette semantics without changing behavior, data flow, or API interactions.

**Architecture:** Keep route and hook logic intact, refactor only presentation and semantic class usage. Apply changes route-by-route with a shared chrome pass (`site-header`, `app-sidebar`) so pages inherit consistent baseline styling. Enforce behavior freeze and accessibility checks from `.cursor/.rules` during every task.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, existing admin hooks/services.

---

## File Structure and Responsibilities

### Primary route files (page composition)
- Modify: `frontend/src/app/(app)/layout.tsx` - preserve auth gate and normalize shell spacing/surface tokens.
- Modify: `frontend/src/app/(app)/dashboard/page.tsx` - replace ad-hoc section wrappers with shadcn cards/skeleton rhythm.
- Modify: `frontend/src/app/(app)/dashboard/profil/page.tsx`
- Modify: `frontend/src/app/(app)/pengaturan/page.tsx` - replace custom tabs/table shell with shadcn equivalents where 1:1 behavior is possible.
- Modify: `frontend/src/app/(app)/jadwal/page.tsx`
- Modify: `frontend/src/app/(app)/jamaah/page.tsx`
- Modify: `frontend/src/app/(app)/donasi/page.tsx`
- Modify: `frontend/src/app/(app)/laporan/page.tsx`
- Modify: `frontend/src/app/(app)/konten/page.tsx`
- Modify: `frontend/src/app/(app)/reservasi/page.tsx`

### Shared admin components (cross-page baseline)
- Modify: `frontend/src/components/site-header.tsx`
- Modify: `frontend/src/components/app-sidebar.tsx`
- Modify as needed: `frontend/src/components/dashboard/StatCard.tsx`
- Modify as needed: `frontend/src/components/dashboard/PendingDonationsTable.tsx`
- Modify as needed: `frontend/src/components/dashboard/ActivityFeed.tsx`
- Modify as needed: `frontend/src/components/dashboard/DonationBarChart.tsx`
- Modify as needed: `frontend/src/components/dashboard/CategoryBreakdown.tsx`
- Modify as needed: `frontend/src/components/dashboard/MosqueProfile.tsx`

### Optional shared extraction (only if repetition is confirmed)
- Create (optional): `frontend/src/components/dashboard/admin-section-card.tsx`
- Create (optional): `frontend/src/components/dashboard/admin-page-header.tsx`

### Verification
- Run: `cd frontend && bun run lint`
- Manual route checks for all `(app)` routes above with desktop and mobile sidebar behavior.

---

### Task 1: Define UI Guardrails and Behavior Freeze in Code

**Files:**
- Modify: `docs/superpowers/specs/2026-04-01-admin-ui-polish-design.md` (only if clarifications needed)
- Modify: `frontend/src/app/(app)/layout.tsx`

- [ ] **Step 1: Add/confirm non-functional guard comments in admin layout**

Ensure layout notes behavior freeze intent (auth redirect logic unchanged) and focus only on shell presentation.

- [ ] **Step 2: Verify layout behavior parity manually**

Run app and verify: unauthenticated user still redirects to `/login?redirect=...`, authenticated user sees same route content.

- [ ] **Step 3: Commit**

```bash
git add "frontend/src/app/(app)/layout.tsx"
git commit -m "refactor: preserve admin layout behavior while preparing UI normalization"
```

### Task 2: Normalize Shared Admin Chrome (Header + Sidebar)

**Files:**
- Modify: `frontend/src/components/site-header.tsx`
- Modify: `frontend/src/components/app-sidebar.tsx`
- Modify (if required): `frontend/src/components/ui/sidebar.tsx`

- [ ] **Step 1: Replace ad-hoc styling with semantic token classes**

Use `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`; remove hardcoded color values.

- [ ] **Step 2: Preserve keyboard and interaction behavior**

Ensure icon buttons retain `aria-label`, visible focus states, and link/button semantics per `.cursor/.rules`.

- [ ] **Step 3: Verify sidebar control invariants**

Check expanded/collapsed/hover/mobile drawer parity; no change in open/close semantics.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/site-header.tsx frontend/src/components/app-sidebar.tsx frontend/src/components/ui/sidebar.tsx
git commit -m "refactor: polish admin header and sidebar with semantic shadcn styling"
```

### Task 3: Refactor Dashboard Overview Composition

**Files:**
- Modify: `frontend/src/app/(app)/dashboard/page.tsx`
- Modify: `frontend/src/components/dashboard/StatCard.tsx`
- Modify: `frontend/src/components/dashboard/PendingDonationsTable.tsx`
- Modify: `frontend/src/components/dashboard/ActivityFeed.tsx`
- Modify: `frontend/src/components/dashboard/DonationBarChart.tsx`
- Modify: `frontend/src/components/dashboard/CategoryBreakdown.tsx`

- [ ] **Step 1: Convert section wrappers to shadcn-first cards/skeletons**

Use consistent `Card` and `Skeleton` rhythm; remove ad-hoc wrappers.

- [ ] **Step 2: Standardize typography and spacing**

Ensure consistent heading sizes, metadata text styles, and section paddings.

- [ ] **Step 3: Validate loading/empty/populated states**

Confirm each dashboard block still renders correctly for all states.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(app\)/dashboard/page.tsx frontend/src/components/dashboard/StatCard.tsx frontend/src/components/dashboard/PendingDonationsTable.tsx frontend/src/components/dashboard/ActivityFeed.tsx frontend/src/components/dashboard/DonationBarChart.tsx frontend/src/components/dashboard/CategoryBreakdown.tsx
git commit -m "refactor: standardize dashboard sections with shadcn composition"
```

### Task 4: Refactor Pengaturan Page (Tabs, Table, Empty States)

**Files:**
- Modify: `frontend/src/app/(app)/pengaturan/page.tsx`
- Modify: `frontend/src/components/dashboard/MosqueProfile.tsx`

- [ ] **Step 1: Replace custom tabs strip with shadcn `Tabs`**

Only if behavior can match 1:1; otherwise keep current state logic and normalize visuals.

- [ ] **Step 2: Replace ad-hoc table shell with semantic shadcn table composition**

Use native table semantics and tokenized class styling.

- [ ] **Step 3: Normalize placeholder/empty states**

Use card or empty-state pattern with redundant cues (not color-only).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(app\)/pengaturan/page.tsx frontend/src/components/dashboard/MosqueProfile.tsx
git commit -m "refactor: polish pengaturan UI with shadcn tabs and semantic table patterns"
```

### Task 5: Refactor Remaining Admin Pages Route-by-Route

**Files:**
- Modify: `frontend/src/app/(app)/dashboard/profil/page.tsx`
- Modify: `frontend/src/app/(app)/jadwal/page.tsx`
- Modify: `frontend/src/app/(app)/jamaah/page.tsx`
- Modify: `frontend/src/app/(app)/donasi/page.tsx`
- Modify: `frontend/src/app/(app)/laporan/page.tsx`
- Modify: `frontend/src/app/(app)/konten/page.tsx`
- Modify: `frontend/src/app/(app)/reservasi/page.tsx`

- [ ] **Step 1: Process one route at a time**

For each route: remove ad-hoc wrappers, use semantic token classes, prefer shadcn primitives.

- [ ] **Step 2: Apply `.cursor/.rules` accessibility checks per route**

Confirm focus-visible, keyboard reachability, semantics, and icon button labels.

- [ ] **Step 3: Validate URL/state behavior unchanged**

Tabs/filters/pagination/deep links keep existing behavior where present.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/\(app\)/dashboard/profil/page.tsx frontend/src/app/\(app\)/jadwal/page.tsx frontend/src/app/\(app\)/jamaah/page.tsx frontend/src/app/\(app\)/donasi/page.tsx frontend/src/app/\(app\)/laporan/page.tsx frontend/src/app/\(app\)/konten/page.tsx frontend/src/app/\(app\)/reservasi/page.tsx
git commit -m "refactor: normalize remaining admin route UI with shadcn-first patterns"
```

### Task 6: Optional Lightweight Shared Extraction

**Files:**
- Create (optional): `frontend/src/components/dashboard/admin-section-card.tsx`
- Create (optional): `frontend/src/components/dashboard/admin-page-header.tsx`
- Modify (optional): touched route files from Task 5

- [ ] **Step 1: Extract only repeated patterns**

Only extract if at least 3 uses with near-identical structure.

- [ ] **Step 2: Keep wrappers presentation-only**

No business/data logic inside shared wrappers.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/dashboard/admin-section-card.tsx frontend/src/components/dashboard/admin-page-header.tsx frontend/src/app/\(app\)/**/*.tsx
git commit -m "refactor: extract lightweight reusable admin presentation wrappers"
```

### Task 7: Verification and Hardening

**Files:**
- Modify as needed: any touched files above for fixes

- [ ] **Step 1: Run lint**

Run: `cd frontend && bun run lint`  
Expected: no new lint errors in touched files.

- [ ] **Step 2: Manual regression checklist**

Check:
- sidebar expanded/collapsed/hover/mobile parity
- header action parity
- one CRUD-like flow unchanged
- one table flow (sort/filter/pagination where present) unchanged
- auth guard and redirect behavior unchanged
- network endpoint/payload parity (no new or changed requests)

- [ ] **Step 3: Accessibility checklist from `.cursor/.rules`**

Check:
- visible `:focus-visible` rings
- icon-only buttons with descriptive `aria-label`
- native semantics preferred (`button`, `a`, `table`, `label`)
- redundant status cues (not color-only)
- locale-aware number/currency formatting remains intact

- [ ] **Step 4: Commit**

```bash
git add frontend/src
git commit -m "fix: finalize admin UI polish with lint and regression hardening"
```

---

## Notes for Implementers

- Prefer existing shadcn components in `frontend/src/components/ui` before creating new primitives.
- Never introduce hardcoded `#`, `rgb()`, or `hsl()` color usage in touched admin files.
- Keep animation minimal and respect `prefers-reduced-motion`.
- If any page requires behavior changes to achieve visual goals, stop and request a spec update first.
