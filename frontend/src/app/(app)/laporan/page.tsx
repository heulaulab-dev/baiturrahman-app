'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const expenseCategories = [
	{ id: '1', name: 'Listrik & Air', amount: 15000000, trend: 'up' as const },
	{ id: '2', name: 'Gaji Imam', amount: 8000000, trend: 'down' as const },
	{ id: '3', name: 'Gaji Karyawan', amount: 12000000, trend: 'up' as const },
	{ id: '4', name: 'ATK & Perlengkapan', amount: 3500000, trend: 'down' as const },
	{ id: '5', name: 'Program Kajian', amount: 25000000, trend: 'up' as const },
	{ id: '6', name: 'Santunan Yatim', amount: 5000000, trend: 'down' as const },
	{ id: '7', name: 'Renovasi & Bangunan', amount: 15000000, trend: 'down' as const },
];

export default function LaporanPage() {
	const [period, setPeriod] = useState<'bulan-ini' | '3-bulan' | 'tahun-ini'>('bulan-ini');

	const totalExpense = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Laporan Keuangan</h2>
				<Button variant="secondary" className="gap-2">
					<Download className="w-4 h-4" />
					Export Laporan
				</Button>
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
					<div className="text-2xl font-mono text-foreground mb-1">Rp 127.850.000</div>
					<div className="text-xs text-muted-foreground">Periode ini</div>
					</CardContent>
				</Card>
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted-foreground uppercase mb-2">Total Pengeluaran</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp {totalExpense.toLocaleString('id-ID')}</div>
					<div className="text-xs text-muted-foreground">Periode ini</div>
				</div>
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted-foreground uppercase mb-2">Saldo Bersih</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 84.650.000</div>
					<div className="text-xs text-muted-foreground">Periode ini</div>
				</div>
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted-foreground uppercase mb-2">Dana Wakaf</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 1.500.000.000</div>
					<div className="text-xs text-muted-foreground">Terkumpul</div>
				</div>
			</div>

			{/* Expense Breakdown */}
			<div className="border border-border bg-background rounded-lg overflow-hidden">
				<div className="grid grid-cols-[40px_1fr_160px_60px_80px] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
					<div>#</div>
					<div>Kategori</div>
					<div className="text-right">Jumlah</div>
					<div className="text-center">Trend</div>
					<div className="text-center">Persen</div>
				</div>
				{expenseCategories.map((cat, index) => (
					<div key={cat.id} className="grid grid-cols-[40px_1fr_160px_60px_80px] border-t border-border h-12 items-center px-4 text-sm hover:bg-muted/30 transition-colors">
						<div className="text-muted-foreground">#{index + 1}</div>
						<div className="text-foreground font-medium">{cat.name}</div>
						<div className="text-right font-mono text-foreground">Rp {cat.amount.toLocaleString('id-ID')}</div>
						<div className="flex justify-center">
							{cat.trend === 'up' ? <TrendingUp className="w-4 h-4 text-primary" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
						</div>
						<div className="text-center text-xs text-muted-foreground">
							{cat.trend === 'up' ? '+12%' : '-8%'}
						</div>
					</div>
				))}
			</div>

			{/* Category Cards */}
			<div>
				<h3 className="text-lg font-semibold text-foreground mb-4">Rincian Per Kategori</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{expenseCategories.map((cat) => (
						<div key={cat.id} className="p-4 border border-border bg-muted/30 rounded-md">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<BarChart3 className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium text-foreground">{cat.name}</span>
								</div>
								<div className="text-right font-mono text-sm text-foreground">
									Rp {cat.amount.toLocaleString('id-ID')}
								</div>
							</div>
							<div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
								<div
									className="h-full bg-foreground/80 rounded-full"
									style={{ width: `${(cat.amount / 25000000) * 100}%` }}
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
