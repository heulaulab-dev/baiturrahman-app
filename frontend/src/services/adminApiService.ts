import axios from 'axios'
import api from '@/lib/axios'
import type {
  DonationFull,
  DonationStats,
  Event,
  EventCategory,
  EventStatus,
  User,
  UserRole,
  OrgRole,
  PaymentMethod,
  Announcement,
  AnnouncementPriority,
  AnnouncementCategoryType,
  Khutbah,
  ApiResponse,
  PaginatedResponse,
  HistoryEntry,
  GalleryItem,
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
  /** Partial match on donor name (server-side, case-insensitive). */
  donor_name?: string
}

/** Same filter fields as list; exports all matching rows as CSV. */
export type ExportDonationsParams = Pick<
  GetDonationsParams,
  'status' | 'category' | 'from' | 'to' | 'donor_name'
>

export const getAdminDonations = async (
  params: GetDonationsParams = {}
): Promise<PaginatedResponse<DonationFull>> => {
  const response = await api.get<PaginatedResponse<DonationFull>>('/v1/admin/donations', { params })
  return response.data
}

function filenameFromContentDisposition(cd: string | undefined, fallback: string): string {
  if (typeof cd !== 'string') return fallback
  const quoted = /filename="([^"]+)"/.exec(cd)
  const plain = /filename=([^;\s]+)/.exec(cd)
  if (quoted) return quoted[1]
  if (plain) return plain[1].trim()
  return fallback
}

function triggerCsvDownload(blob: Blob, contentDisposition: string | undefined): void {
  const filename = filenameFromContentDisposition(contentDisposition, 'donasi.csv')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function assertCsvBlobOrThrowJsonError(blob: Blob): Promise<void> {
  if (!blob.type.includes('json')) return
  const text = await blob.text()
  const j = JSON.parse(text) as { error?: string }
  throw new Error(j.error || 'Export gagal')
}

async function axiosBlobErrorMessage(err: unknown): Promise<string> {
  if (!axios.isAxiosError(err) || !(err.response?.data instanceof Blob)) {
    return ''
  }
  const text = await err.response.data.text()
  try {
    const j = JSON.parse(text) as { error?: string }
    return j.error || 'Export gagal'
  } catch {
    return text ? text.slice(0, 200) : 'Export gagal'
  }
}

export const exportAdminDonationsCsv = async (params: ExportDonationsParams = {}): Promise<void> => {
  try {
    const response = await api.get<Blob>('/v1/admin/donations/export', {
      params,
      responseType: 'blob',
    })
    const blob = response.data as unknown as Blob
    await assertCsvBlobOrThrowJsonError(blob)
    triggerCsvDownload(blob, response.headers['content-disposition'])
  } catch (err) {
    const fromAxios = await axiosBlobErrorMessage(err)
    if (fromAxios) throw new Error(fromAxios)
    throw err
  }
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
  params: { page?: number; limit?: number; status?: 'draft' | 'published' } = {}
): Promise<PaginatedResponse<Khutbah>> => {
  const response = await api.get<PaginatedResponse<Khutbah>>('/v1/admin/khutbahs', { params })
  return response.data
}

export const getAdminKhutbahById = async (id: string): Promise<Khutbah> => {
  const response = await api.get<ApiResponse<Khutbah>>(`/v1/admin/khutbahs/${id}`)
  return response.data.data
}

export type CreateEventPayload = {
  title: string
  slug: string
  description?: string
  content?: string
  category: EventCategory
  event_date: string
  event_time?: string | null
  location?: string | null
  is_online?: boolean
  meeting_url?: string | null
  image_url?: string | null
  gallery?: string[] | null
  max_participants?: number | null
  registration_required?: boolean
  status: EventStatus
}

export const createAdminEvent = async (data: CreateEventPayload): Promise<Event> => {
  const response = await api.post<ApiResponse<Event>>('/v1/admin/events', data)
  return response.data.data
}

export const updateAdminEvent = async (id: string, data: CreateEventPayload): Promise<Event> => {
  // Include `id` so JSON binding does not zero the UUID on the server.
  const response = await api.put<ApiResponse<Event>>(`/v1/admin/events/${id}`, { ...data, id })
  return response.data.data
}

export const deleteAdminEvent = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/events/${id}`)
}

export type CreateAnnouncementPayload = {
  title: string
  content: string
  priority?: AnnouncementPriority
  category: AnnouncementCategoryType
  published_at?: string | null
  expires_at?: string | null
  is_pinned?: boolean
  image_url?: string | null
}

export const createAdminAnnouncement = async (data: CreateAnnouncementPayload): Promise<Announcement> => {
  const response = await api.post<ApiResponse<Announcement>>('/v1/admin/announcements', data)
  return response.data.data
}

export const updateAdminAnnouncement = async (
  id: string,
  data: CreateAnnouncementPayload
): Promise<Announcement> => {
  const response = await api.put<ApiResponse<Announcement>>(`/v1/admin/announcements/${id}`, { ...data, id })
  return response.data.data
}

export const deleteAdminAnnouncement = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/announcements/${id}`)
}

