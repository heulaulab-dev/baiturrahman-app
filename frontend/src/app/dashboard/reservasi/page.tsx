'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, X } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const rooms = [
	{ id: 'aula-utama', name: 'Aula Utama Masjid', capacity: 500 },
	{ id: 'lantai-utama-masjid', name: 'Lantai Utama Masjid', capacity: 300 },
	{ id: 'teras-koridor', name: 'Teras Koridor', capacity: 150 },
	{ id: 'area-parkir', name: 'Area Parkir', capacity: 200 },
];

const reservationsData = [
	{ id: '1', tanggal: '2026-03-20', pemohon: 'Ust. Ahmad Fauzi', ruangan: 'aula-utama', waktu: '08:00 - 12:00', keperluan: '300 jamaah', status: 'disetujui' },
	{ id: '2', tanggal: '2026-03-21', pemohon: 'Siti Nurhaliza', ruangan: 'lantai-utama-masjid', waktu: '09:00 - 11:00', keperluan: '50 jamaah', status: 'pending' },
	{ id: '3', tanggal: '2026-03-19', pemohon: 'Budi Setiawan', ruangan: 'teras-koridor', waktu: '07:00 - 09:00', keperluan: '100 jamaah', status: 'pending' },
	{ id: '4', tanggal: '2026-03-18', pemohon: 'H. Ahmad Fauzi', ruangan: 'aula-utama', waktu: '16:00 - 17:00', keperluan: '200 jamaah', status: 'disetujui' },
];

export default function ReservasiPage() {
	const [selectedReservation, setSelectedReservation] = useState<typeof reservationsData[0] | null>(null);
	const [showNewModal, setShowNewModal] = useState(false);

	function getRoomName(id: string) {
		return rooms.find(r => r.id === id)?.name ?? id;
	}

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Reservasi Ruangan</h2>
				<button
					onClick={() => setShowNewModal(true)}
					className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90"
				>
					+ Buat Reservasi Baru
				</button>
			</div>

			{/* Reservations List */}
			<div className="border border-border bg-background rounded-lg overflow-hidden">
				<div className="grid grid-cols-[1fr_160px_120px_120px_100px_80px] bg-muted/30 h-10 items-center px-4 text-xs font-medium tracking-wider text-muted uppercase">
					<div>Pemohon</div>
					<div>Ruangan</div>
					<div>Tanggal</div>
					<div>Waktu</div>
					<div>Keperluan</div>
					<div className="text-center">Status</div>
				</div>
				{reservationsData.map((reservasi) => (
					<div
						key={reservasi.id}
						onClick={() => setSelectedReservation(reservasi)}
						className={`grid grid-cols-[1fr_160px_120px_120px_100px_80px] border-t border-border h-14 items-center px-4 text-sm hover:bg-muted/30 transition-colors cursor-pointer ${selectedReservation?.id === reservasi.id ? 'bg-muted/20' : ''}`}
					>
						<div className="text-foreground font-medium">{reservasi.pemohon}</div>
						<div className="text-muted text-xs">{getRoomName(reservasi.ruangan)}</div>
						<div className="text-muted text-xs">{reservasi.tanggal}</div>
						<div className="text-muted text-xs">{reservasi.waktu}</div>
						<div className="text-muted text-xs">{reservasi.keperluan}</div>
						<div className="flex justify-center">
							<StatusBadge status={reservasi.status === 'disetujui' ? 'success' : 'warning'}>
								{reservasi.status === 'disetujui' ? 'Disetujui' : 'Pending'}
							</StatusBadge>
						</div>
					</div>
				))}
			</div>

			{/* Detail Panel */}
			{selectedReservation && (
				<div className="border border-border rounded-lg bg-background p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-foreground">Detail Reservasi</h3>
						<button onClick={() => setSelectedReservation(null)} className="text-muted hover:text-foreground">
							<X className="w-5 h-5" />
						</button>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<div className="text-muted mb-1">Pemohon</div>
							<div className="text-foreground font-medium">{selectedReservation.pemohon}</div>
						</div>
						<div>
							<div className="text-muted mb-1">Ruangan</div>
							<div className="text-foreground">{getRoomName(selectedReservation.ruangan)}</div>
						</div>
						<div>
							<div className="text-muted mb-1">Tanggal</div>
							<div className="text-foreground">{selectedReservation.tanggal}</div>
						</div>
						<div>
							<div className="text-muted mb-1">Waktu</div>
							<div className="text-foreground">{selectedReservation.waktu}</div>
						</div>
					</div>
					{selectedReservation.status === 'pending' && (
						<div className="flex gap-3 mt-6">
							<button className="py-2.5 px-6 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-foreground/90 text-sm">
								Setujui
							</button>
							<button className="py-2.5 px-6 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50 text-sm">
								Tolak
							</button>
						</div>
					)}
				</div>
			)}

			{/* New Reservation Modal */}
			{showNewModal && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div onClick={() => setShowNewModal(false)} className="absolute inset-0 bg-background/80" />
					<div className="absolute right-0 top-0 bottom-0 w-[480px] bg-background border-l border-border shadow-xl overflow-y-auto">
						<div className="flex items-center justify-between border-b border-border p-4">
							<h3 className="text-lg font-semibold text-foreground">Buat Reservasi Baru</h3>
							<button onClick={() => setShowNewModal(false)} className="text-muted hover:text-foreground">
								<X className="w-5 h-5" />
							</button>
						</div>
						<form className="p-6 space-y-4">
							<div>
								<label className="block text-sm text-muted mb-2">Nama Pemohon</label>
								<input type="text" placeholder="Nama lengkap" className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-md outline-none" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm text-muted mb-2">Tanggal</label>
									<input type="date" className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-md outline-none" />
								</div>
								<div>
									<label className="block text-sm text-muted mb-2">Waktu</label>
									<div className="flex items-center gap-2">
										<input type="time" className="flex-1 px-3 py-2 bg-background border border-border text-foreground rounded-md outline-none" />
										<span className="text-muted">-</span>
										<input type="time" className="flex-1 px-3 py-2 bg-background border border-border text-foreground rounded-md outline-none" />
									</div>
								</div>
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Ruangan</label>
								<select className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-md outline-none">
									{rooms.map(room => (
										<option key={room.id} value={room.id}>{room.name} ({room.capacity})</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm text-muted mb-2">Catatan</label>
								<textarea rows={3} placeholder="Tambahkan catatan..." className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-md outline-none resize-none" />
							</div>
							<div className="flex gap-3 pt-4">
								<button type="submit" className="flex-1 py-3 px-4 rounded-md font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors">Buat Reservasi</button>
								<button type="button" onClick={() => setShowNewModal(false)} className="flex-1 py-3 px-4 rounded-md font-medium bg-muted/30 text-muted hover:bg-muted/50 transition-colors">Batal</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
