'use client';

import { useState } from 'react';
import { ChevronDown, Edit, Check, X, UserPlus, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

const prayerTimes = [
	{ nama: 'Subuh', imam: 'H. Ahmad Faishal', muadzin: 'Budi Santoso' },
	{ nama: 'Dzuhur', imam: 'Ust. Ahmad Faishal', muadzin: 'Budi Santoso' },
	{ nama: 'Ashar', imam: 'Ust. Zainuddin Al-Hafidz', muadzin: 'Budi Santoso' },
	{ nama: 'Maghrib', imam: 'Ust. Yusuf Al-Amin', muadzin: 'Ust. Zainuddin Al-Hafidz' },
	{ nama: 'Isya', imam: 'Ust. Yusuf Al-Amin', muadzin: 'Ust. Zainuddin Al-Hafidz' },
];

const kajianHarian = [
	{ id: '1', nama: 'Tafsir Al-Baqarah', kitab: 'Tafsir', ustadz: 'Ust. Dr. Abdullah Hakim', waktu: 'Senin, 19:30', aktif: true },
	{ id: '2', nama: 'Fiqh Ibadah', kitab: 'Fiqh', ustadz: 'Ust. Zainuddin', waktu: 'Rabu, 20:00', aktif: true },
	{ id: '3', nama: 'Sirah Nabawiyah', kitab: 'Sirah', ustadz: 'Ust. Ahmad Fauzi', waktu: 'Kamis, 04:30', aktif: false },
	{ id: '4', nama: 'Tasawuf', kitab: 'Tasawuf', ustadz: 'Ust. Zainuddin', waktu: 'Jumat, 16:00', aktif: true },
];

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function JadwalPage() {
	const [activeTab, setActiveTab] = useState<'petugas-jumat' | 'imam-rawatib' | 'kajian-harian'>('petugas-jumat');
	const [selectedDay, setSelectedDay] = useState<string | null>(null);
	const [showAssignmentModal, setShowAssignmentModal] = useState(false);
	const [showKajianForm, setShowKajianForm] = useState(false);

	const jumatSchedule = {
		khatib: 'Ust. Dr. Abdullah Hakim',
		imam: ['H. Ahmad Faishal, Lc.', 'Ust. Ahmad Fauzi'],
		muadzin: ['Budi Santoso', 'Ust. Zainuddin'],
		tema: 'Membangun Keluarga Sakinah di Era Digital',
	};

	return (
		<div className="space-y-6 p-6">
			{/* Tabs */}
			<div className="flex border-border rounded-lg bg-muted/30">
				<button
					onClick={() => setActiveTab('petugas-jumat')}
					className={`px-6 py-3 font-medium transition-colors ${activeTab === 'petugas-jumat' ? 'bg-background' : ''}`}
				>
					Petugas Jumat
				</button>
				<button
					onClick={() => setActiveTab('imam-rawatib')}
					className={`px-6 py-3 font-medium transition-colors ${activeTab === 'imam-rawatib' ? 'bg-background' : ''}`}
				>
					Imam Rawatib
				</button>
				<button
					onClick={() => setActiveTab('kajian-harian')}
					className={`px-6 py-3 font-medium transition-colors ${activeTab === 'kajian-harian' ? 'bg-background' : ''}`}
				>
					Kajian Harian
				</button>
			</div>

			{/* Petugas Jumat Tab */}
			{activeTab === 'petugas-jumat' && (
				<div className="space-y-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Petugas Jumat</h2>
						<button className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							Generate PDF Jadwal
						</button>
					</div>

					<div className="p-6 border-border rounded-lg bg-background">
						<div className="grid grid-cols-7 gap-2 mb-4">
							{days.map((day, index) => (
								<div key={day} className="text-center">
									<div className="text-sm font-medium text-muted mb-2">{day}</div>
									<button
										onClick={() => setSelectedDay(index < 5 ? `${day} ${index + 1}` : null)}
										className={`
											p-2 rounded-md transition-colors
											${index >= 5 ? 'opacity-50 pointer-events-none' : 'hover:bg-muted/50'}
											${selectedDay?.includes(day) ? 'bg-muted/50' : ''}
										`}
									>
										{index < 5 && <div className="text-lg text-foreground">{index + 1}</div>}
									</button>
								</div>
							))}
						</div>

						{selectedDay && (
							<>
								<div className="mt-6">
									<div className="flex items-center gap-3 mb-4">
										<button
											onClick={() => setSelectedDay(null)}
											className="p-2 text-muted hover:text-foreground transition-colors"
										>
											Cancel
										</button>
										<h3 className="text-lg font-semibold text-foreground">
											{selectedDay}
										</h3>
										<button
											onClick={() => setShowAssignmentModal(true)}
											className="ml-auto p-2 bg-foreground text-background rounded-md font-medium transition-colors hover:bg-muted/90"
										>
											Atur Petugas
										</button>
									</div>
								</div>

								<div className="grid grid-cols-5 gap-3 p-4 border-border rounded-lg">
									{prayerTimes.map((prayer) => (
										<div
											key={prayer.nama}
											className="flex flex-col items-center justify-center p-3 border-border rounded-md hover:bg-muted/30 transition-colors"
										>
											<div className="text-sm text-muted mb-1">{prayer.nama}</div>
											<div className="text-foreground font-semibold">{prayer.imam}</div>
											<div className="text-xs text-muted">{prayer.muadzin}</div>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			)}

			{/* Imam Rawatib Tab */}
			{activeTab === 'imam-rawatib' && (
				<div className="space-y-6">
					<div className="p-6 border-border rounded-lg bg-background">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
							{prayerTimes.map((prayer) => (
								<div key={prayer.nama} className="space-y-3">
									<div className="flex items-center justify-between mb-2">
										<div className="text-foreground font-semibold">{prayer.nama}</div>
										<div className="flex gap-2">
											<button
												onClick={() => setShowAssignmentModal(true)}
												className="text-muted hover:text-foreground transition-colors p-1"
											>
												<Edit className="w-4 h-4" />
											</button>
											<button
												onClick={() => setShowAssignmentModal(true)}
												className="text-muted hover:text-foreground transition-colors p-1"
											>
												<UserPlus className="w-4 h-4" />
											</button>
										</div>
									</div>
									<div className="space-y-2">
										<div>
											<div className="text-sm text-muted">Imam</div>
											<div className="text-foreground">{prayer.imam}</div>
										</div>
										<div>
											<div className="text-sm text-muted">Muadzin</div>
											<div className="text-foreground">{prayer.muadzin}</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Kajian Harian Tab */}
			{activeTab === 'kajian-harian' && (
				<div className="space-y-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Kajian Harian</h2>
						<button
							onClick={() => setShowKajianForm(true)}
							className="px-4 py-2 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90"
						>
							+ Tambah Kajian
						</button>
					</div>

					<div className="space-y-4">
						{kajianHarian.map((kajian) => (
							<div
								key={kajian.id}
								className="p-6 border-border rounded-lg bg-background hover:bg-muted/30 transition-colors"
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
											<Clock className="w-5 h-5 text-muted" />
										</div>
										<div>
											<div className="text-lg font-semibold text-foreground">{kajian.nama}</div>
											<div className="text-sm text-muted">{kajian.kitab}</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className="text-sm text-muted">oleh {kajian.ustadz}</div>
										<button className="text-muted hover:text-foreground transition-colors p-1">
											<Edit className="w-4 h-4" />
										</button>
										<StatusBadge status={kajian.aktif ? 'success' : 'warning'}>
											{kajian.aktif ? 'Aktif' : 'Tidak Aktif'}
										</StatusBadge>
										<ChevronDown className="w-4 h-4 text-muted" />
									</div>
								</div>
								<div className="text-sm text-muted">
									<Check className="w-3 h-3 mr-1 inline" />
									{kajian.waktu}
								</div>
							</div>
						))}
					</div>

					{showKajianForm && (
						<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
							<div onClick={() => setShowKajianForm(false)} className="absolute inset-0 bg-background/80" />
							<div className="absolute right-0 top-0 bottom-0 w-[480px] max-h-[90vh] bg-background border-border rounded-lg shadow-xl overflow-y-auto">
								<div className="p-6 border-b border-border">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-foreground">Tambah Kajian Baru</h3>
										<button onClick={() => setShowKajianForm(false)} className="text-muted hover:text-foreground">
											<X className="w-5 h-5" />
										</button>
									</div>
								</div>
								<form className="p-6 space-y-4">
									<div>
										<label className="block text-sm text-muted mb-2">Nama Kajian</label>
										<input type="text" placeholder="Contoh: Tafsir Al-Baqarah" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm text-muted mb-2">Kitab</label>
											<select className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none">
												<option value="Tafsir">Tafsir</option>
												<option value="Fiqh">Fiqh</option>
												<option value="Tasawuf">Tasawuf</option>
												<option value="Sirah">Sirah</option>
											</select>
										</div>
										<div>
											<label className="block text-sm text-muted mb-2">Ustadz</label>
											<input type="text" placeholder="Nama ustadz" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
										</div>
									</div>
									<div>
										<label className="block text-sm text-muted mb-2">Jam Mulai</label>
										<input type="time" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
									</div>
								</form>
								<div className="flex gap-3 p-6 border-t border-border">
									<button type="submit" className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">Simpan</button>
									<button type="button" onClick={() => setShowKajianForm(false)} className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">Batal</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Petugas Assignment Modal */}
			{showAssignmentModal && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div onClick={() => setShowAssignmentModal(false)} className="absolute inset-0 bg-background/80" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-background border-border rounded-lg shadow-xl">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-foreground">Atur Petugas Jumat</h3>
								<button onClick={() => setShowAssignmentModal(false)} className="text-muted hover:text-foreground">
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<div className="text-sm text-muted mb-2">Khatib Jumat</div>
									<input type="text" defaultValue={jumatSchedule.khatib} className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div>
									<div className="text-sm text-muted mb-2">Tema Khutbah</div>
									<input type="text" defaultValue={jumatSchedule.tema} className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted w-16">Imam 1</div>
									<input type="text" defaultValue={jumatSchedule.imam[0]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted w-16">Imam 2</div>
									<input type="text" defaultValue={jumatSchedule.imam[1]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted w-16">Muadzin 1</div>
									<input type="text" defaultValue={jumatSchedule.muadzin[0]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted w-16">Muadzin 2</div>
									<input type="text" defaultValue={jumatSchedule.muadzin[1]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
							</div>
						</div>
						<div className="flex gap-3 p-6 border-t border-border">
							<button type="submit" className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">Simpan</button>
							<button type="button" onClick={() => setShowAssignmentModal(false)} className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">Batal</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
