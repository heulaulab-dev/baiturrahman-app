import { ApiReference } from '@scalar/nextjs-api-reference'

/**
 * Interactive API docs (Scalar). Spec: `frontend/public/openapi.json`.
 * Includes gallery routes under tags Public + Gallery and Admin + Gallery (`/api/v1/gallery/items`, `/api/v1/admin/gallery/*`).
 */
export const GET = ApiReference({
	url: '/openapi.json',
})
