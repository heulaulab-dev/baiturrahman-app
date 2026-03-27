import axios from 'axios'
import { authService } from '@/services/authService'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false
let failedQueues: Array<() => void> = []

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = authService.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/login')) {
          // Try to refresh the token
          if (!isRefreshing) {
            isRefreshing = true

            try {
              const refreshResult = await authService.refreshToken()

              if (refreshResult) {
                // Token refreshed successfully, retry original request
                isRefreshing = false

                // Update auth header
                if (originalRequest?.headers) {
                  originalRequest.headers.Authorization = `Bearer ${refreshResult.access_token}`
                }

                // Retry all queued requests
                failedQueues.forEach(cb => cb())
                failedQueues = []

                return api.request(originalRequest!)
              } else {
                // Refresh failed, redirect to login
                authService.clearTokens()
                isRefreshing = false

                // Redirect to login with current path
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
                return Promise.reject(error)
              }
            } catch (refreshError) {
              // Refresh process failed, clear tokens and redirect
              isRefreshing = false
              authService.clearTokens()

              const currentPath = window.location.pathname
              if (!currentPath.startsWith('/login')) {
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
              }

              return Promise.reject(error)
            }
          } else {
            // Queue the request for retry after refresh
            return new Promise((resolve) => {
              failedQueues.push(() => resolve(api.request(originalRequest!)))
            })
          }
        }
      }
    }

    // Handle 422 Validation errors
    if (error.response?.status === 422) {
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
