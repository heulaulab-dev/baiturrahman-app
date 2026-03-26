# Dashboard Overview Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the landing-content-style dashboard overview with an admin command center wired to real backend APIs.

**Architecture:** New admin API service layer + TanStack Query hooks feed data into extracted dashboard components. The page itself becomes a thin composition of these data-connected components.

**Tech Stack:** Next.js 16 (App Router), TypeScript, TanStack Query, Tailwind CSS 4, Axios

**Design reference:** `docs/plans/2026-03-17-dashboard-overview-redesign.md`

---

## API Response Shapes

Backend wraps all responses:

```typescript
// Success: { success: true, data: T, message: string }
// Paginated: { success: true, data: T[], page: number, limit: number, total: number, total_pages: number }
// Error: { success: false, error: string }
```

The axios instance at `frontend/src/lib/axios.ts` auto-injects the JWT token from `localStorage`.
Base URL is `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api`), and API calls prepend `/v1`.

---

## Task 1: Add Admin Types

**Files:**
- Modify: `frontend/src/types/index.ts`

**Step 1: Add the DonationStats interface and update Donation interface**

Append to `frontend/src/types/index.ts`:

```typescript
export interface DonationFull {
  id: string
  donation_code: string
  donor_name: string
  donor_email?: string
  donor_phone?: string
  amount: number
  payment_method_id?: string
  category: 'infaq' | 'sedekah' | 'zakat' | 'wakaf' | 'operasional'
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  proof_url?: string
  confirmed_by?: string
  confirmed_at?: string
  created_at: string
  updated_at: string
  payment_method?: PaymentMethod
}

export interface DonationStats {
  total_amount: number
  total_count: number
  by_category: Record<string, { total: number; count: number }>
  by_month: Record<string, { total: number; count: number }>
  pending_count: number
  confirmed_count: number
  cancelled_count: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}
```

**Step 2: Commit**

```bash
git add frontend/src/types/index.ts
git commit -m "feat: add admin donation types and API response interfaces"
```

---

## Task 2: Create Admin API Service

**Files:**
- Create: `frontend/src/services/adminApiService.ts`

**Step 1: Write the admin API service**

```typescript
import api from '@/lib/axios'
import type {
  DonationFull,
  DonationStats,
  Event,
  User,
  ApiResponse,
  PaginatedResponse,
} from '@/types'

// Donation Stats
export const getDonationStats = async (): Promise<DonationStats> => {
  const response = await api.get<ApiResponse<DonationStats>>('/v1/admin/donations/stats')
  return response.data.data
}

// Donations (admin)
export interface GetDonationsParams {
  page?: number
  limit?: number
  status?: 'pending' | 'confirmed' | 'cancelled'
  category?: string
  from?: string
  to?: string
}

export const getAdminDonations = async (
  params: GetDonationsParams = {}
): Promise<PaginatedResponse<DonationFull>> => {
  const response = await api.get<PaginatedResponse<DonationFull>>('/v1/admin/donations', { params })
  return response.data
}

// Confirm donation
export const confirmDonation = async (id: string): Promise<DonationFull> => {
  const response = await api.put<ApiResponse<DonationFull>>(`/v1/admin/donations/${id}/confirm`)
  return response.data.data
}

// Events (admin)
export const getAdminEvents = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Event>> => {
  const response = await api.get<PaginatedResponse<Event>>('/v1/admin/events', { params })
  return response.data
}

// Users (admin)
export const getAdminUsers = async (): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>('/v1/admin/users')
  return response.data
}
```

**Step 2: Commit**

```bash
git add frontend/src/services/adminApiService.ts
git commit -m "feat: add admin API service for donations, events, users"
```

---

## Task 3: Create Admin TanStack Query Hooks

**Files:**
- Create: `frontend/src/services/adminHooks.ts`

**Step 1: Write the hooks**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDonationStats,
  getAdminDonations,
  confirmDonation,
  getAdminEvents,
  getAdminUsers,
  type GetDonationsParams,
} from './adminApiService'

export const useDonationStats = () => {
  return useQuery({
    queryKey: ['admin', 'donation-stats'],
    queryFn: getDonationStats,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  })
}

export const usePendingDonations = (limit = 5) => {
  return useQuery({
    queryKey: ['admin', 'donations', 'pending', limit],
    queryFn: () => getAdminDonations({ status: 'pending', limit, page: 1 }),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  })
}

export const useRecentDonations = (limit = 5) => {
  return useQuery({
    queryKey: ['admin', 'donations', 'recent', limit],
    queryFn: () => getAdminDonations({ limit, page: 1 }),
    staleTime: 1000 * 60,
  })
}

export const useConfirmDonation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'donation-stats'] })
    },
  })
}

