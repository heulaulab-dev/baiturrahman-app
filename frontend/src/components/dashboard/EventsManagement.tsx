'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
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
import { AdminImageUploadField } from '@/components/dashboard/AdminImageUploadField'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { eventVisibleOnPublicPages, formatEventClockLabel, formatEventDateIso } from '@/lib/event-display'
import { resolveBackendAssetUrl, slugifyForUrl } from '@/lib/utils'
import {
  useAdminEvents,
  useCreateAdminEvent,
  useDeleteAdminEvent,
  useUpdateAdminEvent,
} from '@/services/adminHooks'
import type { CreateEventPayload } from '@/services/adminApiService'
import type { Event, EventCategory, EventStatus } from '@/types'

const categories: { value: EventCategory; label: string }[] = [
  { value: 'kajian', label: 'Kajian' },
  { value: 'sosial', label: 'Sosial' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'other', label: 'Lainnya' },
]

const statuses: { value: EventStatus; label: string }[] = [
  { value: 'upcoming', label: 'Akan datang' },
  { value: 'ongoing', label: 'Berlangsung' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

function emptyForm(): CreateEventPayload & { timeHm: string } {
  return {
    title: '',
    slug: '',
    description: '',
    content: '',
    category: 'kajian',
    event_date: new Date().toISOString().slice(0, 10),
    event_time: null,
    timeHm: '',
    location: '',
    is_online: false,
    meeting_url: null,
    image_url: null,
    registration_required: false,
    status: 'upcoming',
  }
}

function eventToForm(e: Event): CreateEventPayload & { timeHm: string } {
  const d = formatEventDateIso(e.event_date)
  const dateStr = format(d, 'yyyy-MM-dd')
  const clock = formatEventClockLabel(e.event_time)
  return {
    title: e.title,
    slug: e.slug,
    description: e.description ?? '',
    content: e.content ?? '',
    category: e.category,
    event_date: dateStr,
    event_time: e.event_time ?? null,
    timeHm: clock ?? '',
    location: e.location ?? '',
    is_online: e.is_online,
    meeting_url: e.meeting_url ?? null,
    image_url: e.image_url ?? null,
    registration_required: e.registration_required,
    status: e.status,
  }
}

function buildEventTimeIso(dateYmd: string, timeHm: string): string | null {
  if (!timeHm?.trim()) return null
  const [hh, mm] = timeHm.split(':').map((x) => parseInt(x, 10))
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null
  const [y, mo, d] = dateYmd.split('-').map((x) => parseInt(x, 10))
  const local = new Date(y, mo - 1, d, hh, mm, 0, 0)
  return local.toISOString()
}

export function EventsManagement() {
  const { data: res, isLoading } = useAdminEvents(100)
  const events = res?.data ?? []

  const createMut = useCreateAdminEvent()
  const updateMut = useUpdateAdminEvent()
  const deleteMut = useDeleteAdminEvent()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [form, setForm] = useState(() => emptyForm())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm(eventToForm(editing))
      setSlugTouched(true)
    } else {
      setForm(emptyForm())
      setSlugTouched(false)
    }
  }, [open, editing])

  const onTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: !editing && !slugTouched ? slugifyForUrl(title) : f.slug,
    }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = form.slug.trim() || slugifyForUrl(form.title)
    const payload: CreateEventPayload = {
      title: form.title.trim(),
      slug,
      description: (form.description ?? '').trim(),
      content: (form.content ?? '').trim() || undefined,
      category: form.category,
      event_date: form.event_date,
      event_time: buildEventTimeIso(form.event_date, form.timeHm),
      location: (form.location ?? '').trim() || null,
      is_online: form.is_online,
      meeting_url: form.meeting_url?.trim() || null,
      image_url: form.image_url?.trim() || null,
      registration_required: form.registration_required,
      status: form.status,
    }

    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload })
        toast.success('Event diperbarui')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Event ditambahkan')
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast.error('Gagal menyimpan event')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMut.mutateAsync(deleteId)
      toast.success('Event dihapus')
      setDeleteId(null)
    } catch {
      toast.error('Gagal menghapus event')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Kegiatan tampil di landing (Kajian) jika status bukan &quot;Dibatalkan&quot;.
        </p>
        <Button
          type="button"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          <Plus className="mr-2 size-4 shrink-0" aria-hidden />
          Tambah event
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada event.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((item) => {
            const img = resolveBackendAssetUrl(item.image_url ?? undefined)
            const visible = eventVisibleOnPublicPages(item)
            const d = formatEventDateIso(item.event_date)
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border border-l-4 border-l-primary/50 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {categories.find((c) => c.value === item.category)?.label ?? item.category}
                    </span>
                    <StatusBadge status={visible ? 'success' : 'default'}>
                      {visible ? 'Publik' : 'Tersembunyi'}
                    </StatusBadge>
                    <span className="text-xs text-muted-foreground">
                      {statuses.find((s) => s.value === item.status)?.label ?? item.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" aria-hidden />
                      {format(d, 'EEEE, d MMM yyyy', { locale: id })}
                    </span>
                    {formatEventClockLabel(item.event_time) ? (
                      <span>{formatEventClockLabel(item.event_time)} WIB</span>
                    ) : null}
                    {item.location ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" aria-hidden />
                        {item.location}
                      </span>
                    ) : null}
                  </div>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="mt-2 h-20 w-auto max-w-full rounded object-cover" />
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
            <DialogTitle>{editing ? 'Edit event' : 'Event baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-title">Judul</Label>
              <Input
                id="ev-title"
                value={form.title}
                onChange={(ev) => onTitleChange(ev.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-slug">Slug URL</Label>
              <Input
                id="ev-slug"
                value={form.slug}
                onChange={(ev) => {
                  setSlugTouched(true)
                  setForm((f) => ({ ...f, slug: ev.target.value }))
                }}
                required
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as EventCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as EventStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ev-date">Tanggal</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={form.event_date}
                  onChange={(ev) => setForm((f) => ({ ...f, event_date: ev.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-time">Waktu (opsional)</Label>
                <Input
                  id="ev-time"
                  type="time"
                  value={form.timeHm}
                  onChange={(ev) => setForm((f) => ({ ...f, timeHm: ev.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-loc">Lokasi</Label>
              <Input
                id="ev-loc"
                value={form.location ?? ''}
                onChange={(ev) => setForm((f) => ({ ...f, location: ev.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-desc">Ringkasan</Label>
              <Textarea
                id="ev-desc"
                value={form.description}
                onChange={(ev) => setForm((f) => ({ ...f, description: ev.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-content">Konten lengkap (opsional)</Label>
              <Textarea
                id="ev-content"
                value={form.content}
                onChange={(ev) => setForm((f) => ({ ...f, content: ev.target.value }))}
                rows={3}
              />
            </div>
            <AdminImageUploadField
              id="ev-img"
              label="Gambar (opsional)"
              value={form.image_url ?? ''}
              onChange={(url) => setForm((f) => ({ ...f, image_url: url || null }))}
              module="events"
            />
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="ev-online"
                  checked={form.is_online}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, is_online: c }))}
                />
                <Label htmlFor="ev-online">Online</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="ev-reg"
                  checked={form.registration_required}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, registration_required: c }))}
                />
                <Label htmlFor="ev-reg">Perlu pendaftaran</Label>
              </div>
            </div>
            {form.is_online ? (
              <div className="space-y-2">
                <Label htmlFor="ev-meet">Link pertemuan</Label>
                <Input
                  id="ev-meet"
                  value={form.meeting_url ?? ''}
                  onChange={(ev) => setForm((f) => ({ ...f, meeting_url: ev.target.value || null }))}
                />
              </div>
            ) : null}
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
            <AlertDialogTitle>Hapus event?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Event akan dihapus dari basis data.
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
