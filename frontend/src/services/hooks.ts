import { useQuery, useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
	getMosqueInfo,
	getPrayerTimesByDate,
	getPrayerTimesByMonth,
	getEvents,
	getEventBySlug,
	getAnnouncements,
	getPaymentMethods,
	getContentSections,
	getStructures,
	createDonation as apiCreateDonation,
	getLatestKhutbah,
	getKhutbahArchive,
	getHistoryEntries,
	getHistoryEntriesByDateRange,
	getPublicStrukturs,
	getTentangKami,
	getGalleryItems,
	getHeroSlides,
	getSponsors,
	getSponsorsForLanding,
} from './apiService';

// Mosque Info
export const useMosqueInfo = () => {
	return useQuery({
		queryKey: ['mosque-info'],
		queryFn: getMosqueInfo,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

// Prayer Times
export const usePrayerTimes = (date: string) => {
	return useQuery({
		queryKey: ['prayer-times', date],
		queryFn: () => getPrayerTimesByDate(date),
		enabled: !!date,
		staleTime: 1000 * 60 * 60, // 1 hour
	});
};

export const useMonthlyPrayerTimes = (year: number, month: number) => {
	return useQuery({
		queryKey: ['prayer-times', 'month', year, month],
		queryFn: () => getPrayerTimesByMonth(year, month),
		enabled: !!year && !!month,
		staleTime: 1000 * 60 * 60 * 24, // 24 hours
	});
};

// Events
export const useEvents = () => {
	return useQuery({
		queryKey: ['events'],
		queryFn: getEvents,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useEvent = (slug: string) => {
	return useQuery({
		queryKey: ['event', slug],
		queryFn: () => getEventBySlug(slug),
		enabled: !!slug,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
};

// Announcements
export const useAnnouncements = () => {
	return useQuery({
		queryKey: ['announcements'],
		queryFn: getAnnouncements,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

// Payment Methods
export const usePaymentMethods = () => {
	return useQuery({
		queryKey: ['payment-methods'],
		queryFn: getPaymentMethods,
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

// Donation
export const useCreateDonation = () => {
	const createMutation = useMutation({
		mutationFn: apiCreateDonation,
	});
	return createMutation;
};

// Re-export createDonation for direct use
export { apiCreateDonation as createDonation };

// Content Sections
export const useContentSections = () => {
	return useQuery({
		queryKey: ['content-sections'],
		queryFn: getContentSections,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
};

// Structure
export const useStructures = () => {
	return useQuery({
		queryKey: ['structures'],
		queryFn: getStructures,
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

// Khutbah
export const useLatestKhutbah = () => {
	return useQuery({
		queryKey: ['khutbah', 'latest'],
		queryFn: getLatestKhutbah,
		staleTime: 1000 * 60 * 60, // 1 hour
		retry: (failureCount, error) => {
			if (isAxiosError(error) && error.response?.status === 404) return false;
			return failureCount < 3;
		},
	});
};

export const useKhutbahArchive = () => {
	return useQuery({
		queryKey: ['khutbah', 'archive'],
		queryFn: getKhutbahArchive,
		staleTime: 1000 * 60 * 60 * 24, // 24 hours
	});
};

// History Entries
export const useHistoryEntries = (
	params?: { status?: string; category?: string; page?: number; limit?: number }
) => {
	return useQuery({
		queryKey: ['history-entries', params],
		queryFn: () => getHistoryEntries(params),
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
};

export const useHistoryEntriesByDateRange = (from: string, to: string) => {
	return useQuery({
		queryKey: ['history-entries', 'date-range', from, to],
		queryFn: () => getHistoryEntriesByDateRange(from, to),
		enabled: !!from && !!to,
		staleTime: 1000 * 60 * 60 * 24, // 24 hours
	});
};

// Strukturs
export const usePublicStrukturs = () => {
	return useQuery({
		queryKey: ['strukturs', 'public'],
		queryFn: getPublicStrukturs,
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

// Tentang Kami
export const useTentangKami = () => {
	return useQuery({
		queryKey: ['tentang-kami'],
		queryFn: getTentangKami,
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

export const useGalleryItems = () => {
	return useQuery({
		queryKey: ['gallery', 'items'],
		queryFn: getGalleryItems,
		staleTime: 1000 * 60 * 5,
	});
};

export const useHeroSlides = () => {
	return useQuery({
		queryKey: ['hero', 'slides'],
		queryFn: getHeroSlides,
		staleTime: 1000 * 60 * 5,
	});
};

export const useSponsors = () => {
	return useQuery({
		queryKey: ['sponsors', 'public'],
		queryFn: getSponsors,
		staleTime: 1000 * 60 * 5,
	});
};

export const useSponsorsForLanding = () => {
	return useQuery({
		queryKey: ['sponsors', 'landing'],
		queryFn: getSponsorsForLanding,
		staleTime: 1000 * 60 * 5,
	});
};
