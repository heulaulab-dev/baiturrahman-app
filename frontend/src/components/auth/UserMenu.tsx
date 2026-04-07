'use client'

import Link from 'next/link'
import { User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logout berhasil')
    } catch (error) {
      toast.error('Logout gagal')
    }
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.full_name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-1">
              <Badge variant="outline" className="text-xs">
                {getRoleLabel()}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profil" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pengaturan" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
