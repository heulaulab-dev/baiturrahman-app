'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { HeroBackgroundCarousel } from '@/components/landing/HeroBackgroundCarousel';
import { PrayerCountdown } from '@/components/landing/PrayerCountdown';
import { Button } from '@/components/ui/button';
import { cn, resolveBackendAssetUrl } from '@/lib/utils';
import { useHeroSlides } from '@/services/hooks';
import Link from 'next/link';

export function HeroSection() {
	const { data: slides = [], isError } = useHeroSlides();

	const resolvedSlides = useMemo(() => {
		return slides
			.map((s) => ({
				id: s.id,
				src: resolveBackendAssetUrl(s.image_url) ?? '',
				alt: s.alt_text?.trim() || 'Gambar masjid',
			}))
			.filter((s) => s.src.length > 0);
	}, [slides]);

	const hasBackground = !isError && resolvedSlides.length > 0;

	return (
		<section
			id="hero"
			className={cn(
				'relative flex min-h-screen items-center overflow-hidden',
				hasBackground ? 'bg-neutral-950' : 'grain-overlay bg-white',
			)}
		>
			{hasBackground ? (
				<HeroBackgroundCarousel slides={resolvedSlides} />
			) : null}

			{/* Arabic Calligraphy - Left Side */}
			<motion.div
				initial={{ opacity: 0, x: -30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="pointer-events-none absolute left-0 top-1/2 flex h-full w-[55%] -translate-y-1/2 items-center justify-center"
			>
				<span className="font-arabic select-none text-[min(50vw,32rem)] leading-none text-sacred-green opacity-30">
					بيت الرحمن
				</span>
			</motion.div>

			{/* Content Layer */}
			<div className="relative z-10 mx-auto flex h-full min-h-screen flex-col justify-between gap-16 px-4 py-16 sm:px-6 lg:px-8 container">
				{/* Top content - Tagline */}
				<div className="flex flex-1 items-center justify-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						className="text-center"
					>
						<h1 className="font-serif-cormorant text-[clamp(2rem,5vw,4rem)] font-semibold leading-tight text-sacred-green">
							Merahmati Umat, Menerangi Jiwa
						</h1>
					</motion.div>
				</div>

				<div className="flex flex-col gap-5">
					{/* Prayer Countdown Widget */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className="flex justify-center"
					>
						<PrayerCountdown />
					</motion.div>

					{/* CTAs */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.7 }}
						className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
					>
						<Button
							asChild
							variant="outline"
							className="h-auto rounded-none border-2 border-sacred-green bg-transparent px-8 py-6 text-base font-normal text-sacred-green shadow-none hover:bg-sacred-green hover:text-white"
						>
							<Link href="#kajian" className="inline-flex items-center gap-2">
								Jadwal Kajian
								<ArrowRight size={20} />
							</Link>
						</Button>
						<Button
							asChild
							className="h-auto rounded-none border-0 bg-sacred-gold px-8 py-6 text-base font-normal text-white shadow-none hover:bg-sacred-gold-light"
						>
							<Link href="#donasi">Mulai tabung akhirat</Link>
						</Button>
					</motion.div>
				</div>

				{/* Scroll Indicator */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1 }}
					className="flex justify-center"
				>
					<div className="flex flex-col items-center gap-2">
						<span className="text-sacred-muted text-xs uppercase tracking-widest">Scroll</span>
						<motion.div
							animate={{ y: [0, 8, 0] }}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
							className="h-10 w-px bg-sacred-green"
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
