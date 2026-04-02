import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** API base URL env is usually `.../api`; asset URLs from upload are served from the same host without `/api`. */
export function getBackendOrigin(): string {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
	const origin = apiUrl.replace(/\/?api\/?$/, "").replace(/\/$/, "")
	return origin || "http://localhost:8080"
}

/** Turn backend paths like `/uploads/x.png` into absolute URLs for `<img>` / `next/image`. */
export function resolveBackendAssetUrl(urlOrPath: string | undefined | null): string | undefined {
	if (!urlOrPath?.trim()) return undefined
	const u = urlOrPath.trim()
	if (u.startsWith("http://") || u.startsWith("https://")) return u
	const origin = getBackendOrigin()
	return `${origin}${u.startsWith("/") ? u : `/${u}`}`
}
