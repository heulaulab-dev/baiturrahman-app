'use client';

import { useState, type ReactNode } from 'react';
import { ArrowUp, ArrowDown, Search, FileText, ExternalLink, MoreHorizontal, Check, X, Trash2, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	useAdminPaymentMethods,
	useCreatePaymentMethod,
	useUpdatePaymentMethod,
	useDeletePaymentMethod,
} from '@/services/adminHooks';
import type { PaymentMethodType } from '@/types';

const donasiData = [
	{ id: '1', nama: 'Ahmad Fauzi Rahman', jenis: 'Donasi Umum', nominal: 500000, metode: 'bca', tanggal: '2026-03-15', status: 'success' as const },
	{ id: '2', nama: 'Siti Nurhaliza Putri', jenis: 'Zakat Maal', nominal: 2500000, metode: 'bca', tanggal: '2026-03-14', status: 'success' as const },
	{ id: '3', nama: 'Muhammad Irfan Hakim', jenis: 'Wakaf Tunai', nominal: 10000000, metode: 'mandiri', tanggal: '2026-03-13', status: 'warning' as const },
	{ id: '4', nama: 'Dewi Rahayu Santoso', jenis: 'Infaq Jumat', nominal: 750000, metode: 'tunai', tanggal: '2026-03-12', status: 'danger' as const },
	{ id: '5', nama: 'Budi Setiawan', jenis: 'Donasi Umum', nominal: 100000, metode: 'bca', tanggal: '2026-03-11', status: 'success' as const },
	{ id: '6', nama: 'Nurul Hidayah', jenis: 'Zakat Fitrah', nominal: 5000000, metode: 'bni', tanggal: '2026-03-10', status: 'warning' as const },
];

const categories = ['Semua', 'Donasi Umum', 'Zakat', 'Wakaf', 'Infaq Jumat', 'Fidyah', 'Zakat Fitrah'];

