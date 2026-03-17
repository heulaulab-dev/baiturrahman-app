'use client';

import { Building2, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';

const quickLinks = {
	Tentang: ['Tentang Kami', 'Sejarah', 'Visi Misi', 'Struktur Organisasi'],
	Jadwal: ['Jadwal Sholat', 'Jadwal Kajian', 'Khutbah Jumat'],
	Layanan: ['Zakat & Wakaf', 'Muallaf Center', 'Reservasi', 'Perpustakaan'],
};

const prayerTimes = [
	{ name: 'Subuh', time: '04:32' },
	{ name: 'Dzuhur', time: '12:04' },
	{ name: 'Ashar', time: '15:21' },
	{ name: 'Maghrib', time: '18:03' },
	{ name: 'Isya', time: '19:15' },
];

const socialLinks = [
	{ icon: Instagram, href: 'https://instagram.com/baiturrahman' },
	{ icon: Youtube, href: 'https://youtube.com/baiturrahman' },
	{ icon: Facebook, href: 'https://facebook.com/baiturrahman' },
	{ icon: Twitter, href: 'https://twitter.com/baiturrahman' },
];

export function Footer() {
	return (
		<footer className="bg-[#fafafa] border-t border-[#f0f0f0] py-16">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<div className="grid md:grid-cols-4 gap-12">
					{/* Left: Brand */}
					<div className="md:col-span-1">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex items-center justify-center w-10 h-10 border-2 border-[#1a3d2b]">
								<Building2 size={20} className="text-[#1a3d2b]" />
							</div>
							<span className="font-serif-cormorant font-semibold text-xl text-[#1a3d2b]">
								Baiturrahman
							</span>
						</div>
						<p className="text-sm text-[#6b6b6b] mb-4">
							Merahmati Umat, Menerangi Jiwa
						</p>
						<p className="text-xs text-[#6b6b6b]">
							&copy; {new Date().getFullYear()} Masjid Baiturrahman. All rights reserved.
						</p>
					</div>

					{/* Center: Quick Links */}
					<div className="md:col-span-2">
						<div className="grid grid-cols-3 gap-8">
							{Object.entries(quickLinks).map(([category, links]) => (
								<div key={category}>
									<h4 className="font-serif-cormorant font-semibold text-[#1a3d2b] mb-3">
										{category}
									</h4>
									<ul className="space-y-2">
										{links.map((link) => (
											<li key={link}>
												<a
													href="#"
													className="text-sm text-[#6b6b6b] gold-underline"
												>
													{link}
												</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>

					{/* Right: Prayer Times & Social */}
					<div className="md:col-span-1">
						<h4 className="font-serif-cormorant font-semibold text-[#1a3d2b] mb-3">
							Jadwal Sholat
						</h4>
						<div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-6">
							{prayerTimes.map((prayer) => (
								<div key={prayer.name} className="flex justify-between gap-2">
									<span className="text-sm text-[#6b6b6b]">{prayer.name}</span>
									<span className="font-mono-jetbrains text-sm text-[#1a3d2b]">
										{prayer.time}
									</span>
								</div>
							))}
						</div>

						<div className="flex gap-2">
							{socialLinks.map((social) => {
								const Icon = social.icon;
								return (
									<a
										key={social.href}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 border border-[#e0e0e0] text-[#1a3d2b] hover:border-[#b8962e] hover:text-[#b8962e] transition-colors"
									>
										<Icon size={18} />
									</a>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
