import api from '@/lib/axios'
import type { ApiResponse } from '@/types'

const MAX_ADMIN_IMAGE_BYTES = 5 * 1024 * 1024

/** POST multipart `file` to admin upload; returns relative path e.g. `/uploads/{uuid}.jpg`. */
export async function uploadAdminImage(file: File): Promise<string> {
	if (file.size > MAX_ADMIN_IMAGE_BYTES) {
		throw new Error('Ukuran berkas maksimal 5MB')
	}
	const formData = new FormData()
	formData.append('file', file)
	const response = await api.post<ApiResponse<{ url: string }>>('/v1/admin/upload', formData, {
		transformRequest: [
			(data, headers) => {
				delete headers['Content-Type']
				return data as FormData
			},
		],
	})
	return response.data.data.url
}
