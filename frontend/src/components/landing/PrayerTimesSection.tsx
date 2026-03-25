'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const prayerTimes = [
	{ name: 'Subuh', time: '04:32' },
	{ name: 'Dzuhur', time: '12:04' },
	{ name: 'Ashar', time: '15:21' },
	{ name: 'Maghrib', time: '18:03' },
	{ name: 'Isya', time: '19:15' },
];

export function PrayerTimesSection() {
	const [currentPrayer, setCurrentPrayer] = useState<number>(0);

	useEffect(() => {
		const findCurrentPrayer = () => {
			const now = new Date();
			const currentTime = now.getHours() * 60 + now.getMinutes();

			for (let i = prayerTimes.length - 1; i >= 0; i--) {
				const [hours, minutes] = prayerTimes[i].time.split(':').map(Number);
				const prayerMinutes = hours * 60 + minutes;

				if (currentTime >= prayerMinutes) {
					return i;
				}
			}

			// Before first prayer, highlight first one
			return 0;
		};

		setCurrentPrayer(findCurrentPrayer());
	}, []);

	const getNextPrayer = () => {
		const next = currentPrayer + 1;
		return next < prayerTimes.length ? next : 0;
	};

	const nextPrayer = getNextPrayer();

	return (
		<section id='jadwal' className='py-6 border-y border-sacred-green bg-white'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
					{/* Prayer Pills */}
					<div className='flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 flex-1 font-mono-jetbrains'>
						{prayerTimes.map((prayer, index) => (
							<motion.div
								key={prayer.name}
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className={`
									px-4 py-2 rounded-none border transition-all duration-300
									${
										index === currentPrayer || index === nextPrayer
											? 'border-sacred-gold bg-sacred-gold/5'
											: 'border-sacred-green hover:border-sacred-gold'
									}
								`}
							>
								<div className='flex items-center gap-2'>
									<span
										className={`
										font-serif-cormorant text-sm md:text-base
										${
											index === currentPrayer || index === nextPrayer
												? 'text-sacred-gold'
												: 'text-sacred-green'
										}
									`}
									>
										{prayer.name}
									</span>
									<span
										className={`
										font-mono-jetbrains text-sm md:text-base
										${
											index === currentPrayer || index === nextPrayer
												? 'text-sacred-gold font-semibold'
												: 'text-sacred-green'
										}
									`}
									>
										{prayer.time}
									</span>
								</div>
							</motion.div>
						))}
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
							{new Date().toLocaleDateString('id-ID', {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</div>
						<div className='text-sacred-green font-mono-jetbrains text-sm'>
							17 Ramadhan 1446 H
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
