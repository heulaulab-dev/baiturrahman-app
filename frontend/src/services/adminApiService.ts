import api from '@/lib/axios'
import type {
  DonationFull,
  DonationStats,
  Event,
  User,
  UserRole,
  PaymentMethod,
  Announcement,
  Khutbah,
  ApiResponse,
  PaginatedResponse,
  HistoryEntry,
  Struktur,
  ContentSection,
  MosqueInfo,
  Reservation,
  ReservationStatus,
  CreateReservationRequest,
} from '@/types'

export const getDonationStats = async (): Promise<DonationStats> => {
  const response = await api.get<ApiResponse<DonationStats>>('/v1/admin/donations/stats')
  return response.data.data
}

export interface GetDonationsParams {
  page?: number
  limit?: number
  status?: 'pending' | 'confirmed' | 'cancelled'
  category?: string
  from?: string
  to?: string
}

export const getAdminDonations = async (
  params: GetDonationsParams = {}
): Promise<PaginatedResponse<DonationFull>> => {
  const response = await api.get<PaginatedResponse<DonationFull>>('/v1/admin/donations', { params })
  return response.data
}

export const confirmDonation = async (id: string): Promise<DonationFull> => {
  const response = await api.put<ApiResponse<DonationFull>>(`/v1/admin/donations/${id}/confirm`)
  return response.data.data
}

export const getAdminPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<ApiResponse<PaymentMethod[]>>('/v1/admin/payment-methods', {
    params: { active: 'false' },
  })
  return response.data.data
}

export const createPaymentMethod = async (data: {
  name: string
  type: PaymentMethod['type']
  account_number?: string
  account_name?: string
  qr_code_url?: string
  instructions?: string
  is_active?: boolean
  display_order?: number
}): Promise<PaymentMethod> => {
  const response = await api.post<ApiResponse<PaymentMethod>>('/v1/admin/payment-methods', data)
  return response.data.data
}

export const updatePaymentMethod = async (
  id: string,
  data: Partial<PaymentMethod> & { qr_code_url?: string | null }
): Promise<PaymentMethod> => {
  const response = await api.put<ApiResponse<PaymentMethod>>(`/v1/admin/payment-methods/${id}`, data)
  return response.data.data
}

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/payment-methods/${id}`)
}

export const getAdminEvents = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Event>> => {
  const response = await api.get<PaginatedResponse<Event>>('/v1/admin/events', { params })
  return response.data
}

export const getAdminAnnouncements = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Announcement>> => {
  const response = await api.get<PaginatedResponse<Announcement>>('/v1/admin/announcements', { params })
  return response.data
}

export const getAdminKhutbahs = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Khutbah>> => {
  const response = await api.get<PaginatedResponse<Khutbah>>('/v1/admin/khutbahs', { params })
  return response.data
}

export const getAdminUsers = async (): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>('/v1/admin/users')
  return response.data
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  full_name: string
  role: UserRole
}

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/v1/admin/users', data)
  return response.data.data
}

// Content - Tentang Kami
export const getTentangKami = async (): Promise<ContentSection> => {
  const response = await api.get<ApiResponse<ContentSection>>('/v1/admin/content/tentang-kami')
  return response.data.data
}

export const updateTentangKami = async (data: {
  title?: string
  subtitle?: string
  body: string
  image_url?: string
  video_url?: string
  is_active: boolean
}): Promise<ContentSection> => {
  const response = await api.put<ApiResponse<ContentSection>>('/v1/admin/content/tentang-kami', data)
  return response.data.data
}

// History Entries - Admin
export interface GetHistoryEntriesParams {
  page?: number
  limit?: number
  status?: string
  category?: string
}

export const getAdminHistoryEntries = async (
  params?: GetHistoryEntriesParams
): Promise<PaginatedResponse<HistoryEntry>> => {
  const response = await api.get<PaginatedResponse<HistoryEntry>>('/v1/admin/history-entries', { params })
  return response.data
}

export const getHistoryEntryById = async (id: string): Promise<HistoryEntry> => {
  const response = await api.get<ApiResponse<HistoryEntry>>(`/v1/admin/history-entries/${id}`)
  return response.data.data
}

export const createHistoryEntry = async (data: {
  title: string
  content: string
  entry_date: string
  category: 'milestone' | 'achievement' | 'event'
  image_url?: string
  is_published?: boolean
}): Promise<HistoryEntry> => {
  const response = await api.post<ApiResponse<HistoryEntry>>('/v1/admin/history-entries', data)
  return response.data.data
}

export const updateHistoryEntry = async (
  id: string,
  data: Partial<HistoryEntry>
): Promise<HistoryEntry> => {
  const response = await api.put<ApiResponse<HistoryEntry>>(`/v1/admin/history-entries/${id}`, data)
  return response.data.data
}

export const deleteHistoryEntry = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/history-entries/${id}`)
}

