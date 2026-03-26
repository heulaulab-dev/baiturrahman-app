# Dashboard Overview Redesign

**Date:** 2026-03-17
**Branch:** `feature/landing-redesign-minimalist-sacred`
**Status:** Approved

## Problem

The dashboard overview page (`frontend/src/app/dashboard/page.tsx`) contains landing-page-style content — Jadwal Kajian Minggu Ini, Petugas Jumat Minggu Ini, a broken SVG donation chart, and hardcoded static data arrays. None of this is actionable for an admin. The overview should be an operator's command center where every widget is either actionable or informative.

## Design Principles

- **Vercel Noir aesthetic**: Monochromatic, monospace numbers, subtle borders, micro-interactions
- **Admin-first**: Every section either requires action or informs a decision
- **Data-dense but not cluttered**: Linear/Vercel information density
- **No decorative content**: Remove anything that belongs on the public landing page

## What Gets Removed

- Jadwal Kajian Minggu Ini section (landing content)
- Petugas Jumat Minggu Ini section (landing content)
- Broken SVG donation area chart
- Number counting animation on mount
- All hardcoded static data arrays (`statsData`, `recentActivity`, `upcomingKajian`, `jumatSchedule`)

## New Layout

### Section 1: KPI Stats Row

Four `StatCard` components wired to real API data:

| Card | API Source | Badge |
|---|---|---|
| Total Donasi Terkonfirmasi | `GET /admin/donations/stats` → `total_amount` | Month-over-month trend |
| Menunggu Konfirmasi | `stats.pending_count` | Warning color if > 0 |
| Total Event | `GET /admin/events` → count | "bulan ini" |
| Pengguna Aktif | `GET /admin/users` → count | total |

### Section 2: Main Content Grid (lg:grid-cols-3)

**Left 2 columns: Pending Donations Table**

Compact table of donations awaiting confirmation (`GET /admin/donations?status=pending&limit=5`).

- Columns: Donatur, Kategori, Nominal (mono, right-aligned), Metode, Waktu (relative)
- Row height: `h-14`
- Inline confirm/reject ghost buttons on hover
- Empty state: centered muted text
- Footer: "Lihat Semua →" link to `/dashboard/donasi`

**Right 1 column: Quick Actions + Activity Feed**

Quick Actions (top): Four stacked full-width buttons linking to key admin pages.
- Catat Donasi → `/dashboard/donasi`
- Tambah Event → `/dashboard/konten`
- Lihat Laporan → `/dashboard/laporan`
- Pengaturan → `/dashboard/pengaturan`

Aktivitas Terbaru (below): Last 5 recent donations (`GET /admin/donations?limit=5`).
- Status dot (green = confirmed, red = cancelled, yellow = pending)
- One-line: "Nama — Rp amount status"
- Relative timestamp

### Section 3: Bottom Row (lg:grid-cols-2)

**Left: Donasi 12 Bulan Terakhir**

CSS-only horizontal bar chart from `stats.by_month`.
- `bg-foreground/10` track + `bg-foreground` fill bar
- Width proportional to max amount in dataset
- Month label left, formatted amount right in mono

**Right: Ringkasan per Kategori**

Category breakdown from `stats.by_category`.
- Same bar style as monthly chart
- Category name, transaction count, total amount

## Data Layer

### New File: `services/adminApiService.ts`

```typescript
getDonationStats(): Promise<DonationStats>
  → GET /v1/admin/donations/stats

getDonations(params): Promise<PaginatedResponse<Donation>>
  → GET /v1/admin/donations

confirmDonation(id): Promise<Donation>
  → PUT /v1/admin/donations/:id/confirm

getAdminEvents(params): Promise<PaginatedResponse<Event>>
  → GET /v1/admin/events

getAdminUsers(): Promise<PaginatedResponse<User>>
  → GET /v1/admin/users
```

### New File: `services/adminHooks.ts`

TanStack Query hooks wrapping admin API calls:

- `useDonationStats()` — staleTime 60s, refetchOnWindowFocus
- `usePendingDonations()` — staleTime 30s (needs to stay fresh)
- `useRecentDonations()` — staleTime 60s
- `useAdminEvents()` — staleTime 5min
- `useAdminUsers()` — staleTime 5min
- `useConfirmDonation()` — mutation with optimistic update on pending list

### New File: `types/admin.ts`

TypeScript interfaces for admin API responses:
- `DonationStats`
- Admin-specific response wrappers

## Loading & Error States

- Skeleton loading per section: `bg-muted/50 animate-pulse` blocks matching layout
- Inline error with retry button (not full-page)
- Empty state: centered muted text

## Existing Components Reused

- `StatCard` — as-is, already matches design system
- `StatusBadge` — for donation status in pending table

## New Components

- `PendingDonationsTable` — extracted for testability
- `DonationBarChart` — CSS-only horizontal bar chart
- `CategoryBreakdown` — category summary with bars
- `ActivityFeed` — minimal timeline list
- `DashboardSkeleton` — loading skeleton for the overview

## Files Changed

- `frontend/src/app/dashboard/page.tsx` — full rewrite
- `frontend/src/services/adminApiService.ts` — new
- `frontend/src/services/adminHooks.ts` — new
- `frontend/src/types/admin.ts` — new (or extend existing types/index.ts)
- `frontend/src/components/dashboard/PendingDonationsTable.tsx` — new
- `frontend/src/components/dashboard/DonationBarChart.tsx` — new
- `frontend/src/components/dashboard/CategoryBreakdown.tsx` — new
- `frontend/src/components/dashboard/ActivityFeed.tsx` — new
- `frontend/src/components/dashboard/DashboardSkeleton.tsx` — new
