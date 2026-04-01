'use client';

import { useState } from 'react';
import { ChevronDown, Edit, Check, X, UserPlus, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

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
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
				<TabsList className="h-auto gap-2 bg-muted/30 p-2">
					<TabsTrigger value="petugas-jumat">Petugas Jumat</TabsTrigger>
					<TabsTrigger value="imam-rawatib">Imam Rawatib</TabsTrigger>
					<TabsTrigger value="kajian-harian">Kajian Harian</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Petugas Jumat Tab */}
			<TabsContent value="petugas-jumat" className="mt-0">
				<div className="space-y-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Petugas Jumat</h2>
						<Button>
							Generate PDF Jadwal
						</Button>
					</div>

					<div className="p-6 border-border rounded-lg bg-background">
						<div className="grid grid-cols-7 gap-2 mb-4">
							{days.map((day, index) => (
								<div key={day} className="text-center">
									<div className="text-sm font-medium text-muted-foreground mb-2">{day}</div>
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
										<Button
											variant="ghost"
											onClick={() => setSelectedDay(null)}
										>
											Cancel
										</Button>
										<h3 className="text-lg font-semibold text-foreground">
											{selectedDay}
										</h3>
										<Button
											onClick={() => setShowAssignmentModal(true)}
											className="ml-auto"
										>
											Atur Petugas
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-5 gap-3 p-4 border-border rounded-lg">
									{prayerTimes.map((prayer) => (
										<div
											key={prayer.nama}
											className="flex flex-col items-center justify-center p-3 border-border rounded-md hover:bg-muted/30 transition-colors"
										>
											<div className="text-sm text-muted-foreground mb-1">{prayer.nama}</div>
											<div className="text-foreground font-semibold">{prayer.imam}</div>
											<div className="text-xs text-muted-foreground">{prayer.muadzin}</div>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			</TabsContent>

			{/* Imam Rawatib Tab */}
			<TabsContent value="imam-rawatib" className="mt-0">
				<div className="space-y-6">
					<Card>
						<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
							{prayerTimes.map((prayer) => (
								<div key={prayer.nama} className="space-y-3">
									<div className="flex items-center justify-between mb-2">
										<div className="text-foreground font-semibold">{prayer.nama}</div>
										<div className="flex gap-2">
											<button
												onClick={() => setShowAssignmentModal(true)}
												className="text-muted-foreground hover:text-foreground transition-colors p-1"
											>
												<Edit className="w-4 h-4" />
											</button>
											<button
												onClick={() => setShowAssignmentModal(true)}
												className="text-muted-foreground hover:text-foreground transition-colors p-1"
											>
												<UserPlus className="w-4 h-4" />
											</button>
										</div>
									</div>
									<div className="space-y-2">
										<div>
											<div className="text-sm text-muted-foreground">Imam</div>
											<div className="text-foreground">{prayer.imam}</div>
										</div>
										<div>
											<div className="text-sm text-muted-foreground">Muadzin</div>
											<div className="text-foreground">{prayer.muadzin}</div>
										</div>
									</div>
								</div>
							))}
						</div>
						</CardContent>
					</Card>
				</div>
			</TabsContent>

			{/* Kajian Harian Tab */}
			<TabsContent value="kajian-harian" className="mt-0">
				<div className="space-y-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-3xl font-semibold text-foreground">Kajian Harian</h2>
						<Button
							onClick={() => setShowKajianForm(true)}
						>
							+ Tambah Kajian
						</Button>
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
											<Clock className="w-5 h-5 text-muted-foreground" />
										</div>
										<div>
											<div className="text-lg font-semibold text-foreground">{kajian.nama}</div>
											<div className="text-sm text-muted-foreground">{kajian.kitab}</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<div className="text-sm text-muted-foreground">oleh {kajian.ustadz}</div>
										<button className="text-muted-foreground hover:text-foreground transition-colors p-1">
											<Edit className="w-4 h-4" />
										</button>
										<StatusBadge status={kajian.aktif ? 'success' : 'warning'}>
											{kajian.aktif ? 'Aktif' : 'Tidak Aktif'}
										</StatusBadge>
										<ChevronDown className="w-4 h-4 text-muted-foreground" />
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									<Check className="w-3 h-3 mr-1 inline" />
									{kajian.waktu}
								</div>
							</div>
						))}
					</div>

					{showKajianForm && (
						<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
							<button
								type="button"
								onClick={() => setShowKajianForm(false)}
								className="absolute inset-0 bg-background/80"
								aria-label="Tutup form kajian"
							/>
							<div className="absolute right-0 top-0 bottom-0 w-[480px] max-h-[90vh] bg-background border-border rounded-lg shadow-xl overflow-y-auto">
								<div className="p-6 border-b border-border">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-foreground">Tambah Kajian Baru</h3>
										<button onClick={() => setShowKajianForm(false)} className="text-muted-foreground hover:text-foreground">
											<X className="w-5 h-5" />
										</button>
									</div>
								</div>
								<form className="p-6 space-y-4">
									<div>
										<label htmlFor="nama-kajian" className="block text-sm text-muted-foreground mb-2">Nama Kajian</label>
										<input id="nama-kajian" type="text" placeholder="Contoh: Tafsir Al-Baqarah" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label htmlFor="kitab-kajian" className="block text-sm text-muted-foreground mb-2">Kitab</label>
											<select id="kitab-kajian" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none">
												<option value="Tafsir">Tafsir</option>
												<option value="Fiqh">Fiqh</option>
												<option value="Tasawuf">Tasawuf</option>
												<option value="Sirah">Sirah</option>
											</select>
										</div>
										<div>
											<label htmlFor="ustadz-kajian" className="block text-sm text-muted-foreground mb-2">Ustadz</label>
											<input id="ustadz-kajian" type="text" placeholder="Nama ustadz" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
										</div>
									</div>
									<div>
										<label htmlFor="jam-kajian" className="block text-sm text-muted-foreground mb-2">Jam Mulai</label>
										<input id="jam-kajian" type="time" className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
									</div>
								</form>
								<div className="flex gap-3 p-6 border-t border-border">
									<button type="submit" className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">Simpan</button>
									<button type="button" onClick={() => setShowKajianForm(false)} className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-muted text-muted-foreground hover:bg-muted/80">Batal</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</TabsContent>

			{/* Petugas Assignment Modal */}
			{showAssignmentModal && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<button
						type="button"
						onClick={() => setShowAssignmentModal(false)}
						className="absolute inset-0 bg-background/80"
						aria-label="Tutup modal petugas"
					/>
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] bg-background border-border rounded-lg shadow-xl">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-foreground">Atur Petugas Jumat</h3>
								<button onClick={() => setShowAssignmentModal(false)} className="text-muted-foreground hover:text-foreground">
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<div className="text-sm text-muted-foreground mb-2">Khatib Jumat</div>
									<input type="text" defaultValue={jumatSchedule.khatib} className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div>
									<div className="text-sm text-muted-foreground mb-2">Tema Khutbah</div>
									<input type="text" defaultValue={jumatSchedule.tema} className="w-full px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted-foreground w-16">Imam 1</div>
									<input type="text" defaultValue={jumatSchedule.imam[0]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted-foreground w-16">Imam 2</div>
									<input type="text" defaultValue={jumatSchedule.imam[1]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted-foreground w-16">Muadzin 1</div>
									<input type="text" defaultValue={jumatSchedule.muadzin[0]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
								<div className="flex items-center gap-3">
									<div className="text-sm text-muted-foreground w-16">Muadzin 2</div>
									<input type="text" defaultValue={jumatSchedule.muadzin[1]} className="flex-1 px-4 py-2 bg-background border-border text-foreground rounded-md outline-none" />
								</div>
							</div>
						</div>
						<div className="flex gap-3 p-6 border-t border-border">
							<button type="submit" className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">Simpan</button>
							<button type="button" onClick={() => setShowAssignmentModal(false)} className="flex-1 py-3 px-4 rounded-md font-medium transition-colors bg-muted text-muted-foreground hover:bg-muted/80">Batal</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
