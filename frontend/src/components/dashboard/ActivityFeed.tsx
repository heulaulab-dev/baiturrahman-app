'use client';

import { useRecentDonations } from '@/services/adminHooks';

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

const statusConfig: Record<string, { color: string; label: string }> = {
  confirmed: { color: 'bg-primary', label: 'dikonfirmasi' },
  cancelled: { color: 'bg-destructive', label: 'dibatalkan' },
  pending: { color: 'bg-accent', label: 'pending' },
};

export function ActivityFeed() {
  const { data, isLoading } = useRecentDonations();

  const donations = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {['a', 'b', 'c', 'd', 'e'].map((skeletonKey) => (
          <div key={skeletonKey} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-muted/50 animate-pulse mt-2 shrink-0" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-4 w-3/4 bg-muted/50 animate-pulse rounded" />
              <div className="h-3 w-1/3 bg-muted/50 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">Belum ada aktivitas</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {donations.map((d) => {
        const config = statusConfig[d.status] ?? statusConfig.pending;
        return (
          <div key={d.id} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.color}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">
                {d.donor_name}
                <span className="text-muted-foreground"> — </span>
                <span className="font-mono">{formatCurrency(d.amount)}</span>
                <span className="text-muted-foreground"> {config.label}</span>
              </p>
              <p className="text-xs text-muted-foreground">{relativeTime(d.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
