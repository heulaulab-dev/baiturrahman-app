export type UserRole = 'super_admin' | 'admin' | 'editor'

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  role: UserRole
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

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  date: string
  time: string
  location: string
  image_url?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

interface EventsResponse {
	success: boolean;
	data: Event[];
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}

interface EventResponse {
	success: boolean;
	data: Event;
}

export interface Announcement {
  id: string
  title: string
  content: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AnnouncementsResponse {
	success: boolean;
	data: Announcement[];
	page: number;
	limit: number;
	total: number;
	total_pages: number;
}



export interface Khutbah {
  id: string
  khatib: string
  tema: string
  imam?: string
  muadzin?: string
  date: string
  content?: string
  file_url?: string
  status: 'draft' | 'published'
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

export interface Khutbah {
  id: string
  khatib: string
  tema: string
  imam?: string
  muadzin?: string
  date: string
  content?: string
  file_url?: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
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
