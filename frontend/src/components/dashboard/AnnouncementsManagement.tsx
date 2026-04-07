'use client'

import { useEffect, useState } from 'react'
import { Pencil, Pin, Plus, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import {
  useAdminAnnouncements,
  useCreateAdminAnnouncement,
  useDeleteAdminAnnouncement,
  useUpdateAdminAnnouncement,
} from '@/services/adminHooks'
import type { CreateAnnouncementPayload } from '@/services/adminApiService'
import type { Announcement, AnnouncementCategoryType, AnnouncementPriority } from '@/types'
import { resolveBackendAssetUrl } from '@/lib/utils'

const priorities: { value: AnnouncementPriority; label: string }[] = [
  { value: 'low', label: 'Rendah' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Tinggi' },
  { value: 'urgent', label: 'Mendesak' },
]

const annCategories: { value: AnnouncementCategoryType; label: string }[] = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Peringatan' },
  { value: 'event', label: 'Event' },
  { value: 'donation', label: 'Donasi' },
]

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = parseISO(iso)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  } catch {
    return ''
  }
}

function fromDatetimeLocal(s: string): string | null {
  if (!s.trim()) return null
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function emptyForm(): CreateAnnouncementPayload & { publishedLocal: string; expiresLocal: string } {
  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm")
  return {
    title: '',
    content: '',
    priority: 'normal',
    category: 'info',
    published_at: new Date().toISOString(),
    publishedLocal: now,
    expires_at: null,
    expiresLocal: '',
    is_pinned: false,
    image_url: null,
  }
}

function announcementToForm(a: Announcement): CreateAnnouncementPayload & { publishedLocal: string; expiresLocal: string } {
  return {
    title: a.title,
    content: a.content,
    priority: a.priority,
    category: a.category,
    published_at: a.published_at ?? null,
    publishedLocal: toDatetimeLocal(a.published_at ?? undefined),
    expires_at: a.expires_at ?? null,
    expiresLocal: toDatetimeLocal(a.expires_at ?? undefined),
    is_pinned: a.is_pinned,
    image_url: a.image_url ?? null,
  }
}

export function AnnouncementsManagement() {
  const { data: res, isLoading } = useAdminAnnouncements(100)
  const items = res?.data ?? []

  const createMut = useCreateAdminAnnouncement()
  const updateMut = useUpdateAdminAnnouncement()
  const deleteMut = useDeleteAdminAnnouncement()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState(() => emptyForm())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editing) setForm(announcementToForm(editing))
    else setForm(emptyForm())
  }, [open, editing])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CreateAnnouncementPayload = {
      title: form.title.trim(),
      content: form.content.trim(),
      priority: form.priority,
      category: form.category,
      published_at: fromDatetimeLocal(form.publishedLocal) ?? new Date().toISOString(),
      expires_at: fromDatetimeLocal(form.expiresLocal),
      is_pinned: form.is_pinned,
      image_url: form.image_url?.trim() || null,
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload })
        toast.success('Berita diperbarui')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Berita ditambahkan')
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast.error('Gagal menyimpan berita')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMut.mutateAsync(deleteId)
      toast.success('Berita dihapus')
      setDeleteId(null)
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Yang tampil di landing memakai filter aktif (terbit, belum kedaluwarsa, atau disematkan).
        </p>
        <Button
          type="button"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          <Plus className="mr-2 size-4 shrink-0" aria-hidden />
          Tulis berita
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada berita.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const img = resolveBackendAssetUrl(item.image_url ?? undefined)
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border border-l-4 border-l-teal-500/40 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                      {annCategories.find((c) => c.value === item.category)?.label ?? item.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {priorities.find((p) => p.value === item.priority)?.label ?? item.priority}
                    </span>
                    {item.is_pinned ? (
                      <StatusBadge status="success">
                        <Pin className="mr-1 size-3" aria-hidden />
                        Semat
                      </StatusBadge>
                    ) : null}
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.content}</p>
                  <div className="text-xs text-muted-foreground">
                    {item.published_at ? (
                      <span>Terbit: {format(parseISO(item.published_at), 'd MMM yyyy HH:mm', { locale: id })}</span>
                    ) : null}
                    {item.expires_at ? (
                      <span className="ml-3">
                        Kedaluwarsa: {format(parseISO(item.expires_at), 'd MMM yyyy HH:mm', { locale: id })}
                      </span>
                    ) : null}
                  </div>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="mt-2 h-16 w-auto max-w-full rounded object-cover" />
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(item)
                      setOpen(true)
                    }}
                  >
                    <Pencil className="mr-1 size-3.5" aria-hidden />
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteId(item.id)}>
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit berita' : 'Berita baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="an-title">Judul</Label>
              <Input
                id="an-title"
                value={form.title}
                onChange={(ev) => setForm((f) => ({ ...f, title: ev.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as AnnouncementCategoryType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {annCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritas</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as AnnouncementPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="an-body">Isi</Label>
              <Textarea
                id="an-body"
                value={form.content}
                onChange={(ev) => setForm((f) => ({ ...f, content: ev.target.value }))}
                rows={5}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="an-pub">Waktu terbit</Label>
                <Input
                  id="an-pub"
                  type="datetime-local"
                  value={form.publishedLocal}
                  onChange={(ev) => setForm((f) => ({ ...f, publishedLocal: ev.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="an-exp">Kedaluwarsa (opsional)</Label>
                <Input
                  id="an-exp"
                  type="datetime-local"
                  value={form.expiresLocal}
                  onChange={(ev) => setForm((f) => ({ ...f, expiresLocal: ev.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="an-img">URL gambar (opsional)</Label>
              <Input
                id="an-img"
                value={form.image_url ?? ''}
                onChange={(ev) => setForm((f) => ({ ...f, image_url: ev.target.value || null }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="an-pin"
                checked={form.is_pinned}
                onCheckedChange={(c) => setForm((f) => ({ ...f, is_pinned: c }))}
              />
              <Label htmlFor="an-pin">Sematkan di daftar</Label>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMut.isPending || updateMut.isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus berita?</AlertDialogTitle>
            <AlertDialogDescription>
              Item akan dihapus permanen dari basis data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
