'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const prayerTimes = [
	{ name: 'Subuh', time: '04:32' },
	{ name: 'Dzuhur', time: '12:04' },
	{ name: 'Ashar', time: '15:21' },
	{ name: 'Maghrib', time: '18:03' },
	{ name: 'Isya', time: '19:15' },
];

export function PrayerCountdown() {
	const [nextPrayer, setNextPrayer] = useState(prayerTimes[0]);
	const [countdown, setCountdown] = useState('');
	const widgetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const findNextPrayer = () => {
			const now = new Date();
			const currentTime = now.getHours() * 60 + now.getMinutes();

			for (const prayer of prayerTimes) {
				const [hours, minutes] = prayer.time.split(':').map(Number);
				const prayerMinutes = hours * 60 + minutes;

				if (prayerMinutes > currentTime) {
					return prayer;
				}
			}

			// If all prayers passed, next is Subuh tomorrow
			return prayerTimes[0];
		};

		const calculateCountdown = () => {
			const now = new Date();
			const current = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();

			const [hours, minutes] = nextPrayer.time.split(':').map(Number);
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

		setNextPrayer(findNextPrayer());

		const interval = setInterval(() => {
			setCountdown(calculateCountdown());
		}, 1000);

		return () => clearInterval(interval);
	}, [nextPrayer]);

	// Magnetic effect on desktop
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!widgetRef.current || window.innerWidth < 768) return;

		const rect = widgetRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left - rect.width / 2;
		const y = e.clientY - rect.top - rect.height / 2;

		// Limit the distance
		const maxDistance = 20;
		const distance = Math.sqrt(x * x + y * y);
		const scale = Math.min(distance, maxDistance) / distance;

		widgetRef.current.style.transform = `translate(${x * scale * 0.3}px, ${y * scale * 0.3}px)`;
	};

	const handleMouseLeave = () => {
		if (widgetRef.current) {
			widgetRef.current.style.transform = 'translate(0, 0)';
		}
	};

	return (
		<div
			ref={widgetRef}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className="magnetic"
		>
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
