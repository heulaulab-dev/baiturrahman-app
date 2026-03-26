import api from '@/lib/axios'
import type { User, LoginRequest, LoginResponse, ApiResponse } from '@/types'
import { toast } from 'sonner'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const authService = {
  // Get stored tokens
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // Store tokens
  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  // Clear tokens
  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {

    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/v1/auth/login', credentials)
      const { access_token, refresh_token, user } = response.data.data

      authService.setTokens(access_token, refresh_token)
      return { access_token, refresh_token, user }
    } catch (error) {
      toast.error("Login failed: " + (error as Error).message);
      throw error;
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

      authService.setTokens(access_token, refresh_token)

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