export const toggleHistoryEntryStatus = async (id: string): Promise<HistoryEntry> => {
  const response = await api.put<ApiResponse<HistoryEntry>>(`/v1/admin/history-entries/${id}/toggle`)
  return response.data.data
}

// Strukturs - Admin
export interface GetStruktursParams {
  page?: number
  limit?: number
}

export const getAdminStrukturs = async (
  params?: GetStruktursParams
): Promise<PaginatedResponse<Struktur>> => {
  const response = await api.get<PaginatedResponse<Struktur>>('/v1/admin/strukturs', { params })
  return response.data
}

export const getStrukturById = async (id: string): Promise<Struktur> => {
  const response = await api.get<ApiResponse<Struktur>>(`/v1/admin/strukturs/${id}`)
  return response.data.data
}

export const createStruktur = async (data: {
  name: string
  role: 'ketua' | 'sekretaris' | 'bendahara' | 'humas' | 'imam_syah' | 'muadzin' | 'dai_amil' | 'marbot' | 'lainnya'
  photo_url?: string
  email?: string
  phone?: string
  department?: string
  bio?: string
  social_media?: Record<string, string>
  display_order?: number
  is_active?: boolean
}): Promise<Struktur> => {
  const response = await api.post<ApiResponse<Struktur>>('/v1/admin/strukturs', data)
  return response.data.data
}

export const updateStruktur = async (
  id: string,
  data: Partial<Struktur>
): Promise<Struktur> => {
  const response = await api.put<ApiResponse<Struktur>>(`/v1/admin/strukturs/${id}`, data)
  return response.data.data
}

export const deleteStruktur = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/strukturs/${id}`)
}

export const reorderStrukturs = async (items: { id: string; display_order: number }[]): Promise<void> => {
  await api.put('/v1/admin/strukturs/reorder', { items })
}

export const toggleStrukturStatus = async (id: string): Promise<Struktur> => {
  const response = await api.put<ApiResponse<Struktur>>(`/v1/admin/strukturs/${id}/toggle`)
  return response.data.data
}

export const getActiveStruktursCount = async (): Promise<number> => {
  const response = await api.get<ApiResponse<number>>('/v1/admin/strukturs/active-count')
  return response.data.data
}

// Mosque Info
export const updateMosqueInfo = async (data: Partial<MosqueInfo>): Promise<MosqueInfo> => {
  const response = await api.put<ApiResponse<MosqueInfo>>('/v1/admin/mosque', data)
  return response.data.data
}

export interface GetReservationsParams {
  page?: number
  limit?: number
  status?: ReservationStatus
  facility?: string
  from?: string
  to?: string
}

export const getAdminReservations = async (
  params: GetReservationsParams = {}
): Promise<PaginatedResponse<Reservation>> => {
  const response = await api.get<PaginatedResponse<Reservation>>('/v1/admin/reservations', { params })
  return response.data
}

export const createAdminReservation = async (data: CreateReservationRequest): Promise<Reservation> => {
  const response = await api.post<ApiResponse<Reservation>>('/v1/admin/reservations/create', data)
  return response.data.data
}

export interface UpdateReservationRequest {
  requester_name?: string
  requester_phone?: string | null
  requester_email?: string | null
  facility?: string
  event_title?: string | null
  start_at?: string
  end_at?: string
  participant_count?: number | null
  notes?: string | null
  status?: ReservationStatus
  admin_notes?: string | null
}

export const updateAdminReservation = async (
  id: string,
  data: UpdateReservationRequest
): Promise<Reservation> => {
  const response = await api.put<ApiResponse<Reservation>>(`/v1/admin/reservations/${id}`, data)
  return response.data.data
}

export const deleteAdminReservation = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/reservations/${id}`)
}
