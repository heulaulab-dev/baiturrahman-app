import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
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
  createAdminEvent,
  updateAdminEvent,
  deleteAdminEvent,
  createAdminAnnouncement,
  updateAdminAnnouncement,
  deleteAdminAnnouncement,
  createAdminKhutbah,
  updateAdminKhutbah,
  deleteAdminKhutbah,
  toggleAdminKhutbahStatus,
  getAdminUsers,
  createUser,
  getRbacRoles,
  getRbacPermissions,
  getRbacRolePermissions,
  updateRbacRolePermissions,
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
  getAdminReservations,
  updateAdminReservation,
  deleteAdminReservation,
  getAdminGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
  toggleGalleryItemPublished,
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  toggleHeroSlidePublished,
  getAdminSponsors,
  createAdminSponsor,
  updateAdminSponsor,
  deleteAdminSponsor,
  reorderAdminSponsors,
  type GetReservationsParams,
  type UpdateReservationRequest,
  type CreateEventPayload,
  type CreateAnnouncementPayload,
  type CreateKhutbahPayload,
} from './adminApiService'
import type { OrgRole } from '@/types'

function invalidateKontenLandingQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['events'] })
  queryClient.invalidateQueries({ queryKey: ['event'] })
  queryClient.invalidateQueries({ queryKey: ['announcements'] })
  queryClient.invalidateQueries({ queryKey: ['khutbah', 'latest'] })
  queryClient.invalidateQueries({ queryKey: ['khutbah', 'archive'] })
}

export const useDonationStats = (queryEnabled = true) => {
  return useQuery({
    queryKey: ['admin', 'donation-stats'],
    queryFn: getDonationStats,
    enabled: queryEnabled,
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
  donor_name?: string
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

export const useCreateAdminEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventPayload) => createAdminEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useUpdateAdminEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateEventPayload }) => updateAdminEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useDeleteAdminEvent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useCreateAdminAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAnnouncementPayload) => createAdminAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useUpdateAdminAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAnnouncementPayload }) =>
      updateAdminAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useDeleteAdminAnnouncement = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useCreateAdminKhutbah = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateKhutbahPayload) => createAdminKhutbah(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'khutbahs'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useUpdateAdminKhutbah = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateKhutbahPayload }) => updateAdminKhutbah(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'khutbahs'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useDeleteAdminKhutbah = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminKhutbah(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'khutbahs'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useToggleAdminKhutbahStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleAdminKhutbahStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'khutbahs'] })
      invalidateKontenLandingQueries(queryClient)
    },
  })
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export const useRbacRoles = () => {
  return useQuery({
    queryKey: ['admin', 'rbac', 'roles'],
    queryFn: getRbacRoles,
    staleTime: 1000 * 60 * 5,
  })
}

export const useRbacPermissions = () => {
  return useQuery({
    queryKey: ['admin', 'rbac', 'permissions'],
    queryFn: getRbacPermissions,
    staleTime: 1000 * 60 * 5,
  })
}

export const useRbacRolePermissions = (orgRole: OrgRole | '') => {
  return useQuery({
    queryKey: ['admin', 'rbac', 'role-permissions', orgRole],
    queryFn: () => getRbacRolePermissions(orgRole as OrgRole),
    enabled: !!orgRole,
    staleTime: 1000 * 30,
  })
}

export const useUpdateRbacRolePermissions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgRole, permissionKeys }: { orgRole: OrgRole; permissionKeys: string[] }) =>
      updateRbacRolePermissions(orgRole, permissionKeys),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rbac', 'role-permissions', variables.orgRole] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'rbac', 'roles'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
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
      queryClient.invalidateQueries({ queryKey: ['tentang-kami'] })
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
      queryClient.invalidateQueries({ queryKey: ['history-entries'] })
    },
  })
}

export const useUpdateHistoryEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateHistoryEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
      queryClient.invalidateQueries({ queryKey: ['history-entries'] })
    },
  })
}

export const useDeleteHistoryEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHistoryEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
      queryClient.invalidateQueries({ queryKey: ['history-entries'] })
    },
  })
}

