'use client';

import { useState, type ReactNode } from 'react';
import { FileText, Image, Calendar } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { TentangKami } from '@/components/dashboard/TentangKami';
import { HistoryManagement } from '@/components/dashboard/HistoryManagement';
import { StrukturManagement } from '@/components/dashboard/StrukturManagement';
import { useAdminAnnouncements, useAdminEvents, useAdminKhutbahs } from '@/services/adminHooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TabType = 'tentang-kami' | 'events' | 'berita' | 'mimbar-jumat' | 'sejarah' | 'struktur' | 'banner' | 'gallery';

export default function KontenPage() {
	const [activeTab, setActiveTab] = useState<TabType>('events');
	const { data: eventsResponse, isLoading: eventsLoading } = useAdminEvents(12);
	const { data: announcementsResponse, isLoading: announcementsLoading } = useAdminAnnouncements(12);
	const { data: khutbahsResponse, isLoading: khutbahsLoading } = useAdminKhutbahs(12);
	const events = eventsResponse?.data ?? [];
	const announcements = announcementsResponse?.data ?? [];
	const khutbahs = khutbahsResponse?.data ?? [];
	let eventsContent: ReactNode;
	let announcementsContent: ReactNode;
	let khutbahsContent: ReactNode;

	const getEventStatus = (isPublished: boolean) => {
		if (isPublished) return { badge: 'success' as const, label: 'Published' };
		return { badge: 'default' as const, label: 'Draft' };
	};

	if (eventsLoading) {
		eventsContent = <p className="text-sm text-muted-foreground">Memuat events...</p>;
	} else if (events.length === 0) {
		eventsContent = <p className="text-sm text-muted-foreground">Belum ada data events</p>;
	} else {
		eventsContent = events.map((item) => (
			<div key={item.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-4 cursor-pointer">
				<div className="flex items-center justify-between mb-2">
					<span className="px-2 py-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">Event</span>
					<StatusBadge status={getEventStatus(item.is_published).badge}>
						{getEventStatus(item.is_published).label}
					</StatusBadge>
				</div>
				<h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
				<p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
				<div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
					<Calendar className="w-3 h-3" />
					<span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
				</div>
			</div>
		));
	}

	if (announcementsLoading) {
		announcementsContent = <p className="text-sm text-muted-foreground">Memuat berita...</p>;
	} else if (announcements.length === 0) {
		announcementsContent = <p className="text-sm text-muted-foreground">Belum ada data berita</p>;
	} else {
		announcementsContent = announcements.map((item) => (
			<div key={item.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-4 cursor-pointer">
				<div className="flex items-center justify-between mb-2">
					<span className="px-2 py-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">Berita</span>
					<span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
				</div>
				<h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
				<p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
			</div>
		));
	}

	if (khutbahsLoading) {
		khutbahsContent = <p className="text-sm text-muted-foreground">Memuat mimbar...</p>;
	} else if (khutbahs.length === 0) {
		khutbahsContent = <p className="text-sm text-muted-foreground">Belum ada data mimbar jumat</p>;
	} else {
		khutbahsContent = khutbahs.map((khutbah) => (
			<div key={khutbah.id} className="border border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-6">
				<div className="flex items-center justify-between mb-3">
					<div className="text-xs text-muted-foreground">{new Date(khutbah.date).toLocaleDateString('id-ID')}</div>
					<StatusBadge status={khutbah.status === 'published' ? 'success' : 'default'}>
						{khutbah.status === 'published' ? 'Published' : 'Draft'}
					</StatusBadge>
				</div>
				<h3 className="text-lg font-semibold text-foreground mb-2">{khutbah.tema}</h3>
				<div className="text-sm text-muted-foreground">Khatib: {khutbah.khatib}</div>
				<Button variant="ghost" size="sm" className="mt-3">
					<FileText className="w-4 h-4" />
					Unduh PDF
				</Button>
			</div>
		));
	}

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
						{eventsContent}
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
						{announcementsContent}
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
						{khutbahsContent}
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
