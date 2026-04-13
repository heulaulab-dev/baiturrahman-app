export type UserRole = 'super_admin' | 'admin' | 'editor'
export type OrgRole =
  | 'ketua'
  | 'sekretaris'
  | 'bendahara'
  | 'humas'
  | 'imam_syah'
  | 'muadzin'
  | 'dai_amil'
  | 'marbot'
  | 'lainnya'

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: UserRole
  org_role: OrgRole
  struktur_id?: string | null
  permissions?: string[]
  avatar_url?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface MosqueInfo {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  facebook?: string
  instagram?: string
  youtube?: string
  image_url?: string
  city: string
  province: string
  postal_code?: string
  logo_url?: string
  banner_url?: string
  latitude?: number
  longitude?: number
  maps_embed_url?: string
  social_media?: {
    facebook?: string
    instagram?: string
    youtube?: string
    twitter?: string
  }
  established_year?: number
  vision?: string
  mission?: string
  created_at: string
  updated_at: string
}

export interface PrayerTime {
  id: string
  date: string
  fajr: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  created_at: string
}

export type EventCategory = 'kajian' | 'sosial' | 'pendidikan' | 'other'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

/** Backend `events` row — JSON uses snake_case from Go. */
export interface Event {
  id: string
  title: string
  slug: string
  description: string
  content?: string
  category: EventCategory
  event_date: string
  event_time?: string | null
  location?: string | null
  is_online: boolean
  meeting_url?: string | null
  image_url?: string | null
  gallery?: string[] | null
  max_participants?: number | null
  registration_required: boolean
  status: EventStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
export type AnnouncementCategoryType = 'info' | 'warning' | 'event' | 'donation'

export interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  category: AnnouncementCategoryType
  published_at?: string | null
  expires_at?: string | null
  is_pinned: boolean
  image_url?: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Khutbah {
  id: string
  khatib: string
  tema: string
  imam?: string | null
  muadzin?: string | null
  date: string
  content?: string | null
  file_url?: string | null
  status: 'draft' | 'published'
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  donor_name: string
  amount: number
  payment_method: string
  status: 'pending' | 'confirmed' | 'rejected'
  message?: string
  created_at: string
}

export type PaymentMethodType = 'bank_transfer' | 'ewallet' | 'qris'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  account_number?: string
  account_name?: string
  qr_code_url?: string
  instructions?: string
  is_active: boolean
  display_order: number
}

export interface PaymentMethodsResponse {
	success: boolean;
	data: PaymentMethod[];
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

export interface ContentSection {
  id: string
  section_key: string
  title?: string
  subtitle?: string
  body: string
  image_url?: string
  video_url?: string
  display_order: number
  is_active: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface StructureMember {
  id: string
  name: string
  position: string
  role: string
  image_url?: string
  order: number
  created_at: string
}

export interface DonationFull {
  id: string
  donation_code: string
  donor_name: string
  donor_email?: string
  donor_phone?: string
  amount: number
  payment_method_id?: string
  category: 'infaq' | 'sedekah' | 'zakat' | 'wakaf' | 'operasional'
  notes: string
  status: 'pending' | 'confirmed' | 'cancelled'
  proof_url?: string
  confirmed_by?: string
  confirmed_at?: string
  created_at: string
  updated_at: string
  payment_method?: PaymentMethod
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Reservation {
  id: string
  requester_name: string
  requester_phone?: string
  requester_email?: string
  facility: string
  event_title?: string
  start_at: string
  end_at: string
  participant_count?: number
  notes?: string
  status: ReservationStatus
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  reviewer?: Pick<User, 'id' | 'full_name' | 'email'>
  created_at: string
  updated_at: string
}

/** Body untuk POST publik `/v1/reservations` (ISO 8601 untuk waktu). */
export interface CreateReservationRequest {
  requester_name: string
  requester_phone?: string
  requester_email?: string
  facility: string
  event_title?: string
  start_at: string
  end_at: string
  participant_count?: number
  notes?: string
}

export interface DonationStats {
  total_amount: number
  total_count: number
  by_category: Record<string, { total: number; count: number }>
  by_month: Record<string, { total: number; count: number }>
  pending_count: number
  confirmed_count: number
  cancelled_count: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface HistoryEntry {
  id: string
  title: string
  content: string
  entry_date: string
  category: 'milestone' | 'achievement' | 'event'
  image_url?: string
  is_published: boolean
  created_by?: string
  created_at: string
  updated_at: string
  creator?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

/** Curated landing gallery (admin-managed). */
export interface GalleryItem {
  id: string
  title: string
  summary: string
  image_url: string
  link_url: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

/** Landing hero background slides (Konten → Banner), separate from gallery. */
export interface HeroSlide {
  id: string
  image_url: string
  alt_text: string
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Struktur {
  id: string
  name: string
  role: 'ketua' | 'sekretaris' | 'bendahara' | 'humas' | 'imam_syah' | 'muadzin' | 'dai_amil' | 'marbot' | 'lainnya'
  photo_url?: string
  email?: string
  phone?: string
  department?: string
  bio?: string
  social_media?: string
  display_order: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
  creator?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
}

export type FinanceFundType = 'kas_besar' | 'kas_kecil'
export type FinanceTxType =
  | 'pemasukan'
  | 'pengeluaran'
  | 'transfer_out'
  | 'transfer_in'
  | 'opening_balance'
  | 'adjustment'
export type FinanceApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface FinanceTransaction {
  id: string
  fund_type: FinanceFundType
  tx_type: FinanceTxType
  tx_date: string
  amount: number
  category: string
  description: string
  reference_no?: string | null
  display_below: boolean
  approval_status: FinanceApprovalStatus
  linked_transfer_id?: string | null
  created_by: string
  approved_by?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string
}

export interface FinanceBalanceResponse {
  fund_type: FinanceFundType
  balance: number
}
