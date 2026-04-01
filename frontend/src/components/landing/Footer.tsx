'use client';

import {CircleFadingPlus } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/public/Logomark.svg';
import {
	LANDING_PRAYER_PILLS,
	useMuslimProLandingPrayerTimes,
} from '@/components/landing/useMuslimProLandingPrayerTimes';
import { useMosqueInfo } from '@/services/hooks';

const quickLinks = {
	Tentang: ['Tentang Kami', 'Sejarah', 'Visi Misi'] ,
	Jadwal: ['Jadwal Sholat', 'Jadwal Kajian', 'Khutbah Jumat'],
	Layanan: ['Zakat & Wakaf', 'Reservasi', 'Donasi'],
};

const socialLinks = [
	{ icon: CircleFadingPlus, href: 'https://instagram.com/baiturrahman' },
	{ icon: CircleFadingPlus, href: 'https://youtube.com/baiturrahman' },
	{ icon: CircleFadingPlus, href: 'https://facebook.com/baiturrahman' },
	{ icon: CircleFadingPlus, href: 'https://twitter.com/baiturrahman' },
];

export function Footer() {
	const { data: mosqueInfo } = useMosqueInfo();
	const { isLoading, pillTimes } = useMuslimProLandingPrayerTimes();

	return (
		<footer className="bg-white border-t border-sacred-green py-16">
			<div className="mx-auto px-4 sm:px-6 lg:px-8 container">
				<div className="grid md:grid-cols-4 gap-12">
					{/* Left: Brand */}
					<div className="md:col-span-1">
						<div className="flex items-center gap-3 mb-4">
							<Image src={Logo} alt="Baiturrahman" width={100} height={100} />
						</div>
						<p className="text-sm text-sacred-muted mb-4">
							{mosqueInfo?.description || 'Pusat ibadah dan kegiatan keagamaan Muslim'}
						</p>
						<p className="text-xs text-sacred-muted">
							&copy; {new Date().getFullYear()} {mosqueInfo?.name || 'Masjid Baiturrahman'}. All rights reserved.
						</p>
					</div>

					{/* Center: Quick Links */}
					<div className="md:col-span-2">
						<div className="grid grid-cols-3 gap-8">
							{Object.entries(quickLinks).map(([category, links]) => (
								<div key={category}>
									<h4 className="font-serif-cormorant font-semibold text-sacred-green mb-3">
										{category}
									</h4>
									<ul className="space-y-2">
										{links.map((link) => (
											<li key={link}>		
												<Link
													href={`#${link}`}
													className="text-sm text-sacred-muted relative group"
												>	
													{link}
													<span className="absolute bottom-0 left-0 w-0 h-px bg-sacred-gold transition-all duration-300 group-hover:w-full" />
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>

					{/* Right: Prayer Times & Social */}
					<div className="md:col-span-1">
						<h4 className="font-serif-cormorant font-semibold text-sacred-green mb-3">
							Jadwal Sholat
						</h4>
						<div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-6">
							{LANDING_PRAYER_PILLS.map((prayer) => (
								<div key={prayer.name} className="flex justify-between gap-2">
									<span className="text-sm text-sacred-muted">{prayer.name}</span>
									<span className="font-mono-jetbrains text-sm text-sacred-green">
										{isLoading ? (
											<span
												className="inline-block w-10 h-3 rounded bg-gray-200 dark:bg-gray-800 animate-pulse"
												aria-hidden="true"
											/>
										) : (
											pillTimes?.[prayer.index]
										)}
									</span>
								</div>
							))}
						</div>
						<div className="flex gap-2">
							{socialLinks.map((social) => {
								const Icon = social.icon;
								return (
									<Link
										key={social.href}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 border border-sacred-green text-sacred-green hover:border-sacred-gold hover:text-sacred-gold transition-colors"
									>
										<Icon size={18} />
									</Link>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
