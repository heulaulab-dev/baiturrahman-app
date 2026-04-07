import api from '@/lib/axios'
import type { ApiResponse } from '@/types'

const MAX_ADMIN_IMAGE_BYTES = 5 * 1024 * 1024

/** Prefix folder inside the MinIO bucket; must match backend allowlist. */
export type AdminStorageModule =
	| 'general'
	| 'gallery'
	| 'donate'
	| 'konten'
	| 'profile'
	| 'announcements'
	| 'events'
	| 'struktur'
	| 'khutbah'
	| 'history'
	| 'mosque'
	| 'payment-methods'

/**
 * POST multipart `file` + `module` to admin upload.
 * Returns absolute URL (e.g. https://assets.../uploads/{module}/{uuid}.jpg).
 */
export async function uploadAdminImage(
	file: File,
	module: AdminStorageModule = 'general'
): Promise<string> {
	if (file.size > MAX_ADMIN_IMAGE_BYTES) {
		throw new Error('Ukuran berkas maksimal 5MB')
	}
	const formData = new FormData()
	formData.append('file', file)
	formData.append('module', module)
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
