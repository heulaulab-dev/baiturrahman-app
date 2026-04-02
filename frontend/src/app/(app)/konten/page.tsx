'use client'

import { useState, type ReactNode } from 'react'
import { Calendar, Download, FileText, Image, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { HistoryManagement } from '@/components/dashboard/HistoryManagement'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { StrukturManagement } from '@/components/dashboard/StrukturManagement'
import { TentangKami } from '@/components/dashboard/TentangKami'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadKontenRingkasanCsv } from '@/lib/konten-csv'
import { resolveBackendAssetUrl } from '@/lib/utils'
import { useAdminAnnouncements, useAdminEvents, useAdminKhutbahs } from '@/services/adminHooks'

type TabType =
  | 'tentang-kami'
  | 'events'
  | 'berita'
  | 'mimbar-jumat'
  | 'sejarah'
  | 'struktur'
  | 'banner'
  | 'gallery'

export default function KontenPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tentang-kami')
  const { data: eventsResponse, isLoading: eventsLoading } = useAdminEvents(12)
  const { data: announcementsResponse, isLoading: announcementsLoading } = useAdminAnnouncements(12)
  const { data: khutbahsResponse, isLoading: khutbahsLoading } = useAdminKhutbahs(12)
  const events = eventsResponse?.data ?? []
  const announcements = announcementsResponse?.data ?? []
  const khutbahs = khutbahsResponse?.data ?? []

  const listsLoading = eventsLoading || announcementsLoading || khutbahsLoading

  const handleExportCsv = () => {
    if (listsLoading) {
      toast.error('Tunggu hingga data selesai dimuat')
      return
    }
    try {
      downloadKontenRingkasanCsv({ events, announcements, khutbahs })
      toast.success('CSV berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor CSV')
    }
  }

  const getEventStatus = (isPublished: boolean) => {
    if (isPublished) return { badge: 'success' as const, label: 'Terbit' }
    return { badge: 'default' as const, label: 'Draf' }
  }

  let eventsContent: ReactNode
  let announcementsContent: ReactNode
  let khutbahsContent: ReactNode

  if (eventsLoading) {
    eventsContent = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {['es1', 'es2', 'es3', 'es4'].map((k) => (
          <Skeleton key={k} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    )
  } else if (events.length === 0) {
    eventsContent = (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Belum ada event.</CardContent>
      </Card>
    )
  } else {
    eventsContent = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {events.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border border-l-4 border-l-primary/50 bg-card p-4 shadow-sm transition-colors hover:border-l-primary hover:bg-muted/20"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Event</span>
              <StatusBadge status={getEventStatus(item.is_published).badge}>
                {getEventStatus(item.is_published).label}
              </StatusBadge>
            </div>
            <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3 shrink-0 text-primary/80" aria-hidden />
              <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (announcementsLoading) {
    announcementsContent = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {['as1', 'as2', 'as3', 'as4'].map((k) => (
          <Skeleton key={k} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    )
  } else if (announcements.length === 0) {
    announcementsContent = (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Belum ada berita.</CardContent>
      </Card>
    )
  } else {
    announcementsContent = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border border-l-4 border-l-teal-500/50 bg-card p-4 shadow-sm transition-colors hover:border-l-teal-600 hover:bg-muted/20 dark:border-l-teal-400/50"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-md bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                Berita
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
            <h3 className="mb-1 font-semibold text-foreground">{item.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">{item.content}</p>
          </div>
        ))}
      </div>
    )
  }

  if (khutbahsLoading) {
    khutbahsContent = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {['ks1', 'ks2', 'ks3', 'ks4'].map((k) => (
          <Skeleton key={k} className="h-44 w-full rounded-lg" />
        ))}
      </div>
    )
  } else if (khutbahs.length === 0) {
    khutbahsContent = (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">Belum ada khutbah.</CardContent>
      </Card>
    )
  } else {
    khutbahsContent = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {khutbahs.map((khutbah) => {
          const pdfHref = resolveBackendAssetUrl(khutbah.file_url)
          return (
            <div
              key={khutbah.id}
              className="rounded-lg border border-border border-l-4 border-l-amber-500/45 bg-card p-6 shadow-sm transition-colors hover:border-l-amber-500 hover:bg-muted/20 dark:border-l-amber-400/40"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  {new Date(khutbah.date).toLocaleDateString('id-ID')}
                </div>
                <StatusBadge status={khutbah.status === 'published' ? 'success' : 'default'}>
                  {khutbah.status === 'published' ? 'Terbit' : 'Draf'}
                </StatusBadge>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{khutbah.tema}</h3>
              <div className="text-sm text-muted-foreground">Khatib: {khutbah.khatib}</div>
              {pdfHref ? (
                <Button variant="outline" size="sm" className="mt-3 gap-2 border-primary/30 text-primary hover:bg-primary/10" asChild>
                  <a href={pdfHref} target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4 shrink-0" aria-hidden />
                    Unduh lampiran
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="mt-3 gap-2" disabled>
                  <FileText className="size-4 shrink-0" aria-hidden />
                  Belum ada file
                </Button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'tentang-kami', label: 'Tentang kami' },
    { key: 'events', label: 'Event' },
    { key: 'berita', label: 'Berita' },
    { key: 'mimbar-jumat', label: 'Mimbar Jumat' },
    { key: 'sejarah', label: 'Sejarah' },
    { key: 'struktur', label: 'Struktur' },
    { key: 'banner', label: 'Banner' },
    { key: 'gallery', label: 'Galeri' },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Konten</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola profil, publikasi, dan aset konten situs masjid.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleExportCsv} disabled={listsLoading}>
          <Download className="mr-2 size-4 shrink-0" aria-hidden />
          Export CSV
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 border border-border/60 bg-muted/30 p-1 shadow-sm">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tentang-kami" className="outline-none">
          <TentangKami />
        </TabsContent>

        <TabsContent value="events" className="space-y-6 outline-none">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Event</CardTitle>
                <CardDescription>Kegiatan yang tampil di halaman publik (12 terbaru).</CardDescription>
              </div>
              <Button type="button" disabled className="shrink-0" title="Form tambah event belum tersedia di halaman ini">
                <Plus className="mr-2 size-4 shrink-0" aria-hidden />
                Tambah event
              </Button>
            </CardHeader>
            <CardContent>{eventsContent}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="berita" className="space-y-6 outline-none">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Berita</CardTitle>
                <CardDescription>Pengumuman dan artikel ringkas untuk jamaah (12 terbaru).</CardDescription>
              </div>
              <Button type="button" disabled className="shrink-0" title="Form tulis berita belum tersedia di halaman ini">
                <Plus className="mr-2 size-4 shrink-0" aria-hidden />
                Tulis berita
              </Button>
            </CardHeader>
            <CardContent>{announcementsContent}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mimbar-jumat" className="space-y-6 outline-none">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Mimbar Jumat</CardTitle>
                <CardDescription>Khutbah dan dokumentasi (12 terbaru).</CardDescription>
              </div>
              <Button type="button" disabled className="shrink-0" title="Form khutbah baru belum tersedia di halaman ini">
                <Plus className="mr-2 size-4 shrink-0" aria-hidden />
                Khutbah baru
              </Button>
            </CardHeader>
            <CardContent>{khutbahsContent}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sejarah" className="outline-none">
          <HistoryManagement />
        </TabsContent>

        <TabsContent value="struktur" className="outline-none">
          <StrukturManagement />
        </TabsContent>

        <TabsContent value="banner" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Banner</CardTitle>
              <CardDescription>Pengelolaan banner hero akan ditambahkan pada pembaruan berikutnya.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Image className="mb-3 size-12 text-primary/35" aria-hidden />
              <p className="text-sm">Belum tersedia</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Galeri</CardTitle>
              <CardDescription>Album foto masjid akan ditambahkan pada pembaruan berikutnya.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Image className="mb-3 size-12 text-primary/35" aria-hidden />
              <p className="text-sm">Belum tersedia</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
