import api from '@/lib/axios'
import type {
  MosqueInfo,
  Event,
  Announcement,
  PrayerTime,
  Donation,
  PaymentMethod,
  ContentSection,
  StructureMember,
  Khutbah,
  HistoryEntry,
  GalleryItem,
  HeroSlide,
  PublicSponsor,
  PublicQurbanAnimalSummary,
  Struktur,
  ApiResponse,
  PaginatedResponse,
  Reservation,
  CreateReservationRequest,
} from '@/types'

// Mosque Info
export const getMosqueInfo = async (): Promise<MosqueInfo | null> => {
  const response = await api.get<ApiResponse<MosqueInfo | null>>('/v1/mosque')
  return response.data.data ?? null
}

// Prayer Times
export const getPrayerTimesByDate = async (date: string): Promise<PrayerTime> => {
  const response = await api.get<ApiResponse<PrayerTime>>('/v1/prayer-times', { params: { date } })
  return response.data.data
}

export const getPrayerTimesByMonth = async (
  year: number,
  month: number
): Promise<PrayerTime[]> => {
  const response = await api.get<ApiResponse<PrayerTime[]>>('/v1/prayer-times/month', {
    params: { year, month },
  })
  return response.data.data
}

// Events
export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get<PaginatedResponse<Event>>('/v1/events')
  return response.data.data
}

export const getEventBySlug = async (slug: string): Promise<Event> => {
  const response = await api.get<ApiResponse<Event>>(`/v1/events/${slug}`)
  return response.data.data
}

// Announcements — `active=true` matches backend filter for currently visible items.
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get<PaginatedResponse<Announcement>>('/v1/announcements', {
    params: { active: 'true' },
  })
  return response.data.data
}

// Donations
export const createDonation = async (data: {
  donor_name: string
  amount: number
  payment_method_id: string
  message?: string
}): Promise<Donation> => {
  const response = await api.post<ApiResponse<Donation>>('/v1/donations', data)
  return response.data.data
}

/** Buat reservasi dari dashboard (JWT). Backend: POST /v1/admin/reservations/create */
export const createReservation = async (data: CreateReservationRequest): Promise<Reservation> => {
  const response = await api.post<ApiResponse<Reservation>>('/v1/admin/reservations/create', data)
  return response.data.data
}

/** Pengunjung tanpa login. Backend: POST /v1/reservations */
export const createPublicReservation = async (data: CreateReservationRequest): Promise<Reservation> => {
  const response = await api.post<ApiResponse<Reservation>>('/v1/reservations', data)
  return response.data.data
}

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<ApiResponse<PaymentMethod[]>>('/v1/payment-methods')
  return response.data.data
}

// Content
export const getContentSections = async (): Promise<ContentSection[]> => {
  const response = await api.get<ApiResponse<ContentSection[]>>('/v1/content')
  return response.data.data
}

// Structure
export const getStructures = async (): Promise<StructureMember[]> => {
  const response = await api.get<ApiResponse<StructureMember[]>>('/v1/structure')
  return response.data.data
}

// Khutbah
export const getLatestKhutbah = async (): Promise<Khutbah | null> => {
  const response = await api.get<ApiResponse<Khutbah | null>>('/v1/khutbahs/latest')
  return response.data.data ?? null
}

export const getKhutbahArchive = async (): Promise<Khutbah[]> => {
  const response = await api.get<PaginatedResponse<Khutbah>>('/v1/khutbahs/archive')
  return response.data.data
}

// History Entries (Public)
export const getHistoryEntries = async (
  params?: { status?: string; category?: string; page?: number; limit?: number }
): Promise<PaginatedResponse<HistoryEntry>> => {
  const response = await api.get<PaginatedResponse<HistoryEntry>>('/v1/history-entries', { params })
  return response.data
}

export const getHistoryEntriesByDateRange = async (
  from: string,
  to: string
): Promise<HistoryEntry[]> => {
  const response = await api.get<ApiResponse<HistoryEntry[]>>('/v1/history-entries/date-range', {
    params: { from, to },
  })
  return response.data.data
}

// Strukturs (Public) — backend returns ApiResponse<Struktur[]>
export const getPublicStrukturs = async (): Promise<Struktur[]> => {
  const response = await api.get<ApiResponse<Struktur[]>>('/v1/strukturs')
  return response.data.data
}

// Tentang Kami (Public)
export const getTentangKami = async (): Promise<ContentSection> => {
  const response = await api.get<ApiResponse<ContentSection>>('/v1/content/tentang-kami')
  return response.data.data
}

// Gallery (public, published only)
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  const response = await api.get<ApiResponse<GalleryItem[]>>('/v1/gallery/items')
  return response.data.data ?? []
}

// Hero slides (public, published only)
export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  const response = await api.get<ApiResponse<HeroSlide[]>>('/v1/hero/slides')
  return response.data.data ?? []
}

export const getSponsors = async (): Promise<PublicSponsor[]> => {
  const response = await api.get<ApiResponse<PublicSponsor[]>>('/v1/sponsors')
  return response.data.data ?? []
}

export const getSponsorsForLanding = async (): Promise<PublicSponsor[]> => {
  const response = await api.get<ApiResponse<PublicSponsor[]>>('/v1/sponsors', {
    params: { for_landing: '1' },
  })
  return response.data.data ?? []
}

export const getPublicQurbanSummary = async (): Promise<PublicQurbanAnimalSummary[]> => {
  const response = await api.get<ApiResponse<PublicQurbanAnimalSummary[]>>('/v1/qurban/summary')
  return response.data.data ?? []
}
