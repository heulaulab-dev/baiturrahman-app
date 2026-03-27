'use client';

interface CategoryBreakdownProps {
  data?: Record<string, { total: number; count: number }>;
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function CategoryBreakdown({ data, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-muted/50 animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted/50 animate-pulse rounded" />
            </div>
            <div className="h-2 bg-muted/50 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Belum ada data kategori</p>;
  }

  const entries = Object.entries(data).sort(([, a], [, b]) => b.total - a.total);
  const maxTotal = Math.max(...entries.map(([, v]) => v.total), 1);

  return (
    <div className="flex flex-col gap-4">
      {entries.map(([category, value]) => {
        const pct = (value.total / maxTotal) * 100;

        return (
          <div key={category}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm font-medium">
                {capitalize(category)}
              </span>
              <span className="text-sm font-mono text-muted-foreground">
                {formatCurrency(value.total)}
              </span>
            </div>
            <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground/80 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{value.count} transaksi</p>
          </div>
        );
      })}
    </div>
  );
}
