'use client';

import { useState } from 'react';
import { Shield, UserPlus, Bell, Settings, Globe, LayoutDashboard, Lock, Check, AlertCircle, Save, Trash2, Calendar, Clock, Key, Moon } from 'lucide-react';

const mosqueInfo = {
	nama: 'Masjid Baiturrahman',
	alamat: 'Jl. Masjid Baiturrahman No. 1, Jakarta Selatan, Indonesia',
	telp: '+62 21 1234 5678',
	email: 'info@baiturrahman.or.id',
	website: 'www.baiturrahman.or.id',
	tagline: 'Merahmati Umat, Menerangi Jiwa',
	logoUrl: null,
};

const usersData = [
	{ id: '1', nama: 'Ketua Pengurus', email: 'ketua@baiturrahman.or.id', role: 'super-admin', lastLogin: '2026-03-17 14:30', status: 'aktif' },
	{ id: '2', nama: 'Bendahara', email: 'bendahara@baiturrahman.or.id', role: 'admin', lastLogin: '2026-03-17 11:45', status: 'aktif' },
	{ id: '3', nama: 'Ust. Yusuf Al-Amin', email: 'ustadz@baiturrahman.or.id', role: 'admin', lastLogin: '2026-03-17 09:20', status: 'aktif' },
	{ id: '4', nama: 'Sekretaris', email: 'sekretaris@baiturrahman.or.id', role: 'content-editor', lastLogin: '2026-03-17 08:15', status: 'aktif' },
];

export default function PengaturanPage() {
	const [activeTab, setActiveTab] = useState<'profil-masjid' | 'pengguna-role' | 'jadwal-sholat' | 'notifikasi' | 'api'>('profil-masjid');

	const [showInviteModal, setShowInviteModal] = useState(false);
	const [showNewUserModal, setShowNewUserModal] = useState(false);
	const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

	return (
		<div className="space-y-6 p-6">
			{/* Tabs */}
			<div className="flex flex-wrap items-center gap-2 mb-6 border-border rounded-lg bg-muted/30 p-1">
				<button
					onClick={() => setActiveTab('profil-masjid')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'profil-masjid' ? 'bg-background' : ''}`}
				>
					<LayoutDashboard className="w-4 h-4" />
					Profil Masjid
				</button>
				<button
					onClick={() => setActiveTab('pengguna-role')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'pengguna-role' ? 'bg-background' : ''}`}
				>
					<UserPlus className="w-4 h-4" />
					Pengguna & Role
				</button>
				<button
					onClick={() => setActiveTab('jadwal-sholat')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'jadwal-sholat' ? 'bg-background' : ''}`}
				>
					<Calendar className="w-4 h-4" />
					Jadwal Sholat
				</button>
				<button
					onClick={() => setActiveTab('notifikasi')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'notifikasi' ? 'bg-background' : ''}`}
				>
					<Bell className="w-4 h-4" />
					Notifikasi
				</button>
				<button
					onClick={() => setActiveTab('api')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'api' ? 'bg-background' : ''}`}
				>
					<Key className="w-4 h-4" />
					API
				</button>
			</div>

			{/* Profil Masjid Tab */}
			{activeTab === 'profil-masjid' && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="lg:col-span-1">
						{/* Form */}
						<div className="p-6 border-border bg-muted/30 rounded-lg">
							<h3 className="text-xl font-semibold text-foreground mb-4">Informasi Masjid</h3>

							<div className="space-y-4">
								<div>
									<label className="block text-sm text-muted mb-2">Nama Masjid</label>
									<input
										type="text"
										defaultValue={mosqueInfo.nama}
										className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-muted mb-2">Alamat</label>
										<input
											type="text"
											defaultValue={mosqueInfo.alamat}
											className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
									<div>
										<label className="block text-sm text-muted mb-2">Telepon</label>
										<input
											type="tel"
											defaultValue={mosqueInfo.telp}
											className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
								</div>
								<div className="col-span-2">
									<label className="block text-sm text-muted mb-2">Email</label>
										<input
											type="email"
											defaultValue={mosqueInfo.email}
											className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
								</div>
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Website</label>
								<input
									type="url"
									defaultValue={mosqueInfo.website}
									placeholder="https://"
									className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
								/>
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Tagline</label>
								<input
									type="text"
									defaultValue={mosqueInfo.tagline}
									className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
								/>
							</div>
							<div className="mt-4">
								<label className="block text-sm text-muted mb-2">Logo Masjid</label>
								<div className="flex items-center gap-3">
									<div className="w-16 h-16 border border-border bg-muted/50 flex items-center justify-center rounded-md">
										<Globe className="w-6 h-6 text-muted" />
									</div>
									<input
										type="file"
										className="w-full px-4 py-3 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
									/>
									<button
										type="button"
										onClick={() => console.log('Upload logo')}
										className="mt-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/50 transition-colors"
									>
										Upload
									</button>
								</div>
							</div>
						</div>

						{/* Preview */}
						<div className="p-4 bg-muted/30 rounded-lg">
							<h4 className="text-lg font-semibold text-foreground mb-4">Preview Tampilan Publik</h4>
							<div className="w-full aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
								<div className="text-muted">
									<div className="w-24 h-24 rounded-full bg-foreground/10 flex items-center justify-center mb-2">
										<LayoutDashboard className="w-12 h-12 text-muted" />
									</div>
								</div>
								<p className="text-center mt-2 text-foreground">
									<span className="font-semibold">{mosqueInfo.nama}</span>
								</p>
								<p className="text-center text-sm text-muted">{mosqueInfo.tagline}</p>
							</div>

							<div className="flex justify-center mt-4">
								<button className="px-6 py-3 rounded-md font-medium bg-foreground text-background hover:bg-muted/90">
									Simpan Perubahan
								</button>
							</div>
						</div>
					</div>

					{/* Statistics Card */}
					<div className="border-border bg-muted/30 rounded-lg p-6">
						<h3 className="text-lg font-semibold text-foreground mb-4">Statistik Website</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="p-4 border-border bg-muted/30 hover:bg-muted/30">
								<div className="text-xs font-medium text-muted uppercase mb-2">Pengunjung</div>
								<div className="text-2xl font-mono text-foreground mb-1">12,456</div>
								<div className="text-sm text-muted">bulan ini</div>
								<div className="flex items-center gap-1 text-success">
									<TrendingUp className="w-4 h-4" />
									<span>+34%</span>
								</div>
							</div>
							<div className="p-4 border-border bg-muted/30 hover:bg-muted/30">
								<div className="text-xs font-medium text-muted uppercase mb-2">Artikel Dilihat</div>
								<div className="text-2xl font-mono text-foreground mb-1">3,456</div>
								<div className="text-sm text-muted">total</div>
							</div>
							<div className="p-4 border-border bg-muted/30 hover:bg-muted/30">
								<div className="text-xs font-medium text-muted uppercase mb-2">Donasi</div>
								<div className="text-2xl font-mono text-foreground mb-1">472</div>
								<div className="text-sm text-muted">transaksi</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
