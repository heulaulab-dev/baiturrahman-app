# Donasi Admin UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the admin Donasi page into tabs (Donasi / Metode pembayaran), align UI with `jamaah` patterns, replace the detail overlay with a `Sheet`, honest KPI copy, and disable non-wired actions without deceiving users.

**Architecture:** Thin `page.tsx` owns the `Tabs` shell, header Export, and tab state. `DonasiDonationsTab` encapsulates hooks/state for the donation list, KPIs, filters, table, pagination, bulk row state, and detail `Sheet`. `DonasiPaymentMethodsTab` encapsulates payment-method CRUD (existing hooks). The parent bumps `selectionResetKey` whenever the active tab changes away from **Donasi**; the donations tab clears `selectedRows` (and closes the sheet) in a `useEffect` on that key.

**Tech stack:** Next.js App Router, React 19, TanStack Query (existing admin hooks), shadcn/ui (`Tabs`, `Card`, `Sheet`, `InputGroup`, `Table`, etc.), TypeScript.

**Spec:** `docs/superpowers/specs/2026-04-02-donasi-admin-ui-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `frontend/src/app/(app)/donasi/page.tsx` | Page title, single Export button (stub), controlled `Tabs`, pass `onTabLeaveDonasi` / `selectionResetKey` |
| `frontend/src/app/(app)/donasi/_components/donasi-payment-methods-tab.tsx` | Payment method form + list; all `useAdminPaymentMethods` / create/update/delete mutations |
| `frontend/src/app/(app)/donasi/_components/donasi-donations-tab.tsx` | Donations fetching, KPIs, toolbar, table, footer, detail `Sheet`; `useAdminDonations` (list + monthly) |
| `frontend/src/types/index.ts` | **Read only** — `DonationFull` includes `donor_email`, `donor_phone`, `proof_url`, `notes` for the Sheet |

---

### Task 1: Add `DonasiPaymentMethodsTab` and wire it in `page.tsx`

**Files:**

- Create: `frontend/src/app/(app)/donasi/_components/donasi-payment-methods-tab.tsx`
- Modify: `frontend/src/app/(app)/donasi/page.tsx` — remove inlined payment-method state/JSX; render `<DonasiPaymentMethodsTab />` where the payment `Card` was (tabs come in Task 3, but the app must compile after this task).

- [ ] **Step 1:** Create a client component `DonasiPaymentMethodsTab`. Copy the payment-method state, handlers (`handleCreatePaymentMethod`, toggle, edit, save, cancel, delete), and JSX from `page.tsx` into this file.

- [ ] **Step 2:** Wrap content in one `Card` with `CardHeader` / `CardTitle` **Metode pembayaran landing** and `CardDescription` — one line e.g. *Metode yang aktif ditampilkan di halaman donasi publik.*

- [ ] **Step 3:** In `page.tsx`, delete the moved payment-method state/handlers/JSX; import and render `<DonasiPaymentMethodsTab />` in the same vertical position the payment card occupied (page order is still “payment card, then donations block” until Task 3 reorders into tabs).

- [ ] **Step 4:** Run lint.

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
```

- [ ] **Step 5:** Commit.

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app
git add frontend/src/app/\(app\)/donasi/_components/donasi-payment-methods-tab.tsx frontend/src/app/\(app\)/donasi/page.tsx
git commit -m "feat(donasi): extract payment methods into tab-ready component"
```

---

### Task 2: Add `DonasiDonationsTab` and wire it in `page.tsx`

**Files:**

- Create: `frontend/src/app/(app)/donasi/_components/donasi-donations-tab.tsx`
- Modify: `frontend/src/app/(app)/donasi/page.tsx` — remove donations block; render `<DonasiDonationsTab selectionResetKey={selectionResetKey} />` (parent introduces `selectionResetKey` state in Task 3; until then pass a stable `0` from a `useState(0)` in `page.tsx` or hardcode `0` — Task 3 will replace with real counter).

- [ ] **Step 1:** Define props:

```tsx
interface DonasiDonationsTabProps {
  /** Increment when user switches away from Donasi tab; child clears `selectedRows`. */
  selectionResetKey: number;
}
```

- [ ] **Step 2:** Move donation-related state and hooks from `page.tsx`: `filter`, `searchQuery`, `sortField`, `sortDirection`, `selectedRows`, `showDetailDrawer`, `selectedDonasi`, `page`, `useAdminDonations` (paged + monthly for new donors), `useAdminPaymentMethods` (for resolving method names in table + sheet), `backendCategoryMap`, `categories`, helpers `getCategoryLabel`, `getStatusBadge`, `filteredData` pipeline, KPI derivations, `handleSort`, `toggleRowSelection`, `useEffect` for filter/search resetting page + clearing selection (see Step 3 for tab leave).

- [ ] **Step 3:** Add `useEffect` dependent on `selectionResetKey`: when it changes, run `setSelectedRows([])` (and optionally close sheet if open: `setShowDetailDrawer(false); setSelectedDonasi(null)`).

- [ ] **Step 4:** KPI row — four `Card`s with consistent structure. Subtitles:
  - Card 1 (total Rp from page slice): clarify e.g. *Berdasarkan filter & halaman ini* (or equivalent spec wording).
  - Card 2 (total transaksi): keep tied to `totalDonations` from `useAdminDonations` (same as today). Skim the hook/response in `frontend/src/services/adminHooks.ts` so subtitle copy matches whether `total` is filter-scoped.
  - Card 3 (rata-rata): same scope disclaimer as card 1.
  - Card 4 (donatur baru bulan ini): keep existing logic; *bulan ini*.

- [ ] **Step 5:** Toolbar — `Card` or bordered `div` with `flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center`. Search: reuse the `InputGroup` / `InputGroupAddon` / `Search` toolbar pattern from `frontend/src/app/(app)/jamaah/page.tsx`. Category `Select` with `Filter` icon. Sort buttons unchanged logically. **No Export** in toolbar.

- [ ] **Step 6:** Table — outer `Card` with `CardHeader` / `CardTitle` *Daftar donasi*; `CardContent` with `className="p-0"` or padding + `<div className="overflow-x-auto"><Table>…</Table></div>`.

- [ ] **Step 7:** Footer bar — **Sebelumnya** / **Berikutnya** instead of English; bulk **Konfirmasi terpilih** and **Hapus** as `disabled` with visible `p` or `span` class `text-muted-foreground text-xs` e.g. *Aksi massal memerlukan integrasi API (segera hadir).* Remove `confirm()` on delete.

- [ ] **Step 8:** Replace full-screen overlay with `Sheet` — mirror the member-detail `Sheet` / `SheetContent side="right"` structure in `frontend/src/app/(app)/jamaah/page.tsx`; use `className` similar to jamaah (`flex`, fixed width / `sm:max-w-[480px]`, `overflow-y-auto`).

  Sheet body fields from `DonationFull`:
  - Nama, nominal, kategori, metode (resolve by `payment_method_id` or `payment_method`), tanggal, status `StatusBadge`.
  - **Email** / **Telepon**: show `selectedDonasi.donor_email` / `donor_phone` or em dash / *Tidak ada data*.
  - **Catatan**: `notes` or empty state.
  - **Bukti**: if `proof_url`, `<img src={...} alt="" className="max-h-48 rounded-md border" />` plus link open in new tab; else muted *Belum ada bukti*.
  - Remove fake initials circle or replace with initials from `donor_name` only (optional polish).

  Footer: **Ditolak** / **Konfirmasi** and textarea disabled or read-only with helper *Konfirmasi dari panel admin akan tersedia setelah integrasi API.* — spec says disable actions + helper; simplest is `Button disabled` + `FormDescription`-style text.

- [ ] **Step 9:** In `page.tsx`, remove donations-specific state/hooks/JSX; import `DonasiDonationsTab` with `selectionResetKey={0}` temporarily (Task 3 adds the incrementing key from tab changes). Keep page header + Export as it exists until Task 3 refines it.

- [ ] **Step 10:** Lint + commit.

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint
```

