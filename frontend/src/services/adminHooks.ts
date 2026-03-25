import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDonationStats,
  getAdminDonations,
  confirmDonation,
  getAdminEvents,
  getAdminUsers,
} from './adminApiService'

export const useDonationStats = () => {
  return useQuery({
    queryKey: ['admin', 'donation-stats'],
    queryFn: getDonationStats,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  })
}

export const usePendingDonations = (limit = 5) => {
  return useQuery({
    queryKey: ['admin', 'donations', 'pending', limit],
    queryFn: () => getAdminDonations({ status: 'pending', limit, page: 1 }),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  })
}

export const useRecentDonations = (limit = 5) => {
  return useQuery({
    queryKey: ['admin', 'donations', 'recent', limit],
    queryFn: () => getAdminDonations({ limit, page: 1 }),
    staleTime: 1000 * 60,
  })
}

export const useConfirmDonation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'donations'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'donation-stats'] })
    },
  })
}

export const useAdminEvents = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'events', limit],
    queryFn: () => getAdminEvents({ limit, page: 1 }),
    staleTime: 1000 * 60 * 5,
  })
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
    staleTime: 1000 * 60 * 5,
  })
}
