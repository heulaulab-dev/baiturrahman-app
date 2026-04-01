'use client';

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDonationStats } from '@/services/adminHooks';
import type { DonationStats } from '@/types';

export default function LaporanPage() {
	const [period, setPeriod] = useState<'bulan-ini' | '3-bulan' | 'tahun-ini'>('bulan-ini');

	const { data: donationStats, isLoading } = useDonationStats();
	const stats: DonationStats | undefined = donationStats;

	const currentDate = new Date();
	const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
	const monthKeysLast3 = Array.from({ length: 3 }).map((_, idx) => {
		const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - idx, 1);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
	});
	const monthKeysThisYear = Array.from({ length: currentDate.getMonth() + 1 }).map((_, idx) => {
		const d = new Date(currentDate.getFullYear(), idx, 1);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
	});

	let periodMonthKeys: string[] = [monthKey];
	if (period === '3-bulan') periodMonthKeys = monthKeysLast3;
	if (period === 'tahun-ini') periodMonthKeys = monthKeysThisYear;
	const byMonth = stats?.by_month ?? {};
	const periodIncome = periodMonthKeys.reduce((sum, key) => sum + (byMonth[key]?.total ?? 0), 0);
	const periodCount = periodMonthKeys.reduce((sum, key) => sum + (byMonth[key]?.count ?? 0), 0);

	const categories = Object.entries(stats?.by_category ?? {}).map(([key, value]) => ({
		key,
		total: value.total ?? 0,
		count: value.count ?? 0,
	}));
	const maxCategoryTotal = Math.max(...categories.map((c) => c.total), 1);

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Laporan Keuangan</h2>
			</div>

			{/* Period Selector */}
			<Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
				<TabsList className="h-auto gap-2 bg-muted/30 p-2">
					<TabsTrigger value="bulan-ini">Bulan Ini</TabsTrigger>
					<TabsTrigger value="3-bulan">3 Bulan Lalu</TabsTrigger>
					<TabsTrigger value="tahun-ini">Tahun Ini</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Pemasukan</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-mono text-foreground mb-1">
							{isLoading ? '...' : `Rp ${Math.round(periodIncome).toLocaleString('id-ID')}`}
						</div>
						<div className="text-xs text-muted-foreground">Periode ini</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground uppercase">Transaksi Confirmed</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-mono text-foreground mb-1">
							{isLoading ? '...' : periodCount.toLocaleString('id-ID')}
						</div>
						<div className="text-xs text-muted-foreground">Periode ini</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-mono text-foreground mb-1">
							{(stats?.pending_count ?? 0).toLocaleString('id-ID')}
						</div>
						<div className="text-xs text-muted-foreground">total</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground uppercase">Confirmed</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-mono text-foreground mb-1">
							{(stats?.confirmed_count ?? 0).toLocaleString('id-ID')}
						</div>
						<div className="text-xs text-muted-foreground">total</div>
					</CardContent>
				</Card>
			</div>

			{/* Category Cards */}
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-4">Rincian Donasi Per Kategori (Confirmed)</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{categories.map((cat) => (
						<div key={cat.key} className="p-4 border border-border bg-muted/30 rounded-md">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<BarChart3 className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium text-foreground">{cat.key}</span>
								</div>
								<div className="text-right font-mono text-sm text-foreground">
									Rp {Math.round(cat.total).toLocaleString('id-ID')}
								</div>
							</div>
							<div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
								<div
									className="h-full bg-foreground/80 rounded-full"
									style={{ width: `${(cat.total / maxCategoryTotal) * 100}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
