'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowDown, ArrowUp, ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AdminImageUploadField } from '@/components/dashboard/AdminImageUploadField'
import { FinanceFormDatePicker } from '@/components/dashboard/finance/FinanceFormDatePicker'
import { resolveBackendAssetUrl } from '@/lib/utils'
import {
  useAdminSponsors,
  useCreateAdminSponsor,
  useDeleteAdminSponsor,
  useReorderAdminSponsors,
  useUpdateAdminSponsor,
} from '@/services/adminHooks'
import type { Sponsor } from '@/types'

function ymdFromApi(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

interface FormState {
  name: string
  logo_url: string
  website_url: string
  description: string
  visibility_start: string
  visibility_end: string
  contract_start: string
  contract_end: string
  show_on_landing: boolean
}

function emptyForm(): FormState {
  return {
    name: '',
    logo_url: '',
    website_url: '',
    description: '',
    visibility_start: '',
    visibility_end: '',
    contract_start: '',
    contract_end: '',
    show_on_landing: false,
  }
}

function itemToForm(item: Sponsor): FormState {
  return {
    name: item.name ?? '',
    logo_url: item.logo_url ?? '',
    website_url: item.website_url ?? '',
    description: item.description ?? '',
    visibility_start: ymdFromApi(item.visibility_start),
    visibility_end: ymdFromApi(item.visibility_end),
    contract_start: ymdFromApi(item.contract_start),
    contract_end: ymdFromApi(item.contract_end),
    show_on_landing: item.show_on_landing,
  }
}

export function SponsorManagement() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Sponsor | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: items = [], isLoading } = useAdminSponsors()
  const createMut = useCreateAdminSponsor()
  const updateMut = useUpdateAdminSponsor()
  const deleteMut = useDeleteAdminSponsor()
  const reorderMut = useReorderAdminSponsors()

  const sorted = [...items].sort(
    (a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id)
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setDialogOpen(true)
  }

  const openEdit = (item: Sponsor) => {
    setEditing(item)
    setForm(itemToForm(item))
    setDialogOpen(true)
  }

  const persistOrder = async (next: Sponsor[]) => {
    const payload = next.map((it, i) => ({ id: it.id, sort_order: i }))
    await reorderMut.mutateAsync(payload)
  }

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= sorted.length) return
    const next = [...sorted]
    ;[next[index], next[j]] = [next[j], next[index]]
    try {
      await persistOrder(next)
      toast.success('Urutan diperbarui')
    } catch {
      toast.error('Gagal mengubah urutan')
    }
  }

  const payloadFromForm = () => ({
    name: form.name.trim(),
    logo_url: form.logo_url.trim() || undefined,
    website_url: form.website_url.trim() || undefined,
    description: form.description.trim() || undefined,
    visibility_start: form.visibility_start.trim() || undefined,
    visibility_end: form.visibility_end.trim() || undefined,
    contract_start: form.contract_start.trim() || undefined,
    contract_end: form.contract_end.trim() || undefined,
    show_on_landing: form.show_on_landing,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi')
      return
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          data: {
            ...payloadFromForm(),
            visibility_start: form.visibility_start.trim() || '',
            visibility_end: form.visibility_end.trim() || '',
            contract_start: form.contract_start.trim() || '',
            contract_end: form.contract_end.trim() || '',
          },
        })
        toast.success('Sponsor diperbarui')
      } else {
        await createMut.mutateAsync(payloadFromForm())
        toast.success('Sponsor ditambahkan')
      }
      setDialogOpen(false)
    } catch {
      toast.error('Gagal menyimpan')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMut.mutateAsync(deleteId)
      toast.success('Sponsor dihapus')
      setDeleteId(null)
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Logo mitra/sponsor, rentang <strong>tampil di publik</strong> (WIB), dan opsional rentang kontrak
          (hanya admin). Centang &quot;Beranda&quot; untuk blok ringkas di landing.
        </p>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 size-4" aria-hidden />
          Tambah sponsor
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada sponsor.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {sorted.map((item, index) => {
            const thumb = resolveBackendAssetUrl(item.logo_url)
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      width={80}
                      height={80}
                      className="size-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.show_on_landing ? 'Tampil di beranda · ' : ''}
                    Urutan {item.sort_order}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={index === 0 || reorderMut.isPending}
                    onClick={() => move(index, -1)}
                    aria-label="Naikkan"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={index === sorted.length - 1 || reorderMut.isPending}
                    onClick={() => move(index, 1)}
                    aria-label="Turunkan"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => openEdit(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit sponsor' : 'Sponsor baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sp-name">Nama</Label>
              <Input
                id="sp-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <AdminImageUploadField
              id="sp-logo"
              label="Logo"
              value={form.logo_url}
              onChange={(url) => setForm((f) => ({ ...f, logo_url: url }))}
              module="sponsors"
              description="Logo mitra (JPG/PNG/GIF/WebP, maks. 5MB). Opsional."
            />
            <div className="space-y-2">
              <Label htmlFor="sp-web">Situs / tautan</Label>
              <Input
                id="sp-web"
                type="url"
                placeholder="https://"
                value={form.website_url}
                onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-desc">Deskripsi singkat</Label>
              <Textarea
                id="sp-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormDatePicker
                id="sp-vs"
                label="Visibilitas mulai"
                value={form.visibility_start}
                onChange={(ymd) => setForm((f) => ({ ...f, visibility_start: ymd }))}
              />
              <FinanceFormDatePicker
                id="sp-ve"
                label="Visibilitas akhir (kosong = terbuka)"
                value={form.visibility_end}
                onChange={(ymd) => setForm((f) => ({ ...f, visibility_end: ymd }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormDatePicker
                id="sp-cs"
                label="Kontrak mulai (admin)"
                value={form.contract_start}
                onChange={(ymd) => setForm((f) => ({ ...f, contract_start: ymd }))}
              />
              <FinanceFormDatePicker
                id="sp-ce"
                label="Kontrak akhir (admin)"
                value={form.contract_end}
                onChange={(ymd) => setForm((f) => ({ ...f, contract_end: ymd }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="sp-land"
                checked={form.show_on_landing}
                onCheckedChange={(v) => setForm((f) => ({ ...f, show_on_landing: v }))}
              />
              <Label htmlFor="sp-land">Tampil di blok beranda</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus sponsor?</AlertDialogTitle>
            <AlertDialogDescription>
              Sponsor tidak akan tampil di situs publik setelah dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
