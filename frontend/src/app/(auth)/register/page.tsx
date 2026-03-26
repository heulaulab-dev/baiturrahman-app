'use client';

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src="/Logo.svg" alt="Baiturrahman" className="h-16" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Masjid Baiturrahim
          </h1>
          <p className="text-muted-foreground">
            Daftar akun baru untuk mengakses dashboard
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <RegisterForm onSuccess={() => router.push('/login')} />
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
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
