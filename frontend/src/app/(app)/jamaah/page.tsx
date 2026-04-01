'use client';

import { useState } from 'react';
import { Search, Filter, UserPlus, MoreHorizontal } from 'lucide-react';
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
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { useAdminUsers } from '@/services/adminHooks';

const filterOptions = ['Semua', 'Aktif', 'Tidak Aktif', 'Muallaf'];

function getInitials(nama: string) {
	return nama.split(' ').slice(0, 2).map((n) => n[0]).join('');
}

export default function JamaahPage() {
	const { data: usersResponse } = useAdminUsers();
	const membersData = (usersResponse?.data ?? []).map((user) => ({
		id: user.id,
		nama: user.full_name,
		nik: user.username,
		status: user.is_active ? 'aktif' : 'tidak-aktif',
		bergabung: new Date(user.created_at).toLocaleDateString('id-ID'),
		foto: user.avatar_url ?? null,
		muallaf: false,
	}));

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
				<Button className="gap-2">
					<UserPlus className="w-4 h-4" />
					Tambah Anggota
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative">
					<Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
					<Input
						type="text"
						placeholder="Cari anggota..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-64 pl-10"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 text-muted-foreground" />
					<Select value={filter} onValueChange={setFilter}>
						<SelectTrigger className="w-44">
							<SelectValue placeholder="Filter status" />
						</SelectTrigger>
						<SelectContent>
							{filterOptions.map((opt) => (
								<SelectItem key={opt} value={opt}>
									{opt}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2 p-2 border border-border bg-muted/30 rounded-md">
					<div className="text-xs text-muted-foreground">Aktif:</div>
					<div className="text-xl font-semibold text-foreground">{aktifCount}</div>
				</div>
				<div className="flex items-center gap-2 p-2 border border-border bg-muted/30 rounded-md">
					<div className="text-xs text-muted-foreground">Muallaf:</div>
					<div className="text-xl font-semibold text-foreground">{muallafCount}</div>
				</div>
				<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')} className="ml-auto">
					<TabsList>
						<TabsTrigger value="table">Table</TabsTrigger>
						<TabsTrigger value="grid">Grid</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Table View */}
			{viewMode === 'table' && (
				<div className="border border-border bg-background rounded-md overflow-hidden">
					<div className="grid grid-cols-[40px_48px_1fr_120px_100px_80px] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
						<div><input type="checkbox" className="w-4 h-4 border-border rounded" /></div>
						<div>Foto</div>
						<div>Nama Lengkap</div>
						<div>Status</div>
						<div>Bergabung</div>
						<div className="text-center">Aksi</div>
					</div>
					{filteredData.map((member) => (
						<button
							key={member.id}
							onClick={() => { setSelectedMember(member); setShowDetailDrawer(true); }}
							className="grid w-full grid-cols-[40px_48px_1fr_120px_100px_80px] border-t border-border h-14 items-center px-4 text-left text-sm hover:bg-muted/30 transition-colors"
						>
							<div><input type="checkbox" className="w-4 h-4 border-border rounded" onClick={(e) => e.stopPropagation()} /></div>
							<div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center text-xs font-semibold text-muted-foreground">
								{getInitials(member.nama)}
							</div>
							<div className="min-w-0">
								<div className="text-foreground font-medium truncate">{member.nama}</div>
							</div>
							<div>{getStatusBadge(member.status)}</div>
							<div className="text-muted-foreground text-xs">{member.bergabung}</div>
							<div className="text-center">
								<button onClick={(e) => e.stopPropagation()} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
									<MoreHorizontal className="w-4 h-4" />
								</button>
							</div>
						</button>
					))}
				</div>
			)}

			{/* Grid View */}
			{viewMode === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredData.map((member) => (
						<button
							key={member.id}
							onClick={() => { setSelectedMember(member); setShowDetailDrawer(true); }}
							className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg overflow-hidden text-left"
						>
							<div className="p-4 flex items-start gap-3">
								<div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center shrink-0 text-lg font-semibold text-muted-foreground">
									{getInitials(member.nama)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-foreground font-semibold truncate">{member.nama}</div>
									<div className="text-xs text-muted-foreground mt-1">{member.bergabung}</div>
									<div className="mt-2">{getStatusBadge(member.status)}</div>
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			{/* Detail Drawer */}
			<Sheet open={showDetailDrawer && !!selectedMember} onOpenChange={setShowDetailDrawer}>
				<SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Detail Anggota</SheetTitle>
					</SheetHeader>
					{selectedMember && (
						<>
						<div className="p-6 space-y-6">
							<div className="flex items-start gap-4">
								<div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center shrink-0 text-3xl font-semibold text-muted-foreground">
									{getInitials(selectedMember.nama)}
								</div>
								<div>
									<div className="text-xl font-semibold text-foreground">{selectedMember.nama}</div>
									<div className="mt-2">{getStatusBadge(selectedMember.status)}</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-muted-foreground">Bergabung</div>
									<div className="text-foreground">{selectedMember.bergabung}</div>
								</div>
								<div>
									<div className="text-muted-foreground">Muallaf</div>
									<div className="text-foreground">{selectedMember.muallaf ? 'Ya' : 'Tidak'}</div>
								</div>
							</div>
						</div>
						<div className="flex gap-3 border-t border-border p-6">
							<Button className="flex-1">Simpan</Button>
							<Button variant="secondary" className="flex-1" onClick={() => setShowDetailDrawer(false)}>
								Tutup
							</Button>
						</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
