'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpDown, BarChart3, Download, Settings, LogOut, CreditCard, Wallet, Calendar, AlertCircle } from 'lucide-react';

const expenseCategories = [
	{ id: '1', name: 'Listrik & Air', amount: 15000000, trend: 'up' },
	{ id: '2', name: 'Gaji Imam', amount: 8000000, trend: 'down' },
	{ id: '3', name: 'Gaji Karyawan', amount: 12000000, trend: 'up' },
	{ id: '4', name: 'ATK & Perlengkapan', amount: 3500000, trend: 'down' },
	{ id: '5', name: 'Program Kajian', amount: 25000000, trend: 'up' },
	{ id: '6', name: 'Santunan Yatim', amount: 5000000, trend: 'down' },
	{ id: '7', name: 'Renovasi & Bangunan', amount: 15000000, trend: 'down' },
];

export default function LaporanPage() {
	const [period, setPeriod] = useState<'bulan-ini' | '3-bulan' | 'tahun-ini' | 'custom'>('bulan-ini');

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Laporan Keuangan</h2>
				<button className="px-4 py-2 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">
					<Download className="w-4 h-4 mr-2" />
					Export Laporan
				</button>
			</div>

			{/* Period Selector */}
			<div className="flex items-center gap-2 mb-6 p-4 border-border rounded-lg bg-muted/30">
				<button
					onClick={() => setPeriod('bulan-ini')}
					className={`px-4 py-2 rounded-md font-medium transition-colors ${period === 'bulan-ini' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Bulan Ini
				</button>
				<button
					onClick={() => setPeriod('3-bulan')}
					className={`px-4 py-2 rounded-md font-medium transition-colors ${period === '3-bulan' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					3 Bulan Lalu
				</button>
				<button
					onClick={() => setPeriod('tahun-ini')}
					className={`px-4 py-2 rounded-md font-medium transition-colors ${period === 'tahun-ini' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Tahun Ini
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div className="p-6 border-border bg-muted/30 hover:bg-muted/30 transition-colors">
					<div className="text-sm font-medium text-muted uppercase mb-2">Total Pemasukan</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 127.850.000</div>
					<div className="text-xs text-muted">Periode ini</div>
				</div>
				<div className="p-6 border-border bg-muted/30 hover:bg-muted/30 transition-colors">
					<div className="text-sm font-medium text-muted uppercase mb-2">Total Pengeluaran</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 43.200.000</div>
					<div className="text-xs text-muted">Periode ini</div>
				</div>
				<div className="p-6 border-border bg-muted/30 hover:bg-muted/30 transition-colors">
					<div className="text-sm font-medium text-muted uppercase mb-2">Saldo Bersih</div>
					<div className="text-2xl font-mono text-foreground mb-1 text-success">Rp 84.650.000</div>
					<div className="text-xs text-muted">Periode ini</div>
				</div>
				<div className="p-6 border-border bg-muted/30 hover:bg-muted/30 transition-colors">
					<div className="text-sm font-medium text-muted uppercase mb-2">Dana Wakaf</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp 1.500.000.000</div>
					<div className="text-xs text-muted">Terkumpul</div>
				</div>
			</div>

			{/* Chart */}
			<div className="p-6 border-border bg-muted/30">
				<h3 className="text-lg font-semibold text-foreground mb-4">Pemasukan vs Pengeluaran</h3>

				<div className="h-64">
					<svg viewBox="0 0 600 200" className="w-full h-full">
						<defs>
							<linearGradient id="barGradient" x1="0" y1="200" x2="0" y2="0" gradientUnits="userSpaceOnUse">
								<stop offset="0%" stopColor="#f5f5f7" stopOpacity="0.3" />
								<stop offset="100%" stopColor="#f5f5f7" stopOpacity="0.1" />
							</linearGradient>
						</defs>

						{/* Bars */}
						{expenseCategories.map((cat, i) => (
							<g key={cat.id} transform={`translate(${i * 40}, 0)`}>
								<rect
									y={400 - (i * 30) - 8}
									width="40"
									height="120"
									fill="url(#barGradient)"
									rx="2"
								/>
								<text
									x={i * 40 + 48}
									y={400 - (i * 30) - 4}
									className="text-sm font-medium text-foreground"
									fill="#0f0f0f"
								>
									{cat.amount.toLocaleString('id-ID')}
								</text>
							</g>
						))}
					</svg>
				</div>
			</div>

			{/* Expense Breakdown Table */}
			<div className="border-border bg-background rounded-lg overflow-hidden">
				<div className="grid grid-cols-[60px_4rem_8rem_6rem_4rem] bg-muted/30 h-12 items-center text-xs font-medium tracking-widest text-muted">
					<div className="p-3">#</div>
					<div>Kategori</div>
					<div>Jumlah</div>
					<div>Trend</div>
					<div className="text-center">Persen</div>
				</div>

				<div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
					{expenseCategories.map((cat, index) => (
						<div
							key={cat.id}
							className="grid grid-cols-[60px_4rem_8rem_6rem_4rem] border-b border-border h-12 items-center text-sm hover:bg-muted/30"
						>
							<div className="p-3">
								#{index + 1}
							</div>
							<div className="text-foreground font-medium">{cat.name}</div>
						</div>
						<div className="text-right font-mono text-foreground">
							Rp {cat.amount.toLocaleString('id-ID')}
						</div>
						<div className="text-center">
							{cat.trend === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
							{cat.trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
						</div>
						<div className="text-center">
							{cat.trend === 'up' && (
								<span className="text-xs font-medium text-muted">+12%</span>
							)}
							{cat.trend === 'down' && (
								<span className="text-xs font-medium text-destructive">-8%</span>
							)}
						</div>
					</div>
				))}
				</div>
			</div>

			{/* Expense Categories Breakdown */}
			<div className="mt-6">
				<h3 className="text-lg font-semibold text-foreground mb-4">Rincianan Per Kategori</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{expenseCategories.map((cat) => (
						<div key={cat.id} className="p-4 border-border bg-muted/30 hover:bg-muted/30">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<BarChart3 className="w-4 h-4 text-muted" />
									<span className="text-sm font-medium text-foreground">{cat.name}</span>
								</div>
								<div className="text-right font-mono text-foreground">
									Rp {cat.amount.toLocaleString('id-ID')}
								</div>
							</div>

							{/* Mini bar chart */}
							<div className="h-16 flex items-end gap-1">
								<div className="flex-1 bg-muted/50 rounded h-12"></div>
								<div className="flex-1 bg-muted/50 rounded h-12"></div>
								<div className="flex-1 bg-muted/50 rounded h-12"></div>
								<div className="flex-1 bg-muted/50 rounded h-12"></div>
								<div className="flex-1 bg-muted/50 rounded h-12"></div>
							</div>

							<div className="text-xs text-muted mb-2">Bulan Lalu</div>
							<div className="text-xs text-muted">Rata</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
