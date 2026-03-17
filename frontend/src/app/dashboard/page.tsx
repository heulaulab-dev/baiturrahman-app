'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart3, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

const statsData = [
	{
		label: 'Total Donasi Bulan Ini',
		value: 'Rp 47.250.000',
		trend: 'up',
		badge: '+12%',
	},
	{
		label: 'Anggota Aktif',
		value: '1.247',
		trend: 'up',
		badge: '+34 bln',
	},
	{
		label: 'Kajian Terjadwal',
		value: '8',
		trend: null,
		badge: 'minggu ini',
	},
	{
		label: 'Reservasi Pending',
		value: '3',
		trend: null,
		badge: 'butuh konfirmasi',
	},
];

const recentActivity = [
	{
		icon: 'wallet',
		text: 'Ahmad Fauzi baru menambah donasi Rp 500.000',
		time: '3 menit lalu',
		action: 'View Details',
	},
	{
		icon: 'user-plus',
		text: 'Siti Nurhaliza terdaftar sebagai anggota baru',
		time: '5 menit lalu',
		action: 'View Profile',
	},
	{
		icon: 'calendar-plus',
		text: 'Jadwal Kajian baru ditambahkan: Ustadz Abdullah',
		time: '15 menit lalu',
		action: 'Edit',
	},
	{
		icon: 'file-plus',
		text: 'Berita baru: Pembukaan Program Ramadhan',
		time: '1 jam lalu',
		action: 'Edit',
	},
];

const upcomingKajian = [
	{ day: 'Senin', date: '17', kajian: ['Tafsir Al-Fatihah (19:30)'] },
	{ day: 'Selasa', date: '18', kajian: ['Fiqh Ibadah (20:00)'] },
	{ day: 'Rabu', date: '19', kajian: ['Tasawuf (04:30)'] },
	{ day: 'Kamis', date: '20', kajian: ['Tafsir (04:30)'] },
	{ day: 'Jumat', date: '21', kajian: [] },
	{ day: 'Sabtu', date: '22', kajian: ['Fiqh Sholat (16:00)'] },
	{ day: 'Minggu', date: '23', kajian: ['Khutbah Jumat (13:00)'] },
];

const jumatSchedule = {
	khatib: 'Ust. Dr. Abdullah Hakim',
	imam: ['H. Ahmad Faishal, Lc.', 'Ust. Ahmad Fauzi'],
	muadzin: ['Budi Santoso', 'Ust. Zainuddin'],
	tema: 'Membangun Keluarga Sakinah di Era Digital',
};

