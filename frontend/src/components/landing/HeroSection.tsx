'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { PrayerCountdown } from '@/components/landing/PrayerCountdown';

export function HeroSection() {
	return (
		<section className="relative min-h-screen flex items-center overflow-hidden bg-white grain-overlay">
			{/* Arabic Calligraphy - Left Side */}
			<motion.div
				initial={{ opacity: 0, x: -30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-full flex items-center justify-center pointer-events-none"
			>
				<span className="font-arabic text-[min(50vw,32rem)] text-[#1a3d2b] opacity-30 leading-none select-none">
					بيت الرحمن
				</span>
			</motion.div>

			{/* Mosque Silhouette - Right Side */}
			<motion.div
				initial={{ opacity: 0, x: 30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.8, delay: 0.4 }}
				className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-full flex items-center justify-center pointer-events-none"
			>
				<svg
					viewBox="0 0 400 300"
					className="w-[min(40vw,28rem)] h-auto text-[#1a3d2b]"
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
				>
					{/* Main dome */}
					<path d="M200 50 Q250 100 250 150 L250 250 L150 250 L150 150 Q150 100 200 50" />
					{/* Minaret left */}
					<path d="M100 250 L100 80 L90 80 L100 50 L110 80 L100 80 L100 250" />
					{/* Minaret right */}
					<path d="M300 250 L300 80 L290 80 L300 50 L310 80 L300 80 L300 250" />
					{/* Base */}
					<line x1="80" y1="250" x2="320" y2="250" />
					{/* Entry arch */}
					<path d="M180 250 L180 200 Q200 180 220 200 L220 250" />
				</svg>
			</motion.div>

			{/* Content Layer */}
			<div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 container h-full flex flex-col justify-between py-16">
				{/* Top content - Tagline */}
				<div className="flex-1 flex items-center justify-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						className="text-center"
					>
						<h1 className="font-serif-cormorant font-semibold text-[clamp(2rem,5vw,4rem)] text-[#1a3d2b] leading-tight">
							Merahmati Umat, Menerangi Jiwa
						</h1>
					</motion.div>
				</div>

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
					className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
				>
					<a
						href="#kajian"
						className="inline-flex items-center gap-2 border-2 border-[#1a3d2b] text-[#1a3d2b] hover:bg-[#1a3d2b] hover:text-white px-8 py-6 text-base font-normal transition-colors duration-300"
					>
						Jadwal Kajian
						<ArrowRight size={20} />
					</a>
					<a
						href="#donasi"
						className="inline-flex items-center gap-2 bg-[#b8962e] text-white hover:bg-[#d4ad50] px-8 py-6 text-base font-normal transition-colors duration-300"
					>
						Donasi Sekarang
					</a>
				</motion.div>

				{/* Scroll Indicator */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1 }}
					className="flex justify-center"
				>
					<div className="flex flex-col items-center gap-2">
						<span className="text-xs uppercase tracking-widest text-[#6b6b6b]">Scroll</span>
						<motion.div
							animate={{ y: [0, 8, 0] }}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
							className="w-px h-10 bg-[#1a3d2b]"
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
