import api from '@/lib/axios'
import type { ApiResponse } from '@/types'

export interface AsetTetap {
  id: string
  nama_aset: 'Tanah' | 'Bangunan'
  luas?: string
  created_at: string
  updated_at: string
}

export interface BarangTidakTetap {
  id: string
  kategori:
    | 'Sound System'
    | 'Perlengkapan Sholat'
    | 'Perlengkapan TPA/Mengaji'
    | 'Perlengkapan Kebersihan'
    | 'Perlengkapan Lain-Lain'
  nama_barang: string
  jumlah?: number
  satuan?: string
  kondisi_baik: boolean
  keterangan?: string
  created_at: string
  updated_at: string
}

export interface CreateAsetTetapRequest {
  nama_aset: 'Tanah' | 'Bangunan'
  luas?: string
}

export interface UpdateAsetTetapRequest {
  nama_aset: 'Tanah' | 'Bangunan'
  luas?: string
}

export interface CreateBarangTidakTetapRequest {
  kategori: BarangTidakTetap['kategori']
  nama_barang: string
  jumlah?: number
  satuan?: string
  kondisi_baik?: boolean
  keterangan?: string
}

export interface UpdateBarangTidakTetapRequest {
  kategori: BarangTidakTetap['kategori']
  nama_barang: string
  jumlah?: number
  satuan?: string
  kondisi_baik?: boolean
  keterangan?: string
}

export const getAsetTetap = async (): Promise<AsetTetap[]> => {
  const response = await api.get<ApiResponse<AsetTetap[]>>('/v1/admin/inventaris/aset-tetap')
  return response.data.data
}

export const createAsetTetap = async (data: CreateAsetTetapRequest): Promise<AsetTetap> => {
  const response = await api.post<ApiResponse<AsetTetap>>('/v1/admin/inventaris/aset-tetap', data)
  return response.data.data
}

export const updateAsetTetap = async (id: string, data: UpdateAsetTetapRequest): Promise<AsetTetap> => {
  const response = await api.put<ApiResponse<AsetTetap>>(`/v1/admin/inventaris/aset-tetap/${id}`, data)
  return response.data.data
}

export const deleteAsetTetap = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/inventaris/aset-tetap/${id}`)
}

export const getBarangTidakTetap = async (kategori?: string): Promise<BarangTidakTetap[]> => {
  const response = await api.get<ApiResponse<BarangTidakTetap[]>>('/v1/admin/inventaris/barang', {
    params: { kategori },
  })
  return response.data.data
}

export const createBarangTidakTetap = async (
  data: CreateBarangTidakTetapRequest
): Promise<BarangTidakTetap> => {
  const response = await api.post<ApiResponse<BarangTidakTetap>>('/v1/admin/inventaris/barang', data)
  return response.data.data
}

export const updateBarangTidakTetap = async (
  id: string,
  data: UpdateBarangTidakTetapRequest
): Promise<BarangTidakTetap> => {
  const response = await api.put<ApiResponse<BarangTidakTetap>>(`/v1/admin/inventaris/barang/${id}`, data)
  return response.data.data
}

export const deleteBarangTidakTetap = async (id: string): Promise<void> => {
  await api.delete(`/v1/admin/inventaris/barang/${id}`)
}

export const exportInventarisXlsx = async (): Promise<void> => {
  const response = await api.get<Blob>('/v1/admin/inventaris/export/xlsx', { responseType: 'blob' })
  const blob = response.data as unknown as Blob
  if (blob.type.includes('json')) {
    const text = await blob.text()
    const j = JSON.parse(text) as { error?: string }
    throw new Error(j.error || 'Export gagal')
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'inventaris.xlsx'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
