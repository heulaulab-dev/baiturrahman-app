'use client';

import Link from 'next/link';
import { BarChart3, CalendarDays, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { PendingDonationsTable } from '@/components/dashboard/PendingDonationsTable';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DonationBarChart } from '@/components/dashboard/DonationBarChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { useDonationStats, useAdminEvents, useAdminUsers } from '@/services/adminHooks';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDonationStats();
  const { data: eventsData, isLoading: eventsLoading } = useAdminEvents();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 border-border">
                <div className="h-3 w-32 bg-muted/50 animate-pulse rounded mb-3" />
                <div className="h-8 w-40 bg-muted/50 animate-pulse rounded" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Total Donasi"
              value={stats ? formatCurrency(stats.total_amount) : 'Rp 0'}
              trend={stats && stats.total_amount > 0 ? 'up' : null}
              badge={`${stats?.confirmed_count ?? 0} terkonfirmasi`}
            />
            <StatCard
              label="Menunggu Konfirmasi"
              value={String(stats?.pending_count ?? 0)}
              trend={stats && stats.pending_count > 0 ? 'down' : null}
              badge="butuh tindakan"
            />
            <StatCard
              label="Event"
              value={eventsLoading ? '...' : String(eventsData?.total ?? 0)}
              badge="total"
            />
            <StatCard
              label="Pengguna"
              value={usersLoading ? '...' : String(usersData?.total ?? 0)}
              badge="terdaftar"
            />
          </>
        )}
      </div>

      {/* Section 2: Main Grid — Pending Donations + Quick Actions / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingDonationsTable />

        <div className="col-span-1 space-y-6">
          {/* Quick Actions */}
          <div>
            <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-3">
              Pintasan
            </h3>
            <div className="flex flex-col gap-2">
              <Button variant="default" asChild className="justify-start">
                <Link href="/donasi">
                  <BarChart3 data-icon="inline-start" />
                  Kelola Donasi
                </Link>
              </Button>
              <Button variant="secondary" asChild className="justify-start">
                <Link href="/konten">
                  <CalendarDays data-icon="inline-start" />
                  Kelola Event
                </Link>
              </Button>
              <Button variant="secondary" asChild className="justify-start">
                <Link href="/laporan">
                  <AlertCircle data-icon="inline-start" />
                  Lihat Laporan
                </Link>
              </Button>
              <Button variant="secondary" asChild className="justify-start">
                <Link href="/pengaturan">
                  <Users data-icon="inline-start" />
                  Pengaturan
                </Link>
              </Button>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-3">
              Aktivitas Terbaru
            </h3>
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* Section 3: Bottom Row — Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded-md">
          <h3 className="text-sm font-semibold mb-4">Donasi per Bulan</h3>
          <DonationBarChart data={stats?.by_month} isLoading={statsLoading} />
        </div>
        <div className="p-6 border border-border rounded-md">
          <h3 className="text-sm font-semibold mb-4">Ringkasan Kategori</h3>
          <CategoryBreakdown data={stats?.by_category} isLoading={statsLoading} />
        </div>
      </div>
    </div>
  );
}
