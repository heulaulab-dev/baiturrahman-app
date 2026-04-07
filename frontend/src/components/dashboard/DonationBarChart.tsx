'use client';

interface DonationBarChartProps {
  data?: Record<string, { total: number; count: number }>;
  isLoading?: boolean;
}

function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  return `Rp ${amount}`;
}

const monthNames: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
  '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des',
};

export function DonationBarChart({ data, isLoading }: DonationBarChartProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-4 bg-muted/50 animate-pulse rounded" />
            <div className="flex-1 h-6 bg-muted/50 animate-pulse rounded-sm" />
            <div className="w-20 h-4 bg-muted/50 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Belum ada data donasi</p>;
  }

  const entries = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  const maxTotal = Math.max(...entries.map(([, v]) => v.total), 1);

  return (
    <div className="flex flex-col gap-2.5">
      {entries.map(([key, value]) => {
        const month = key.split('-')[1];
        const label = monthNames[month] ?? key;
        const pct = (value.total / maxTotal) * 100;

        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{label}</span>
            <div className="flex-1 h-6 bg-primary/10 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm bg-primary transition-all duration-500"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground w-24 text-right shrink-0">
              {formatCompact(value.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
