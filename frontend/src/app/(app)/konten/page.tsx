'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { AnnouncementsManagement } from '@/components/dashboard/AnnouncementsManagement'
import { EventsManagement } from '@/components/dashboard/EventsManagement'
import { HistoryManagement } from '@/components/dashboard/HistoryManagement'
import { KhutbahManagement } from '@/components/dashboard/KhutbahManagement'
import { StrukturManagement } from '@/components/dashboard/StrukturManagement'
import { GalleryManagement } from '@/components/dashboard/GalleryManagement'
import { HeroBannerManagement } from '@/components/dashboard/HeroBannerManagement'
import { SponsorManagement } from '@/components/dashboard/SponsorManagement'
import { TentangKami } from '@/components/dashboard/TentangKami'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMutation } from '@tanstack/react-query'
import { exportContentSummaryXlsx } from '@/services/adminApiService'
import { useAdminAnnouncements, useAdminEvents, useAdminKhutbahs } from '@/services/adminHooks'
import { useAuth } from '@/context/AuthContext'

type TabType =
  | 'tentang-kami'
  | 'events'
  | 'berita'
  | 'mimbar-jumat'
  | 'sejarah'
  | 'struktur'
  | 'banner'
  | 'gallery'
  | 'mitra'

export default function KontenPage() {
  const { hasPermission } = useAuth()
  const canSponsors = hasPermission('access_sponsors')
  const [activeTab, setActiveTab] = useState<TabType>('tentang-kami')
  const { data: eventsResponse } = useAdminEvents(100)
  const { data: announcementsResponse } = useAdminAnnouncements(100)
  const { data: khutbahsResponse } = useAdminKhutbahs(100)
  const events = eventsResponse?.data ?? []
  const announcements = announcementsResponse?.data ?? []
  const khutbahs = khutbahsResponse?.data ?? []

  const exportKonten = useMutation({
    mutationFn: () => exportContentSummaryXlsx(),
  })

  useEffect(() => {
    if (!canSponsors && activeTab === 'mitra') {
      setActiveTab('tentang-kami')
    }
  }, [canSponsors, activeTab])

  const handleExportExcel = () => {
    exportKonten.mutate(undefined, {
      onSuccess: () => toast.success('Excel berhasil diunduh'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Gagal mengekspor Excel'),
    })
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
    ...(canSponsors ? [{ key: 'mitra' as const, label: 'Mitra' }] : []),
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
        <Button type="button" variant="outline" onClick={handleExportExcel} disabled={exportKonten.isPending}>
          <Download className="mr-2 size-4 shrink-0" aria-hidden />
          Export Excel
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

        {canSponsors ? (
          <TabsContent value="mitra" className="outline-none">
            <Card>
              <CardHeader>
                <CardTitle>Mitra &amp; sponsor</CardTitle>
                <CardDescription>
                  Logo, tautan, dan jadwal tampil di situs publik (halaman /mitra dan blok beranda).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SponsorManagement />
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
