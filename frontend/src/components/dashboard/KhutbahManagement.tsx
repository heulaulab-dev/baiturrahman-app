'use client'

import { useEffect, useState } from 'react'
import { FileText, Pencil, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import {
  useAdminKhutbahs,
  useCreateAdminKhutbah,
  useDeleteAdminKhutbah,
  useToggleAdminKhutbahStatus,
  useUpdateAdminKhutbah,
} from '@/services/adminHooks'
import type { CreateKhutbahPayload } from '@/services/adminApiService'
import type { Khutbah } from '@/types'
import { resolveBackendAssetUrl } from '@/lib/utils'

function emptyForm(): CreateKhutbahPayload {
  return {
    khatib: '',
    tema: '',
    imam: null,
    muadzin: null,
    date: new Date().toISOString().slice(0, 10),
    content: null,
    file_url: null,
    status: 'draft',
  }
}

function khutbahToForm(k: Khutbah): CreateKhutbahPayload {
  const d = k.date.includes('T') ? parseISO(k.date) : parseISO(`${k.date}T12:00:00`)
  return {
    khatib: k.khatib,
    tema: k.tema,
    imam: k.imam ?? null,
    muadzin: k.muadzin ?? null,
    date: format(d, 'yyyy-MM-dd'),
    content: k.content ?? null,
    file_url: k.file_url ?? null,
    status: k.status,
  }
}

export function KhutbahManagement() {
  const { data: res, isLoading } = useAdminKhutbahs(100)
  const items = res?.data ?? []

  const createMut = useCreateAdminKhutbah()
  const updateMut = useUpdateAdminKhutbah()
  const deleteMut = useDeleteAdminKhutbah()
  const toggleMut = useToggleAdminKhutbahStatus()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Khutbah | null>(null)
  const [form, setForm] = useState<CreateKhutbahPayload>(() => emptyForm())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (editing) setForm(khutbahToForm(editing))
    else setForm(emptyForm())
  }, [open, editing])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: CreateKhutbahPayload = {
      khatib: form.khatib.trim(),
      tema: form.tema.trim(),
      imam: form.imam?.trim() || null,
      muadzin: form.muadzin?.trim() || null,
      date: form.date,
      content: form.content?.trim() || null,
      file_url: form.file_url?.trim() || null,
      status: form.status,
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, data: payload })
        toast.success('Khutbah diperbarui')
      } else {
        await createMut.mutateAsync(payload)
        toast.success('Khutbah ditambahkan')
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast.error('Gagal menyimpan khutbah')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMut.mutateAsync(deleteId)
      toast.success('Khutbah dihapus')
      setDeleteId(null)
    } catch {
      toast.error('Gagal menghapus')
    }
  }

  const handleToggle = async (k: Khutbah) => {
    try {
      await toggleMut.mutateAsync(k.id)
      toast.success(k.status === 'published' ? 'Diset sebagai draf' : 'Diterbitkan')
    } catch {
      toast.error('Gagal mengubah status')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Hanya khutbah berstatus &quot;Terbit&quot; yang tampil di halaman publik (terbaru &amp; arsip).
        </p>
        <Button
          type="button"
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          <Plus className="mr-2 size-4 shrink-0" aria-hidden />
          Khutbah baru
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada khutbah.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const pdfHref = resolveBackendAssetUrl(item.file_url ?? undefined)
            const d = item.date.includes('T') ? parseISO(item.date) : parseISO(`${item.date}T12:00:00`)
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-lg border border-border border-l-4 border-l-amber-500/45 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status === 'published' ? 'success' : 'default'}>
                      {item.status === 'published' ? 'Terbit' : 'Draf'}
                    </StatusBadge>
                    <span className="text-xs text-muted-foreground">
                      {format(d, 'EEEE, d MMM yyyy', { locale: id })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.tema}</h3>
                  <p className="text-sm text-muted-foreground">Khatib: {item.khatib}</p>
                  {pdfHref ? (
                    <Button variant="outline" size="sm" className="mt-1 gap-2" asChild>
                      <a href={pdfHref} target="_blank" rel="noopener noreferrer">
                        <FileText className="size-4 shrink-0" aria-hidden />
                        Lampiran
                      </a>
                    </Button>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggle(item)}
                    disabled={toggleMut.isPending}
                  >
                    {item.status === 'published' ? (
                      <>
                        <EyeOff className="mr-1 size-3.5" aria-hidden />
                        Jadikan draf
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 size-3.5" aria-hidden />
                        Terbitkan
                      </>
                    )}
                  </Button>
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
            <DialogTitle>{editing ? 'Edit khutbah' : 'Khutbah baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kh-tema">Tema</Label>
              <Input
                id="kh-tema"
                value={form.tema}
                onChange={(ev) => setForm((f) => ({ ...f, tema: ev.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kh-khatib">Khatib</Label>
              <Input
                id="kh-khatib"
                value={form.khatib}
                onChange={(ev) => setForm((f) => ({ ...f, khatib: ev.target.value }))}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kh-imam">Imam (opsional)</Label>
                <Input
                  id="kh-imam"
                  value={form.imam ?? ''}
                  onChange={(ev) => setForm((f) => ({ ...f, imam: ev.target.value || null }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kh-muadzin">Muadzin (opsional)</Label>
                <Input
                  id="kh-muadzin"
                  value={form.muadzin ?? ''}
                  onChange={(ev) => setForm((f) => ({ ...f, muadzin: ev.target.value || null }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="kh-date">Tanggal</Label>
                <Input
                  id="kh-date"
                  type="date"
                  value={form.date}
                  onChange={(ev) => setForm((f) => ({ ...f, date: ev.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as 'draft' | 'published' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draf</SelectItem>
                    <SelectItem value="published">Terbit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kh-file">URL file PDF / lampiran (opsional)</Label>
              <Input
                id="kh-file"
                value={form.file_url ?? ''}
                onChange={(ev) => setForm((f) => ({ ...f, file_url: ev.target.value.trim() || null }))}
                placeholder="https://… (tautan langsung ke berkas PDF atau dokumen)"
              />
              <p className="text-xs text-muted-foreground">
                Tampil di beranda sebagai tombol unduh. Unggah PDF ke penyimpanan Anda lalu tempel URL publiknya di sini.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kh-content">Catatan / ringkasan (opsional)</Label>
              <Textarea
                id="kh-content"
                value={form.content ?? ''}
                onChange={(ev) => setForm((f) => ({ ...f, content: ev.target.value || null }))}
                rows={4}
              />
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
            <AlertDialogTitle>Hapus khutbah?</AlertDialogTitle>
            <AlertDialogDescription>Data akan dihapus permanen.</AlertDialogDescription>
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
