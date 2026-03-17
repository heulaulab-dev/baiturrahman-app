'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown, Search, FileText, ExternalLink, MoreHorizontal, Check, X, Trash2, Plus, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const paymentMethods = [
	{ id: 'qris', name: 'QRIS', type: 'qris' },
	{ id: 'bca', name: 'Transfer BCA', type: 'transfer' },
	{ id: 'mandiri', name: 'Transfer Mandiri', type: 'transfer' },
	{ id: 'tunai', name: 'Tunai', type: 'cash' },
	{ id: 'bni', name: 'Transfer BNI', type: 'transfer' },
];

const donasiData = [
	{ id: '1', nama: 'Ahmad Fauzi Rahman', jenis: 'Donasi Umum', nominal: 500000, metode: 'bca', tanggal: '2026-03-15', status: 'success' },
	{ id: '2', nama: 'Siti Nurhaliza Putri', jenis: 'Zakat Maal', nominal: 2500000, metode: 'bca', tanggal: '2026-03-14', status: 'success' },
	{ id: '3', nama: 'Muhammad Irfan Hakim', jenis: 'Wakaf Tunai', nominal: 10000000, metode: 'mandiri', tanggal: '2026-03-13', status: 'warning' },
	{ id: '4', nama: 'Dewi Rahayu Santoso', jenis: 'Infaq Jumat', nominal: 750000, metode: 'tunai', tanggal: '2026-03-12', status: 'danger' },
	{ id: '5', nama: 'Budi Setiawan', jenis: 'Donasi Umum', nominal: 100000, metode: 'bca', tanggal: '2026-03-11', status: 'success' },
	{ id: '6', nama: 'Nurul Hidayah', jenis: 'Zakat Fitrah', nominal: 5000000, metode: 'bni', tanggal: '2026-03-10', status: 'warning' },
];

const categories = ['Semua', 'Donasi Umum', 'Zakat', 'Wakaf', 'Infaq Jumat', 'Fidyah', 'Zakat Fitrah'];

