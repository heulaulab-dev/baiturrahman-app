'use client'

import { useState } from 'react'
import { LayoutDashboard, UserPlus } from 'lucide-react'
import { MosqueProfile } from '@/components/dashboard/MosqueProfile'
import { ExcelExportSettings } from '@/components/dashboard/ExcelExportSettings'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminUsers } from '@/services/adminHooks'
import type { UserRole } from '@/types'

type TabType = 'profil-masjid' | 'export-excel' | 'pengguna-role'

function roleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super admin'
    case 'admin':
      return 'Admin'
    case 'editor':
      return 'Editor'
    default:
      return role
  }
}

function roleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'super_admin':
      return 'default'
    case 'admin':
      return 'secondary'
    case 'editor':
      return 'outline'
    default:
      return 'outline'
  }
}

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profil-masjid')
  const { data: usersResponse, isLoading: usersLoading } = useAdminUsers()
  const users = usersResponse?.data ?? []

  const tabs: { key: TabType; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'profil-masjid', label: 'Profil masjid', icon: LayoutDashboard },
    { key: 'export-excel', label: 'Export Excel', icon: LayoutDashboard },
    { key: 'pengguna-role', label: 'Pengguna & role', icon: UserPlus },
  ]

  let usersBody: React.ReactNode

  if (usersLoading) {
    const skeletonRowKeys = ['u1', 'u2', 'u3', 'u4', 'u5'] as const
    usersBody = skeletonRowKeys.map((k) => (
      <TableRow key={k}>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-40" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-5 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-36" />
        </TableCell>
      </TableRow>
    ))
  } else if (users.length === 0) {
    usersBody = (
      <TableRow>
        <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
          Belum ada data pengguna.
        </TableCell>
      </TableRow>
    )
  } else {
    usersBody = users.map((user) => (
      <TableRow key={user.id} className="hover:bg-muted/30">
        <TableCell className="font-medium text-foreground">{user.full_name}</TableCell>
        <TableCell className="text-muted-foreground">{user.email}</TableCell>
        <TableCell>
          <Badge variant={roleBadgeVariant(user.role)} className="font-normal">
            {roleLabel(user.role)}
          </Badge>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID') : '—'}
        </TableCell>
      </TableRow>
    ))
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-semibold text-foreground">Pengaturan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Profil masjid dan daftar akun pengurus dengan peran akses.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 border border-border/60 bg-muted/30 p-1 shadow-sm">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="gap-2 px-4 py-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              <tab.icon className="size-4 shrink-0" aria-hidden />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profil-masjid" className="outline-none">
          <MosqueProfile />
        </TabsContent>

        <TabsContent value="export-excel" className="outline-none">
          <ExcelExportSettings />
        </TabsContent>

        <TabsContent value="pengguna-role" className="outline-none">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Pengguna</CardTitle>
              <CardDescription>Daftar akun terdaftar dan peran aksesnya.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-foreground">Nama</TableHead>
                      <TableHead className="text-foreground">Email</TableHead>
                      <TableHead className="text-foreground">Role</TableHead>
                      <TableHead className="text-foreground">Login terakhir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{usersBody}</TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