export const useAdminEvents = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'events', limit],
    queryFn: () => getAdminEvents({ limit, page: 1 }),
    staleTime: 1000 * 60 * 5,
  })
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
    staleTime: 1000 * 60 * 5,
  })
}
```

**Step 2: Commit**

```bash
git add frontend/src/services/adminHooks.ts
git commit -m "feat: add TanStack Query hooks for admin dashboard data"
```

---

## Task 4: Create Dashboard Components — PendingDonationsTable

**Files:**
- Create: `frontend/src/components/dashboard/PendingDonationsTable.tsx`

**Step 1: Build the component**

The pending donations table is the primary action surface. It shows donations with `status: 'pending'` and provides inline confirm/reject actions.

Key design decisions:
- Use `usePendingDonations()` hook for data
- Use `useConfirmDonation()` mutation for inline confirm
- `StatusBadge` for payment method category
- Monospace right-aligned amounts
- Relative timestamps using `Intl.RelativeTimeFormat` or simple helper
- Row hover reveals action buttons (Vercel ghost-button style)
- Empty state with muted text
- Footer links to `/dashboard/donasi`
- Loading skeleton: 5 rows of `h-14 bg-muted/50 animate-pulse`

Props: none (self-contained with hooks)

Approximate structure:
```
<div className="col-span-1 lg:col-span-2">
  <header> "Menunggu Konfirmasi" + "Lihat Semua →" link </header>
  <div> table rows or empty state </div>
</div>
```

Each row:
```
<div className="flex items-center h-14 px-4 border-b border-border hover:bg-muted/30 group">
  <div>donor name + category badge</div>
  <div className="font-mono text-right">Rp {amount}</div>
  <div>relative time</div>
  <div className="opacity-0 group-hover:opacity-100">confirm/reject buttons</div>
