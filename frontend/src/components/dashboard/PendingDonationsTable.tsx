'use client';

import { Check, X, Inbox } from 'lucide-react';
import Link from 'next/link';
import { usePendingDonations, useConfirmDonation } from '@/services/adminHooks';
import { StatusBadge } from './StatusBadge';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function relativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function PendingDonationsTable() {
  const { data, isLoading, error, refetch } = usePendingDonations();
  const confirmMutation = useConfirmDonation();

  const donations = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 bg-muted/50 animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
        </div>
        <div className="flex flex-col gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-border flex items-center px-4 gap-4">
              <div className="h-4 w-32 bg-muted/50 animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted/50 animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted/50 animate-pulse rounded ml-auto" />
              <div className="h-4 w-20 bg-muted/50 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground mb-3">Gagal memuat data donasi</p>
        <button
          onClick={() => refetch()}
          className="text-sm hover:text-muted-foreground transition-colors"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Menunggu Konfirmasi</h3>
        <Link
          href="/dashboard/donasi"
          className="text-sm text-muted-foreground hover:underline transition-colors"
        >
          Lihat Semua →
        </Link>
      </div>

      {donations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3 text-muted-foreground/50" />
          <p className="text-sm">Tidak ada donasi menunggu konfirmasi</p>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            <div>Donatur</div>
            <div className="w-20 text-center">Kategori</div>
            <div className="w-28 text-right">Nominal</div>
            <div className="w-24 text-right">Waktu</div>
            <div className="w-20 text-center">Aksi</div>
          </div>

          {donations.map((donation) => (
            <div
              key={donation.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] h-14 items-center px-4 border-t border-border hover:bg-muted/20 transition-colors group"
            >
              <div className="text-sm font-medium truncate pr-3">
                {donation.donor_name}
              </div>
              <div className="w-20 flex justify-center">
                <StatusBadge status="default">
                  {capitalize(donation.category)}
                </StatusBadge>
              </div>
              <div className="w-28 text-right font-mono text-sm">
                {formatCurrency(donation.amount)}
              </div>
              <div className="w-24 text-right text-xs text-muted-foreground">
                {relativeTime(donation.created_at)}
              </div>
              <div className="w-20 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => confirmMutation.mutate(donation.id)}
                  disabled={confirmMutation.isPending}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted/30 transition-colors"
                  title="Konfirmasi"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Tolak"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
