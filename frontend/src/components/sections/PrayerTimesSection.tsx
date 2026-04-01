'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Moon, Sun } from 'lucide-react';
import { usePrayerTimes } from '@/services/hooks';

interface PrayerCardProps {
	name: string;
	time: string;
	icon: React.ReactNode;
	isNext?: boolean;
	isNow?: boolean;
}

function PrayerCard({ name, time, icon, isNext, isNow }: Readonly<PrayerCardProps>) {
	let cardClassName = 'text-center transition-all duration-300 hover:shadow-md';
	if (isNext) cardClassName = 'text-center transition-all duration-300 border-2 border-primary/50';
	if (isNow) cardClassName = 'text-center transition-all duration-300 border-2 border-primary shadow-lg scale-105';

	const iconWrapClassName = isNow ? 'p-3 rounded-full bg-primary text-primary-foreground' : 'p-3 rounded-full bg-gray-100 dark:bg-gray-800';
	const timeClassName = isNow ? 'text-2xl font-bold text-primary' : 'text-2xl font-bold text-gray-900 dark:text-white';

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
		>
			<Card className={cardClassName}>
				<CardContent className='p-6'>
					<div className='flex justify-center mb-3'>
						<div className={iconWrapClassName}>
							{icon}
						</div>
					</div>
					<h3 className='mb-2 font-semibold dark:text-white text-lg'>{name}</h3>
					<p className={timeClassName}>{time}</p>
					{isNow && (
						<span className='inline-block bg-primary mt-2 px-3 py-1 rounded-full text-primary-foreground text-xs'>
							Now
						</span>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}

export function PrayerTimesSection() {
	const today = new Date().toISOString().split('T')[0];
	const { data: prayerTimes, isLoading } = usePrayerTimes(today);
	const prayerData = prayerTimes ?? null;
	const displayTime = (value?: string) => (isLoading ? '...' : value || '--:--');

	return (
		<section id='prayer-times' className='py-20'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className='mb-12 text-center'
				>
					<h2 className='mb-4 font-bold text-4xl'>Jadwal Sholat</h2>
					<p className='text-lg'>
						{new Date().toLocaleDateString('id-ID', {
							weekday: 'long',
							year: 'numeric',
							month: 'long',
							day: 'numeric',
						})}
					</p>
					<p className='mt-2 text-sm'>
						Sumber: API
					</p>
				</motion.div>

				<div className='gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mx-auto max-w-6xl'>
					<PrayerCard
						name='Subuh'
						time={displayTime(prayerData?.fajr)}
						icon={<Moon size={24} />}
					/>
					<PrayerCard
						name='Dzuhur'
						time={displayTime(prayerData?.dhuhr)}
						icon={<Sun size={24} />}
					/>
					<PrayerCard
						name='Ashar'
						time={displayTime(prayerData?.asr)}
						icon={<Cloud size={24} />}
					/>
					<PrayerCard
						name='Maghrib'
						time={displayTime(prayerData?.maghrib)}
						icon={<Sun size={24} />}
					/>
					<PrayerCard
						name='Isya'
						time={displayTime(prayerData?.isha)}
						icon={<Moon size={24} />}
					/>
				</div>
			</div>
		</section>
	);
}
