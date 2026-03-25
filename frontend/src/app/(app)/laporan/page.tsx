'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react';

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
				<button className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">
					<Download className="w-4 h-4" />
					Export Laporan
				</button>
			</div>

			{/* Period Selector */}
			<div className="flex items-center gap-1 p-1 border border-border rounded-lg bg-muted/30">
				{[
					{ key: 'bulan-ini' as const, label: 'Bulan Ini' },
					{ key: '3-bulan' as const, label: '3 Bulan Lalu' },
					{ key: 'tahun-ini' as const, label: 'Tahun Ini' },
				].map((p) => (
					<button
						key={p.key}
						onClick={() => setPeriod(p.key)}
						className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${period === p.key ? 'bg-background text-foreground' : 'text-muted hover:bg-muted/50'}`}
					>
						{p.label}
					</button>
				))}
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted uppercase mb-2">Total Pemasukan</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 127.850.000</div>
					<div className="text-xs text-muted">Periode ini</div>
				</div>
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted uppercase mb-2">Total Pengeluaran</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp {totalExpense.toLocaleString('id-ID')}</div>
					<div className="text-xs text-muted">Periode ini</div>
				</div>
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted uppercase mb-2">Saldo Bersih</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 84.650.000</div>
					<div className="text-xs text-muted">Periode ini</div>
				</div>
				<div className="p-6 border border-border bg-muted/30">
					<div className="text-sm font-medium text-muted uppercase mb-2">Dana Wakaf</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 1.500.000.000</div>
					<div className="text-xs text-muted">Terkumpul</div>
				</div>
			</div>

			{/* Expense Breakdown */}
			<div className="border border-border bg-background rounded-lg overflow-hidden">
				<div className="grid grid-cols-[40px_1fr_160px_60px_80px] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted uppercase">
					<div>#</div>
					<div>Kategori</div>
					<div className="text-right">Jumlah</div>
					<div className="text-center">Trend</div>
					<div className="text-center">Persen</div>
				</div>
				{expenseCategories.map((cat, index) => (
					<div key={cat.id} className="grid grid-cols-[40px_1fr_160px_60px_80px] border-t border-border h-12 items-center px-4 text-sm hover:bg-muted/30 transition-colors">
						<div className="text-muted">#{index + 1}</div>
						<div className="text-foreground font-medium">{cat.name}</div>
						<div className="text-right font-mono text-foreground">Rp {cat.amount.toLocaleString('id-ID')}</div>
						<div className="flex justify-center">
							{cat.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
						</div>
						<div className="text-center text-xs text-muted">
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
									<BarChart3 className="w-4 h-4 text-muted" />
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
