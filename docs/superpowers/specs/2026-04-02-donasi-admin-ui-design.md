# Donasi Admin Page — UI Restructure and Polish

## Context

`frontend/src/app/(app)/donasi/page.tsx` is a large (~700 line) client page combining payment-method CRUD for the public landing, donation list management (filters, sort, pagination, bulk selection), KPI-style summaries, and a custom full-screen detail overlay. Visual rhythm is inconsistent (e.g. one `Card` in the KPI row vs plain bordered blocks), export appears in multiple places while remaining non-functional, and the detail panel shows placeholder contact data unrelated to `DonationFull`.

This spec defines a **UI-only** pass: information architecture, shadcn-aligned polish, and honest labeling for page-limited metrics. It does **not** extend backend integration for confirm/reject/export/bulk delete unless a future spec explicitly adds that scope.

## Goals

- Split **donation operations** and **payment method configuration** with **tabs**: primary **Donasi**, secondary **Metode pembayaran**.
- Align layout and components with patterns used on `jamaah` and other `(app)` pages (`Card`, `Tabs`, `InputGroup`, `Sheet`, consistent spacing).
- Unify KPI presentation; clarify copy where totals reflect **current filter + current page** of API results.
- Replace the custom full-screen detail overlay with a **`Sheet`**; show only fields present on `DonationFull`; remove fake phone/email placeholders.
- Consolidate **Export** to a single primary affordance in the page header (styling only in this pass — no working export).
- Improve responsive behavior (toolbar stacking, horizontal table scroll).
- Normalize pagination copy to Indonesian (**Sebelumnya** / **Berikutnya**).

## Non-Goals

- Wiring **Konfirmasi**, **Ditolak**, bulk confirm/delete, or **Export CSV** to the API (deferred).
- Changing donation or payment-method API contracts, hooks, or service layers.
- URL query synchronization for active tab (e.g. `?tab=`) unless added in a later spec.
- Skeleton loaders (optional future enhancement).

## Selected Approach

**Thin page shell + two tab components** (middle ground between a monolithic file and many tiny fragments):

1. `page.tsx` — page title, single Export button (non-functional), `Tabs` with two triggers.
2. `DonasiDonationsTab` — KPI row, toolbar, table, footer/bulk area, state for filters/sort/pagination/selection/detail sheet.
3. `DonasiPaymentMethodsTab` — card with description, add form, method list (existing CRUD behavior).

File names and exact folder (`components/dashboard/` vs colocated) are implementation details; prefer colocation under `donasi/` or existing dashboard patterns per implementation plan.

## Information Architecture

### Header

- Title: **Manajemen Donasi**.
- One **Export CSV** `Button` (secondary or outline consistent with admin); no duplicate Export in the toolbar.

### Tab: Donasi

Order of blocks:

1. **KPI row** — four matching `Card`s with `CardHeader` / `CardContent` and short descriptions.
2. **Toolbar** — search (prefer `InputGroup` + icon), category `Select`, sort by **Tanggal** / **Nominal** (preserve current toggle behavior).
3. **Table** — wrapped in `Card` with optional titled header **Daftar donasi**; `overflow-x-auto` on narrow viewports.
4. **Footer** — bulk actions + pagination in one bar; Indonesian Previous/Next labels.

### Tab: Metode pembayaran

- Single `Card` with `CardTitle` and `CardDescription` (one line explaining landing visibility).
- Add-method form grid and list of methods — same behaviors as today (create/update/delete/toggle active).

### State hygiene

- On tab change away from **Donasi**, **clear row selection** to avoid ambiguous bulk state when returning.

## KPI and Copy

- **Total** and **Rata-rata** computed from client-side `filteredData` are **only meaningful for the current loaded page** after API filter/search/sort. Subtitles must not imply whole-database totals (e.g. mention filter/halaman where appropriate).
- **Jumlah transaksi** / server `total` — keep aligned with existing `useAdminDonations` pagination metadata.
- **Donatur baru (bulan ini)** — keep existing monthly query logic; label remains **bulan ini**.

## Detail Panel (`Sheet`)

- Use shadcn **`Sheet`**, `side="right"`, width class consistent with `jamaah` (e.g. `sm:max-w-md`).
- Display: donor name, amount, category label, payment method name (resolve from loaded methods), date, status badge.
- For fields not on `DonationFull`: show **—** or muted **Tidak ada data**, not fabricated phone/email.
- **Bukti transfer:** placeholder region only if no URL field exists on the type; otherwise omit or show image when API provides it (no new fields in this spec).
- **Catatan**, **Konfirmasi**, **Ditolak:** for this pass, **disable** primary actions with short helper text (e.g. under actions or `title`) that integration is pending — avoid silent no-ops or misleading success.

## Bulk Row Actions

- **Konfirmasi terpilih** and **Hapus** — same rule as detail: **disabled** with visible rationale, or equivalent non-deceptive pattern; no `confirm()` that implies deletion occurred.

## Error and Loading

- Preserve existing loading and empty copy; improve spacing only.

## Accessibility

- Sheet: close on overlay/Esc per shadcn defaults; restore focus to row action where practical.
- Preserve existing `aria-label`s on checkboxes and icon buttons; extend if new controls are added.

## Testing (Manual)

- Switch tabs; confirm selection clears when leaving **Donasi**.
- Resize: toolbar stacks; table scrolls horizontally without breaking layout.
- Open/close detail sheet from a row; verify no fake PII.
- Payment method CRUD still works (regression smoke).

## Dependencies

- Existing hooks: `useAdminDonations`, `useAdminPaymentMethods`, `useCreatePaymentMethod`, `useUpdatePaymentMethod`, `useDeletePaymentMethod`.
- UI primitives: `Tabs`, `Card`, `Sheet`, `InputGroup`, `Table`, `Button`, `Select`, `Checkbox`, `StatusBadge`.

## Relation to Other Work

- Complements `2026-04-01-admin-ui-polish-design.md` (broader admin normalization); this spec is **authoritative for `donasi`** for the restructuring described here.
