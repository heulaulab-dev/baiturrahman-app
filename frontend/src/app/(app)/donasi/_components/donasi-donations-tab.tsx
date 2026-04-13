'use client';

import { useEffect, useState, useImperativeHandle, forwardRef, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ArrowUp, ArrowDown, Search, ExternalLink, MoreHorizontal, Check, Trash2, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '@/components/ui/input-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useAdminDonations, useAdminPaymentMethods } from '@/services/adminHooks';
import { exportAdminDonationsXlsx } from '@/services/adminApiService';
import type { DonationFull } from '@/types';

export interface DonasiDonationsTabProps {
	/** Parent increments when user leaves the Donasi tab (Task 3). Until then pass 0 from page. */
	selectionResetKey: number;
}

export type DonasiDonationsTabHandle = {
	exportXlsx: () => Promise<void>;
};

const categories = ['Semua', 'Donasi Umum', 'Zakat', 'Wakaf', 'Infaq Jumat', 'Fidyah', 'Zakat Fitrah'];
const pageSize = 20;

const backendCategoryMap: Record<string, string | undefined> = {
	Semua: undefined,
	'Donasi Umum': 'sedekah',
	Zakat: 'zakat',
	Wakaf: 'wakaf',
	'Infaq Jumat': 'infaq',
	Fidyah: 'operasional',
	'Zakat Fitrah': 'zakat',
};

function getCategoryLabel(category: string) {
	const map: Record<string, string> = {
		infaq: 'Infaq Jumat',
		sedekah: 'Donasi Umum',
		zakat: 'Zakat',
		wakaf: 'Wakaf',
		operasional: 'Operasional',
	};
	return map[category] ?? category;
}

function getStatusBadge(status: DonationFull['status']) {
	if (status === 'confirmed') return { tone: 'success' as const, label: 'Terkonfirmasi' };
	if (status === 'cancelled') return { tone: 'danger' as const, label: 'Ditolak' };
	return { tone: 'warning' as const, label: 'Pending' };
}

function getInitials(nama: string) {
	const parts = nama.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	return parts
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase() ?? '')
		.join('');
}

