'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import Image from 'next/image'
import Logo from '@/public/Logo.svg'
import { LoginRequest } from '@/types'
import { useAuth } from '@/context/AuthContext'
import loginImage from '@/public/images/login-image.jpg'


export default function LoginPage() {
  const { login } = useAuth();
  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }


  return (
    <LoginForm logo={<Image src={Logo} alt="Baiturrahman" width={160} height={160} />} title="Masuk ke dashboard admin" description="Masuk ke dashboard admin" imageSrc={loginImage.src} imageAlt="Masuk ke dashboard admin" onSubmit={onSubmit} forgotPasswordHref="/forgot-password" createAccountHref="/register" />
  );
}