export type CreateKhutbahPayload = {
  khatib: string
  tema: string
  imam?: string | null
  muadzin?: string | null
  date: string
  content?: string | null
  file_url?: string | null
  status: 'draft' | 'published'
}

export const createAdminKhutbah = async (data: CreateKhutbahPayload): Promise<Khutbah> => {
  const response = await api.post<ApiResponse<Khutbah>>('/v1/admin/khutbahs', data)
  return response.data.data
}

export const updateAdminKhutbah = async (id: string, data: CreateKhutbahPayload): Promise<Khutbah> => {
  const response = await api.put<ApiResponse<Khutbah>>(`/v1/admin/khutbahs/${id}`, { ...data, id })
  return response.data.data
}

export const deleteAdminKhutbah = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/khutbahs/${id}`)
}

export const toggleAdminKhutbahStatus = async (id: string): Promise<Khutbah> => {
  const response = await api.put<ApiResponse<Khutbah>>(`/v1/admin/khutbahs/${id}/toggle`)
  return response.data.data
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
  org_role: OrgRole
  struktur_id?: string
}

export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/v1/admin/users', data)
  return response.data.data
}

export interface RbacRoleItem {
  value: OrgRole
  label: string
}

export interface RbacPermissionItem {
  key: string
  name: string
  description: string
  module: string
  is_active: boolean
}

export interface RbacRolePermissionItem extends RbacPermissionItem {
  allowed: boolean
}

export interface RbacRolePermissionsResponse {
  org_role: OrgRole
  permissions: RbacRolePermissionItem[]
}

export const getRbacRoles = async (): Promise<RbacRoleItem[]> => {
  const response = await api.get<ApiResponse<RbacRoleItem[]>>('/v1/admin/rbac/roles')
  return response.data.data
}

export const getRbacPermissions = async (): Promise<RbacPermissionItem[]> => {
  const response = await api.get<ApiResponse<RbacPermissionItem[]>>('/v1/admin/rbac/permissions')
  return response.data.data
}

export const getRbacRolePermissions = async (orgRole: OrgRole): Promise<RbacRolePermissionsResponse> => {
  const response = await api.get<ApiResponse<RbacRolePermissionsResponse>>(`/v1/admin/rbac/roles/${orgRole}/permissions`)
  return response.data.data
}

export const updateRbacRolePermissions = async (
  orgRole: OrgRole,
  permissionKeys: string[]
): Promise<RbacRolePermissionsResponse> => {
  const response = await api.put<ApiResponse<RbacRolePermissionsResponse>>(`/v1/admin/rbac/roles/${orgRole}/permissions`, {
    permission_keys: permissionKeys,
  })
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

// Gallery — admin
export const getAdminGalleryItems = async (): Promise<GalleryItem[]> => {
  const response = await api.get<ApiResponse<GalleryItem[]>>('/v1/admin/gallery/items')
  return response.data.data ?? []
}

export const createGalleryItem = async (data: {
  title: string
  summary?: string
  image_url: string
  link_url?: string
  sort_order?: number
  is_published?: boolean
}): Promise<GalleryItem> => {
  const response = await api.post<ApiResponse<GalleryItem>>('/v1/admin/gallery/items', data)
  return response.data.data
}

export const updateGalleryItem = async (
  id: string,
  data: Partial<{
    title: string
    summary: string
    image_url: string
    link_url: string
    sort_order: number
    is_published: boolean
  }>
): Promise<GalleryItem> => {
  const response = await api.put<ApiResponse<GalleryItem>>(`/v1/admin/gallery/items/${id}`, data)
  return response.data.data
}

export const deleteGalleryItem = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/gallery/items/${id}`)
}

export const reorderGalleryItems = async (
  items: { id: string; sort_order: number }[]
): Promise<void> => {
  await api.put('/v1/admin/gallery/items/reorder', { items })
}

export const toggleGalleryItemPublished = async (id: string): Promise<GalleryItem> => {
  const response = await api.put<ApiResponse<GalleryItem>>(`/v1/admin/gallery/items/${id}/toggle`)
  return response.data.data
}
