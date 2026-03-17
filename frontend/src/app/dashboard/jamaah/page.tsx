'use client';

import { useState } from 'react';
import { Search, Filter, UserPlus, Edit2, Trash2, MoreHorizontal, User, CheckCircle2, Clock } from 'lucide-react';
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
const viewOptions = ['Table View', 'Card Grid View'];

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

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Struktur Anggota Jamaah</h2>

				<div className="flex items-center gap-3">
					<button className="py-2.5 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
						<UserPlus className="w-4 h-4" />
						Tambah Anggota
					</button>
				</div>

				<div className="flex items-center gap-3 ml-auto">
					<div className="relative">
						<Search className="w-4 h-4 text-muted" />
						<input
							type="text"
							placeholder="Cari anggota..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none w-64"
						/>
					</div>

					<div className="flex gap-2">
						<Filter className="w-4 h-4 text-muted" />
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value as typeof filter)}
							className="py-2 px-4 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
						>
							{filterOptions.map(opt => (
								<option key={opt} value={opt}>{opt}</option>
							))}
						</select>
					</div>

					<div className="flex items-center gap-2 p-2 border-border bg-muted/30 rounded-md">
						<div className="text-xs text-muted">Aktif:</div>
						<div className="text-xl font-semibold text-foreground">{aktifCount}</div>
					</div>

					<div className="flex items-center gap-2 p-2 border-border bg-muted/30 rounded-md">
						<div className="text-xs text-muted">Muallaf:</div>
						<div className="text-xl font-semibold text-foreground">{muallafCount}</div>
					</div>
				</div>

				{/* View Toggle */}
				<div className="flex items-center gap-2 border-border rounded-md p-1">
					<button
						onClick={() => setViewMode('table')}
						className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-muted/50' : ''}`}
					>
						Table View
					</button>
					<button
						onClick={() => setViewMode('grid')}
						className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-muted/50' : ''}`}
					>
						Grid View
					</button>
				</div>

			{/* Muallaf Progress Section */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-foreground">Progress Muallaf</h3>
						<div className="flex items-center gap-2">
							<div className="text-xs text-muted">Total: 3</div>
							<button className="text-accent hover:text-accent/80 transition-colors text-sm">Lihat Semua →</button>
						</div>
					</div>

					<div className="relative">
						<div className="flex items-center gap-6">
							{[0, 1, 2].map((step) => (
								<div key={step} className="flex-1">
									<div
										className={`
											flex flex-col
											${step === 0 ? 'text-accent' : 'text-muted'}
										`}
									>
										<div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center bg-background">
											{step === 0 && <CheckCircle2 className="w-5 h-5" />}
											<span className="text-xs font-medium">{step + 1}</span>
										</div>
										<div className="text-sm font-medium mt-1">
											{step === 0 && 'Pendaftaran'}
											{step === 1 && 'Bimbingan'}
											{step === 2 && 'Sertifikasi'}
										</div>
									</div>
								</div>
							))}
						</div>
						{[1, 2].map((i) => (
							<div key={i} className="flex-1">
								<div className="w-8 h-px bg-current" />
							</div>
						))}
					</div>
				</div>

			{/* Table View */}
			{viewMode === 'table' && (
				<div className="border-border bg-background rounded-md overflow-hidden">
					{/* Table Header */}
					<div className="grid grid-cols-[60px_4rem_8rem_6rem_4rem] bg-muted/30 h-12 items-center text-xs font-medium tracking-widest text-muted">
						<div className="p-3 flex items-center">
							<input
								type="checkbox"
								className="w-4 h-4 border-border rounded focus:ring-1 focus:ring-foreground/20"
							/>
						</div>
						<div className="text-center">#</div>
						<div className="text-center">Foto</div>
						<div>Nama Lengkap</div>
						<div>NIK</div>
						<div>Status</div>
						<div>Tanggal Bergabung</div>
						<div className="text-center">Aksi</div>
					</div>

					{/* Table Body */}
					<div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
						{filteredData.map((member, index) => (
							<div
								key={member.id}
								onClick={() => setSelectedMember(member)}
								className={`
									grid grid-cols-[60px_4rem_8rem_6rem_4rem_4rem] border-b border-border
									h-14 items-center text-sm
									hover:bg-muted/30 transition-colors
									cursor-pointer
								`}
							>
								<div className="p-3 flex items-center gap-3">
									<input
										type="checkbox"
										className="w-4 h-4 border-border rounded focus:ring-1 focus:ring-foreground/20"
									/>
								</div>
								<div className="text-center text-xs tracking-widest text-muted">#{index + 1}</div>
								<div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
									{member.foto ? (
										<img src={member.foto} alt={member.nama} className="w-full h-full object-cover" />
									) : (
										<span className="text-lg font-semibold text-muted">
											{member.nama.split(' ').slice(0, 2).map(n => n[0]).join('')}
										</span>
									)}
								</div>
								<div className="min-w-0">
									<div className="text-foreground font-medium truncate">
										{member.nama}
									</div>
									<div className="text-muted text-xs truncate">
										{member.nik.replace(/(\d{3})(?=\d)/g, '$1***$2')}
									</div>
								</div>
								<div className="text-center">
									<StatusBadge status={member.status === 'aktif' ? 'success' : member.status === 'tidak-aktif' ? 'danger' : 'warning'}>
										{member.status === 'aktif' && 'Aktif'}
										{member.status === 'tidak-aktif' && 'Tidak Aktif'}
									</StatusBadge>
								</div>
								<div className="text-muted text-sm">
									{member.bergabung}
								</div>
								<div className="text-center">
									{member.muallaf && <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center"><span className="text-xs text-accent font-semibold">M</span></div>}
								</div>
								<div className="text-center">
									<button
										onClick={(e) => e.stopPropagation()}
										className="p-1.5 text-muted hover:text-foreground transition-colors"
									>
										<MoreHorizontal className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>

					{/* Table Footer */}
					<div className="grid grid-cols-[60px_4rem_8rem_6rem_4rem_4rem_4rem_4rem] bg-muted/30 h-12 items-center text-xs font-medium text-muted border-t border-border">
						<div className="text-muted hover:text-foreground transition-colors">
							Previous
						</button>
						<span className="font-mono text-muted">
							{Math.min(Math.ceil(filteredData.length / 20), filteredData.length)} of {filteredData.length}
						</span>
						<button className="text-muted hover:text-foreground transition-colors">
							Next >
						</button>
						<div className="col-span-2 flex items-center justify-end pr-3">
							<button className="text-muted hover:text-foreground transition-colors flex items-center gap-2">
								<UserPlus className="w-4 h-4" />
								Tambah Baru
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Grid View */}
			{viewMode === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredData.map((member) => (
						<div
							key={member.id}
							onClick={() => setSelectedMember(member)}
							className="border-border bg-background hover:bg-muted/30 transition-colors rounded-lg overflow-hidden"
						>
							{/* Card Header */}
							<div className="p-4 border-b border-border flex items-start gap-3">
								<div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
									{member.foto ? (
										<img src={member.foto} alt={member.nama} className="w-full h-full object-cover" />
									) : (
										<span className="text-2xl font-semibold text-muted">
											{member.nama.split(' ').slice(0, 2).map(n => n[0]).join('')}
										</span>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1">
										<div className="text-foreground font-semibold truncate">
											{member.nama}
										</div>
										<div className="flex items-center gap-2">
											{member.muallaf && <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center"><span className="text-xs text-accent font-semibold">M</span></div>}
											<button onClick={(e) => e.stopPropagation()} className="text-muted hover:text-foreground">
												<Edit2 className="w-4 h-4" />
											</button>
										</div>
									</div>
									<div className="text-xs text-muted">{member.nik.replace(/(\d{3})(?=\d)/g, '$1***$2')}</div>
								</div>
							</div>

							{/* Card Body */}
							<div className="p-4 grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-muted">NIK</div>
									<div className="font-mono text-foreground truncate">{member.nik.replace(/(\d{3})(?=\d)/g, '$1***$2')}</div>
								</div>
								<div>
									<div className="text-muted">Status</div>
									<div>
										<StatusBadge status={member.status === 'aktif' ? 'success' : member.status === 'tidak-aktif' ? 'danger' : 'warning'}>
											{member.status === 'aktif' && 'Aktif'}
											{member.status === 'tidak-aktif' && 'Tidak Aktif'}
										</StatusBadge>
									</div>
								</div>
								<div>
									<div className="text-muted">Bergabung</div>
									<div className="text-muted">{member.bergabung}</div>
								</div>
								{member.muallaf && (
									<div>
										<div className="text-muted">Sebagai</div>
										<div className="text-foreground font-medium">Muallaf</div>
									</div>
								)}
							</div>

							<div className="col-span-2 flex justify-end">
								<div>
									<div className="text-muted">Tanggal Bergabung</div>
									<div className="text-foreground">{member.bergabung}</div>
								</div>
								<button className="w-full py-2 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
									Lihat Detail
								</button>
							</div>
						</div>
					</div>
				))}
			)}

			{/* Detail Drawer */}
			{showDetailDrawer && selectedMember && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div
						onClick={() => setShowDetailDrawer(false)}
						className="absolute inset-0 bg-background/80"
					/>
					<div
						className={`
							absolute right-0 top-0 bottom-0 w-[480px] max-h-[90vh] bg-background border-border rounded-lg shadow-xl overflow-y-auto
							transform transition-all duration-300
							${showDetailDrawer ? 'translate-x-0' : 'translate-x-full'}
						`}
					>
						<div className="p-6 border-b border-border flex items-center justify-between">
							<h3 className="text-lg font-semibold text-foreground">Detail Anggota</h3>
							<button onClick={() => setShowDetailDrawer(false)} className="text-muted hover:text-foreground">
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Profile Info */}
						<div className="space-y-6 p-6">
							<div className="flex items-start gap-4">
								<div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
									{selectedMember.foto ? (
										<img src={selectedMember.foto} alt={selectedMember.nama} className="w-full h-full object-cover" />
									) : (
										<span className="text-3xl font-semibold text-muted">
											{selectedMember.nama.split(' ').slice(0, 2).map(n => n[0]).join('')}
										</span>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="mb-1">
										<div className="text-sm text-muted">Nama Lengkap</div>
										<div className="text-xl font-semibold text-foreground">{selectedMember.nama}</div>
									</div>
									<div className="mb-4">
										<div className="text-sm text-muted">NIK</div>
										<div className="font-mono text-foreground text-lg">{selectedMember.nik.replace(/(\d{3})(?=\d)/g, '$1***$2')}</div>
									</div>
									<div className="flex items-center gap-2">
										<div>
											<div className="text-sm text-muted">Status</div>
											<div>
												<StatusBadge status={selectedMember.status === 'aktif' ? 'success' : selectedMember.status === 'tidak-aktif' ? 'danger' : 'warning'}>
													{selectedMember.status === 'aktif' && 'Aktif'}
													{selectedMember.status === 'tidak-aktif' && 'Tidak Aktif'}
												</StatusBadge>
											</div>
										</div>
										{selectedMember.muallaf && (
											<div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
												<span className="text-xs text-accent font-semibold">M</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Contact Info */}
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<div className="text-muted">No. HP</div>
								<div className="text-foreground font-mono">0812-3456-7890</div>
							</div>
							<div>
								<div className="text-muted">Email</div>
								<div className="text-foreground">ahmad.fauzi@email.com</div>
							</div>
							<div>
								<div className="text-muted">Tanggal Bergabung</div>
								<div className="text-foreground">{selectedMember.bergabung}</div>
							</div>
						</div>

						{/* Riwayat Donasi - Mini Table */}
						<div>
							<div className="text-sm text-muted mb-3">Riwayat Donasi</div>
							<div className="border-border rounded-md overflow-hidden">
								<div className="grid grid-cols-[60px_4rem_8rem] bg-muted/30 h-10 items-center text-xs font-medium text-muted">
									<div className="p-2">#</div>
									<div>Tanggal</div>
									<div>Jumlah</div>
									<div className="text-right">Status</div>
								</div>
								{[
									{ tanggal: '2026-01', jumlah: 'Rp 500.000', status: 'success' },
									{ tanggal: '2025-12', jumlah: 'Rp 250.000', status: 'success' },
									{ tanggal: '2025-06', jumlah: 'Rp 100.000', status: 'success' },
								].map((riwayat, i) => (
									<div key={i} className="grid grid-cols-[60px_4rem_8rem_6rem_4rem] border-b border-border h-10 items-center text-sm">
										<div className="p-2 text-center">{i + 1}</div>
										<div className="text-foreground">{riwayat.tanggal}</div>
										<div className="text-right font-mono text-foreground">Rp {riwayat.jumlah.toLocaleString('id-ID')}</div>
										<div className="text-center">
											<StatusBadge status={riwayat.status}>
												{riwayat.status === 'success' && 'Terkonfirmasi'}
											</StatusBadge>
										</div>
									</div>
									</div>
								))}
							</div>
						</div>

						{/* Kajian yang Diikuti */}
						<div className="mt-6">
							<div className="text-sm text-muted mb-3">Kajian yang Diikuti</div>
							<div className="space-y-2">
								{[
									{ kajian: 'Tafsir Al-Baqarah', ustadz: 'Ust. H. Hamidin' },
									{ kajian: 'Fiqh Ibadah', ustadz: 'Ust. Ahmad Faishal' },
								].map((k, i) => (
									<div key={i} className="flex items-center gap-3 p-3 border-border rounded-md">
										<Clock className="w-4 h-4 text-muted flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<div className="text-foreground font-medium">{k.kajian}</div>
											<div className="text-xs text-muted">oleh {k.ustadz}</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Catatan Pengurus - Read Only */}
						<div className="mt-6 p-4 bg-muted/30 rounded-md">
							<div className="text-sm text-muted mb-2">Catatan Pengurus</div>
							<div className="text-sm text-foreground leading-relaxed">
								Anggota aktif, terlibatur dalam pengajian rutin. Bermanyalaat dalam setiap kegiatan masjid.
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3 p-6 border-t border-border">
							<button className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
								Simpan
							</button>
							<button className="flex-1 py-3 px-4 rounded-md font-medium transition-colors">
								Batal
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
