'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
	CalendarRange,
	MoreHorizontal,
	Search,
	Trash2,
	Check,
	XCircle,
	Ban,
	Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminReservations } from '@/services/adminHooks';
import { useReservationAdminActions } from '@/services/reservationHooks';
import type { Reservation, ReservationStatus } from '@/types';

const statusFilterOptions: { value: string; label: string }[] = [
	{ value: 'all', label: 'Semua status' },
	{ value: 'pending', label: 'Menunggu' },
	{ value: 'approved', label: 'Disetujui' },
	{ value: 'rejected', label: 'Ditolak' },
	{ value: 'cancelled', label: 'Dibatalkan' },
];

function formatDateTimeRange(start: string, end: string) {
	const s = new Date(start);
	const e = new Date(end);
	return `${s.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} — ${e.toLocaleString('id-ID', { timeStyle: 'short' })}`;
}

function statusBadge(status: ReservationStatus) {
	switch (status) {
		case 'approved':
			return <StatusBadge status="success">Disetujui</StatusBadge>;
		case 'rejected':
			return <StatusBadge status="danger">Ditolak</StatusBadge>;
		case 'cancelled':
			return <StatusBadge status="warning">Dibatalkan</StatusBadge>;
		default:
			return <StatusBadge status="warning">Menunggu</StatusBadge>;
	}
}

function statusLabel(status: ReservationStatus) {
	const m: Record<ReservationStatus, string> = {
		pending: 'Menunggu',
		approved: 'Disetujui',
		rejected: 'Ditolak',
		cancelled: 'Dibatalkan',
	};
	return m[status];
}

