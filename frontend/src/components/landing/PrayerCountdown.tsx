'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { LANDING_PRAYER_PILLS, useMuslimProLandingPrayerTimes } from './useMuslimProLandingPrayerTimes';

export function PrayerCountdown() {
	const { pillTimes, currentPrayerData, isLoading } = useMuslimProLandingPrayerTimes();
	const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string }>({ name: 'Subuh', time: '--:--' });
	const [countdown, setCountdown] = useState('');

	useEffect(() => {
		const calculateCountdown = () => {
			const now = new Date();
			const current = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();

			const [hours, minutes] = nextPrayer.time.split(':').map(Number);
			if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return '--:--:--';
			let target = hours * 60 * 60 + minutes * 60;

			// If target is in the past, add 24 hours
			if (target <= current) {
				target += 24 * 60 * 60;
			}

			const diff = target - current;
			const hrs = Math.floor(diff / 3600);
			const mins = Math.floor((diff % 3600) / 60);
			const secs = diff % 60;

			return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		};

		const interval = setInterval(() => {
			setCountdown(calculateCountdown());
		}, 1000);

		return () => clearInterval(interval);
	}, [nextPrayer]);

	useEffect(() => {
		if (!pillTimes || isLoading) return;
		const nextIndex = currentPrayerData.nextPrayer;
		const pill = LANDING_PRAYER_PILLS[nextIndex];
		const time = pillTimes[nextIndex] ?? '--:--';
		setNextPrayer({ name: pill?.name ?? 'Subuh', time });
	}, [currentPrayerData.nextPrayer, isLoading, pillTimes]);

	return (
		<div className="magnetic">
			<motion.div
				animate={{ opacity: [0.8, 1, 0.8] }}
				transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
				className="bg-white border-2 border-sacred-green px-6 py-3 flex items-center gap-4"
			>
				<Clock size={20} className="text-sacred-green" />
				<div className="flex items-baseline gap-3">
					<span className="font-serif-cormorant text-xl text-sacred-green">{nextPrayer.name}</span>
					<span className="font-mono-jetbrains text-lg text-sacred-gold">{nextPrayer.time}</span>
					<span className="font-mono-jetbrains text-sm text-sacred-muted">{countdown}</span>
				</div>
			</motion.div>
		</div>
	);
}
