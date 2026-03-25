import api from '@/lib/axios'
import type {
  DonationFull,
  DonationStats,
  Event,
  User,
  ApiResponse,
  PaginatedResponse,
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

export const getAdminEvents = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<Event>> => {
  const response = await api.get<PaginatedResponse<Event>>('/v1/admin/events', { params })
  return response.data
}

export const getAdminUsers = async (): Promise<PaginatedResponse<User>> => {
  const response = await api.get<PaginatedResponse<User>>('/v1/admin/users')
  return response.data
}
