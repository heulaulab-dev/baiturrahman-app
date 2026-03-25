'use client';

import { useState } from 'react';
import { Search, Filter, UserPlus, Edit2, Trash2, MoreHorizontal, CheckCircle2, Clock, X } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const membersData = [
	{ id: '1', nama: 'H. Ahmad Hamidin, M.Q.', nik: '3201xxxxxxxxxxxx', status: 'aktif', bergabung: '2020-01-15', foto: null, muallaf: false },
	{ id: '2', nama: 'Ust. Ahmad Faishal, Lc.', nik: '3201xxxxxxxxxxxx', status: 'aktif', bergabung: '2019-05-22', foto: null, muallaf: false },
	{ id: '3', nama: 'Ust. Zainuddin Al-Hafidz', nik: '3201xxxxxxxxxxxx', status: 'aktif', bergabung: '2021-03-10', foto: null, muallaf: true },
	{ id: '4', nama: 'Ust. Yusuf Al-Amin', nik: '3201xxxxxxxxxxxx', status: 'aktif', bergabung: '2018-08-05', foto: null, muallaf: false },
	{ id: '5', nama: 'Fatimah Az-Zahra', nik: '3201xxxxxxxxxxxx', status: 'aktif', bergabung: '2017-11-12', foto: null, muallaf: false },
	{ id: '6', nama: 'Hendra Gunawan', nik: '3201xxxxxxxxxxxx', status: 'muallaf', bergabung: '2019-09-18', foto: null, muallaf: true },
	{ id: '7', nama: 'Yusuf Al-Amin', nik: '3201xxxxxxxxxxxx', status: 'muallaf', bergabung: '2020-03-01', foto: null, muallaf: true },
	{ id: '8', nama: 'Budi Santoso', nik: '3201xxxxxxxxxxxx', status: 'tidak-aktif', bergabung: '2018-06-25', foto: null, muallaf: false },
];

const filterOptions = ['Semua', 'Aktif', 'Tidak Aktif', 'Muallaf'];

