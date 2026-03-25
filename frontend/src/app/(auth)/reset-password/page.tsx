import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <ResetPasswordForm />
        </div>

        {/* Footer */}
        <div className="mt-6 space-y-4">
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
