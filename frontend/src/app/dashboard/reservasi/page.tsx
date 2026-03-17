'use client';

import { useState } from 'react';
import { Calendar, Clock, User, MapPin, CheckCircle2, Save, X, Search, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const rooms = [
	{ id: 'aula-utama', name: 'Aula Utama Masjid', capacity: 500, type: 'primary', color: 'bg-blue-500/10 text-blue-600' },
	{ id: 'lantai-utama-masjid', name: 'Lantai Utama Masjid', capacity: 300, type: 'primary', color: 'bg-green-500/10 text-green-600' },
	{ id: 'teras-koridor', name: 'Teras Koridor', capacity: 150, type: 'secondary', color: 'bg-orange-500/10 text-orange-600' },
	{ id: 'area-parkir', name: 'Area Parkir', capacity: 200, type: 'secondary', color: 'bg-purple-500/10 text-purple-600' },
];

const reservationsData = [
	{ id: '1', tanggal: '2026-03-20', pemohon: 'Ust. Ahmad Fauzi', instansi: 'Aula Utama', ruangan: 'aula-utama', waktu: '08:00 - 12:00', keperluan: '300 jamaah', status: 'disetujui' },
	{ id: '2', tanggal: '2026-03-21', pemohon: 'Siti Nurhaliza', instansi: 'lantai-utama-masjid', ruangan: 'lantai-utama-masjid', waktu: '09:00 - 11:00', keperluan: '50 jamaah', status: 'pending' },
	{ id: '3', tanggal: '2026-03-19', pemohon: 'Budi Setiawan', instansi: 'teras-koridor', ruangan: 'teras-koridor', waktu: '07:00 - 09:00', keperluan: '100 jamaah', status: 'pending' },
	{ id: '4', tanggal: '2026-03-18', pemohon: 'H. Ahmad Fauzi', instansi: 'aula-utama', ruangan: 'aula-utama', waktu: '16:00 - 17:00', keperluan: '200 jamaah', status: 'disetujui' },
];

export default function ReservasiPage() {
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedReservation, setSelectedReservation] = useState<typeof reservationsData[0] | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showNewModal, setShowNewModal] = useState(false);

	const getDaysInMonth = (year: number, month: number) => {
		const days = [];
		const date = new Date(year, month - 1, 1);
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

		for (let i = 0; i < 31; i++) {
			const day = new Date(date.getFullYear(), date.getMonth(), i).getDay();
			days.push(day);
		}

		return days;
	};

	const generateMonthData = () => {
		const year = new Date().getFullYear();
		const month = new Date().getMonth();
		const days = getDaysInMonth(year, month);
		const firstDay = new Date(year, month, 1).getDay();

		// Generate empty cells for padding before first day
		for (let i = 0; i < firstDay; i++) {
			days.unshift({ day: i, type: 'empty' });
		}

		// Split into weeks
		const weeks = [];
		let week = [];

		days.forEach((day, index) => {
			week.push(day);
			if (week.length === 7) {
				weeks.push(week);
				week = [];
			}
		});

		if (week.length > 0) {
			weeks.push(week);
		}

		return { weeks, year, month };
	};

	const getReservationsForDate = (dateString: string) => {
		return reservationsData.filter(r => r.tanggal === dateString);
	};

	return (
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-semibold text-foreground">Reservasi Ruangan</h2>
				<button className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
					+ Buat Reservasi Baru
				</button>
			</div>

			{/* Calendar + List */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Calendar */}
				<div className="border-border rounded-lg bg-background">
					<div className="p-4 border-b border-border flex items-center justify-between">
						<button
							onClick={() => {
								const prevMonth = new Date();
								prevMonth.setMonth(prevMonth.getMonth() - 1);
							}}
							className="p-1 text-muted hover:text-foreground transition-colors"
						>
							←
						</button>
						<div className="flex items-center gap-3">
							<button
								onClick={() => setSelectedDate(null)}
								className={`px-3 py-1 rounded-md transition-colors ${selectedDate ? 'bg-muted/30' : ''}`}
							>
								{selectedDate ? (
									<X className="w-4 h-4" />
								) : (
									<Calendar className="w-5 h-5 text-muted" />
								)}
							</button>
						<button
							onClick={() => {
								const nextMonth = new Date();
								nextMonth.setMonth(nextMonth.getMonth() + 1);
							}}
							className="p-1 text-muted hover:text-foreground transition-colors"
						>
							→
						</button>
						<div className="text-lg font-semibold text-foreground">
							{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
						</div>
						<button
							onClick={() => {
								const nextMonth = new Date();
								nextMonth.setMonth(nextMonth.getMonth() + 1);
							}}
							className="p-1 text-muted hover:text-foreground transition-colors"
						>
							→
						</button>
					</div>

					{/* Month Grid */}
					<div className="grid grid-cols-7 gap-1 p-4">
						{['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
							<div
								key={day}
								onClick={() => setSelectedDate(day.type === 'empty' ? null : `${year}-${day.day}`)}
								className={`
									aspect-square flex items-center justify-center p-2 rounded-lg transition-colors
									${selectedDate === `${year}-${day.day}` ? 'ring-2 ring-foreground/20' : 'hover:bg-muted/30'}
									${day.type === 'empty' ? 'opacity-50 pointer-events-none' : ''}
								`}
							>
								<span className="text-sm text-muted">{day.day}</span>
							</div>
						))}
					</div>
				</div>

				{/* Reservasi List */}
				<div className="border-border rounded-lg bg-background">
					<div className="p-4 border-b border-border">
						<h3 className="text-lg font-semibold text-foreground mb-4">
							{selectedDate ? (
								<>
									{new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
								</>
							) : (
								<span className="text-muted">Pilih tanggal untuk melihat reservasi</span>
							)}
						</h3>
					</div>

					<div className="overflow-y-auto max-h-[500px]">
						{selectedDate && getReservationsForDate(selectedDate).length > 0 ? (
							getReservationsForDate(selectedDate).map((reservasi) => (
								<div
									key={reservasi.id}
									onClick={() => setSelectedReservation(reservasi)}
									className={`
										p-4 border-b border-border
										hover:bg-muted/30 transition-colors
										cursor-pointer
										${selectedReservation?.id === reservasi.id ? 'bg-muted/50' : ''}
									`}
								>
									<div className="flex items-start justify-between mb-3">
										<div>
											<div className="text-sm text-muted mb-1">{reservasi.pemohon}</div>
											<div className="text-lg font-semibold text-foreground">{reservasi.pemohon.split(' ')[0]}</div>
										</div>
										<div className="text-xs text-muted">{reservasi.tanggal}</div>
									</div>

									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<div className="text-muted">Ruangan</div>
											<div className="text-foreground">{reservasi.ruangan}</div>
										</div>
										<div>
											<div className="text-muted">Waktu</div>
											<div className="text-foreground">{reservasi.waktu}</div>
										</div>
										<div>
											<div className="text-muted">Keperluan</div>
											<div className="text-foreground">{reservasi.keperluan}</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<StatusBadge status={reservasi.status}>
											{reservasi.status === 'disetujui' && 'Disetujui'}
											{reservasi.status === 'pending' && 'Pending'}
											{reservasi.status === 'selesai' && 'Selesai'}
										</StatusBadge>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-muted">
							<Calendar className="w-12 h-12 text-muted mb-2" />
							<p>Tidak ada reservasi untuk tanggal ini</p>
						</div>
					)}
				</div>

				{/* New Reservation Modal */}
				{showNewModal && (
					<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
						<div
							onClick={() => setShowNewModal(false)}
							className="absolute inset-0 bg-background/80"
						/>
						<div className="absolute right-0 top-0 bottom-0 w-[480px] max-h-[90vh] bg-background border-border rounded-lg shadow-xl overflow-y-auto">
							<div className="flex items-center justify-between border-b border-border p-4">
								<h3 className="text-lg font-semibold text-foreground">Buat Reservasi Baru</h3>
								<button onClick={() => setShowNewModal(false)} className="text-muted hover:text-foreground">
									<X className="w-5 h-5" />
								</button>
							</div>
							<form className="p-6 space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-muted mb-2">Nama Pemohon</label>
										<input
											type="text"
											placeholder="Nama lengkap"
											className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
									<div>
										<label className="block text-sm text-muted mb-2">No. HP</label>
										<input
											type="tel"
											placeholder="+62 xxx xxxx xxxx"
											className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-muted mb-2">Tanggal</label>
										<input
											type="date"
											className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
										/>
									</div>
									<div>
										<label className="block text-sm text-muted mb-2">Waktu</label>
										<div className="flex gap-2">
											<input
												type="time"
												placeholder="08:00"
												className="px-3 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none w-24"
											/>
											<span className="text-muted">-</span>
											<input
												type="time"
												placeholder="12:00"
												className="px-3 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none w-24"
											/>
										</div>
									</div>
								</div>

								<div className="mb-4">
									<label className="block text-sm text-muted mb-2">Ruangan</label>
									<select className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none">
										{rooms.map(room => (
											<option key={room.id} value={room.id}>{room.name} ({room.capacity})</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm text-muted mb-2">Keperluan (Perkiraan)</label>
									<input
										type="number"
										placeholder="100"
										className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none"
									/>
								</div>

								<div className="mb-4">
									<label className="block text-sm text-muted mb-2">Catatan</label>
									<textarea
										rows={3}
										placeholder="Tambahkan catatan jika perlu..."
										className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none resize-none"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4 pt-4">
									<button type="submit" className="py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
										Buat Reservasi
									</button>
									<button
										type="button"
										onClick={() => setShowNewModal(false)}
										className="py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50"
									>
										Batal
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Detail Modal */}
				{showDetailModal && selectedReservation && (
					<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
						<div
							onClick={() => setShowDetailModal(false)}
							className="absolute inset-0 bg-background/80"
						/>
						<div className="absolute right-0 top-0 bottom-0 w-[480px] max-h-[90vh] bg-background border-border rounded-lg shadow-xl overflow-y-auto">
							<div className="flex items-center justify-between border-b border-border p-4">
								<h3 className="text-lg font-semibold text-foreground">Detail Reservasi</h3>
								<button onClick={() => setShowDetailModal(false)} className="text-muted hover:text-foreground">
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Room Badge */}
							<div className="mb-6 p-4 rounded-lg bg-muted/30">
								<div className="flex items-center gap-2 mb-2">
									<div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: rooms.find(r => r.id === selectedReservation.ruangan)?.color || 'bg-gray-500/10 text-gray-600' }}>
										<MapPin className="w-5 h-5 text-[10px]" />
									</div>
									<div className="flex-1">
										<div className="text-sm text-muted mb-1">Ruangan</div>
										<div className="text-foreground">{rooms.find(r => r.id === selectedReservation.ruangan)?.name || '-'}</div>
									</div>
								</div>
								<div className="text-sm text-muted">Kapasitas: {rooms.find(r => r.id === selectedReservation.ruangan)?.capacity || '-'}</div>
							</div>

							{/* Pemohon Info */}
							<div className="space-y-4">
								<div>
									<div className="text-sm text-muted mb-2">Nama Pemohon</div>
									<div className="text-lg font-semibold text-foreground">{selectedReservation.pemohon}</div>
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<div className="text-muted">Tanggal</div>
										<div className="text-foreground">{selectedReservation.tanggal}</div>
									</div>
									<div>
										<div className="text-muted">Waktu</div>
										<div className="text-foreground">{selectedReservation.waktu}</div>
									</div>
								</div>

								<div>
									<div className="text-sm text-muted mb-2">Keperluan</div>
									<div className="text-foreground">{selectedReservation.keperluan}</div>
								</div>

								{selectedReservation.status !== 'selesai' && (
									<div className="p-4 border-border rounded-lg bg-warning/10 text-warning">
										<div className="flex items-center gap-2 mb-2">
											<Clock className="w-5 h-5 text-[10px]" />
											<span>Pending review</span>
										</div>
									</div>
								)}

								{selectedReservation.status === 'selesai' && (
									<div className="p-4 border-border rounded-lg bg-success/10 text-success">
										<div className="flex items-center gap-2">
											<CheckCircle2 className="w-5 h-5 text-[10px]" />
											<span>Reservasi disetujui</span>
										</div>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 p-6 border-t border-border">
								<button
									onClick={() => {
										console.log('Approve reservation:', selectedReservation.id);
									}}
									className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-success text-background hover:bg-success/90 disabled:opacity-50"
									disabled={selectedReservation.status !== 'pending'}
								>
									Setujui
								</button>
								<button
									onClick={() => setShowDetailModal(false)}
									className="py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50"
								>
									Tutup
								</button>
							</div>

							{/* Approval Notes */}
							<div className="pt-4">
								<label className="block text-sm text-muted mb-2">Catatan Persetujuan</label>
								<textarea
									rows={3}
									placeholder="Tambahkan catatan untuk persetujuan..."
									className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md focus:border-foreground focus:ring-1 focus:ring-foreground/20 outline-none resize-none"
									disabled={selectedReservation.status !== 'pending'}
								/>
							</div>

							<div className="flex gap-3">
								<button
									onClick={() => {
										console.log('Save notes:', selectedReservation.id);
									}}
									className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90 disabled:opacity-50"
									disabled={selectedReservation.status !== 'pending'}
								>
									Simpan Catatan
								</button>
								{selectedReservation.status !== 'pending' && (
									<button
										onClick={() => {
											console.log('Reject reservation:', selectedReservation.id);
											setShowDetailModal(false);
										}}
										className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-destructive text-background hover:bg-destructive/90"
									>
										Ditolak
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			)}
		</div>
	);
}
