'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export type PrayerTimeFields = {
	Fajr: string;
	Zuhr: string;
	Asr: string;
	Maghrib: string;
	Isha: string;
};

export type ScrapperResponse = {
	praytimes: Record<string, PrayerTimeFields>;
	ramadhan?: Record<string, { start: string; end: string }>;
};

export type CurrentPrayerIndices = { currentPrayer: number; nextPrayer: number };

export const LANDING_PRAYER_PILLS = [
	{ name: 'Subuh', index: 0 },
	{ name: 'Dzuhur', index: 1 },
	{ name: 'Ashar', index: 2 },
	{ name: 'Maghrib', index: 3 },
	{ name: 'Isya', index: 4 },
] as const;

export function useMuslimProLandingPrayerTimes() {
	const [now, setNow] = useState<Date>(() => new Date());

	useEffect(() => {
		const intervalId = window.setInterval(() => setNow(new Date()), 60 * 1000);
		return () => window.clearInterval(intervalId);
	}, []);

	const year = now.getFullYear();
	const day = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

	const { data: scrapperData, isLoading, isError } = useQuery<ScrapperResponse | undefined>({
		queryKey: ['landing-prayer-times', 'muslimpro-scrapper', 'Jakarta', 'KEMENAG', day],
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
			parseTimeToMinutes(prayerTimesForToday.Fajr),
			parseTimeToMinutes(prayerTimesForToday.Zuhr),
			parseTimeToMinutes(prayerTimesForToday.Asr),
			parseTimeToMinutes(prayerTimesForToday.Maghrib),
			parseTimeToMinutes(prayerTimesForToday.Isha),
		];

		const nowMinutes = now.getHours() * 60 + now.getMinutes();

		let currentPrayer = 0;
		for (let i = 0; i < prayerMinutes.length; i++) {
			if (prayerMinutes[i] <= nowMinutes) currentPrayer = i;
		}

		const nextPrayer = (currentPrayer + 1) % 5;
		return { currentPrayer, nextPrayer };
	}, [hasPrayerTimes, prayerTimesForToday, now]);

	const pillTimes = useMemo(() => {
		if (isLoading) return null;
		if (!hasPrayerTimes || !prayerTimesForToday) return ['--:--', '--:--', '--:--', '--:--', '--:--'];

		return [
			prayerTimesForToday.Fajr,
			prayerTimesForToday.Zuhr,
			prayerTimesForToday.Asr,
			prayerTimesForToday.Maghrib,
			prayerTimesForToday.Isha,
		];
	}, [hasPrayerTimes, isLoading, prayerTimesForToday]);

	const showUnavailableMessage = !isLoading && (isError || !hasPrayerTimes);

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

		return 'Ramadhan info unavailable';
	}, [isLoading, now, scrapperData]);

	return {
		now,
		isLoading,
		isError,
		hasPrayerTimes,
		scrapperData,
		prayerTimesForToday,
		pillTimes,
		currentPrayerData,
		showUnavailableMessage,
		ramadhanLine,
	};
}