export default function JamaahPage() {
	const [filter, setFilter] = useState('Semua');
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
	const [selectedMember, setSelectedMember] = useState<typeof membersData[0] | null>(null);
	const [showDetailDrawer, setShowDetailDrawer] = useState(false);

	const filteredData = membersData.filter((member) => {
		if (filter === 'Semua') return true;
		if (filter === 'Aktif') return member.status === 'aktif';
		if (filter === 'Tidak Aktif') return member.status === 'tidak-aktif';
		if (filter === 'Muallaf') return member.muallaf === true;
		return false;
	}).filter((member) => {
		if (searchQuery) {
			return member.nama.toLowerCase().includes(searchQuery.toLowerCase()) || member.nik.includes(searchQuery);
		}
		return true;
	});

	const aktifCount = membersData.filter(m => m.status === 'aktif').length;
	const muallafCount = membersData.filter(m => m.muallaf === true).length;

	function getInitials(nama: string) {
		return nama.split(' ').slice(0, 2).map(n => n[0]).join('');
	}

	function getStatusBadge(status: string) {
		if (status === 'aktif') return <StatusBadge status="success">Aktif</StatusBadge>;
		if (status === 'tidak-aktif') return <StatusBadge status="danger">Tidak Aktif</StatusBadge>;
		return <StatusBadge status="warning">Muallaf</StatusBadge>;
	}

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Struktur Anggota Jamaah</h2>
				<button className="py-2.5 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90 flex items-center gap-2">
					<UserPlus className="w-4 h-4" />
					Tambah Anggota
				</button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative">
					<Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
					<input
						type="text"
						placeholder="Cari anggota..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 pr-4 py-2 bg-background border border-border text-foreground rounded-md outline-none w-64"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 text-muted" />
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="py-2 px-4 bg-background border border-border text-foreground rounded-md outline-none"
					>
						{filterOptions.map(opt => (
							<option key={opt} value={opt}>{opt}</option>
						))}
					</select>
				</div>
				<div className="flex items-center gap-2 p-2 border border-border bg-muted/30 rounded-md">
					<div className="text-xs text-muted">Aktif:</div>
					<div className="text-xl font-semibold text-foreground">{aktifCount}</div>
				</div>
				<div className="flex items-center gap-2 p-2 border border-border bg-muted/30 rounded-md">
					<div className="text-xs text-muted">Muallaf:</div>
					<div className="text-xl font-semibold text-foreground">{muallafCount}</div>
				</div>
				<div className="flex items-center gap-1 border border-border rounded-md p-1 ml-auto">
					<button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-md transition-colors text-sm ${viewMode === 'table' ? 'bg-muted/50' : ''}`}>Table</button>
					<button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-md transition-colors text-sm ${viewMode === 'grid' ? 'bg-muted/50' : ''}`}>Grid</button>
				</div>
			</div>

			{/* Table View */}
			{viewMode === 'table' && (
				<div className="border border-border bg-background rounded-md overflow-hidden">
					<div className="grid grid-cols-[40px_48px_1fr_120px_100px_80px] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted uppercase">
						<div><input type="checkbox" className="w-4 h-4 border-border rounded" /></div>
						<div>Foto</div>
						<div>Nama Lengkap</div>
						<div>Status</div>
						<div>Bergabung</div>
						<div className="text-center">Aksi</div>
					</div>
					{filteredData.map((member) => (
						<div
							key={member.id}
							onClick={() => { setSelectedMember(member); setShowDetailDrawer(true); }}
							className="grid grid-cols-[40px_48px_1fr_120px_100px_80px] border-t border-border h-14 items-center px-4 text-sm hover:bg-muted/30 transition-colors cursor-pointer"
						>
							<div><input type="checkbox" className="w-4 h-4 border-border rounded" onClick={(e) => e.stopPropagation()} /></div>
							<div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-xs font-semibold text-muted">
								{getInitials(member.nama)}
							</div>
							<div className="min-w-0">
								<div className="text-foreground font-medium truncate">{member.nama}</div>
							</div>
							<div>{getStatusBadge(member.status)}</div>
							<div className="text-muted text-xs">{member.bergabung}</div>
							<div className="text-center">
								<button onClick={(e) => e.stopPropagation()} className="p-1.5 text-muted hover:text-foreground transition-colors">
									<MoreHorizontal className="w-4 h-4" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Grid View */}
			{viewMode === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredData.map((member) => (
						<div
							key={member.id}
							onClick={() => { setSelectedMember(member); setShowDetailDrawer(true); }}
							className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg overflow-hidden cursor-pointer"
						>
							<div className="p-4 flex items-start gap-3">
								<div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center shrink-0 text-lg font-semibold text-muted">
									{getInitials(member.nama)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-foreground font-semibold truncate">{member.nama}</div>
									<div className="text-xs text-muted mt-1">{member.bergabung}</div>
									<div className="mt-2">{getStatusBadge(member.status)}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Detail Drawer */}
			{showDetailDrawer && selectedMember && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div onClick={() => setShowDetailDrawer(false)} className="absolute inset-0 bg-background/80" />
					<div className="absolute right-0 top-0 bottom-0 w-[480px] bg-background border-l border-border shadow-xl overflow-y-auto">
						<div className="p-6 border-b border-border flex items-center justify-between">
							<h3 className="text-lg font-semibold text-foreground">Detail Anggota</h3>
							<button onClick={() => setShowDetailDrawer(false)} className="text-muted hover:text-foreground">
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-6">
							<div className="flex items-start gap-4">
								<div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center shrink-0 text-3xl font-semibold text-muted">
									{getInitials(selectedMember.nama)}
								</div>
								<div>
									<div className="text-xl font-semibold text-foreground">{selectedMember.nama}</div>
									<div className="mt-2">{getStatusBadge(selectedMember.status)}</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-muted">Bergabung</div>
									<div className="text-foreground">{selectedMember.bergabung}</div>
								</div>
								<div>
									<div className="text-muted">Muallaf</div>
									<div className="text-foreground">{selectedMember.muallaf ? 'Ya' : 'Tidak'}</div>
								</div>
							</div>
						</div>
						<div className="flex gap-3 p-6 border-t border-border">
							<button className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">Simpan</button>
							<button onClick={() => setShowDetailDrawer(false)} className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">Tutup</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
