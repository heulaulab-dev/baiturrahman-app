'use client';

import { useState } from 'react';
import { UserPlus, Bell, Globe, LayoutDashboard, Calendar, Key, TrendingUp } from 'lucide-react';

const mosqueInfo = {
	nama: 'Masjid Baiturrahman',
	alamat: 'Jl. Masjid Baiturrahman No. 1, Jakarta Selatan, Indonesia',
	telp: '+62 21 1234 5678',
	email: 'info@baiturrahman.or.id',
	website: 'www.baiturrahman.or.id',
	tagline: 'Merahmati Umat, Menerangi Jiwa',
};

const usersData = [
	{ id: '1', nama: 'Ketua Pengurus', email: 'ketua@baiturrahman.or.id', role: 'super-admin', lastLogin: '2026-03-17 14:30', status: 'aktif' },
	{ id: '2', nama: 'Bendahara', email: 'bendahara@baiturrahman.or.id', role: 'admin', lastLogin: '2026-03-17 11:45', status: 'aktif' },
	{ id: '3', nama: 'Ust. Yusuf Al-Amin', email: 'ustadz@baiturrahman.or.id', role: 'admin', lastLogin: '2026-03-17 09:20', status: 'aktif' },
	{ id: '4', nama: 'Sekretaris', email: 'sekretaris@baiturrahman.or.id', role: 'content-editor', lastLogin: '2026-03-17 08:15', status: 'aktif' },
];

type TabType = 'profil-masjid' | 'pengguna-role' | 'jadwal-sholat' | 'notifikasi' | 'api';

export default function PengaturanPage() {
	const [activeTab, setActiveTab] = useState<TabType>('profil-masjid');

	const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
		{ key: 'profil-masjid', label: 'Profil Masjid', icon: LayoutDashboard },
		{ key: 'pengguna-role', label: 'Pengguna & Role', icon: UserPlus },
		{ key: 'jadwal-sholat', label: 'Jadwal Sholat', icon: Calendar },
		{ key: 'notifikasi', label: 'Notifikasi', icon: Bell },
		{ key: 'api', label: 'API', icon: Key },
	];

	return (
		<div className="space-y-6 p-6">
			{/* Tabs */}
			<div className="flex flex-wrap items-center gap-1 border border-border rounded-lg bg-muted/30 p-1">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors text-sm ${activeTab === tab.key ? 'bg-background text-foreground' : 'text-muted hover:bg-muted/50'}`}
					>
						<tab.icon className="w-4 h-4" />
						{tab.label}
					</button>
				))}
			</div>

			{/* Profil Masjid Tab */}
			{activeTab === 'profil-masjid' && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="p-6 border border-border bg-muted/30 rounded-lg">
						<h3 className="text-xl font-semibold text-foreground mb-4">Informasi Masjid</h3>
						<div className="space-y-4">
							<div>
								<label className="block text-sm text-muted mb-2">Nama Masjid</label>
								<input type="text" defaultValue={mosqueInfo.nama} className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-md outline-none" />
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Alamat</label>
								<input type="text" defaultValue={mosqueInfo.alamat} className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-md outline-none" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-muted mb-2">Telepon</label>
									<input type="tel" defaultValue={mosqueInfo.telp} className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-md outline-none" />
								</div>
								<div>
									<label className="block text-sm text-muted mb-2">Email</label>
									<input type="email" defaultValue={mosqueInfo.email} className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-md outline-none" />
								</div>
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Website</label>
								<input type="url" defaultValue={mosqueInfo.website} className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-md outline-none" />
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Tagline</label>
								<input type="text" defaultValue={mosqueInfo.tagline} className="w-full px-4 py-3 bg-background border border-border text-foreground rounded-md outline-none" />
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Logo Masjid</label>
								<div className="flex items-center gap-3">
									<div className="w-16 h-16 border border-border bg-muted/50 flex items-center justify-center rounded-md">
										<Globe className="w-6 h-6 text-muted" />
									</div>
									<button className="px-4 py-2 bg-muted/30 text-foreground rounded-md hover:bg-muted/50 transition-colors text-sm">
										Upload
									</button>
								</div>
							</div>
							<button className="w-full py-3 px-4 rounded-md font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">
								Simpan Perubahan
							</button>
						</div>
					</div>

					<div className="border border-border bg-muted/30 rounded-lg p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">Statistik Website</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-4 border border-border bg-background rounded-md">
								<div className="text-xs font-medium text-muted uppercase mb-2">Pengunjung</div>
								<div className="text-2xl font-mono text-foreground mb-1">12,456</div>
								<div className="text-sm text-muted">bulan ini</div>
								<div className="flex items-center gap-1 text-emerald-500 text-xs mt-1">
									<TrendingUp className="w-3 h-3" />
									<span>+34%</span>
								</div>
							</div>
							<div className="p-4 border border-border bg-background rounded-md">
								<div className="text-xs font-medium text-muted uppercase mb-2">Artikel Dilihat</div>
								<div className="text-2xl font-mono text-foreground mb-1">3,456</div>
								<div className="text-sm text-muted">total</div>
							</div>
							<div className="p-4 border border-border bg-background rounded-md">
								<div className="text-xs font-medium text-muted uppercase mb-2">Donasi</div>
								<div className="text-2xl font-mono text-foreground mb-1">472</div>
								<div className="text-sm text-muted">transaksi</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Pengguna & Role Tab */}
			{activeTab === 'pengguna-role' && (
				<div className="border border-border bg-background rounded-lg overflow-hidden">
					<div className="grid grid-cols-[1fr_200px_120px_140px] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted uppercase">
						<div>Nama</div>
						<div>Email</div>
						<div>Role</div>
						<div>Login Terakhir</div>
					</div>
					{usersData.map((user) => (
						<div key={user.id} className="grid grid-cols-[1fr_200px_120px_140px] border-t border-border h-12 items-center px-4 text-sm hover:bg-muted/30 transition-colors">
							<div className="text-foreground font-medium">{user.nama}</div>
							<div className="text-muted truncate">{user.email}</div>
							<div className="text-xs text-muted uppercase tracking-wider">{user.role}</div>
							<div className="text-xs text-muted">{user.lastLogin}</div>
						</div>
					))}
				</div>
			)}

			{/* Placeholder tabs */}
			{(activeTab === 'jadwal-sholat' || activeTab === 'notifikasi' || activeTab === 'api') && (
				<div className="flex flex-col items-center justify-center py-20 text-muted">
					<p className="text-sm">Halaman ini belum tersedia</p>
				</div>
			)}
		</div>
	);
}
