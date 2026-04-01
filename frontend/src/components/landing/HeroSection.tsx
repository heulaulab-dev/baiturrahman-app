'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PrayerCountdown } from '@/components/landing/PrayerCountdown';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
	return (
		<section
			id='hero'
			className='relative min-h-screen flex items-center overflow-hidden bg-white grain-overlay'
		>
			{/* Arabic Calligraphy - Left Side */}
			<motion.div
				initial={{ opacity: 0, x: -30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
				className='absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-full flex items-center justify-center pointer-events-none'
			>
				<span className='font-arabic text-[min(50vw,32rem)] text-sacred-green opacity-30 leading-none select-none'>
					بيت الرحمن
				</span>
			</motion.div>

			{/* Content Layer */}
			<div className='relative z-10 mx-auto px-4 sm:px-6 lg:px-8 container h-full flex flex-col justify-between py-16 gap-16'>
				{/* Top content - Tagline */}
				<div className='flex-1 flex items-center justify-center'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						className='text-center'
					>
						<h1 className='font-serif-cormorant font-semibold text-[clamp(2rem,5vw,4rem)] text-sacred-green leading-tight'>
							Merahmati Umat, Menerangi Jiwa
						</h1>
					</motion.div>
				</div>

				<div className='flex flex-col gap-5'>
					{/* Prayer Countdown Widget */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.6 }}
						className='flex justify-center'
					>
						<PrayerCountdown />
					</motion.div>

					{/* CTAs */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.7 }}
						className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-8'
					>
						<Button
							asChild
							variant='outline'
							className='h-auto rounded-none border-2 border-sacred-green bg-transparent px-8 py-6 text-base font-normal text-sacred-green shadow-none hover:bg-sacred-green hover:text-white'
						>
							<Link href='#kajian' className='inline-flex items-center gap-2'>
								Jadwal Kajian
								<ArrowRight size={20} />
							</Link>
						</Button>
						<Button
							asChild
							className='h-auto rounded-none border-0 bg-sacred-gold px-8 py-6 text-base font-normal text-white shadow-none hover:bg-sacred-gold-light'
						>
							<Link href='#donasi'>Donasi Sekarang</Link>
						</Button>
					</motion.div>
				</div>

				{/* Scroll Indicator */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1 }}
					className='flex justify-center'
				>
					<div className='flex flex-col items-center gap-2'>
						<span className='text-xs uppercase tracking-widest text-sacred-muted'>
							Scroll
						</span>
						<motion.div
							animate={{ y: [0, 8, 0] }}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
							className='w-px h-10 bg-sacred-green'
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
