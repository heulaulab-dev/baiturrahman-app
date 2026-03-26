'use client';

import { useState } from 'react';
import { Search, FileText, Plus, Image, X, Calendar, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { TentangKami } from '@/components/dashboard/TentangKami';
import { HistoryManagement } from '@/components/dashboard/HistoryManagement';
import { StrukturManagement } from '@/components/dashboard/StrukturManagement';

const eventsData = [
	{ id: '1', title: 'Kajian Rutin: Kitab Al-Quran', category: 'Kajian', date: '2026-03-20', status: 'published', excerpt: 'Kajian rutin mingguan membahas kitab Al-Quran.' },
	{ id: '2', title: 'Kajian Tasawuf: Rahayu', category: 'Kajian', date: '2026-03-18', status: 'published', excerpt: 'Kajian tasawuf mingguan.' },
	{ id: '3', title: 'Buka Puasa Bersama', category: 'Kegiatan', date: '2026-03-17', status: 'scheduled', excerpt: 'Buka puasa bersama untuk jamaah.' },
	{ id: '4', title: 'Ramadhan 1446', category: 'Kegiatan', date: '2026-03-01', status: 'draft', excerpt: 'Program kegiatan Ramadhan 1446 H.' },
];

const beritaData = [
	{ id: '1', title: 'Pembukaan Program Ramadhan 1446', category: 'Berita', date: '2026-03-12', excerpt: 'Masjid Baiturrahman membuka serangkaian kegiatan Ramadhan.', author: 'Admin' },
	{ id: '2', title: 'Wisuda Tahfidz Angkatan ke-15', category: 'Kejadian', date: '2026-03-10', excerpt: '25 santri berhasil menyelesaikan hafalan 30 juz Al-Quran.', author: 'Admin' },
	{ id: '3', title: 'Kunjungan Pondok Pesantren', category: 'Kegiatan', date: '2026-03-08', excerpt: 'Menerima kunjungan dari pondok pesantren.', author: 'Admin' },
];

const mimbarJumatData = [
	{ id: '1', tanggal: '2026-03-14', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Membangun Keluarga Sakinah di Era Digital' },
	{ id: '2', tanggal: '2026-03-07', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Keadilan Hati dalam Beramal' },
	{ id: '3', tanggal: '2026-02-28', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Adab Sopan Santun' },
];

type TabType = 'tentang-kami' | 'events' | 'berita' | 'mimbar-jumat' | 'sejarah' | 'struktur' | 'banner' | 'gallery';

export default function KontenPage() {
	const [activeTab, setActiveTab] = useState<TabType>('events');

	const tabs: { key: TabType; label: string }[] = [
		{ key: 'tentang-kami', label: 'Tentang Kami' },
		{ key: 'events', label: 'Events' },
		{ key: 'berita', label: 'Berita' },
		{ key: 'mimbar-jumat', label: 'Mimbar Jumat' },
		{ key: 'sejarah', label: 'Sejarah' },
		{ key: 'struktur', label: 'Struktur' },
		{ key: 'banner', label: 'Banner' },
		{ key: 'gallery', label: 'Galeri' },
	];

	return (
		<div className="space-y-6 p-6">
			{/* Sub-tabs */}
			<div className="flex flex-wrap items-center gap-1 border border-border rounded-lg bg-muted/30 p-1">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						className={`px-6 py-3 rounded-md font-medium transition-colors text-sm ${activeTab === tab.key ? 'bg-background text-foreground' : 'text-muted hover:bg-muted/50'}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tentang Kami Tab */}
			{activeTab === 'tentang-kami' && <TentangKami />}

			{/* Events Tab */}
			{activeTab === 'events' && (
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Events</h2>
						<button className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Tambah Event
						</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{eventsData.map((item) => (
							<div key={item.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-4 cursor-pointer">
								<div className="flex items-center justify-between mb-2">
									<span className="px-2 py-1 text-xs font-medium tracking-wider text-muted uppercase">{item.category}</span>
									<StatusBadge status={item.status === 'published' ? 'success' : item.status === 'draft' ? 'default' : 'warning'}>
										{item.status === 'published' ? 'Published' : item.status === 'draft' ? 'Draft' : 'Scheduled'}
									</StatusBadge>
								</div>
								<h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
								<p className="text-sm text-muted line-clamp-2">{item.excerpt}</p>
								<div className="flex items-center gap-2 mt-3 text-xs text-muted">
									<Calendar className="w-3 h-3" />
									<span>{item.date}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Berita Tab */}
			{activeTab === 'berita' && (
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Berita</h2>
						<button className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Tulis Berita
						</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{beritaData.map((item) => (
							<div key={item.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-4 cursor-pointer">
								<div className="flex items-center justify-between mb-2">
									<span className="px-2 py-1 text-xs font-medium tracking-wider text-muted uppercase">{item.category}</span>
									<span className="text-xs text-muted">{item.date}</span>
								</div>
								<h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
								<p className="text-sm text-muted line-clamp-2">{item.excerpt}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Mimbar Jumat Tab */}
			{activeTab === 'mimbar-jumat' && (
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Mimbar Jumat</h2>
						<button className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Mimbar Baru
						</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{mimbarJumatData.map((khutbah) => (
							<div key={khutbah.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-6">
								<div className="flex items-center justify-between mb-3">
									<div className="text-xs text-muted">{khutbah.tanggal}</div>
									<StatusBadge status="success">Published</StatusBadge>
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-2">{khutbah.tema}</h3>
								<div className="text-sm text-muted">Khatib: {khutbah.khatib}</div>
								<button className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mt-3 text-sm">
									<FileText className="w-4 h-4" />
									Unduh PDF
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Sejarah Tab */}
			{activeTab === 'sejarah' && <HistoryManagement />}

			{/* Struktur Tab */}
			{activeTab === 'struktur' && <StrukturManagement />}

			{/* Banner / Gallery placeholder */}
			{(activeTab === 'banner' || activeTab === 'gallery') && (
				<div className="flex flex-col items-center justify-center py-20 text-muted">
					<Image className="w-12 h-12 mb-3 text-muted/50" />
					<p className="text-sm">Halaman {activeTab === 'banner' ? 'Banner' : 'Galeri'} belum tersedia</p>
				</div>
			)}
		</div>
	);
}