export default function DonasiPage() {
	const [filter, setFilter] = useState('Semua');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortField, setSortField] = useState<'tanggal' | 'nominal'>('tanggal');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [selectedRows, setSelectedRows] = useState<number[]>([]);
	const [showDetailDrawer, setShowDetailDrawer] = useState(false);
	const [selectedDonasi, setSelectedDonasi] = useState<typeof donasiData[0] | null>(null);

	// Filter and sort data
	const filteredData = donasiData.filter((donasi) => {
		if (filter !== 'Semua') {
			return donasi.jenis === filter;
		}
		return true;
	}).filter((donasi) => {
		if (searchQuery) {
			return donasi.nama.toLowerCase().includes(searchQuery.toLowerCase());
		}
		return true;
	}).sort((a, b) => {
		if (sortField === 'tanggal') {
			const dateA = new Date(a.tanggal.split('/').reverse().join('/'));
			const dateB = new Date(b.tanggal.split('/').reverse().join('/'));
			return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
		}
		if (sortField === 'nominal') {
			return sortDirection === 'asc' ? a.nominal - b.nominal : b.nominal - a.nominal;
		}
		return 0;
	});

	const totalPeriode = filteredData.reduce((sum, donasi) => sum + donasi.nominal, 0);
	const rataDonasi = Math.floor(totalPeriode / filteredData.length);

	const handleSort = (field: typeof sortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('desc');
		}
	};

	const toggleRowSelection = (id: number) => {
		setSelectedRows(prev =>
			prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
		);
	};

	const handleExport = () => {
		// Export functionality
		console.log('Exporting:', filteredData);
	};

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Manajemen Donasi</h2>
				<button className="px-4 py-2 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">
					Export CSV
				</button>
			</div>

			{/* Filter Bar */}
			<div className="flex flex-wrap items-center gap-4 mb-6 p-4 border-border bg-muted/30">
				<div className="flex items-center gap-2 relative">
					<Search className="w-4 h-4 text-muted" />
					<input
						type="text"
						placeholder="Cari donatur..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
					/>
				</div>

				<div className="flex gap-2">
					<Filter className="w-4 h-4 text-muted" />
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value as typeof filter)}
						className="py-2 px-4 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
					>
						{categories.map(cat => (
							<option key={cat} value={cat}>{cat}</option>
						))}
					</select>
				</div>

				<div className="flex gap-2">
					<button
						onClick={() => handleSort('tanggal')}
						className={`px-3 py-2 rounded-md transition-colors ${sortField === 'tanggal' ? 'bg-muted/50' : ''}`}
					>
						Tanggal
						{sortField === 'tanggal' && (
							<span className="ml-2 text-muted">
								{sortDirection === 'asc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
							</span>
						)}
					</button>
					<button
						onClick={() => handleSort('nominal')}
						className={`px-3 py-2 rounded-md transition-colors ${sortField === 'nominal' ? 'bg-muted/50' : ''}`}
					>
						Nominal
						{sortField === 'nominal' && (
							<span className="ml-2 text-muted">
								{sortDirection === 'asc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
							</span>
						)}
					</button>
				</div>

				<button onClick={handleExport} className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
					Export
				</button>
			</div>

			{/* Summary Row */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted uppercase mb-2">Total Periode</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp {totalPeriode.toLocaleString('id-ID')}</div>
					<div className="text-sm text-muted">384 transaksi</div>
				</div>
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted uppercase mb-2">Jumlah Transaksi</div>
					<div className="text-2xl font-mono text-foreground mb-1">{filteredData.length}</div>
					<div className="text-sm text-muted">kali ini</div>
				</div>
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted uppercase mb-2">Rata-rata Donasi</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp {rataDonasi.toLocaleString('id-ID')}</div>
					<div className="text-sm text-muted">per transaksi</div>
				</div>
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted uppercase mb-2">Donatur Baru</div>
					<div className="text-2xl font-mono text-foreground mb-1">47</div>
					<div className="text-sm text-muted">bulan ini</div>
				</div>
			</div>

			{/* Main Table */}
			<div className="border-border bg-background rounded-md overflow-hidden">
				{/* Table Header */}
				<div className="grid grid-cols-[50px_3rem_5rem_6rem_5rem_5rem_5rem] bg-muted/30 h-12 items-center text-xs font-medium tracking-widest text-muted">
					<div className="p-3 flex items-center">
						<input
							type="checkbox"
							onChange={(e) => {
								if (e.target.checked) {
									setSelectedRows([...filteredData.map(d => d.id)]);
								} else {
									setSelectedRows([]);
								}
							}}
							className="w-4 h-4 border-border rounded focus:ring-1 focus:ring-foreground/20"
						/>
					</div>
					<div className="text-center">#</div>
					<div>Nama Donatur</div>
					<div>Jenis</div>
					<div>Nominal</div>
					<div>Metode</div>
					<div>Tanggal</div>
					<div>Status</div>
					<div className="text-center">Aksi</div>
				</div>

				{/* Table Body */}
				<div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
					{filteredData.map((donasi, index) => (
						<div
							key={donasi.id}
							onClick={() => setShowDetailDrawer(true)}
							className={`
								grid grid-cols-[50px_3rem_5rem_6rem_5rem_5rem_5rem] border-b border-border
								h-12 items-center text-sm
								${selectedRows.includes(donasi.id) ? 'bg-muted/50' : ''}
								hover:bg-muted/30 transition-colors
							`}
						>
							<div className="p-3 flex items-center">
								<input
									type="checkbox"
									checked={selectedRows.includes(donasi.id)}
									onChange={(e) => toggleRowSelection(donasi.id)}
									className="w-4 h-4 border-border rounded focus:ring-1 focus:ring-foreground/20"
								/>
							</div>
							<div className="text-center text-xs tracking-widest text-muted">#{index + 1}</div>
							<div className="text-foreground font-medium truncate">
								{donasi.nama}
							</div>
							<div className="text-foreground truncate">
								{donasi.jenis}
							</div>
							<div className="text-right font-mono text-foreground">
								Rp {donasi.nominal.toLocaleString('id-ID')}
							</div>
							<div className="text-center">
								{paymentMethods.find(pm => pm.id === donasi.metode)?.name || '-'}
							</div>
							<div className="text-muted">{donasi.tanggal}</div>
							<div className="text-center">
								<StatusBadge status={donasi.status}>
									{donasi.status === 'success' && 'Terkonfirmasi'}
									{donasi.status === 'warning' && 'Pending'}
									{donasi.status === 'danger' && 'Ditolak'}
								</StatusBadge>
							</div>
							<div className="text-center">
								<button
									onClick={(e) => {
										e.stopPropagation();
										setSelectedDonasi(donasi);
										setShowDetailDrawer(true);
									}}
									className="p-1.5 text-muted hover:text-foreground transition-colors"
								>
									<MoreHorizontal className="w-4 h-4" />
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Table Footer */}
				<div className="grid grid-cols-[50px_3rem_5rem_6rem_5rem_5rem_5rem] bg-muted/30 h-12 items-center text-xs font-medium text-muted border-t border-border">
					<div className="col-span-2 flex items-center gap-2 pl-3">
						<button className="text-muted hover:text-foreground transition-colors disabled:opacity-50" disabled={selectedRows.length === 0}>
							<Check className="w-4 h-4" />
							<span className="ml-2">Konfirmasi Terpilih ({selectedRows.length})</span>
						</button>
						<button
							onClick={handleExport}
							className="text-muted hover:text-foreground transition-colors flex items-center gap-2"
						>
							<ExternalLink className="w-4 h-4" />
							Export
						</button>
					</div>
					<div className="flex items-center gap-2 justify-between text-center">
						<button
							onClick={() => {
								setFilter('Semua');
								setSortField('tanggal');
								setSortDirection('desc');
							}}
							className="text-muted hover:text-foreground transition-colors"
						>
							Previous
						</button>
						<span className="font-mono text-muted">
							{Math.min(Math.ceil(filteredData.length / 20), filteredData.length)} of {filteredData.length}
						</span>
						<button className="text-muted hover:text-foreground transition-colors">
							Next >
						</button>
					</div>
					<div className="col-span-2 flex items-center gap-2 justify-end pr-3">
						<button
							onClick={() => {
								if (confirm('Hapus donasi terpilih?')) {
									console.log('Delete selected:', selectedRows);
								}
							}}
							className="text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2 disabled:opacity-50"
							disabled={selectedRows.length === 0}
						>
							<Trash2 className="w-4 h-4" />
							Hapus
						</button>
					</div>
				</div>
			</div>

			{/* Detail Drawer */}
			{showDetailDrawer && selectedDonasi && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div
						onClick={() => setShowDetailDrawer(false)}
						className="absolute inset-0 bg-background/80"
					/>
					<div
						className={`
							absolute right-0 top-0 bottom-0 w-[400px] bg-background border-border rounded-lg shadow-xl
							transform transition-all duration-300
							${showDetailDrawer ? 'translate-x-0' : 'translate-x-full'}
						`}
					>
						<div className="p-6 border-b border-border">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-foreground">Detail Donasi</h3>
								<button onClick={() => setShowDetailDrawer(false)} className="text-muted hover:text-foreground">
									<X className="w-5 h-5" />
								</button>
							</div>
						</div>

						{/* Donatur Info */}
						<div className="space-y-4 p-6">
							<div className="flex items-start gap-4">
								<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
									<div className="text-2xl font-semibold text-muted">AF</div>
								</div>
								<div>
									<div className="text-sm text-muted">Nama</div>
									<div className="text-lg font-semibold text-foreground">{selectedDonasi.nama}</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-muted">No. HP</div>
									<div className="text-foreground">0812-3456-7890</div>
								</div>
								<div>
									<div className="text-muted">Email</div>
									<div className="text-foreground truncate">ahmad.fauzi@email.com</div>
								</div>
							</div>
						</div>

						{/* Bukti Transfer */}
						<div className="p-6 bg-muted/30">
							<div className="text-sm text-muted mb-2">Bukti Transfer</div>
							<div className="w-full aspect-video bg-muted/50 rounded flex items-center justify-center">
								<FileText className="w-12 h-12 text-muted" />
								<span className="text-sm text-muted">Upload bukti transfer</span>
							</div>
						</div>

						{/* Catatan Field */}
						<div className="p-6">
							<label className="block text-sm text-muted mb-2">Catatan (Opsional)</label>
							<textarea
								placeholder="Tambahkan catatan untuk donasi ini..."
								className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none resize-none h-24"
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-3 p-6 border-t border-border">
							<button className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-destructive text-background hover:bg-destructive/90">
								Ditolak
							</button>
							<button className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-success text-background hover:bg-success/90">
								Konfirmasi
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
