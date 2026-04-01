'use client';

import { useState } from 'react';
import { FileText, Image, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { TentangKami } from '@/components/dashboard/TentangKami';
import { HistoryManagement } from '@/components/dashboard/HistoryManagement';
import { StrukturManagement } from '@/components/dashboard/StrukturManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const eventsData = [
	{ id: '1', title: 'Kajian Rutin: Kitab Al-Quran', category: 'Kajian', date: '2026-03-20', status: 'published' as const, excerpt: 'Kajian rutin mingguan membahas kitab Al-Quran.' },
	{ id: '2', title: 'Kajian Tasawuf: Rahayu', category: 'Kajian', date: '2026-03-18', status: 'published' as const, excerpt: 'Kajian tasawuf mingguan.' },
	{ id: '3', title: 'Buka Puasa Bersama', category: 'Kegiatan', date: '2026-03-17', status: 'scheduled' as const, excerpt: 'Buka puasa bersama untuk jamaah.' },
	{ id: '4', title: 'Ramadhan 1446', category: 'Kegiatan', date: '2026-03-01', status: 'draft' as const, excerpt: 'Program kegiatan Ramadhan 1446 H.' },
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
	const getEventStatus = (status: 'published' | 'scheduled' | 'draft') => {
		if (status === 'published') return { badge: 'success' as const, label: 'Published' };
		if (status === 'draft') return { badge: 'default' as const, label: 'Draft' };
		return { badge: 'warning' as const, label: 'Scheduled' };
	};

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
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
				<TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-muted/30 p-2">
					{tabs.map((tab) => (
						<TabsTrigger key={tab.key} value={tab.key}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

			{/* Tentang Kami Tab */}
			<TabsContent value="tentang-kami"><TentangKami /></TabsContent>

			{/* Events Tab */}
			<TabsContent value="events">
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Events</h2>
						<Button>
							+ Tambah Event
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{eventsData.map((item) => (
							<div key={item.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-4 cursor-pointer">
								<div className="flex items-center justify-between mb-2">
									<span className="px-2 py-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">{item.category}</span>
									<StatusBadge status={getEventStatus(item.status).badge}>
										{getEventStatus(item.status).label}
									</StatusBadge>
								</div>
								<h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
								<p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
								<div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
									<Calendar className="w-3 h-3" />
									<span>{item.date}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</TabsContent>

			{/* Berita Tab */}
			<TabsContent value="berita">
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Berita</h2>
						<Button>
							+ Tulis Berita
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{beritaData.map((item) => (
							<div key={item.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-4 cursor-pointer">
								<div className="flex items-center justify-between mb-2">
									<span className="px-2 py-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">{item.category}</span>
									<span className="text-xs text-muted-foreground">{item.date}</span>
								</div>
								<h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
								<p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
							</div>
						))}
					</div>
				</div>
			</TabsContent>

			{/* Mimbar Jumat Tab */}
			<TabsContent value="mimbar-jumat">
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Mimbar Jumat</h2>
						<Button>
							+ Mimbar Baru
						</Button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{mimbarJumatData.map((khutbah) => (
							<div key={khutbah.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-6">
								<div className="flex items-center justify-between mb-3">
									<div className="text-xs text-muted-foreground">{khutbah.tanggal}</div>
									<StatusBadge status="success">Published</StatusBadge>
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-2">{khutbah.tema}</h3>
								<div className="text-sm text-muted-foreground">Khatib: {khutbah.khatib}</div>
								<Button variant="ghost" size="sm" className="mt-3">
									<FileText className="w-4 h-4" />
									Unduh PDF
								</Button>
							</div>
						))}
					</div>
				</div>
			</TabsContent>

			{/* Sejarah Tab */}
			<TabsContent value="sejarah"><HistoryManagement /></TabsContent>

			{/* Struktur Tab */}
			<TabsContent value="struktur"><StrukturManagement /></TabsContent>

			{/* Banner / Gallery placeholder */}
			<TabsContent value="banner">
				<Card className="py-20">
					<CardContent className="flex flex-col items-center justify-center text-muted-foreground">
						<Image className="mb-3 h-12 w-12 opacity-70" />
						<p className="text-sm">Halaman Banner belum tersedia</p>
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value="gallery">
				<Card className="py-20">
					<CardContent className="flex flex-col items-center justify-center text-muted-foreground">
						<Image className="mb-3 h-12 w-12 opacity-70" />
						<p className="text-sm">Halaman Galeri belum tersedia</p>
					</CardContent>
				</Card>
			</TabsContent>
			</Tabs>
		</div>
	);
}
