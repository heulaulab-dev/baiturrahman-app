import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
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
            Masuk ke dashboard admin
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Lupa password?{' '}
          <Link href="/reset-password" className="text-primary hover:underline">
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}