export default function DonasiPage() {
	const [filter, setFilter] = useState('Semua');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortField, setSortField] = useState<'tanggal' | 'nominal'>('tanggal');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [showDetailDrawer, setShowDetailDrawer] = useState(false);
	const [selectedDonasi, setSelectedDonasi] = useState<typeof donasiData[0] | null>(null);
	const [newMethodName, setNewMethodName] = useState('');
	const [newMethodType, setNewMethodType] = useState<PaymentMethodType>('bank_transfer');
	const [newMethodAccountNumber, setNewMethodAccountNumber] = useState('');
	const [newMethodAccountName, setNewMethodAccountName] = useState('');
	const [newMethodQrUrl, setNewMethodQrUrl] = useState('');
	const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
	const [editMethodName, setEditMethodName] = useState('');
	const [editMethodType, setEditMethodType] = useState<PaymentMethodType>('bank_transfer');
	const [editMethodAccountNumber, setEditMethodAccountNumber] = useState('');
	const [editMethodAccountName, setEditMethodAccountName] = useState('');
	const [editMethodQrUrl, setEditMethodQrUrl] = useState('');

	const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useAdminPaymentMethods();
	const createPaymentMethod = useCreatePaymentMethod();
	const updatePaymentMethod = useUpdatePaymentMethod();
	const deletePaymentMethod = useDeletePaymentMethod();

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

	const toggleRowSelection = (id: string) => {
		setSelectedRows(prev =>
			prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
		);
	};

	const handleExport = () => {
		// Export functionality
		console.log('Exporting:', filteredData);
	};

	const handleCreatePaymentMethod = async () => {
		if (!newMethodName.trim()) return;
		await createPaymentMethod.mutateAsync({
			name: newMethodName.trim(),
			type: newMethodType,
			account_number: newMethodType === 'qris' ? undefined : newMethodAccountNumber || undefined,
			account_name: newMethodType === 'qris' ? undefined : newMethodAccountName || undefined,
			qr_code_url: newMethodType === 'qris' ? newMethodQrUrl || undefined : undefined,
			is_active: true,
			display_order: paymentMethods.length + 1,
		});
		setNewMethodName('');
		setNewMethodType('bank_transfer');
		setNewMethodAccountNumber('');
		setNewMethodAccountName('');
		setNewMethodQrUrl('');
	};

	const handleTogglePaymentMethod = async (id: string, isActive: boolean) => {
		await updatePaymentMethod.mutateAsync({
			id,
			data: { is_active: !isActive },
		});
	};

	const handleStartEditPaymentMethod = (method: (typeof paymentMethods)[number]) => {
		setEditingMethodId(method.id);
		setEditMethodName(method.name);
		setEditMethodType(method.type);
		setEditMethodAccountNumber(method.account_number || '');
		setEditMethodAccountName(method.account_name || '');
		setEditMethodQrUrl(method.qr_code_url || '');
	};

	const handleCancelEditPaymentMethod = () => {
		setEditingMethodId(null);
		setEditMethodName('');
		setEditMethodType('bank_transfer');
		setEditMethodAccountNumber('');
		setEditMethodAccountName('');
		setEditMethodQrUrl('');
	};

	const handleSaveEditPaymentMethod = async (id: string) => {
		if (!editMethodName.trim()) return;
		await updatePaymentMethod.mutateAsync({
			id,
			data: {
				name: editMethodName.trim(),
				type: editMethodType,
				account_number: editMethodType === 'qris' ? undefined : editMethodAccountNumber || undefined,
				account_name: editMethodType === 'qris' ? undefined : editMethodAccountName || undefined,
				qr_code_url: editMethodType === 'qris' ? editMethodQrUrl || undefined : undefined,
			},
		});
		handleCancelEditPaymentMethod();
	};

	const handleDeletePaymentMethod = async (id: string) => {
		const confirmDelete = globalThis.confirm('Hapus metode pembayaran ini?');
		if (!confirmDelete) return;
		await deletePaymentMethod.mutateAsync(id);
		if (editingMethodId === id) {
			handleCancelEditPaymentMethod();
		}
	};

	let paymentMethodContent: ReactNode;
	if (paymentMethodsLoading) {
		paymentMethodContent = <p className="text-sm text-muted-foreground">Memuat metode pembayaran...</p>;
	} else if (paymentMethods.length === 0) {
		paymentMethodContent = <p className="text-sm text-muted-foreground">Belum ada metode pembayaran.</p>;
	} else {
		paymentMethodContent = paymentMethods.map((method) => {
			const isEditing = editingMethodId === method.id;
			return (
				<div key={method.id} className="space-y-3 rounded-md border border-border px-3 py-2">
					{isEditing ? (
						<div className="grid grid-cols-1 gap-2 md:grid-cols-5">
							<Input value={editMethodName} onChange={(e) => setEditMethodName(e.target.value)} className="md:col-span-2" />
							<Select value={editMethodType} onValueChange={(v) => setEditMethodType(v as PaymentMethodType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
									<SelectItem value="ewallet">E-Wallet</SelectItem>
									<SelectItem value="qris">QRIS</SelectItem>
								</SelectContent>
							</Select>
							{editMethodType === 'qris' ? (
								<Input value={editMethodQrUrl} onChange={(e) => setEditMethodQrUrl(e.target.value)} className="md:col-span-2" />
							) : (
								<>
									<Input value={editMethodAccountNumber} onChange={(e) => setEditMethodAccountNumber(e.target.value)} />
									<Input value={editMethodAccountName} onChange={(e) => setEditMethodAccountName(e.target.value)} />
								</>
							)}
						</div>
					) : (
						<div>
							<p className="text-sm font-medium text-foreground">{method.name}</p>
							<p className="text-xs text-muted-foreground">
								{method.type}
								{method.account_number ? ` · ${method.account_number}` : ''}
							</p>
						</div>
					)}
					<div className="flex flex-wrap items-center gap-2 justify-end">
						<Button
							type="button"
							variant={method.is_active ? 'secondary' : 'default'}
							size="sm"
							onClick={() => handleTogglePaymentMethod(method.id, method.is_active)}
							disabled={updatePaymentMethod.isPending || deletePaymentMethod.isPending}
						>
							{method.is_active ? 'Nonaktifkan' : 'Aktifkan'}
						</Button>
						{isEditing ? (
							<>
								<Button
									type="button"
									size="sm"
									onClick={() => handleSaveEditPaymentMethod(method.id)}
									disabled={updatePaymentMethod.isPending || !editMethodName.trim()}
								>
									Simpan
								</Button>
								<Button
									type="button"
									variant="secondary"
									size="sm"
									onClick={handleCancelEditPaymentMethod}
									disabled={updatePaymentMethod.isPending}
								>
									Batal
								</Button>
							</>
						) : (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleStartEditPaymentMethod(method)}
								disabled={deletePaymentMethod.isPending}
							>
								Edit
							</Button>
						)}
						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={() => handleDeletePaymentMethod(method.id)}
							disabled={deletePaymentMethod.isPending || updatePaymentMethod.isPending}
						>
							Hapus
						</Button>
					</div>
				</div>
			);
		});
	}

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Manajemen Donasi</h2>
				<Button variant="secondary">
					Export CSV
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Metode Pembayaran Landing</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-3 md:grid-cols-5">
						<Input
							value={newMethodName}
							onChange={(e) => setNewMethodName(e.target.value)}
							placeholder="Nama metode"
							className="md:col-span-2"
						/>
						<Select value={newMethodType} onValueChange={(v) => setNewMethodType(v as PaymentMethodType)}>
							<SelectTrigger>
								<SelectValue placeholder="Tipe metode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="bank_transfer">Bank Transfer</SelectItem>
								<SelectItem value="ewallet">E-Wallet</SelectItem>
								<SelectItem value="qris">QRIS</SelectItem>
							</SelectContent>
						</Select>
						{newMethodType === 'qris' ? (
							<Input
								value={newMethodQrUrl}
								onChange={(e) => setNewMethodQrUrl(e.target.value)}
								placeholder="URL QR code"
								className="md:col-span-2"
							/>
						) : (
							<>
								<Input
									value={newMethodAccountNumber}
									onChange={(e) => setNewMethodAccountNumber(e.target.value)}
									placeholder="No. rekening / akun"
								/>
								<Input
									value={newMethodAccountName}
									onChange={(e) => setNewMethodAccountName(e.target.value)}
									placeholder="Nama pemilik"
								/>
							</>
						)}
					</div>
					<div className="flex justify-end">
						<Button
							type="button"
							onClick={handleCreatePaymentMethod}
							disabled={createPaymentMethod.isPending || !newMethodName.trim()}
						>
							{createPaymentMethod.isPending ? 'Menyimpan...' : 'Tambah Metode'}
						</Button>
					</div>
					<div className="space-y-2">{paymentMethodContent}</div>
				</CardContent>
			</Card>

			{/* Filter Bar */}
			<div className="flex flex-wrap items-center gap-4 mb-6 p-4 border-border bg-muted/30">
				<div className="flex items-center gap-2 relative">
					<Search className="w-4 h-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Cari donatur..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				<div className="flex gap-2">
					<Filter className="w-4 h-4 text-muted-foreground" />
					<Select value={filter} onValueChange={setFilter}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Kategori donasi" />
						</SelectTrigger>
						<SelectContent>
							{categories.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex gap-2">
					<Button
						variant={sortField === 'tanggal' ? 'secondary' : 'ghost'}
						onClick={() => handleSort('tanggal')}
					>
						Tanggal
						{sortField === 'tanggal' && (
							<span className="ml-2 text-muted-foreground">
								{sortDirection === 'asc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
							</span>
						)}
					</Button>
					<Button
						variant={sortField === 'nominal' ? 'secondary' : 'ghost'}
						onClick={() => handleSort('nominal')}
					>
						Nominal
						{sortField === 'nominal' && (
							<span className="ml-2 text-muted-foreground">
								{sortDirection === 'asc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
							</span>
						)}
					</Button>
				</div>

				<Button onClick={handleExport}>
					Export
				</Button>
			</div>

			{/* Summary Row */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Periode</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-mono text-foreground mb-1">Rp {totalPeriode.toLocaleString('id-ID')}</div>
						<div className="text-sm text-muted-foreground">384 transaksi</div>
					</CardContent>
				</Card>
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted-foreground uppercase mb-2">Jumlah Transaksi</div>
					<div className="text-2xl font-mono text-foreground mb-1">{filteredData.length}</div>
					<div className="text-sm text-muted-foreground">kali ini</div>
				</div>
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted-foreground uppercase mb-2">Rata-rata Donasi</div>
					<div className="text-2xl font-mono text-foreground mb-1">Rp {rataDonasi.toLocaleString('id-ID')}</div>
					<div className="text-sm text-muted-foreground">per transaksi</div>
				</div>
				<div className="p-6 border-border hover:bg-muted/30 transition-colors">
					<div className="text-xs font-medium text-muted-foreground uppercase mb-2">Donatur Baru</div>
					<div className="text-2xl font-mono text-foreground mb-1">47</div>
					<div className="text-sm text-muted-foreground">bulan ini</div>
				</div>
			</div>

			{/* Main Table */}
			<div className="border-border bg-background rounded-md overflow-hidden">
				{/* Table Header */}
				<div className="grid grid-cols-[50px_3rem_5rem_6rem_5rem_5rem_5rem] bg-muted/30 h-12 items-center text-xs font-medium tracking-widest text-muted-foreground">
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
						<button
							key={donasi.id}
							onClick={() => {
								setSelectedDonasi(donasi);
								setShowDetailDrawer(true);
							}}
							className={`
								grid w-full grid-cols-[50px_3rem_5rem_6rem_5rem_5rem_5rem] border-b border-border
								h-12 items-center text-sm
								${selectedRows.includes(donasi.id) ? 'bg-muted/50' : ''}
								hover:bg-muted/30 transition-colors text-left
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
							<div className="text-center text-xs tracking-widest text-muted-foreground">#{index + 1}</div>
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
							<div className="text-muted-foreground">{donasi.tanggal}</div>
							<div className="text-center">
								<StatusBadge status={donasi.status}>
									{donasi.status === 'success' && 'Terkonfirmasi'}
									{donasi.status === 'warning' && 'Pending'}
									{donasi.status === 'danger' && 'Ditolak'}
								</StatusBadge>
							</div>
							<div className="text-center">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={(e) => {
										e.stopPropagation();
										setSelectedDonasi(donasi);
										setShowDetailDrawer(true);
									}}
								>
									<MoreHorizontal className="w-4 h-4" />
								</Button>
							</div>
						</button>
					))}
				</div>

				{/* Table Footer */}
				<div className="grid grid-cols-[50px_3rem_5rem_6rem_5rem_5rem_5rem] bg-muted/30 h-12 items-center text-xs font-medium text-muted-foreground border-t border-border">
					<div className="col-span-2 flex items-center gap-2 pl-3">
						<Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-foreground" disabled={selectedRows.length === 0}>
							<Check className="w-4 h-4" />
							<span className="ml-2">Konfirmasi Terpilih ({selectedRows.length})</span>
						</Button>
						<Button
							onClick={handleExport}
							variant="ghost"
							className="h-auto p-0 text-muted-foreground hover:text-foreground"
						>
							<ExternalLink className="w-4 h-4" />
							Export
						</Button>
					</div>
					<div className="flex items-center gap-2 justify-between text-center">
						<button
							onClick={() => {
								setFilter('Semua');
								setSortField('tanggal');
								setSortDirection('desc');
							}}
							className="text-muted-foreground hover:text-foreground transition-colors"
						>
							Previous
						</button>
						<span className="font-mono text-muted-foreground">
							{Math.min(Math.ceil(filteredData.length / 20), filteredData.length)} of {filteredData.length}
						</span>
						<button className="text-muted-foreground hover:text-foreground transition-colors">
							Next →
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
					<button
						onClick={() => setShowDetailDrawer(false)}
						className="absolute inset-0 bg-background/80"
						type="button"
						aria-label="Tutup detail donasi"
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
								<Button type="button" variant="ghost" size="icon" onClick={() => setShowDetailDrawer(false)} aria-label="Tutup detail donasi">
									<X className="w-5 h-5" />
								</Button>
							</div>
						</div>

						{/* Donatur Info */}
						<div className="space-y-4 p-6">
							<div className="flex items-start gap-4">
								<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
									<div className="text-2xl font-semibold text-muted-foreground">AF</div>
								</div>
								<div>
									<div className="text-sm text-muted-foreground">Nama</div>
									<div className="text-lg font-semibold text-foreground">{selectedDonasi.nama}</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-muted-foreground">No. HP</div>
									<div className="text-foreground">0812-3456-7890</div>
								</div>
								<div>
									<div className="text-muted-foreground">Email</div>
									<div className="text-foreground truncate">ahmad.fauzi@email.com</div>
								</div>
							</div>
						</div>

						{/* Bukti Transfer */}
						<div className="p-6 bg-muted/30">
							<div className="text-sm text-muted-foreground mb-2">Bukti Transfer</div>
							<div className="w-full aspect-video bg-muted/50 rounded flex items-center justify-center">
								<FileText className="w-12 h-12 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">Upload bukti transfer</span>
							</div>
						</div>

						{/* Catatan Field */}
						<div className="p-6">
							<label htmlFor="catatan-donasi" className="block text-sm text-muted-foreground mb-2">Catatan (Opsional)</label>
							<textarea
								id="catatan-donasi"
								placeholder="Tambahkan catatan untuk donasi ini..."
								className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none resize-none h-24"
							/>
						</div>

						{/* Actions */}
						<div className="flex gap-3 p-6 border-t border-border">
							<Button className="flex-1" variant="destructive">
								Ditolak
							</Button>
							<Button className="flex-1">
								Konfirmasi
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
