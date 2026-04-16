# Struktur Public Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new public `/struktur` page that shows active structure members and connect it from the landing structure section while keeping admin flow unchanged.

**Architecture:** Reuse existing `StrukturSection` data/rendering logic by introducing explicit display modes (`landing` and `page`) so public presentation remains consistent and DRY. Keep backend untouched because public active-only data is already served by existing endpoints.

**Tech Stack:** Next.js App Router, TypeScript, TanStack Query hooks (`usePublicStrukturs`), existing UI primitives and landing components.

---

## File Structure Map

- Create: `frontend/src/app/(public)/struktur/page.tsx` (public structure page route)
- Modify: `frontend/src/components/landing/StrukturSection.tsx` (mode-based reusable rendering + CTA behavior + field constraints)
- Modify: `frontend/src/app/(public)/page.tsx` or current landing page entry (wire landing mode explicitly)
- Optional Modify: `frontend/src/types/index.ts` only if new prop/type extraction is needed

---

### Task 1: Baseline and Route Placement Validation

**Files:**
- Inspect: `frontend/src/app/*/page.tsx` (landing route group)
- Create: `frontend/src/app/(public)/struktur/page.tsx` (or equivalent active public route group)

- [ ] **Step 1: Write a failing route-level assertion plan (manual test first)**

```txt
Scenario:
1) Open /struktur
2) Expected current result: 404/not found (before implementation)
```

- [ ] **Step 2: Run local check to confirm route does not exist yet**

Run: `cd frontend && bun run dev` then open `/struktur`  
Expected: page missing/404 before implementation.

- [ ] **Step 3: Create minimal page scaffold**

```tsx
// frontend/src/app/(public)/struktur/page.tsx
export default function StrukturPage() {
  return <main className="container py-12">Halaman Struktur</main>
}
```

- [ ] **Step 4: Recheck route availability**

Run: open `/struktur` again  
Expected: scaffold page renders successfully.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/(public)/struktur/page.tsx
git commit -m "feat(struktur): add public struktur page route scaffold"
```

---

### Task 2: Refactor `StrukturSection` to Mode-Based Reuse

**Files:**
- Modify: `frontend/src/components/landing/StrukturSection.tsx`
- Test: manual component behavior in both modes

- [ ] **Step 1: Write failing behavior checklist for mode support**

```txt
Expected after refactor:
- landing mode: keeps existing section semantics and can show CTA to /struktur
- page mode: supports page-level heading context and no landing CTA
- both modes: only show photo, name, role, department
```

- [ ] **Step 2: Validate current mismatch**

Run: inspect current component usage  
Expected: component currently has single-mode behavior and still includes extra public fields.

- [ ] **Step 3: Implement minimal mode prop API and field restriction**

```tsx
interface StrukturSectionProps {
  mode?: 'landing' | 'page'
}

// render only:
// - photo/avatar
// - name
// - role badge
// - department
```

- [ ] **Step 4: Verify both modes render as expected**

Run: `cd frontend && bun run build`  
Expected: build passes and component compiles in both mode paths.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/landing/StrukturSection.tsx
git commit -m "refactor(struktur): add landing/page modes for public structure section"
```

---

### Task 3: Implement Full `/struktur` Public Page

**Files:**
- Modify/Create: `frontend/src/app/(public)/struktur/page.tsx`
- Reuse: `frontend/src/components/landing/StrukturSection.tsx`

- [ ] **Step 1: Write failing acceptance checklist for `/struktur` page**

```txt
Page must provide:
- public heading/subheading context
- full active-member grid via reused section logic
- no contact/social/bio fields displayed
```

- [ ] **Step 2: Confirm scaffold page fails checklist**

Run: open `/struktur`  
Expected: only placeholder text, checklist unmet.

- [ ] **Step 3: Implement page with reused section in `page` mode**

```tsx
import { StrukturSection } from '@/components/landing/StrukturSection'

export default function StrukturPage() {
  return (
    <main>
      <StrukturSection mode="page" />
    </main>
  )
}
```

- [ ] **Step 4: Verify functional behavior**

Run: `cd frontend && bun run build`  
Expected: build pass and `/struktur` renders active members.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/(public)/struktur/page.tsx
git commit -m "feat(struktur): render active members on public struktur page"
```

---

### Task 4: Landing Integration with CTA to `/struktur`

**Files:**
- Modify: landing home page entry file (current public home route)
- Modify: `frontend/src/components/landing/StrukturSection.tsx` (CTA visibility in landing mode)

- [ ] **Step 1: Write failing navigation checklist**

```txt
From landing structure section:
- CTA "Lihat Struktur Lengkap" exists
- CTA navigates to /struktur
- no header menu changes required
```

- [ ] **Step 2: Confirm current landing state**

Run: open landing page  
Expected: no explicit CTA to `/struktur` yet.

- [ ] **Step 3: Implement CTA and mode wiring**

```tsx
// landing home usage:
<StrukturSection mode="landing" />

// in section (landing mode only):
<Link href="/struktur">Lihat Struktur Lengkap</Link>
```

- [ ] **Step 4: Verify navigation flow**

Run: click CTA from landing  
Expected: routes correctly to `/struktur`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/landing/StrukturSection.tsx frontend/src/app/(public)/page.tsx
git commit -m "feat(struktur): add landing CTA to public struktur page"
```

---

### Task 5: Regression Checks and Delivery Hardening

**Files:**
- Verify: frontend changed files only

- [ ] **Step 1: Run frontend build validation**

Run: `cd frontend && bun run build`  
Expected: PASS.

- [ ] **Step 2: Run smoke checklist manually**

```txt
1) Admin adds two members (active + inactive)
2) Landing shows only active members
3) /struktur shows only active members
4) Card fields limited to photo/name/role/department
5) Broken/empty photo falls back gracefully
```

- [ ] **Step 3: Confirm no unintended admin regression**

Run: open admin structure management page and verify create/edit/toggle still works  
Expected: existing workflow unchanged.

- [ ] **Step 4: Final commit for fixes (if any)**

```bash
git add <touched-files>
git commit -m "fix(struktur): finalize public struktur page behavior and regressions"
```

---

## Spec Coverage Check

- `/struktur` public page: covered by Tasks 1 and 3.
- Active-only display: covered by Tasks 2, 3, and 5 smoke checks.
- Card field constraints (photo/name/role/department): covered by Task 2.
- Landing remains full list + CTA to `/struktur`: covered by Task 4.
- No backend changes and no admin flow regression: covered by Task 5.

## Placeholder Scan

- No `TODO`/`TBD` placeholders present.
- Each task contains concrete files, commands, and expected outcomes.

## Type Consistency Check

- `mode` prop consistently defined as `'landing' | 'page'` and reused across landing and page usage.

