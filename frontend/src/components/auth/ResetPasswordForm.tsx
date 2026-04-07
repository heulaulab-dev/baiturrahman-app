'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { toast } from 'sonner'

const resetPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password minimal 6 karakter'),
  confirm_password: z.string().min(6, 'Password konfirmasi minimal 6 karakter'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Token reset tidak valid')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          new_password: data.new_password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success(result.message || 'Password berhasil direset')
      } else {
        toast.error(result.error || result.message || 'Gagal mereset password')
      }
    } catch (error) {
      toast.error('Gagal mereset password. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token && !isSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">
          Token reset tidak ditemukan atau tidak valid.
        </p>
        <Button onClick={() => router.push('/login')} variant="outline">
          Kembali ke Login
        </Button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
        <div>
          <h3 className="text-lg font-semibold mb-2">Password Berhasil Direset!</h3>
          <p className="text-muted-foreground">
            Anda sekarang dapat login dengan password baru.
          </p>
        </div>
        <Button onClick={() => router.push('/login')}>
          Lanjut ke Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field>
        <FieldLabel htmlFor="new_password">Password Baru</FieldLabel>
        <div className="relative">
          <Input
            id="new_password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('new_password')}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FieldError errors={[errors.new_password]} />
      </Field>

      <Field>
        <FieldLabel htmlFor="confirm_password">Konfirmasi Password</FieldLabel>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirm_password')}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FieldError errors={[errors.confirm_password]} />
      </Field>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mereset Password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  )
}