```bash
git add frontend/src/app/\(app\)/donasi/_components/donasi-donations-tab.tsx frontend/src/app/\(app\)/donasi/page.tsx
git commit -m "feat(donasi): extract donations list into tab-ready component"
```

---

### Task 3: Rewire `page.tsx` — tabs shell

**Files:**

- Modify: `frontend/src/app/(app)/donasi/page.tsx` (should already be thin: header + `DonasiPaymentMethodsTab` + `DonasiDonationsTab`)

- [ ] **Step 1:** Import `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`.

- [ ] **Step 2:** State: `const [tab, setTab] = useState('donasi');` and `const [selectionResetKey, setSelectionResetKey] = useState(0);` Pass `selectionResetKey` into `DonasiDonationsTab` (remove any hardcoded `0`).

  `onValueChange` for `Tabs`:

```tsx
const onTabChange = (value: string) => {
  setTab(value);
  if (value !== 'donasi') {
    setSelectionResetKey((k) => k + 1);
  }
};
```

  Use controlled `<Tabs value={tab} onValueChange={onTabChange}>`.

- [ ] **Step 3:** Layout: outer `div` `className="space-y-6 p-6"`; header row with `h2` *Manajemen Donasi* + `Button variant="outline"` *Export CSV* with `onClick` that only `console.log` or no-op + `title="Segera hadir"` — spec: no real export.

- [ ] **Step 4:** `TabsList` — triggers in order **Donasi** then **Metode pembayaran**; values `'donasi'` and `'payment'` (internal IDs). `TabsContent value="donasi"` → `<DonasiDonationsTab selectionResetKey={selectionResetKey} />`. `TabsContent value="payment"` → `<DonasiPaymentMethodsTab />`. This replaces the interim vertical order (payment-above-donations) from Tasks 1–2 with the spec order inside tabs only.

- [ ] **Step 5:** Remove unused imports from `page.tsx`.

- [ ] **Step 6:** Run lint + build (types).

```bash
cd /home/kiyaya/kiyadev/baiturrahman/baiturrahman-app/frontend && bun run lint && bun run build
```

Expected: build succeeds.

- [ ] **Step 7:** Commit.

```bash
git add frontend/src/app/\(app\)/donasi/page.tsx
git commit -m "feat(donasi): tab shell and wire donation/payment tab components"
```

---

### Task 4: Manual QA (spec)

- [ ] Switch **Donasi** → **Metode pembayaran** → **Donasi**; confirm row selection did not persist (or was cleared when leaving Donasi).
- [ ] Narrow viewport: toolbar stacks; table scrolls horizontally.
- [ ] Open detail from a row: optional email/phone show or placeholder; `proof_url` shows image when present.
- [ ] Optional: after closing the Sheet via Esc or overlay, confirm focus behavior is acceptable (Radix default); refine only if focus is lost in a confusing way.
- [ ] Add / edit / toggle / delete payment method still works.
- [ ] Bulk buttons and detail confirm/reject remain disabled with visible explanation.

---

### Task 5: Final commit (if only fixes after QA)

- [ ] Any small fixes from QA in one commit: `fix(donasi): polish after QA`.

---

## Notes for implementers

- `DonationFull.status` uses `'cancelled'`; UI label remains *Ditolak* / danger badge — keep consistent with current `getStatusBadge`.
- Do not add `?tab=` query unless product asks — out of spec scope.
