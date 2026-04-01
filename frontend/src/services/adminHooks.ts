import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getDonationStats,
  getAdminDonations,
  confirmDonation,
  getAdminPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getAdminEvents,
  getAdminAnnouncements,
  getAdminKhutbahs,
  getAdminUsers,
  getTentangKami,
  updateTentangKami,
  getAdminHistoryEntries,
  getHistoryEntryById,
  createHistoryEntry,
  updateHistoryEntry,
  deleteHistoryEntry,
  toggleHistoryEntryStatus,
  getAdminStrukturs,
  getStrukturById,
  createStruktur,
  updateStruktur,
  deleteStruktur,
  reorderStrukturs,
  toggleStrukturStatus,
  getActiveStruktursCount,
  updateMosqueInfo,
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

export const useAdminDonations = (params?: {
  page?: number
  limit?: number
  status?: 'pending' | 'confirmed' | 'cancelled'
  category?: string
  from?: string
  to?: string
}) => {
  return useQuery({
    queryKey: ['admin', 'donations', 'list', params],
    queryFn: () => getAdminDonations(params),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
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

export const useAdminPaymentMethods = () => {
  return useQuery({
    queryKey: ['admin', 'payment-methods'],
    queryFn: getAdminPaymentMethods,
    staleTime: 1000 * 30,
  })
}

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] })
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] })
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })
}

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payment-methods'] })
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
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

export const useAdminAnnouncements = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'announcements', limit],
    queryFn: () => getAdminAnnouncements({ limit, page: 1 }),
    staleTime: 1000 * 60 * 5,
  })
}

export const useAdminKhutbahs = (limit = 10) => {
  return useQuery({
    queryKey: ['admin', 'khutbahs', limit],
    queryFn: () => getAdminKhutbahs({ limit, page: 1 }),
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

// Tentang Kami
export const useTentangKami = () => {
  return useQuery({
    queryKey: ['admin', 'tentang-kami'],
    queryFn: getTentangKami,
    staleTime: 1000 * 60 * 5,
  })
}

export const useUpdateTentangKami = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateTentangKami,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tentang-kami'] })
      queryClient.invalidateQueries({ queryKey: ['public', 'content'] })
    },
  })
}

// History Entries
export const useAdminHistoryEntries = (params?: { page?: number; limit?: number; status?: string; category?: string }) => {
  return useQuery({
    queryKey: ['admin', 'history-entries', params],
    queryFn: () => getAdminHistoryEntries(params),
    staleTime: 1000 * 30,
  })
}

export const useHistoryEntry = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'history-entries', id],
    queryFn: () => getHistoryEntryById(id),
    enabled: !!id,
  })
}

export const useCreateHistoryEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
    },
  })
}

export const useUpdateHistoryEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateHistoryEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
    },
  })
}

export const useDeleteHistoryEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
    },
  })
}

export const useToggleHistoryEntryStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleHistoryEntryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
    },
  })
}

// Strukturs
export const useAdminStrukturs = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'strukturs', params],
    queryFn: () => getAdminStrukturs(params),
    staleTime: 1000 * 30,
  })
}

export const useStruktur = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'strukturs', id],
    queryFn: () => getStrukturById(id),
    enabled: !!id,
  })
}

export const useCreateStruktur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createStruktur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
    },
  })
}

export const useUpdateStruktur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateStruktur(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
    },
  })
}

export const useDeleteStruktur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStruktur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
    },
  })
}

export const useReorderStrukturs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderStrukturs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
    },
  })
}

export const useToggleStrukturStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleStrukturStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
    },
  })
}

export const useActiveStruktursCount = () => {
  return useQuery({
    queryKey: ['admin', 'strukturs', 'active-count'],
    queryFn: getActiveStruktursCount,
    staleTime: 1000 * 60,
  })
}

// Mosque Info
export const useUpdateMosqueInfo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMosqueInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosque-info'] })
    },
  })
}
