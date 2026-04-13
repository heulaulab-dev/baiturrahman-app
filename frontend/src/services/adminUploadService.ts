import api from '@/lib/axios'
import type { ApiResponse } from '@/types'

const MAX_ADMIN_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_ADMIN_PDF_BYTES = 15 * 1024 * 1024

function postAdminUpload(file: File, module: AdminUploadModule) {
	const formData = new FormData()
	formData.append('file', file)
	formData.append('module', module)
	return api.post<ApiResponse<{ url: string }>>('/v1/admin/upload', formData, {
		transformRequest: [
			(data, headers) => {
				delete headers['Content-Type']
				return data as FormData
			},
		],
	})
}

/** Logical folder inside the MinIO bucket (must match backend allowlist). */
export type AdminUploadModule =
	| 'general'
	| 'donate'
	| 'content'
	| 'berita'
	| 'events'
	| 'announcements'
	| 'structure'
	| 'mosque'
	| 'khutbah'
	| 'gallery'
	| 'hero'

/** POST multipart `file` + optional `module` to admin upload; returns public object URL. */
export async function uploadAdminImage(file: File, module: AdminUploadModule = 'general'): Promise<string> {
	if (file.size > MAX_ADMIN_IMAGE_BYTES) {
		throw new Error('Ukuran berkas maksimal 5MB')
	}
	const response = await postAdminUpload(file, module)
	return response.data.data.url
}

/** PDF lampiran (mis. khutbah); batas 15MB. */
export async function uploadAdminPdf(file: File, module: AdminUploadModule = 'khutbah'): Promise<string> {
	const isPdf =
		file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
	if (!isPdf) {
		throw new Error('Gunakan berkas PDF.')
	}
	if (file.size > MAX_ADMIN_PDF_BYTES) {
		throw new Error('Ukuran PDF maksimal 15MB')
	}
	const response = await postAdminUpload(file, module)
	return response.data.data.url
}
