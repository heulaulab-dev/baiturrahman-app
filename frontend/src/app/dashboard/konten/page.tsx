'use client';

import { useState } from 'react';
import { Search, Filter, FileText, Plus, Image, Trash2, X, Calendar, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const kontenSections = {
	hero: { title: 'Selamat Datang', enabled: true },
	layanan: { title: 'Layanan Masjid', enabled: true },
	tentang: { title: 'Tentang Kami', enabled: true },
	kajian: { title: 'Kajian & Artikel', enabled: true },
};
const eventsData = [
	{ id: '1', title: 'Kajian Rutin: Kitab Al-Quran', category: 'Kajian', date: '2026-03-20', status: 'published' },
	{ id: '2', title: 'Kajian Tasawuf: Rahayu', category: 'Kajian', date: '2026-03-18', status: 'published' },
	{ id: '3', title: 'Buka Puasa Bersama', category: 'Kegiatan', date: '2026-03-17', status: 'scheduled' },
	{ id: '4', title: 'Ramadhan 1446', category: 'Kegiatan', date: '2026-03-01', status: 'draft' },
];

const beritaData = [
	{ id: '1', title: 'Pembukaan Program Ramadhan 1446: Kepada Jamaah', category: 'Berita', date: '2026-03-12', excerpt: 'Masjid Baiturrahman membuka serangkaian kegiatan Ramadhan dengan buka puasa bersama untuk 500 jamaah.', author: 'Admin' },
	{ id: '2', title: 'Wisuda Tahfidz Angkatan ke-15', category: 'Kejadian', date: '2026-03-10', excerpt: '25 santri berhasil menyelesaikan hafalan 30 juz Al-Quran.', author: 'Admin' },
	{ id: '3', title: 'Kunjungan Pondok Pesantren', category: 'Kegiatan', date: '2026-03-08', excerpt: 'Menerima kunjungan dari pondok pesantren, membantu menyalurkan buku bacaan Quran.', author: 'Admin' },
];

const mimbarJumatData = [
	{ id: '1', tanggal: '2026-03-14', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Membangun Keluarga Sakinah di Era Digital', pdf: true },
	{ id: '2', tanggal: '2026-03-07', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Keadilan Hati dalam Beramal', pdf: true },
	{ id: '3', tanggal: '2026-02-28', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Adab Sopan Santun', pdf: true },
	{ id: '4', tanggal: '2026-02-21', khatib: 'Ust. Dr. Abdullah Hakim', tema: 'Keutamaan dalam Amal Shalih', pdf: true },
];

export default function KontenPage() {
	const [activeTab, setActiveTab] = useState<'events' | 'berita' | 'mimbar-jumat' | 'banner' | 'gallery'>('events');
	const [selectedContent, setSelectedContent] = useState<typeof eventsData[0] | null>(null);
	const [showEditorModal, setShowEditorModal] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false);

	const getTabData = () => {
		switch (activeTab) {
			case 'events': return eventsData;
			case 'berita': return beritaData;
			case 'mimbar-jumat': return mimbarJumatData;
			default: return [];
		}
	};

	return (
		<div className="space-y-6 p-6">
			{/* Sub-tabs */}
			<div className="flex flex-wrap items-center gap-2 mb-6 border-border rounded-lg bg-muted/30 p-1">
				<button
					onClick={() => setActiveTab('events')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'events' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Events
				</button>
				<button
					onClick={() => setActiveTab('berita')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'berita' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Berita
				</button>
				<button
					onClick={() => setActiveTab('mimbar-jumat')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'mimbar-jumat' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Mimbar Jumat
				</button>
				<button
					onClick={() => setActiveTab('banner')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'banner' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Banner
				</button>
				<button
					onClick={() => setActiveTab('gallery')}
					className={`px-6 py-3 rounded-md font-medium transition-colors ${activeTab === 'gallery' ? 'bg-background text-muted' : 'text-muted hover:bg-muted/50'}`}
				>
					Galeri
				</button>
			</div>

			{/* Events / Berita Tab */}
			{(activeTab === 'events' || activeTab === 'berita') && (
				<div>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">
							{activeTab === 'events' ? 'Events' : 'Berita'}
						</h2>
						<button className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ {activeTab === 'events' ? 'Tambah Event' : 'Tulis Berita'}
						</button>
					</div>

					{/* Two-column layout */}
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{/* List Items (60%) */}
						{getTabData().slice(0, 4).map((item) => (
							<div
								key={item.id}
								onClick={() => setSelectedContent(item)}
								className="border-border bg-background hover:bg-muted/30 transition-colors rounded-lg overflow-hidden cursor-pointer"
							>
								<div className="aspect-square bg-muted/50 p-4 flex items-center justify-center flex-shrink-0 mb-3">
									{activeTab === 'events' && <Image className="w-8 h-8 text-muted" />}
									<div className="text-2xl font-semibold text-foreground line-clamp-1">{item.title}</div>
								</div>
								<div className="p-4">
									<div className="flex items-center justify-between mb-2">
										<span className="px-2 py-1 text-xs font-medium tracking-widest text-muted uppercase">
											{item.category}
										</span>
										<span className="text-xs text-muted">{item.date}</span>
									</div>
									<p className="text-sm text-muted line-clamp-2">{item.excerpt}</p>
								</div>
							</div>
						))}

						{/* Featured Item (40%) */}
						<div className="md:col-span-2 lg:col-span-3">
							<div className="p-6 border-border bg-background rounded-lg">
								<div className="aspect-[16/9] bg-muted/50 mb-4 flex items-center justify-center">
									{activeTab === 'events' && <FileText className="w-12 h-12 text-muted" />}
									<div className="text-xs text-muted">Konten Utama</div>
								</div>
								<div>
									<div className="flex items-center gap-3 mb-3">
										<span className="px-2 py-1 text-xs font-medium tracking-widest text-muted uppercase">
											{selectedContent?.category}
										</span>
									</div>
									<h3 className="text-2xl font-semibold text-foreground">
										{activeTab === 'events' ? 'Kajian Rutin' : 'Pembukaan Program'}
									</h3>
								</div>
								<p className="text-foreground leading-relaxed mb-4">
									{selectedContent?.excerpt || 'Masjid Baiturrahman membuka serangkaian kegiatan Ramadhan dengan buka puasa bersama untuk 500 jamaah.'}
								</p>
								<div className="flex items-center gap-3 text-sm text-muted">
									<Calendar className="w-4 h-4" />
									<span>{selectedContent?.date || '2026-03-20'}</span>
									<span>•</span>
									<button className="text-muted hover:text-foreground">
										<MoreHorizontal className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
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

					{/* List */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{mimbarJumatData.slice(0, 3).map((khutbah, index) => (
							<div
								key={khutbah.id}
								className="border-border bg-background hover:bg-muted/30 transition-colors rounded-lg p-6"
							>
								<div className="flex items-center justify-between mb-4">
									<div>
										<div className="text-xs text-muted">{khutbah.tanggal}</div>
										<h3 className="text-lg font-semibold text-foreground">{khutbah.tema}</h3>
									</div>
									<StatusBadge status="success">
										Published
									</StatusBadge>
								</div>
							</div>

							<div className="space-y-2">
								<div className="text-sm text-muted">Khatib: {khutbah.khatib}</div>
								<div className="text-sm text-foreground">
									Imam: {khutbah.imam[0]}, {khutbah.imam[1] || '-'}
								</div>
								<div className="text-sm text-foreground">
									Muadzin: {khutbah.muadzin[0]}, {khutbah.muadzin[1] || '-'}
								</div>
							</div>

							<button className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors w-full py-3 px-4 rounded-md font-medium">
								<FileText className="w-4 h-4" />
								<span>Unduh PDF</span>
							</button>
						</div>
					))}
				</div>
			)}

			{/* Editor/Preview Modal */}
			{(showEditorModal || showPreviewModal) && selectedContent && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div
						onClick={() => {
							setShowEditorModal(false);
							setShowPreviewModal(false);
						}}
						className="absolute inset-0 bg-background/80"
					/>
					<div className="absolute top-1/2 left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[90vh] bg-background border-border rounded-lg shadow-xl overflow-y-auto">
						<div className="flex items-center justify-between border-b border-border p-4">
							<h3 className="text-lg font-semibold text-foreground">
								{showEditorModal ? 'Edit ' : 'Preview'} {activeTab === 'events' ? 'Event' : 'Berita'}
							</h3>
							<button onClick={() => { showEditorModal ? setShowEditorModal(false) : setShowPreviewModal(false) }} className="text-muted hover:text-foreground">
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Form / Preview */}
						{showEditorModal ? (
							<form className="p-6 space-y-4">
								<div>
									<label className="block text-sm text-muted mb-2">Judul</label>
									<input
										type="text"
										defaultValue={selectedContent.title}
										className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-muted mb-2">Kategori</label>
										<select
											defaultValue={selectedContent.category}
											className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										>
											{['Kajian', 'Berita', 'Kegiatan', 'Khutbah'].map(cat => (
												<option key={cat} value={cat}>{cat}</option>
											))}
										</select>
									</div>
									<div>
										<label className="block text-sm text-muted mb-2">Tanggal Terbit</label>
										<input
											type="date"
											defaultValue={selectedContent.date}
											className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm text-muted mb-2">Ringkasan</label>
									<textarea
										rows={4}
										defaultValue={selectedContent.excerpt}
										className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none resize-none"
									/>
								</div>
								<div className="flex gap-3 pt-4">
									<button type="submit" className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
										Simpan Draft
									</button>
									<button
										type="button"
										onClick={() => setShowEditorModal(false)}
										className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50"
									>
										Batal
									</button>
								</div>
							</form>
						) : (
							<div className="p-6">
								<div className="aspect-video bg-muted/50 mb-4 flex items-center justify-center">
									<FileText className="w-12 h-12 text-muted" />
								</div>
								<h3 className="text-2xl font-semibold text-foreground mb-4">{selectedContent.title}</h3>
								<div className="text-sm text-muted mb-2">{selectedContent.category} • {selectedContent.date}</div>
								<p className="text-foreground leading-relaxed mb-6">{selectedContent.excerpt}</p>
								<div className="bg-muted/30 p-4 rounded-md">
									<span className="text-sm text-muted">Status:</span>
									<div className="flex items-center gap-2 mt-2">
										<StatusBadge status={selectedContent.status === 'published' ? 'success' : 'draft'}>
											{selectedContent.status === 'published' ? 'Published' : 'Draft'}
										</StatusBadge>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
