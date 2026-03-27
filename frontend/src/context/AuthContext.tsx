'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import type { User, LoginRequest } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest, redirectUrl?: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isRemembered: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user
  const isRemembered = authService.isPersistent()

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = authService.getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await authService.getMe()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        authService.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const login = async (credentials: LoginRequest, redirectUrl?: string, rememberMe = false) => {
    const { user: userData } = await authService.login(credentials, rememberMe)
    setUser(userData)
    router.push(redirectUrl || '/dashboard')
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    router.push('/login')
  }

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      await logout()
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout, refreshUser, isRemembered }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
