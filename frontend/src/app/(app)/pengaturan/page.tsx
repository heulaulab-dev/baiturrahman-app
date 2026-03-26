'use client';

import { useState } from 'react';
import { UserPlus, Bell, Globe, LayoutDashboard, Calendar, Key } from 'lucide-react';
import { MosqueProfile } from '@/components/dashboard/MosqueProfile';

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
			{activeTab === 'profil-masjid' && <MosqueProfile />}

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
