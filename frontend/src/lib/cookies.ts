// Cookie utility functions (client-side only)
// These should only be imported in client components

const isClient = typeof window !== 'undefined'

export function setCookie(name: string, value: string, options: { maxAge?: number } = {}): void {
  if (!isClient) return

  const maxAge = options.maxAge ?? 30 * 24 * 60 * 60 // 30 days default
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function getCookie(name: string): string | null {
  if (!isClient) return null

  const value = `; ${document.cookie}`.split(`; ${name}=`)[1]?.split(';')[0]
  return value || null
}

export function deleteCookie(name: string): void {
  if (!isClient) return

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}
