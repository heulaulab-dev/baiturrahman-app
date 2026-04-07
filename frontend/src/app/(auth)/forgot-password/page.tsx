'use client';

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/Logo.svg"
              alt="Baiturrahman"
              width={160}
              height={160}
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Lupa Password?
          </h1>
          <p className="text-muted-foreground">
            Masukkan email Anda untuk menerima link reset password
          </p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <ForgotPasswordForm onSuccess={() => router.push('/login')} />
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Ingat password Anda?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
