'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { z } from 'zod';
import { Search, Filter, UserPlus, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useAdminUsers, useCreateUser } from '@/services/adminHooks';
import type { UserRole } from '@/types';

const filterOptions = ['Semua', 'Aktif', 'Tidak Aktif', 'Muallaf'];

const roleOptions: { value: UserRole; label: string }[] = [
	{ value: 'editor', label: 'Editor' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'super_admin', label: 'Super Admin' },
];

const addMemberSchema = z
	.object({
		full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
		username: z.string().min(3, 'Username minimal 3 karakter').max(100, 'Username maksimal 100 karakter'),
		email: z.string().email('Email tidak valid'),
		password: z.string().min(6, 'Password minimal 6 karakter'),
		confirm_password: z.string().min(6, 'Konfirmasi password wajib diisi'),
		role: z.enum(['super_admin', 'admin', 'editor']),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Password tidak cocok',
		path: ['confirm_password'],
	});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

const defaultAddMemberValues: AddMemberFormValues = {
	full_name: '',
	username: '',
	email: '',
	password: '',
	confirm_password: '',
	role: 'editor',
};

function getInitials(nama: string) {
	return nama.split(' ').slice(0, 2).map((n) => n[0]).join('');
}

export default function JamaahPage() {
	const { data: usersResponse } = useAdminUsers();
	const createUserMutation = useCreateUser();
	const addMemberForm = useForm<AddMemberFormValues>({
		resolver: zodResolver(addMemberSchema),
		defaultValues: defaultAddMemberValues,
	});

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
	const [addMemberOpen, setAddMemberOpen] = useState(false);

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

	function onAddMemberOpenChange(open: boolean) {
		setAddMemberOpen(open);
		if (!open) {
			addMemberForm.reset(defaultAddMemberValues);
		}
	}

	async function onSubmitAddMember(values: AddMemberFormValues) {
		try {
			await createUserMutation.mutateAsync({
				full_name: values.full_name,
				username: values.username,
				email: values.email,
				password: values.password,
				role: values.role,
			});
			toast.success('Anggota berhasil ditambahkan');
			onAddMemberOpenChange(false);
		} catch (err) {
			if (axios.isAxiosError(err)) {
				const msg = (err.response?.data as { error?: string })?.error;
				toast.error(msg ?? 'Gagal menambah anggota');
			} else {
				toast.error('Gagal menambah anggota');
			}
		}
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Struktur Anggota Jamaah</h2>
				<Button type="button" className="gap-2" onClick={() => setAddMemberOpen(true)}>
					<UserPlus className="w-4 h-4" />
					Tambah Anggota
				</Button>
			</div>

			<Dialog open={addMemberOpen} onOpenChange={onAddMemberOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Tambah anggota</DialogTitle>
						<DialogDescription>
							Buat akun pengguna baru. Anggota dapat masuk dengan username/email dan password yang Anda
							tetapkan.
						</DialogDescription>
					</DialogHeader>
					<Form {...addMemberForm}>
						<form onSubmit={addMemberForm.handleSubmit(onSubmitAddMember)} className="space-y-4">
							<FormField
								control={addMemberForm.control}
								name="full_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nama lengkap</FormLabel>
										<FormControl>
											<Input autoComplete="name" placeholder="Nama lengkap" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={addMemberForm.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input autoComplete="username" placeholder="username_unik" {...field} />
										</FormControl>
										<FormDescription>Dipakai untuk login; tampil sebagai identitas di daftar.</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={addMemberForm.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" autoComplete="email" placeholder="email@contoh.com" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={addMemberForm.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Peran</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger aria-label="Peran pengguna">
													<SelectValue placeholder="Pilih peran" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{roleOptions.map((opt) => (
													<SelectItem key={opt.value} value={opt.value}>
														{opt.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={addMemberForm.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={addMemberForm.control}
								name="confirm_password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Konfirmasi password</FormLabel>
										<FormControl>
											<Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button
									type="button"
									variant="secondary"
									onClick={() => onAddMemberOpenChange(false)}
									disabled={createUserMutation.isPending}
								>
									Batal
								</Button>
								<Button type="submit" disabled={createUserMutation.isPending}>
									{createUserMutation.isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Menyimpan…
										</>
									) : (
										'Simpan'
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

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
