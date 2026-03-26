'use client'

import { Mail, User as UserIcon, Shield, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const getInitials = () => {
    const names = user.full_name.split(' ')
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0]
    }
    return names[0]?.substring(0, 2) || user.email.substring(0, 2)
  }

  const getRoleLabel = () => {
    switch (user.role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin':
        return 'Admin'
      case 'editor':
        return 'Editor'
      default:
        return user.role
    }
  }

  const getRoleVariant = (): 'default' | 'secondary' | 'outline' => {
    switch (user.role) {
      case 'super_admin':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profil Pengguna</h1>
        <p className="text-muted-foreground">Informasi akun dan data pengguna</p>
      </div>

      {/* Profile Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Data diri dan informasi akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-6 pb-6 border-b border-border">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url} alt={user.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user.full_name}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
              <Badge variant={getRoleVariant()} className="mt-2 capitalize">
                {getRoleLabel()}
              </Badge>
            </div>
          </div>

          {/* User Details */}
          <div className="grid gap-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>Nama Lengkap</span>
              </div>
              <span className="text-foreground font-medium">{user.full_name}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span>Username</span>
              </div>
              <span className="text-foreground font-medium">{user.username}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <span className="text-foreground font-medium">{user.email}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Role</span>
              </div>
              <Badge variant={getRoleVariant()} className="capitalize">
                {getRoleLabel()}
              </Badge>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Status</span>
              </div>
              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                {user.is_active ? 'Aktif' : 'Non-aktif'}
              </Badge>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Login Terakhir</span>
              </div>
              <span className="text-foreground font-medium">{formatDate(user.last_login_at)}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Bergabung Sejak</span>
              </div>
              <span className="text-foreground font-medium">{formatDate(user.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
