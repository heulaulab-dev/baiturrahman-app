'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field'
import { toast } from 'sonner'

const registerSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50, 'Username maksimal 50 karakter'),
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirm_password: z.string().min(6, 'Password konfirmasi minimal 6 karakter'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Password tidak cocok',
  path: ['confirm_password'],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          full_name: data.full_name,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        toast.success(result.message || 'Registrasi berhasil!')
        onSuccess?.()
      } else {
        toast.error(result.error || result.message || 'Registrasi gagal')
      }
    } catch (error) {
      toast.error('Registrasi gagal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
        <div>
          <h3 className="text-lg font-semibold mb-2">Registrasi Berhasil!</h3>
          <p className="text-muted-foreground">
            Akun Anda telah dibuat dan menunggu persetujuan admin.
            Anda akan menerima email notifikasi setelah akun aktif.
          </p>
        </div>
        <Button onClick={onSuccess} variant="outline">
          Kembali ke Login
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Field>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input
          id="username"
          type="text"
          placeholder="johndoe"
          {...register('username')}
          disabled={isLoading}
        />
        <FieldError errors={errors.username} />
      </Field>

      <Field>
        <FieldLabel htmlFor="full_name">Nama Lengkap</FieldLabel>
        <Input
          id="full_name"
          type="text"
          placeholder="John Doe"
          {...register('full_name')}
          disabled={isLoading}
        />
        <FieldError errors={errors.full_name} />
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          placeholder="nama@email.com"
          {...register('email')}
          disabled={isLoading}
        />
        <FieldError errors={errors.email} />
      </Field>

      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password')}
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
        <FieldError errors={errors.password} />
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
        <FieldError errors={errors.confirm_password} />
      </Field>

      <FieldDescription>
        Akun baru akan menunggu persetujuan admin sebelum dapat digunakan.
      </FieldDescription>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mendaftar...
          </>
        ) : (
          'Daftar'
        )}
      </Button>
    </form>
  )
}