</div>
```

**Step 2: Commit**

```bash
git add frontend/src/components/dashboard/PendingDonationsTable.tsx
git commit -m "feat: add PendingDonationsTable component with inline actions"
```

---

## Task 5: Create Dashboard Components — ActivityFeed

**Files:**
- Create: `frontend/src/components/dashboard/ActivityFeed.tsx`

**Step 1: Build the component**

Shows the 5 most recent donations as a minimal timeline.

Key design decisions:
- Use `useRecentDonations()` hook
- Status dot: green (confirmed), red (cancelled), yellow (pending)
- One line per item: "Donor Name — Rp amount"
- Relative timestamp below in `text-xs text-muted`
- No interactivity beyond viewing

Props: none (self-contained)

Structure:
```
<div className="space-y-3">
  {donations.map(d => (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full mt-2 {statusColor}" />
      <div>
        <p className="text-sm">{d.donor_name} — Rp {formatted}</p>
        <p className="text-xs text-muted">{relativeTime}</p>
      </div>
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add frontend/src/components/dashboard/ActivityFeed.tsx
git commit -m "feat: add ActivityFeed component for recent donations"
```

---

## Task 6: Create Dashboard Components — DonationBarChart

**Files:**
- Create: `frontend/src/components/dashboard/DonationBarChart.tsx`

**Step 1: Build the component**

CSS-only horizontal bar chart showing monthly donation totals.

Props:
```typescript
interface DonationBarChartProps {
  data: Record<string, { total: number; count: number }>
  isLoading?: boolean
}
```

Key design decisions:
- Parse `by_month` data (keys are "YYYY-MM"), sort chronologically, take last 6-12 months
- Find max value for percentage calculation
- Each bar: month label left, `bg-foreground/10` track, `bg-foreground` fill, amount right in `font-mono`
- Bar width: `(value / max) * 100%`
- Loading: 6 rows of `h-8 bg-muted/50 animate-pulse`

Structure:
```
<div className="space-y-3">
  {months.map(m => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted w-8">{monthLabel}</span>
      <div className="flex-1 h-6 bg-foreground/10 rounded-sm overflow-hidden">
        <div className="h-full bg-foreground rounded-sm" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-muted w-24 text-right">{formatted}</span>
    </div>
  ))}
</div>
```

**Step 2: Commit**

```bash
git add frontend/src/components/dashboard/DonationBarChart.tsx
git commit -m "feat: add DonationBarChart CSS-only horizontal bar chart"
```

---

## Task 7: Create Dashboard Components — CategoryBreakdown

**Files:**
- Create: `frontend/src/components/dashboard/CategoryBreakdown.tsx`

**Step 1: Build the component**

Shows donation breakdown by category with proportional bars.

Props:
```typescript
interface CategoryBreakdownProps {
  data: Record<string, { total: number; count: number }>
  isLoading?: boolean
}
```

Key design decisions:
- Sort categories by total descending
- Same bar visual as DonationBarChart for consistency
- Show category name (capitalize), transaction count, and total amount
- Loading: 4 rows skeleton

Structure per row:
```
<div>
  <div className="flex justify-between text-sm mb-1">
    <span>{category}</span>
    <span className="font-mono">{formatted}</span>
  </div>
  <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
    <div className="h-full bg-foreground rounded-full" style={{ width: `${pct}%` }} />
  </div>
  <span className="text-xs text-muted">{count} transaksi</span>
</div>
```

**Step 2: Commit**

```bash
git add frontend/src/components/dashboard/CategoryBreakdown.tsx
git commit -m "feat: add CategoryBreakdown component"
```

---

## Task 8: Rewrite Dashboard Overview Page

**Files:**
- Modify: `frontend/src/app/dashboard/page.tsx` (full rewrite)

**Step 1: Replace the entire page**

The new page is a thin composition layer. All data fetching lives in hooks, all rendering in components.

```typescript
'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { PendingDonationsTable } from '@/components/dashboard/PendingDonationsTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DonationBarChart } from '@/components/dashboard/DonationBarChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { useDonationStats, useAdminEvents, useAdminUsers } from '@/services/adminHooks';
import { BarChart3, Clock, CalendarDays, Users } from 'lucide-react';
import Link from 'next/link';
```

Layout structure:

```
<div className="space-y-6 p-6">
  {/* Section 1: KPI Stats Row */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard label="Total Donasi" value={formatted total_amount} trend="up" badge="+12%" />
    <StatCard label="Menunggu Konfirmasi" value={pending_count} badge="butuh tindakan" />
    <StatCard label="Event" value={events total} badge="total" />
    <StatCard label="Pengguna" value={users total} badge="terdaftar" />
  </div>

  {/* Section 2: Main Grid — Pending + Quick Actions */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <PendingDonationsTable />

    <div className="col-span-1 space-y-6">
      {/* Quick Actions */}
      <div className="space-y-2">
        <Link href="/dashboard/donasi" className="block w-full ...">+ Catat Donasi</Link>
        <Link href="/dashboard/konten" className="block w-full ...">+ Tambah Event</Link>
        <Link href="/dashboard/laporan" className="block w-full ...">Lihat Laporan</Link>
        <Link href="/dashboard/pengaturan" className="block w-full ...">Pengaturan</Link>
      </div>

      {/* Activity Feed */}
      <div>
        <h3>Aktivitas Terbaru</h3>
        <ActivityFeed />
      </div>
    </div>
  </div>

  {/* Section 3: Bottom Row — Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="p-6 border-border bg-muted/30">
      <h3>Donasi per Bulan</h3>
      <DonationBarChart data={stats.by_month} isLoading={statsLoading} />
    </div>
    <div className="p-6 border-border bg-muted/30">
      <h3>Ringkasan Kategori</h3>
      <CategoryBreakdown data={stats.by_category} isLoading={statsLoading} />
    </div>
  </div>
</div>
```

Key implementation details:
- Stats row: Format `total_amount` as `Rp XX.XXX.XXX` using `toLocaleString('id-ID')`
- Skeleton: Show `animate-pulse` blocks while `isLoading` is true on each hook
- Error: Show inline retry for any failed hook
- Remove all old imports: `useEffect`, `useState`, hardcoded data arrays, `BarChart3`, `TrendingUp`, etc.
- Remove the `<style jsx global>` block entirely

**Step 2: Verify the build**

```bash
cd frontend && bun run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 3: Commit**

```bash
git add frontend/src/app/dashboard/page.tsx
git commit -m "feat: rewrite dashboard overview as admin command center

- Replace landing-style content (kajian schedule, jumat officers) with admin metrics
- Wire to real backend APIs via TanStack Query hooks
- Add pending donations table with inline confirm actions
- Add activity feed, monthly bar chart, category breakdown
- Remove all hardcoded static data"
```

---

## Task 9: Verify & Clean Up

**Step 1: Run lint**

```bash
cd frontend && bun run lint
```

Fix any lint errors.

**Step 2: Check for unused imports in old files**

Verify `StatCard` and `StatusBadge` still export correctly and are used.

**Step 3: Final commit if needed**

```bash
git add -A
git commit -m "fix: resolve lint errors after dashboard overview rewrite"
```

---

## Summary of New/Modified Files

| Action | File |
|--------|------|
| Modify | `frontend/src/types/index.ts` |
| Create | `frontend/src/services/adminApiService.ts` |
| Create | `frontend/src/services/adminHooks.ts` |
| Create | `frontend/src/components/dashboard/PendingDonationsTable.tsx` |
| Create | `frontend/src/components/dashboard/ActivityFeed.tsx` |
| Create | `frontend/src/components/dashboard/DonationBarChart.tsx` |
| Create | `frontend/src/components/dashboard/CategoryBreakdown.tsx` |
| Rewrite | `frontend/src/app/dashboard/page.tsx` |
