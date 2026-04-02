'use client';

import { useState } from 'react';
import { Search, Filter, UserPlus, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from '@/components/ui/tabs';
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

	function openMemberDetail(member: typeof membersData[0]) {
		setSelectedMember(member);
		setShowDetailDrawer(true);
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Struktur Anggota Jamaah</h2>
				<Button className="gap-2">
					<UserPlus className="w-4 h-4" />
					Tambah Anggota
				</Button>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<InputGroup className="w-full sm:w-64">
					<InputGroupAddon>
						<InputGroupText>
							<Search aria-hidden className="text-muted-foreground" />
						</InputGroupText>
					</InputGroupAddon>
					<InputGroupInput
						type="search"
						placeholder="Cari anggota..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						aria-label="Cari anggota"
					/>
				</InputGroup>
				<div className="flex items-center gap-2">
					<Filter className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
					<Select value={filter} onValueChange={setFilter}>
						<SelectTrigger className="w-44" aria-label="Filter status">
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
				<Card className="py-2 shadow-sm">
					<CardContent className="flex items-center gap-2 px-3 py-0">
						<span className="text-xs text-muted-foreground">Aktif:</span>
						<span className="text-xs font-semibold text-foreground tabular-nums">{aktifCount}</span>
					</CardContent>
				</Card>
				<Card className="py-2 shadow-sm">
					<CardContent className="flex items-center gap-2 px-3 py-0">
						<span className="text-xs text-muted-foreground">Muallaf:</span>
						<span className="text-xs font-semibold text-foreground tabular-nums">{muallafCount} </span>
					</CardContent>
				</Card>
				<Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')} className="ml-auto">
					<TabsList>
						<TabsTrigger value="table">Table</TabsTrigger>
						<TabsTrigger value="grid">Grid</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{viewMode === 'table' && (
				<Card className="overflow-hidden p-0 shadow-sm">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/30 hover:bg-muted/30">
								<TableHead className="w-10 pl-4">
									<Checkbox aria-label="Pilih semua baris" />
								</TableHead>
								<TableHead className="w-14">Foto</TableHead>
								<TableHead>Nama Lengkap</TableHead>
								<TableHead className="w-[120px]">Status</TableHead>
								<TableHead className="w-[100px]">Bergabung</TableHead>
								<TableHead className="w-[80px] text-center">Aksi</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredData.map((member) => (
								<TableRow
									key={member.id}
									tabIndex={0}
									className="cursor-pointer"
									onClick={() => openMemberDetail(member)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											openMemberDetail(member);
										}
									}}
								>
									<TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
										<Checkbox aria-label={`Pilih ${member.nama}`} />
									</TableCell>
									<TableCell>
										<Avatar className="h-9 w-9">
											{member.foto ? (
												<AvatarImage src={member.foto} alt="" />
											) : null}
											<AvatarFallback className="text-xs font-semibold">
												{getInitials(member.nama)}
											</AvatarFallback>
										</Avatar>
									</TableCell>
									<TableCell className="font-medium">
										<span className="line-clamp-1">{member.nama}</span>
									</TableCell>
									<TableCell>{getStatusBadge(member.status)}</TableCell>
									<TableCell className="text-muted-foreground text-xs">{member.bergabung}</TableCell>
									<TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Aksi untuk ${member.nama}`}>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onSelect={() => {
														openMemberDetail(member);
													}}
												>
													Lihat detail
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem disabled>
													Edit anggota
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}

			{viewMode === 'grid' && (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{filteredData.map((member) => (
						<Card
							key={member.id}
							role="button"
							tabIndex={0}
							className="cursor-pointer shadow-sm transition-colors hover:bg-muted/30"
							onClick={() => openMemberDetail(member)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									openMemberDetail(member);
								}
							}}
						>
							<CardContent className="flex items-start gap-3 p-4">
								<Avatar className="h-14 w-14 shrink-0">
									{member.foto ? (
										<AvatarImage src={member.foto} alt="" />
									) : null}
									<AvatarFallback className="text-lg font-semibold">
										{getInitials(member.nama)}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<div className="truncate font-semibold text-foreground">{member.nama}</div>
									<div className="mt-1 text-xs text-muted-foreground">{member.bergabung}</div>
									<div className="mt-2">{getStatusBadge(member.status)}</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Sheet open={showDetailDrawer && !!selectedMember} onOpenChange={setShowDetailDrawer}>
				<SheetContent side="right" className="flex w-[480px] flex-col overflow-y-auto sm:max-w-[480px]">
					<SheetHeader>
						<SheetTitle>Detail Anggota</SheetTitle>
					</SheetHeader>
					{selectedMember && (
						<>
							<div className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-2">
								<div className="flex items-start gap-4">
									<Avatar className="h-20 w-20 shrink-0">
										{selectedMember.foto ? (
											<AvatarImage src={selectedMember.foto} alt="" />
										) : null}
										<AvatarFallback className="text-3xl font-semibold">
											{getInitials(selectedMember.nama)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<div className="text-xl font-semibold text-foreground">{selectedMember.nama}</div>
										<div className="mt-2">{getStatusBadge(selectedMember.status)}</div>
									</div>
								</div>
								<Separator />
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Bergabung</Label>
										<p className="text-foreground">{selectedMember.bergabung}</p>
									</div>
									<div className="space-y-1.5">
										<Label className="text-muted-foreground">Muallaf</Label>
										<p className="text-foreground">{selectedMember.muallaf ? 'Ya' : 'Tidak'}</p>
									</div>
								</div>
							</div>
							<SheetFooter className="mt-auto flex flex-row gap-3 border-t border-border p-6">
								<Button type="button" className="flex-1">
									Simpan
								</Button>
								<Button
									type="button"
									variant="secondary"
									className="flex-1"
									onClick={() => setShowDetailDrawer(false)}
								>
									Tutup
								</Button>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