export const useToggleHistoryEntryStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleHistoryEntryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'history-entries'] })
      queryClient.invalidateQueries({ queryKey: ['history-entries'] })
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
      queryClient.invalidateQueries({ queryKey: ['strukturs', 'public'] })
    },
  })
}

export const useUpdateStruktur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateStruktur(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
      queryClient.invalidateQueries({ queryKey: ['strukturs', 'public'] })
    },
  })
}

export const useDeleteStruktur = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteStruktur,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
      queryClient.invalidateQueries({ queryKey: ['strukturs', 'public'] })
    },
  })
}

export const useReorderStrukturs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderStrukturs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
      queryClient.invalidateQueries({ queryKey: ['strukturs', 'public'] })
    },
  })
}

export const useToggleStrukturStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleStrukturStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'strukturs'] })
      queryClient.invalidateQueries({ queryKey: ['strukturs', 'public'] })
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

export const useAdminReservations = (params?: GetReservationsParams) => {
  return useQuery({
    queryKey: ['admin', 'reservations', params],
    queryFn: () => getAdminReservations(params),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  })
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationRequest }) =>
      updateAdminReservation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
    },
  })
}

export const useDeleteReservation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
    },
  })
}

// Gallery
export const useAdminGalleryItems = () => {
  return useQuery({
    queryKey: ['admin', 'gallery', 'items'],
    queryFn: getAdminGalleryItems,
    staleTime: 1000 * 30,
  })
}

export const useCreateGalleryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', 'items'] })
    },
  })
}

export const useUpdateGalleryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateGalleryItem>[1] }) =>
      updateGalleryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', 'items'] })
    },
  })
}

export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', 'items'] })
    },
  })
}

export const useReorderGalleryItems = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderGalleryItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', 'items'] })
    },
  })
}

export const useToggleGalleryItemPublished = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleGalleryItemPublished,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gallery', 'items'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', 'items'] })
    },
  })
}

// Hero slides (landing banner)
export const useAdminHeroSlides = () => {
  return useQuery({
    queryKey: ['admin', 'hero', 'slides'],
    queryFn: getAdminHeroSlides,
    staleTime: 1000 * 30,
  })
}

export const useCreateHeroSlide = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero', 'slides'] })
      queryClient.invalidateQueries({ queryKey: ['hero', 'slides'] })
    },
  })
}

export const useUpdateHeroSlide = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateHeroSlide>[1] }) =>
      updateHeroSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero', 'slides'] })
      queryClient.invalidateQueries({ queryKey: ['hero', 'slides'] })
    },
  })
}

export const useDeleteHeroSlide = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHeroSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero', 'slides'] })
      queryClient.invalidateQueries({ queryKey: ['hero', 'slides'] })
    },
  })
}

export const useReorderHeroSlides = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderHeroSlides,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero', 'slides'] })
      queryClient.invalidateQueries({ queryKey: ['hero', 'slides'] })
    },
  })
}

export const useToggleHeroSlidePublished = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleHeroSlidePublished,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero', 'slides'] })
      queryClient.invalidateQueries({ queryKey: ['hero', 'slides'] })
    },
  })
}

function invalidatePublicSponsors(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['sponsors', 'public'] })
  queryClient.invalidateQueries({ queryKey: ['sponsors', 'landing'] })
}

// Sponsors (mitra)
export const useAdminSponsors = (enabled = true) => {
  return useQuery({
    queryKey: ['admin', 'sponsors'],
    queryFn: getAdminSponsors,
    enabled,
    staleTime: 1000 * 30,
  })
}

export const useCreateAdminSponsor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdminSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] })
      invalidatePublicSponsors(queryClient)
    },
  })
}

export const useUpdateAdminSponsor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAdminSponsor>[1] }) =>
      updateAdminSponsor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] })
      invalidatePublicSponsors(queryClient)
    },
  })
}

export const useDeleteAdminSponsor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdminSponsor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] })
      invalidatePublicSponsors(queryClient)
    },
  })
}

export const useReorderAdminSponsors = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: reorderAdminSponsors,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sponsors'] })
      invalidatePublicSponsors(queryClient)
    },
  })
}
