'use client'

import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useRbacRolePermissions, useRbacRoles, useUpdateRbacRolePermissions } from '@/services/adminHooks'
import { useAuth } from '@/context/AuthContext'
import type { OrgRole } from '@/types'

type PermissionByModule = Record<string, { key: string; name: string; description: string; allowed: boolean }[]>

export default function RbacSettingsPage() {
  const { hasPermission } = useAuth()
  const canAccessRbacSettings = hasPermission('access_rbac_settings')
  const { data: roles = [], isLoading: rolesLoading } = useRbacRoles()
  const [selectedRole, setSelectedRole] = useState<OrgRole | ''>('')

  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRole(roles[0].value)
    }
  }, [roles, selectedRole])

  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useRbacRolePermissions(selectedRole)
  const updateMutation = useUpdateRbacRolePermissions()

  const [localPermissionMap, setLocalPermissionMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!rolePermissions?.permissions) return
    const nextMap: Record<string, boolean> = {}
    for (const item of rolePermissions.permissions) {
      nextMap[item.key] = item.allowed
    }
    setLocalPermissionMap(nextMap)
  }, [rolePermissions])

  const groupedByModule = useMemo<PermissionByModule>(() => {
    const grouped: PermissionByModule = {}
    const permissions = rolePermissions?.permissions ?? []
    for (const item of permissions) {
      if (!grouped[item.module]) grouped[item.module] = []
      grouped[item.module].push({
        key: item.key,
        name: item.name,
        description: item.description,
        allowed: localPermissionMap[item.key] ?? false,
      })
    }
    return grouped
  }, [rolePermissions, localPermissionMap])

  const selectedPermissionKeys = useMemo(
    () => Object.entries(localPermissionMap).filter(([, allowed]) => allowed).map(([key]) => key),
    [localPermissionMap]
  )

  const isBusy = rolesLoading || rolePermissionsLoading

  if (!canAccessRbacSettings) {
    return (
      <div className="space-y-2 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Akses ditolak</h2>
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses pengaturan RBAC.
        </p>
      </div>
    )
  }

  const onTogglePermission = (key: string, allowed: boolean) => {
    setLocalPermissionMap((prev) => ({ ...prev, [key]: allowed }))
  }

  const onSave = async () => {
    if (!selectedRole) return
    try {
      await updateMutation.mutateAsync({ orgRole: selectedRole, permissionKeys: selectedPermissionKeys })
      toast.success('Konfigurasi akses berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan konfigurasi akses')
    }
  }

  let permissionContent: React.ReactNode
  if (isBusy) {
    permissionContent = (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  } else if (!selectedRole) {
    permissionContent = <p className="text-sm text-muted-foreground">Pilih peran terlebih dahulu.</p>
  } else {
    permissionContent = (
      <div className="space-y-5">
        {Object.entries(groupedByModule).map(([module, items]) => (
          <div key={module} className="rounded-lg border border-border p-4">
            <div className="mb-3">
              <Badge variant="secondary" className="capitalize">
                {module}
              </Badge>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 p-3">
                  <Checkbox
                    checked={item.allowed}
                    onCheckedChange={(checked) => onTogglePermission(item.key, checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description || item.key}</p>
                    <p className="text-[11px] text-muted-foreground">{item.key}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-foreground">Akses & RBAC</h2>
        <p className="text-sm text-muted-foreground">
          Atur menu dan fitur apa saja yang bisa diakses setiap peran organisasi.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Konfigurasi Peran
          </CardTitle>
          <CardDescription>Pilih peran, centang permission yang diizinkan, lalu simpan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-role-select">Peran organisasi</Label>
            <Select value={selectedRole || undefined} onValueChange={(v) => setSelectedRole(v as OrgRole)}>
              <SelectTrigger id="org-role-select" className="w-full max-w-sm">
                <SelectValue placeholder="Pilih peran organisasi" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {permissionContent}

          <div className="flex justify-end">
            <Button onClick={onSave} disabled={!selectedRole || isBusy || updateMutation.isPending}>
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan konfigurasi'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
