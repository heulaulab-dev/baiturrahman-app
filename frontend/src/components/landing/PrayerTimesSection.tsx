'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type PrayerTimeFields = {
	Fajr: string;
	Zuhr: string;
	Asr: string;
	Maghrib: string;
	Isha: string;
};

type ScrapperResponse = {
	praytimes: Record<string, PrayerTimeFields>;
	ramadhan?: Record<string, { start: string; end: string }>;
};

type CurrentPrayerIndices = { currentPrayer: number; nextPrayer: number };

export function PrayerTimesSection() {
	const [now, setNow] = useState<Date>(() => new Date());

	// Keep `now` in sync so highlight + `day` roll over around midnight.
	useEffect(() => {
		const intervalId = window.setInterval(() => setNow(new Date()), 60 * 1000);
		return () => window.clearInterval(intervalId);
	}, []);

	const year = now.getFullYear();
	const day = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
		now.getDate()
	).padStart(2, '0')}`;

	const { data: scrapperData, isLoading, isError } = useQuery<ScrapperResponse | undefined>({
		queryKey: ["landing-prayer-times","muslimpro-scrapper", "Jakarta", "KEMENAG", day],
		enabled: Boolean(day),
		staleTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
		queryFn: async () => {
			const res = await fetch(`/api/muslimpro-scrapper/prayer-times?day=${day}`);
			if (!res.ok) throw new Error(`Failed fetching prayer times: ${res.status}`);
			const json = (await res.json()) as { data?: ScrapperResponse };
			return json.data;
		},
	});

	const todayKey = useMemo(() => {
		const raw = new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
		}).format(now);

		return raw
			.replace(/,/g, '')
			.replace(/\s+/g, ' ')
			.trim();
	}, [now]);

	const prayerTimesForToday = useMemo(() => {
		const praytimes = scrapperData?.praytimes;
		if (!praytimes) return null;

		const direct = praytimes[todayKey];
		if (direct) return direct;

		// Deterministic fallback: normalize every key, match tokens, pick lexicographically smallest.
		const todayTokens = todayKey.split(/\s+/).filter(Boolean);
		const weekdayToken = todayTokens[0];
		const monthToken = todayTokens[1];
		const dayNumericToken = todayTokens[2];
		if (!weekdayToken || !monthToken || !dayNumericToken) return null;

		let bestOriginalKey: string | null = null;
		let bestNormalizedLabel: string | null = null;

		for (const originalKey of Object.keys(praytimes)) {
			const normalizedKey = originalKey.replace(/,/g, '').replace(/\s+/g, ' ').trim();
			const tokens = normalizedKey.split(/\s+/).filter(Boolean);
			const [wToken, mToken, dToken] = tokens;

			if (wToken === weekdayToken && mToken === monthToken && dToken === dayNumericToken) {
				if (bestNormalizedLabel === null || normalizedKey < bestNormalizedLabel) {
					bestOriginalKey = originalKey;
					bestNormalizedLabel = normalizedKey;
				}
			}
		}

		return bestOriginalKey ? praytimes[bestOriginalKey] ?? null : null;
	}, [scrapperData, todayKey]);

	const hasPrayerTimes = Boolean(
		prayerTimesForToday?.Fajr &&
			prayerTimesForToday?.Zuhr &&
			prayerTimesForToday?.Asr &&
			prayerTimesForToday?.Maghrib &&
			prayerTimesForToday?.Isha
	);

	const currentPrayerData = useMemo<CurrentPrayerIndices>(() => {
		if (!hasPrayerTimes || !prayerTimesForToday) return { currentPrayer: 0, nextPrayer: 1 };

		const parseTimeToMinutes = (time: string) => {
			const [hoursStr, minutesStr] = time.split(':');
			return Number(hoursStr) * 60 + Number(minutesStr);
		};

		const prayerMinutes = [
			parseTimeToMinutes(prayerTimesForToday.Fajr), // index 0
			parseTimeToMinutes(prayerTimesForToday.Zuhr), // index 1
			parseTimeToMinutes(prayerTimesForToday.Asr), // index 2
			parseTimeToMinutes(prayerTimesForToday.Maghrib), // index 3
			parseTimeToMinutes(prayerTimesForToday.Isha), // index 4
		];

		const nowMinutes = now.getHours() * 60 + now.getMinutes();

		// Greatest index i where prayerMinutes[i] <= nowMinutes, else 0.
		let currentPrayer = 0;
		for (let i = 0; i < prayerMinutes.length; i++) {
			if (prayerMinutes[i] <= nowMinutes) currentPrayer = i;
		}

		const nextPrayer = (currentPrayer + 1) % 5;
		return { currentPrayer, nextPrayer };
	}, [hasPrayerTimes, prayerTimesForToday, now]);

	const currentPrayer = currentPrayerData.currentPrayer;
	const nextPrayer = currentPrayerData.nextPrayer;

	const pillTimes = useMemo(() => {
		if (isLoading) return null;
		if (!hasPrayerTimes || !prayerTimesForToday) return ['--:--', '--:--', '--:--', '--:--', '--:--'];

		// Pill order + mapping (must match your spec).
		return [
			prayerTimesForToday.Fajr, // 0 Subuh
			prayerTimesForToday.Zuhr, // 1 Dzuhur
			prayerTimesForToday.Asr, // 2 Ashar
			prayerTimesForToday.Maghrib, // 3 Maghrib
			prayerTimesForToday.Isha, // 4 Isya
		];
	}, [hasPrayerTimes, isLoading, prayerTimesForToday]);

	const showUnavailableMessage =
		!isLoading &&
		(isError || !hasPrayerTimes);

	const ramadhanLine = useMemo(() => {
		if (isLoading) return null;

		const ramadhan = scrapperData?.ramadhan;
		if (!ramadhan) return null;

		const currentYear = now.getFullYear();
		const yearKey = String(currentYear);

		if (Object.prototype.hasOwnProperty.call(ramadhan, yearKey)) {
			const info = ramadhan[yearKey];
			return `Ramadhan ${currentYear}: ${info?.start} - ${info?.end}`;
		}

		// Ramadhan exists but year key missing.
		return 'Ramadhan info unavailable';
	}, [isLoading, now, scrapperData]);

	const pills = useMemo(
		() => [
			{ name: 'Subuh', index: 0 },
			{ name: 'Dzuhur', index: 1 },
			{ name: 'Ashar', index: 2 },
			{ name: 'Maghrib', index: 3 },
			{ name: 'Isya', index: 4 },
		],
		[]
	);

	return (
		<section id='jadwal' className='py-6 border-y border-sacred-green bg-white'>
			<div className='mx-auto px-4 sm:px-6 lg:px-8 container'>
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
					{/* Prayer Pills */}
					<div className='flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 flex-1 font-mono-jetbrains'>
						{pills.map((prayer) => {
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