export default function DashboardPage() {
	const [selectedKajianDay, setSelectedKajianDay] = useState<string | null>(null);
	const [stats, setStats] = useState(statsData);

	// Animate numbers on mount
	useEffect(() => {
		const targets = stats.map(stat => parseInt(stat.value.replace(/\D/g, '')));
		stats.forEach((stat, index) => {
			const current = 0;
			const target = targets[index];
			const duration = 2000;
			const increment = target / 50;

			const interval = setInterval(() => {
				if (current < target) {
					const next = Math.min(current + increment, target);
					// Update display
					const element = document.getElementById(`stat-${index}`);
					if (element) {
						element.textContent = stat.value.replace(/\d(?=\d+)/, (m, d => Math.floor(m / 1000).toLocaleString('id-ID')));
					}
					current = next;
				} else {
					clearInterval(interval);
				}
			}, 50);

			return () => clearInterval(interval);
		});

		return () => {
			intervals.forEach(clear => c());
		};
	}, []);

	return (
		<div className="space-y-6 p-6">
			{/* Stats Row */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat, index) => (
					<StatCard
						key={stat.label}
						label={stat.label}
						value={stat.value}
						trend={stat.trend}
						badge={stat.badge}
					/>
				))}
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left: Donation Chart */}
				<div className="col-span-1 lg:col-span-2 p-6 border-border bg-muted/30">
					<h3 className="text-lg font-semibold text-foreground mb-4">Donasi Bulan Ini</h3>

					{/* SVG Area Chart */}
					<svg viewBox="0 0 400 200" className="w-full h-64">
						<defs>
							<linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse">
								<stop offset="0%" stopColor="#f5f5f7" stopOpacity="0.3" />
								<stop offset="100%" stopColor="#f5f5f7" stopOpacity="0.1" />
							</linearGradient>
						</defs>
						{/* Grid lines */}
						<g stroke="#e5e7eb" strokeWidth="1">
							{[0, 50, 100, 150, 200, 250, 300, 350, 400].map((y, i) => (
								<line key={i} x1="0" y1={y} x2="400" y2={y} strokeDasharray="4 4" />
							))}
						</g>

						{/* Area fill - animated on load */}
						<path
							d="M0,200 Q100,50 200,0 T200,0 Q200,50 200,0 T200,50 200,0 T200,100 200,100 T200,100 200,200 200,200 T200,200 200,200 T200,200 200,200 T200,200 200,100 T200,100 200,0 T300,0 Q300,50 300,0 T300,50 300,100 300,100 300,200 300,200 300,200 300,200 300,200 300,200 300,200 300,200 300,200 300,200 300,200 300,100 400,0 Q400,50 400,0 T400,50 400,100 400,100 400,100 400,100 400,200 400,200 400,200 400,200 400,200 400,200 400,200 400,200"
							fill="url(#chartGradient)"
							className="opacity-0 animate-[drawPath_2s_ease-out_forwards]"
						/>
					</svg>

					{/* Hover tooltip - simplified version */}
					<div className="mt-4 flex justify-between text-xs text-muted">
						<div>
							<span>30 Hari Terakhir</span>
							<span>•</span>
						</div>
						<div>
							<span>Total:</span>
							<span>Rp 47.250.000</span>
						</div>
					</div>
				</div>

				{/* Right: Activity Feed */}
				<div className="col-span-1">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-foreground">Aktivitas Terbaru</h3>
						<button className="text-sm text-muted hover:text-foreground">Lihat Semua →</button>
					</div>

					<div className="space-y-3">
						{recentActivity.map((activity) => (
							<div
								key={activity.text}
								className="flex items-start gap-3 p-3 border-border hover:bg-muted/30 rounded-md transition-colors"
							>
								<div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
									{activity.icon === 'wallet' && <BarChart3 className="w-4 h-4 text-muted" />}
									{activity.icon === 'user-plus' && <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center">
										<Plus className="w-4 h-4 text-[10px]" />
									</div>}
									{activity.icon === 'calendar-plus' && <ArrowUp className="w-4 h-4 text-muted" />}
									{activity.icon === 'file-plus' && <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center">
										<Plus className="w-4 h-4 text-[10px]" />
									</div>}
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-foreground">{activity.text}</p>
									<div className="flex items-center gap-2 text-xs text-muted">
										<span>{activity.time}</span>
										<span>•</span>
										<button className="text-accent hover:text-foreground transition-colors">
											{activity.action}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Quick Actions Panel */}
					<div className="mt-6 space-y-2">
						<button className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Catat Donasi
						</button>
						<button className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Tambah Anggota
						</button>
						<button className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Jadwal Kajian
						</button>
						<button className="w-full py-3 px-4 rounded-md font-medium transition-colors bg-foreground text-background hover:bg-muted/90">
							+ Tulis Berita
						</button>
					</div>
				</div>
			</div>

			{/* Bottom Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
				{/* Jadwal Kajian Minggu Ini */}
				<div className="p-6 border-border bg-muted/30">
					<h3 className="text-lg font-semibold text-foreground mb-4">Jadwal Kajian Minggu Ini</h3>

					<div className="flex gap-4 overflow-x-auto pb-2">
						{upcomingKajian.map((day) => (
							<div
								key={day.day}
								onClick={() => setSelectedKajianDay(day.day)}
								className={`
									flex-shrink-0 flex flex-col items-center
									${selectedKajianDay === day.day ? 'bg-muted/50 rounded-md' : ''}
								`}
							>
								<div className="text-sm font-medium text-muted mb-2">{day.day}</div>
								{day.kajian.map((kajian, k) => (
									<div
										key={k}
										className="p-2 border-border rounded text-xs text-foreground whitespace-nowrap"
									>
										{kajian}
									</div>
								))}
							</div>
						))}
					</div>
				</div>

				{/* Petugas Jumat Minggu Ini */}
				<div className="p-6 border-border bg-muted/30">
					<h3 className="text-lg font-semibold text-foreground mb-4">Petugas Jumat Minggu Ini</h3>

					<div className="space-y-4">
						<div className="border-l-2 border-border pl-4">
							<div className="text-sm text-muted mb-2">Khatib</div>
							<div className="text-lg font-semibold text-foreground">{jumatSchedule.khatib}</div>
						</div>

						<div className="border-l-2 border-border pl-4">
							<div className="text-sm text-muted mb-2">Imam</div>
							<div className="flex flex-wrap gap-2">
								{jumatSchedule.imam.map((imam, i) => (
									<span key={i} className="text-foreground">{imam}</span>
								))}
							</div>
						</div>

						<div className="border-l-2 border-border pl-4">
							<div className="text-sm text-muted mb-2">Muadzin</div>
							<div className="flex flex-wrap gap-2">
								{jumatSchedule.muadzin.map((muadzin, i) => (
									<span key={i} className="text-foreground">{muadzin}</span>
								))}
							</div>
						</div>

						<div className="border-l-2 border-border pl-4">
							<div className="text-sm text-muted mb-2">Tema Khutbah</div>
							<div className="text-foreground">{jumatSchedule.tema}</div>
						</div>
					</div>

					<button className="w-full mt-4 py-3 px-4 rounded-md font-medium transition-colors bg-muted/30 text-muted hover:bg-muted/50">
						Generate PDF Jadwal
					</button>
				</div>
			</div>

			<style jsx global>{`
				@keyframes drawPath {
					0% {
						stroke-dasharray: 0, 1000;
						stroke-dashoffset: 1000;
					}
					100% {
						stroke-dasharray: 1000, 0;
						stroke-dashoffset: 0;
					}
				}
			`}</style>
		</div>
	);
}