export default function ReservasiPage() {
	const [page, setPage] = useState(1);
	const pageSize = 15;
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [fromDate, setFromDate] = useState<Date | undefined>();
	const [toDate, setToDate] = useState<Date | undefined>();
	const [searchQuery, setSearchQuery] = useState('');
	const [sheetOpen, setSheetOpen] = useState(false);
	const [selected, setSelected] = useState<Reservation | null>(null);
	const [adminNotesDraft, setAdminNotesDraft] = useState('');
	const [deleteTarget, setDeleteTarget] = useState<Reservation | null>(null);

	const queryParams = useMemo(() => {
		const fromStr = fromDate ? format(fromDate, 'yyyy-MM-dd') : '';
		const toStr = toDate ? format(toDate, 'yyyy-MM-dd') : '';
		return {
			page,
			limit: pageSize,
			...(statusFilter !== 'all' ? { status: statusFilter as ReservationStatus } : {}),
			...(fromStr ? { from: fromStr } : {}),
			...(toStr ? { to: toStr } : {}),
		};
	}, [page, pageSize, statusFilter, fromDate, toDate]);

	const { data: listResponse, isLoading } = useAdminReservations(queryParams);
	const { patchStatus, saveAdminNotes, removeReservation, isPending: busy } =
		useReservationAdminActions();

	const rows = listResponse?.data ?? [];
	const totalPages = listResponse?.total_pages ?? 1;
	const currentPage = listResponse?.page ?? page;
	const total = listResponse?.total ?? 0;

	const filteredRows = useMemo(() => {
		if (!searchQuery.trim()) return rows;
		const q = searchQuery.toLowerCase();
		return rows.filter(
			(r) =>
				r.requester_name.toLowerCase().includes(q) ||
				r.facility.toLowerCase().includes(q) ||
				(r.event_title?.toLowerCase().includes(q) ?? false) ||
				(r.requester_email?.toLowerCase().includes(q) ?? false)
		);
	}, [rows, searchQuery]);

	useEffect(() => {
		setPage(1);
	}, [statusFilter, fromDate, toDate]);

	useEffect(() => {
		if (selected) {
			setAdminNotesDraft(selected.admin_notes ?? '');
		}
	}, [selected]);

	function openDetail(r: Reservation) {
		setSelected(r);
		setSheetOpen(true);
	}

	async function handlePatchStatus(id: string, status: ReservationStatus) {
		const ok = await patchStatus(id, status);
		if (ok) {
			setSheetOpen(false);
			setSelected(null);
		}
	}

	async function handleSaveAdminNotes() {
		if (!selected) return;
		const ok = await saveAdminNotes(selected.id, adminNotesDraft);
		if (ok) {
			setSelected((prev) =>
				prev && prev.id === selected.id
					? { ...prev, admin_notes: adminNotesDraft.trim() || undefined }
					: prev
			);
		}
	}

	async function handleConfirmDelete() {
		if (!deleteTarget) return;
		const id = deleteTarget.id;
		const ok = await removeReservation(id);
		if (ok) {
			setDeleteTarget(null);
			if (selected?.id === id) {
				setSheetOpen(false);
				setSelected(null);
			}
		}
	}

	const emptyTableMessage =
		rows.length > 0 && searchQuery.trim()
			? 'Tidak ada baris yang cocok dengan pencarian di halaman ini.'
			: 'Tidak ada data reservasi untuk filter ini.';

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold text-foreground">Manajemen Reservasi</h1>
					<p className="text-sm text-muted-foreground">
						Kelola pengajuan pemakaian fasilitas masjid dari jamaah.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-end gap-3">
				<div className="w-full sm:w-56">
					<Label className="text-xs text-muted-foreground">Status</Label>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="mt-1" aria-label="Filter status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statusFilterOptions.map((o) => (
								<SelectItem key={o.value} value={o.value}>
									{o.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DatePicker
					id="filter-from"
					label="Dari tanggal"
					placeholder="Mulai"
					value={fromDate}
					onChange={setFromDate}
					labelClassName="text-xs text-muted-foreground"
					className="w-full sm:w-auto sm:min-w-[220px]"
					buttonClassName="min-h-9 min-w-[200px] sm:min-w-[220px]"
				/>
				<DatePicker
					id="filter-to"
					label="Sampai tanggal"
					placeholder="Akhir"
					value={toDate}
					onChange={setToDate}
					labelClassName="text-xs text-muted-foreground"
					className="w-full sm:w-auto sm:min-w-[220px]"
					buttonClassName="min-h-9 min-w-[200px] sm:min-w-[220px]"
				/>
				{(fromDate ?? toDate) ? (
					<div className="flex items-end pb-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-muted-foreground"
							onClick={() => {
								setFromDate(undefined);
								setToDate(undefined);
							}}
						>
							Hapus tanggal
						</Button>
					</div>
				) : null}
				<div className="flex min-w-[200px] flex-1 flex-col gap-1">
					<div className="flex items-center gap-2">
						<Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
						<Input
							placeholder="Cari nama, fasilitas, acara…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							aria-label="Cari reservasi"
							className="flex-1"
						/>
					</div>
					<p className="text-xs text-muted-foreground pl-6">Pencarian hanya pada baris di halaman ini.</p>
				</div>
			</div>

			<Card className="overflow-hidden p-0 shadow-sm">
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin" />
							Memuat…
						</div>
					) : filteredRows.length === 0 ? (
						<div className="py-16 text-center text-sm text-muted-foreground">{emptyTableMessage}</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/30 hover:bg-muted/30">
									<TableHead className="min-w-[200px]">Waktu</TableHead>
									<TableHead>Pemohon</TableHead>
									<TableHead>Fasilitas</TableHead>
									<TableHead className="hidden md:table-cell">Acara</TableHead>
									<TableHead className="w-[120px]">Status</TableHead>
									<TableHead className="w-[60px] text-center">Aksi</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredRows.map((r) => (
									<TableRow
										key={r.id}
										className="cursor-pointer"
										onClick={() => openDetail(r)}
									>
										<TableCell className="align-top text-sm">
											<div className="flex items-start gap-2">
												<CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
												<span className="text-foreground">{formatDateTimeRange(r.start_at, r.end_at)}</span>
											</div>
										</TableCell>
										<TableCell className="align-top">
											<div className="font-medium text-foreground">{r.requester_name}</div>
											<div className="text-xs text-muted-foreground">
												{r.requester_phone ?? r.requester_email ?? '—'}
											</div>
										</TableCell>
										<TableCell className="align-top capitalize">{r.facility}</TableCell>
										<TableCell className="hidden align-top text-muted-foreground md:table-cell">
											{r.event_title ?? '—'}
										</TableCell>
										<TableCell className="align-top">{statusBadge(r.status)}</TableCell>
										<TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Menu aksi">
														<MoreHorizontal className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem onSelect={() => openDetail(r)}>Detail</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onSelect={() => setDeleteTarget(r)}
													>
														<Trash2 className="mr-2 h-4 w-4" />
														Hapus
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
				<span>
					Total {total} entri
					{searchQuery.trim() ? ` · ${filteredRows.length} cocok pencarian` : ''}
				</span>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={currentPage <= 1 || isLoading}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						Sebelumnya
					</Button>
					<span className="font-mono tabular-nums">
						{currentPage} / {totalPages || 1}
					</span>
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={currentPage >= totalPages || isLoading}
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
					>
						Selanjutnya
					</Button>
				</div>
			</div>

			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
					<SheetHeader>
						<SheetTitle>Detail reservasi</SheetTitle>
					</SheetHeader>
					{selected && (
						<>
							<div className="flex flex-1 flex-col gap-4 px-4 pb-4">
								<div className="flex flex-wrap items-center gap-2">
									{statusBadge(selected.status)}
									<span className="text-xs text-muted-foreground">{statusLabel(selected.status)}</span>
								</div>
								<div className="space-y-1 text-sm">
									<Label className="text-muted-foreground">Jadwal</Label>
									<p className="text-foreground">{formatDateTimeRange(selected.start_at, selected.end_at)}</p>
								</div>
								<div className="grid gap-3 sm:grid-cols-2">
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Pemohon</Label>
										<p className="font-medium text-foreground">{selected.requester_name}</p>
									</div>
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Fasilitas</Label>
										<p className="capitalize text-foreground">{selected.facility}</p>
									</div>
								</div>
								{(selected.requester_phone || selected.requester_email) && (
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Kontak</Label>
										<p className="text-foreground">
											{[selected.requester_phone, selected.requester_email].filter(Boolean).join(' · ')}
										</p>
									</div>
								)}
								{selected.event_title && (
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Judul acara</Label>
										<p className="text-foreground">{selected.event_title}</p>
									</div>
								)}
								{selected.participant_count != null && (
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Perkiraan peserta</Label>
										<p className="text-foreground">{selected.participant_count}</p>
									</div>
								)}
								{selected.notes && (
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Catatan pemohon</Label>
										<p className="whitespace-pre-wrap text-foreground">{selected.notes}</p>
									</div>
								)}
								{selected.reviewer && (
									<div className="space-y-1 text-sm">
										<Label className="text-muted-foreground">Ditinjau oleh</Label>
										<p className="text-foreground">{selected.reviewer.full_name}</p>
										{selected.reviewed_at && (
											<p className="text-xs text-muted-foreground">
												{new Date(selected.reviewed_at).toLocaleString('id-ID')}
											</p>
										)}
									</div>
								)}
								<div className="space-y-2">
									<Label htmlFor="admin-notes">Catatan admin</Label>
									<Textarea
										id="admin-notes"
										rows={4}
										value={adminNotesDraft}
										onChange={(e) => setAdminNotesDraft(e.target.value)}
										placeholder="Internal — tidak tampil ke pemohon"
									/>
								</div>
							</div>
							<SheetFooter className="mt-auto flex-col gap-3 border-t border-border p-4 sm:flex-col">
								<div className="flex w-full flex-wrap gap-2">
									{selected.status === 'pending' && (
										<>
											<Button
												type="button"
												className="flex-1"
												disabled={busy}
												onClick={() => void handlePatchStatus(selected.id, 'approved')}
											>
												<Check className="mr-2 h-4 w-4" />
												Setujui
											</Button>
											<Button
												type="button"
												variant="destructive"
												className="flex-1"
												disabled={busy}
												onClick={() => void handlePatchStatus(selected.id, 'rejected')}
											>
												<XCircle className="mr-2 h-4 w-4" />
												Tolak
											</Button>
											<Button
												type="button"
												variant="secondary"
												className="flex-1"
												disabled={busy}
												onClick={() => void handlePatchStatus(selected.id, 'cancelled')}
											>
												<Ban className="mr-2 h-4 w-4" />
												Batalkan
											</Button>
										</>
									)}
									{selected.status === 'approved' && (
										<Button
											type="button"
											variant="secondary"
											className="w-full"
											disabled={busy}
											onClick={() => void handlePatchStatus(selected.id, 'cancelled')}
										>
											<Ban className="mr-2 h-4 w-4" />
											Batalkan reservasi
										</Button>
									)}
								</div>
								<Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => void handleSaveAdminNotes()}>
									Simpan catatan admin
								</Button>
								<Button type="button" variant="ghost" className="w-full" onClick={() => setSheetOpen(false)}>
									Tutup
								</Button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>

			<AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Hapus reservasi?</AlertDialogTitle>
						<AlertDialogDescription>
							Data tidak dapat dikembalikan. Hapus hanya jika pengajuan tidak diperlukan lagi.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={(e) => {
								e.preventDefault();
								void handleConfirmDelete();
							}}
							disabled={busy}
						>
							Hapus
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
