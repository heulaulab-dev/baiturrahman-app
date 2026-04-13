'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { AnnouncementsManagement } from '@/components/dashboard/AnnouncementsManagement'
import { EventsManagement } from '@/components/dashboard/EventsManagement'
import { HistoryManagement } from '@/components/dashboard/HistoryManagement'
import { KhutbahManagement } from '@/components/dashboard/KhutbahManagement'
import { StrukturManagement } from '@/components/dashboard/StrukturManagement'
import { GalleryManagement } from '@/components/dashboard/GalleryManagement'
import { HeroBannerManagement } from '@/components/dashboard/HeroBannerManagement'
import { TentangKami } from '@/components/dashboard/TentangKami'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadKontenRingkasanCsv } from '@/lib/konten-csv'
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
  const { data: eventsResponse, isLoading: eventsLoading } = useAdminEvents(100)
  const { data: announcementsResponse, isLoading: announcementsLoading } = useAdminAnnouncements(100)
  const { data: khutbahsResponse, isLoading: khutbahsLoading } = useAdminKhutbahs(100)
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
            <CardHeader>
              <CardTitle>Event</CardTitle>
              <CardDescription>Kegiatan / kajian yang tampil di halaman publik (bukan status dibatalkan).</CardDescription>
            </CardHeader>
            <CardContent>
              <EventsManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="berita" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Berita &amp; pengumuman</CardTitle>
              <CardDescription>
                Filter &quot;aktif&quot; di API menentukan apa yang muncul di landing (terbit, semat, belum kedaluwarsa).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementsManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mimbar-jumat" className="space-y-6 outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Mimbar Jumat</CardTitle>
              <CardDescription>Khutbah terbit tampil sebagai &quot;terbaru&quot; dan arsip publik.</CardDescription>
            </CardHeader>
            <CardContent>
              <KhutbahManagement />
            </CardContent>
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
              <CardTitle>Banner hero</CardTitle>
              <CardDescription>
                Gambar latar karusel di bagian atas beranda. Terpisah dari galeri kegiatan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroBannerManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Galeri</CardTitle>
              <CardDescription>
                Kelola foto yang tampil di beranda (karusel) dan halaman publik /galeri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GalleryManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
