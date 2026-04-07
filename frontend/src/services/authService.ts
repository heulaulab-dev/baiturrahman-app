import { isAxiosError } from 'axios'

import api from '@/lib/axios'
import { setCookie, getCookie, deleteCookie } from '@/lib/cookies'
import type { User, LoginRequest, LoginResponse, ApiResponse } from '@/types'
import { toast } from 'sonner'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const authService = {
  // Get stored tokens
  getToken: (): string | null => {
    // Try localStorage first
    const localStorageToken = localStorage.getItem(TOKEN_KEY)
    if (localStorageToken) return localStorageToken

    // Fallback to cookie
    return getCookie(TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    // Try localStorage first
    const localStorageToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (localStorageToken) return localStorageToken

    // Fallback to cookie
    return getCookie(REFRESH_TOKEN_KEY)
  },

  // Check if using persistent storage (cookies)
  isPersistent: (): boolean => {
    return getCookie(TOKEN_KEY) !== null
  },

  // Store tokens
  setTokens: (accessToken: string, refreshToken: string, rememberMe = false): void => {
    if (rememberMe) {
      // Use cookies for "remember me" - more persistent
      setCookie(TOKEN_KEY, accessToken, { maxAge: 30 * 24 * 60 * 60 }) // 30 days
      setCookie(REFRESH_TOKEN_KEY, refreshToken, { maxAge: 30 * 24 * 60 * 60 })
    } else {
      // Use localStorage for session-based auth
      localStorage.setItem(TOKEN_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  },

  // Clear tokens
  clearTokens: (): void => {
    // Clear both localStorage and cookies
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    deleteCookie(TOKEN_KEY)
    deleteCookie(REFRESH_TOKEN_KEY)
  },

  // Login
  login: async (credentials: LoginRequest, rememberMe = false): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/v1/auth/login', credentials)
      const { access_token, refresh_token, user } = response.data.data

      authService.setTokens(access_token, refresh_token, rememberMe)
      return { access_token, refresh_token, user }
    } catch (error) {
      let msg = (error as Error).message
      if (isAxiosError(error) && !error.response) {
        msg = `Cannot reach the API at ${api.defaults.baseURL ?? 'NEXT_PUBLIC_API_URL'}. Start the backend (e.g. docker compose up backend).`
      }
      toast.error('Login failed: ' + msg)
      throw error
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post<ApiResponse<null>>('/v1/auth/logout')
    } catch (error) {
      // Ignore logout errors, clear tokens anyway
    } finally {
      authService.clearTokens()
    }
  },

  // Refresh token
  refreshToken: async (): Promise<LoginResponse | null> => {
    const refreshToken = authService.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/v1/auth/refresh', {
        refresh_token: refreshToken,
      })
      const { access_token, refresh_token, user } = response.data.data

      // Preserve storage type when refreshing
      const isPersistent = authService.isPersistent()
      authService.setTokens(access_token, refresh_token, isPersistent)

      return { access_token, refresh_token, user }
    } catch (error) {
      authService.clearTokens()
      return null
    }
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/v1/auth/me')
    return response.data.data
  },
}
