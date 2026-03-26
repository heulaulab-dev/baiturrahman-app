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
  Struktur,
} from '@/types'

// Mosque Info
export const getMosqueInfo = async (): Promise<MosqueInfo> => {
  const response = await api.get<MosqueInfo>('/v1/mosque')
  return response.data
}

// Prayer Times
export const getPrayerTimesByDate = async (date: string): Promise<PrayerTime> => {
  const response = await api.get<PrayerTime>('/v1/prayer-times', { params: { date } })
  return response.data
}

export const getPrayerTimesByMonth = async (
  year: number,
  month: number
): Promise<PrayerTime[]> => {
  const response = await api.get<PrayerTime[]>('/v1/prayer-times/month', {
    params: { year, month },
  })
  return response.data
}

// Events
export const getEvents = async (): Promise<Event[]> => {
  const response = await api.get<Event[]>('/v1/events')
  return response.data
}

export const getEventBySlug = async (slug: string): Promise<Event> => {
  const response = await api.get<Event>(`/v1/events/${slug}`)
  return response.data
}

// Announcements
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const response = await api.get<Announcement[]>('/v1/announcements')
  return response.data
}

// Donations
export const createDonation = async (data: {
  donor_name: string
  amount: number
  payment_method_id: string
  message?: string
}): Promise<Donation> => {
  const response = await api.post<Donation>('/v1/donations', data)
  return response.data
}

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<PaymentMethod[]>('/v1/payment-methods')
  return response.data
}

// Content
export const getContentSections = async (): Promise<ContentSection[]> => {
  const response = await api.get<ContentSection[]>('/v1/content')
  return response.data
}

// Structure
export const getStructures = async (): Promise<StructureMember[]> => {
  const response = await api.get<StructureMember[]>('/v1/structure')
  return response.data
}

// Khutbah
export const getLatestKhutbah = async (): Promise<Khutbah> => {
  const response = await api.get<Khutbah>('/v1/khutbahs/latest')
  return response.data
}

export const getKhutbahArchive = async (): Promise<Khutbah[]> => {
  const response = await api.get<Khutbah[]>('/v1/khutbahs/archive')
  return response.data
}

// History Entries (Public)
export const getHistoryEntries = async (
  params?: { status?: string; category?: string; page?: number; limit?: number }
): Promise<{ data: HistoryEntry[]; page: number; limit: number; total: number }> => {
  const response = await api.get('/v1/history-entries', { params })
  return response.data
}

export const getHistoryEntriesByDateRange = async (
  from: string,
  to: string
): Promise<HistoryEntry[]> => {
  const response = await api.get('/v1/history-entries/date-range', { params: { from, to } })
  return response.data
}

// Strukturs (Public)
export const getPublicStrukturs = async (): Promise<Struktur[]> => {
  const response = await api.get<Struktur[]>('/v1/strukturs')
  return response.data
}

// Tentang Kami (Public)
export const getTentangKami = async (): Promise<ContentSection> => {
  const response = await api.get<ContentSection>('/v1/content/tentang-kami')
  return response.data
}
