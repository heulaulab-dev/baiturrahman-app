'use client';
import Link from 'next/link';
import Image from 'next/image';

import {
	LANDING_PRAYER_PILLS,
	useMuslimProLandingPrayerTimes,
} from '@/components/landing/useMuslimProLandingPrayerTimes';
import { useMosqueInfo } from '@/services/hooks';

interface QuickLinkItem {
	label: string;
	href: string;
}

const quickLinks: Record<string, QuickLinkItem[]> = {
	Tentang: [
		{ label: 'Tentang Kami', href: '/#tentang-kami' },
		{ label: 'Sejarah', href: '/#sejarah' },
		{ label: 'Visi Misi', href: '/#visi-misi' },
	],
	Jadwal: [
		{ label: 'Jadwal Sholat', href: '/#jadwal' },
		{ label: 'Jadwal Kajian', href: '/#kajian' },
		{ label: 'Khutbah Jumat', href: '/#mimbar-jumat' },
	],
	Layanan: [
		{ label: 'Zakat & Wakaf', href: '/#layanan' },
		{ label: 'Reservasi', href: '/#layanan' },
		{ label: 'Donasi', href: '/#donasi' },
	],
};

const socialLinks = [
	{ iconSrc: '/icon/instagram.svg', href: 'https://instagram.com/baiturrahim' },
	{ iconSrc: '/icon/youtube.svg', href: 'https://youtube.com/baiturrahim' },
	{ iconSrc: '/icon/facebook.svg', href: 'https://facebook.com/baiturrahim' },
	{ iconSrc: '/icon/twitter.svg', href: 'https://twitter.com/baiturrahim' },
	{ iconSrc: '/icon/whatsapp.svg', href: 'https://wa.me/6281234567890' },
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
							<Image
								src="/Logo.svg"
								alt="Baiturrahim"
								width={220}
								height={62}
								className="h-auto w-44 max-w-full"
								unoptimized
							/>
						</div>
						<p className="text-sm text-sacred-muted mb-4">
							{mosqueInfo?.description || 'Pusat ibadah dan kegiatan keagamaan Muslim'}
						</p>
						<p className="text-xs text-sacred-muted">
							&copy; {new Date().getFullYear()} {mosqueInfo?.name || 'Masjid Baiturrahim'}. All rights reserved.
						</p>
						<div className='flex flex-wrap items-center gap-x-2 gap-y-1 pt-1'>
								<Link href='https://heulaulab.tech' target='_blank' rel='noopener noreferrer'>
									<div className='flex items-center gap-x-2'>
										<Image
									src='/heulaulab.svg'
									alt='HeulauLab'
									width={100}
									height={100}
									className='dark:invert w-auto h-10'
								/>
									<span
										className='text-muted-foreground/40 select-none'
										aria-hidden
									>
										|
									</span>
									<span className='text-[11px] text-muted-foreground/90'>
										Proudly partnered with heulaulab
									</span>
									</div>
								</Link>
					</div>
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
										{links.map((item) => (
											<li key={item.label}>
												<Link
													href={item.href}
													className="text-sm text-sacred-muted relative group"
												>
													{item.label}
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
							{socialLinks.map((social) => (
								<Link
									key={social.href}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 border border-sacred-green text-sacred-green hover:border-sacred-gold hover:text-sacred-gold transition-colors"
								>
									<Image
										src={social.iconSrc}
										alt=""
										width={18}
										height={18}
										unoptimized
									/>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