const DonasiDonationsTab = forwardRef<DonasiDonationsTabHandle, DonasiDonationsTabProps>(function DonasiDonationsTab(
	{ selectionResetKey },
	ref
) {
	const [filter, setFilter] = useState('Semua');
	const [searchQuery, setSearchQuery] = useState('');
	const [sortField, setSortField] = useState<'tanggal' | 'nominal'>('tanggal');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [detailOpen, setDetailOpen] = useState(false);
	const [selectedDonasi, setSelectedDonasi] = useState<DonationFull | null>(null);
	const [page, setPage] = useState(1);

	const { data: paymentMethods = [] } = useAdminPaymentMethods();

	const { data: donationsData, isLoading: donationsLoading } = useAdminDonations({
		limit: pageSize,
		page,
		category: backendCategoryMap[filter],
		donor_name: searchQuery.trim() || undefined,
	});

	const currentDate = new Date();
	const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
	const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
	const { data: monthDonationsData } = useAdminDonations({
		limit: 500,
		page: 1,
		from: monthStart,
		to: monthEnd,
	});

	const donations = donationsData?.data ?? [];
	const totalDonations = donationsData?.total ?? donations.length;
	const totalPages = donationsData?.total_pages ?? 1;
	const currentPage = donationsData?.page ?? page;

	const filteredData = donations
		.filter((donasi) => {
			if (filter !== 'Semua') {
				return getCategoryLabel(donasi.category).toLowerCase() === filter.toLowerCase();
			}
			return true;
		})
		.filter((donasi) => {
			if (searchQuery) {
				return donasi.donor_name.toLowerCase().includes(searchQuery.toLowerCase());
			}
			return true;
		})
		.sort((a, b) => {
			if (sortField === 'tanggal') {
				const dateA = new Date(a.created_at);
				const dateB = new Date(b.created_at);
				return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
			}
			if (sortField === 'nominal') {
				return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
			}
			return 0;
		});

	const totalPeriodePage = filteredData.reduce((sum, donasi) => sum + donasi.amount, 0);
	const rataDonasiPage = filteredData.length > 0 ? Math.floor(totalPeriodePage / filteredData.length) : 0;
	const monthlyDonorSet = new Set((monthDonationsData?.data ?? []).map((donation) => donation.donor_name.toLowerCase()));
	const newDonorsThisMonth = monthlyDonorSet.size;

	const handleSort = (field: typeof sortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('desc');
		}
	};

	const toggleRowSelection = (id: string) => {
		setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
	};

	useEffect(() => {
		setPage(1);
		setSelectedRows([]);
	}, [filter, searchQuery]);

	useEffect(() => {
		setSelectedRows([]);
		setDetailOpen(false);
		setSelectedDonasi(null);
	}, [selectionResetKey]);

	useImperativeHandle(
		ref,
		() => ({
			exportXlsx: async () => {
				try {
					await exportAdminDonationsXlsx({
						category: backendCategoryMap[filter],
						donor_name: searchQuery.trim() || undefined,
					});
					toast.success('Berkas Excel berhasil diunduh');
				} catch (e) {
					toast.error(e instanceof Error ? e.message : 'Gagal mengekspor Excel');
					throw e;
				}
			},
		}),
		[filter, searchQuery]
	);

	function paymentMethodLabel(d: DonationFull) {
		return paymentMethods.find((pm) => pm.id === d.payment_method_id)?.name ?? d.payment_method?.name ?? '—';
	}

	let donationRowsContent: ReactNode;
	if (donationsLoading) {
		donationRowsContent = (
			<TableRow>
				<TableCell colSpan={9} className="py-6 text-center text-sm text-muted-foreground">
					Memuat data donasi...
				</TableCell>
			</TableRow>
		);
	} else if (filteredData.length === 0) {
		donationRowsContent = (
			<TableRow>
				<TableCell colSpan={9} className="py-6 text-center text-sm text-muted-foreground">
					Belum ada data donasi.
				</TableCell>
			</TableRow>
		);
	} else {
		donationRowsContent = filteredData.map((donasi, index) => (
			<TableRow key={donasi.id} className={selectedRows.includes(donasi.id) ? 'bg-muted/40' : ''}>
				<TableCell>
					<Checkbox
						checked={selectedRows.includes(donasi.id)}
						onCheckedChange={() => toggleRowSelection(donasi.id)}
						aria-label={`Pilih donasi ${donasi.donor_name}`}
					/>
				</TableCell>
				<TableCell className="text-xs text-muted-foreground">#{(currentPage - 1) * pageSize + index + 1}</TableCell>
				<TableCell className="font-medium">{donasi.donor_name}</TableCell>
				<TableCell>{getCategoryLabel(donasi.category)}</TableCell>
				<TableCell className="text-right font-mono">Rp {donasi.amount.toLocaleString('id-ID')}</TableCell>
				<TableCell>{paymentMethodLabel(donasi)}</TableCell>
				<TableCell>{new Date(donasi.created_at).toLocaleDateString('id-ID')}</TableCell>
				<TableCell>
					<StatusBadge status={getStatusBadge(donasi.status).tone}>{getStatusBadge(donasi.status).label}</StatusBadge>
				</TableCell>
				<TableCell className="text-right">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => {
							setSelectedDonasi(donasi);
							setDetailOpen(true);
						}}
						aria-label={`Lihat detail donasi ${donasi.donor_name}`}
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</TableCell>
			</TableRow>
		));
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="flex flex-wrap items-center gap-3 pt-6">
					<InputGroup className="w-full sm:w-64">
						<InputGroupAddon>
							<InputGroupText>
								<Search aria-hidden className="text-muted-foreground" />
							</InputGroupText>
						</InputGroupAddon>
						<InputGroupInput
							type="search"
							placeholder="Cari donatur..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							aria-label="Cari donatur"
						/>
					</InputGroup>
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
						<Select value={filter} onValueChange={setFilter}>
							<SelectTrigger className="w-48" aria-label="Filter kategori donasi">
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
					<div className="flex flex-wrap gap-2">
						<Button type="button" variant={sortField === 'tanggal' ? 'secondary' : 'ghost'} onClick={() => handleSort('tanggal')}>
							Tanggal
							{sortField === 'tanggal' && (
								<span className="ml-2 text-muted-foreground">
									{sortDirection === 'asc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
								</span>
							)}
						</Button>
						<Button type="button" variant={sortField === 'nominal' ? 'secondary' : 'ghost'} onClick={() => handleSort('nominal')}>
							Nominal
							{sortField === 'nominal' && (
								<span className="ml-2 text-muted-foreground">
									{sortDirection === 'asc' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
								</span>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total nominal</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-1 font-mono text-2xl text-foreground">Rp {totalPeriodePage.toLocaleString('id-ID')}</div>
						<p className="text-sm text-muted-foreground">Berdasarkan filter dan halaman ini</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total transaksi</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-1 font-mono text-2xl text-foreground">{totalDonations.toLocaleString('id-ID')}</div>
						<p className="text-sm text-muted-foreground">Total sesuai filter (server)</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium uppercase text-muted-foreground">Rata-rata</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-1 font-mono text-2xl text-foreground">Rp {rataDonasiPage.toLocaleString('id-ID')}</div>
						<p className="text-sm text-muted-foreground">Berdasarkan filter dan halaman ini</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium uppercase text-muted-foreground">Donatur baru</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-1 font-mono text-2xl text-foreground">{newDonorsThisMonth}</div>
						<p className="text-sm text-muted-foreground">bulan ini</p>
					</CardContent>
				</Card>
			</div>

			<Card className="overflow-hidden p-0 shadow-sm">
				<CardHeader className="border-b border-border bg-muted/30 px-6 py-4">
					<CardTitle className="text-base">Daftar donasi</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto p-0">
					<Table>
						<TableHeader className="bg-muted/30">
							<TableRow>
								<TableHead className="w-10">
									<Checkbox
										checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
										onCheckedChange={(checked) => {
											if (checked) {
												setSelectedRows(filteredData.map((d) => d.id));
												return;
											}
											setSelectedRows([]);
										}}
										aria-label="Pilih semua donasi"
									/>
								</TableHead>
								<TableHead>#</TableHead>
								<TableHead>Nama Donatur</TableHead>
								<TableHead>Jenis</TableHead>
								<TableHead className="text-right">Nominal</TableHead>
								<TableHead>Metode</TableHead>
								<TableHead>Tanggal</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>{donationRowsContent}</TableBody>
					</Table>
				</CardContent>
				<div className="flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
					<div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-md">
						<div className="flex flex-wrap items-center gap-2">
							<Button type="button" variant="ghost" className="h-auto gap-2 p-0 text-muted-foreground hover:text-foreground" disabled>
								<Check className="h-4 w-4 shrink-0" />
								<span>Konfirmasi Terpilih ({selectedRows.length})</span>
							</Button>
							<Button type="button" variant="ghost" className="h-auto gap-2 p-0 text-destructive hover:text-destructive" disabled>
								<Trash2 className="h-4 w-4 shrink-0" />
								Hapus
							</Button>
						</div>
						<p className="text-xs text-muted-foreground">Aksi massal memerlukan integrasi API (segera hadir).</p>
					</div>
					<div className="flex items-center gap-3">
						<Button type="button" variant="ghost" size="sm" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage <= 1}>
							Sebelumnya
						</Button>
						<span className="font-mono">
							{currentPage} / {totalPages}
						</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
							disabled={currentPage >= totalPages}
						>
							Berikutnya
						</Button>
					</div>
				</div>
			</Card>

			<Sheet
				open={detailOpen && !!selectedDonasi}
				onOpenChange={(open) => {
					setDetailOpen(open);
					if (!open) setSelectedDonasi(null);
				}}
			>
				<SheetContent side="right" className="flex w-[480px] flex-col overflow-y-auto sm:max-w-[480px]">
					<SheetHeader>
						<SheetTitle>Detail Donasi</SheetTitle>
					</SheetHeader>
					{selectedDonasi && (
						<>
							<div className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-2">
								<div className="flex items-start gap-4">
									<Avatar className="h-20 w-20 shrink-0">
										<AvatarFallback className="text-3xl font-semibold">{getInitials(selectedDonasi.donor_name)}</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<Label className="text-muted-foreground">Nama</Label>
										<p className="text-lg font-semibold text-foreground">{selectedDonasi.donor_name}</p>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">No. HP</Label>
										<p className="text-foreground">
											{selectedDonasi.donor_phone?.trim() ? selectedDonasi.donor_phone : <span className="text-muted-foreground">Tidak ada data</span>}
										</p>
									</div>
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Email</Label>
										<p className="truncate text-foreground">
											{selectedDonasi.donor_email?.trim() ? (
												selectedDonasi.donor_email
											) : (
												<span className="text-muted-foreground">Tidak ada data</span>
											)}
										</p>
									</div>
								</div>
								<Separator />
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Nominal</Label>
										<p className="font-mono font-medium text-foreground">Rp {selectedDonasi.amount.toLocaleString('id-ID')}</p>
									</div>
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Kategori</Label>
										<p className="text-foreground">{getCategoryLabel(selectedDonasi.category)}</p>
									</div>
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Metode</Label>
										<p className="text-foreground">{paymentMethodLabel(selectedDonasi)}</p>
									</div>
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Tanggal</Label>
										<p className="text-foreground">{new Date(selectedDonasi.created_at).toLocaleString('id-ID')}</p>
									</div>
									<div className="col-span-2 space-y-1.5">
										<Label className="text-muted-foreground">Status</Label>
										<div>
											<StatusBadge status={getStatusBadge(selectedDonasi.status).tone}>{getStatusBadge(selectedDonasi.status).label}</StatusBadge>
										</div>
									</div>
								</div>
								<Separator />
								<div className="space-y-2">
									<Label className="text-muted-foreground">Catatan</Label>
									{selectedDonasi.notes?.trim() ? (
										<p className="whitespace-pre-wrap text-sm text-foreground">{selectedDonasi.notes}</p>
									) : (
										<p className="text-sm text-muted-foreground">Tidak ada catatan</p>
									)}
								</div>
								<div className="space-y-2">
									<Label className="text-muted-foreground">Bukti</Label>
									{selectedDonasi.proof_url ? (
										<div className="space-y-2">
											<img src={selectedDonasi.proof_url} alt="Bukti transfer" className="max-h-48 w-full rounded-md border border-border object-contain" />
											<a
												href={selectedDonasi.proof_url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
											>
												<ExternalLink className="h-4 w-4" aria-hidden />
												Buka di tab baru
											</a>
										</div>
									) : (
										<p className="text-sm text-muted-foreground">Belum ada bukti</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="catatan-donasi-admin" className="text-muted-foreground">
										Catatan admin
									</Label>
									<Textarea
										id="catatan-donasi-admin"
										disabled
										placeholder="Konfirmasi dan catatan admin akan tersedia setelah integrasi API."
										className="min-h-[96px] resize-none"
									/>
								</div>
							</div>
							<SheetFooter className="mt-auto flex flex-col gap-3 border-t border-border p-6 sm:justify-start">
								<p className="text-xs text-muted-foreground">Konfirmasi dari panel admin akan tersedia setelah integrasi API.</p>
								<div className="flex w-full flex-row gap-3">
									<Button type="button" variant="destructive" className="flex-1" disabled>
										Ditolak
									</Button>
									<Button type="button" className="flex-1" disabled>
										Konfirmasi
									</Button>
								</div>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
});

DonasiDonationsTab.displayName = 'DonasiDonationsTab';

export default DonasiDonationsTab;
