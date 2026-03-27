'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import Logo from '@/public/Logo.svg'
import { LoginRequest } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { getCookie } from '@/lib/cookies'
import loginImage from '@/public/images/login-image.jpg'


export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get remember me preference from cookie
  const rememberMeCookie = getCookie('token') !== null

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = searchParams.get('redirect')
      router.push(redirect || '/dashboard')
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  const onSubmit = async (data: LoginRequest) => {
    try {
      const redirect = searchParams.get('redirect')
      await login(data, redirect || '/dashboard', data.rememberMe ?? false)
    } catch (error) {
      console.error("Submission failed:", error)
    }
  }

  // Don't render if loading or already authenticated (redirect will happen)
  if (isLoading || isAuthenticated) {
    return null
  }

  return (
    <LoginForm
      logo={<Image src={Logo} alt="Baiturrahman" width={160} height={160} />}
      title="Masuk ke dashboard admin"
      description="Masuk ke dashboard admin"
      imageSrc={loginImage.src}
      imageAlt="Masuk ke dashboard admin"
      onSubmit={onSubmit}
      forgotPasswordHref="/forgot-password"
      createAccountHref="/register"
    />
  );
}
