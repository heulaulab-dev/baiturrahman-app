'use client';

import { motion } from 'framer-motion';
import {
	LANDING_PRAYER_PILLS,
	useMuslimProLandingPrayerTimes,
} from '@/components/landing/useMuslimProLandingPrayerTimes';

export function PrayerTimesSection() {
	const {
		now,
		isLoading,
		hasPrayerTimes,
		pillTimes,
		currentPrayerData,
		showUnavailableMessage,
		ramadhanLine,
	} = useMuslimProLandingPrayerTimes();

	const currentPrayer = currentPrayerData.currentPrayer;
	const nextPrayer = currentPrayerData.nextPrayer;

	return (
		<section id='jadwal' className='py-6 border-y border-sacred-green bg-white'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
					{/* Prayer Pills */}
					<div className='flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 flex-1 font-mono-jetbrains'>
						{LANDING_PRAYER_PILLS.map((prayer) => {
							const index = prayer.index;
							const isGold = hasPrayerTimes && (index === currentPrayer || index === nextPrayer);

							return (
								<motion.div
									key={prayer.name}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
									className={`
									px-4 py-2 rounded-none border transition-all duration-300
									${isGold ? 'border-sacred-gold bg-sacred-gold/5' : 'border-sacred-green'}
								`}
								>
									<div className='flex items-center gap-2'>
										<span
											className={`
										font-serif-cormorant text-sm md:text-base
										${isGold ? 'text-sacred-gold' : 'text-sacred-green'}
									`}
										>
											{prayer.name}
										</span>
										<span
											className={`
										font-mono-jetbrains text-sm md:text-base
										${isGold ? 'text-sacred-gold font-semibold' : 'text-sacred-green'}
									`}
										>
											{isLoading ? (
												<span
													className='inline-block w-14 h-4 rounded bg-gray-200 dark:bg-gray-800 animate-pulse'
													aria-hidden='true'
												/>
											) : (
												pillTimes?.[index]
											)}
										</span>
									</div>
								</motion.div>
							);
						})}
					</div>

					{/* Date Display */}
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.5 }}
						className='text-right md:text-left font-mono-jetbrains text-xs md:text-sm uppercase tracking-wider text-sacred-green'
					>
						<div>
							{now.toLocaleDateString('id-ID', {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</div>
						{showUnavailableMessage ? (
							<div className='text-sacred-gold text-sm font-semibold'>Jadwal belum tersedia</div>
						) : null}
						{ramadhanLine ? <div className='text-sacred-green font-mono-jetbrains text-sm'>{ramadhanLine}</div> : null}
					</motion.div>
				</div>
			</div>
		</section>
	);
}
