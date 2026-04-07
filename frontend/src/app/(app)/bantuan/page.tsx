import Link from 'next/link'
import {
  Boxes,
  Building2,
  CalendarDays,
  CircleHelp,
  FileText,
  Headphones,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const shortcuts = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Ringkasan aktivitas, donasi menunggu, dan pintasan.',
    icon: LayoutDashboard,
  },
  {
    href: '/jamaah',
    label: 'Jamaah',
    description: 'Data jamaah dan keanggotaan.',
    icon: Users,
  },
  {
    href: '/reservasi',
    label: 'Reservasi',
    description: 'Permohonan pemakaian fasilitas masjid.',
    icon: CalendarDays,
  },
  {
    href: '/donasi',
    label: 'Donasi',
    description: 'Konfirmasi donasi dan metode pembayaran.',
    icon: Wallet,
  },
  {
    href: '/inventaris',
    label: 'Inventaris',
    description: 'Aset tetap dan barang tidak tetap.',
    icon: Boxes,
  },
  {
    href: '/laporan',
    label: 'Laporan',
    description: 'Ringkasan keuangan donasi per periode.',
    icon: FileText,
  },
  {
    href: '/konten',
    label: 'Konten',
    description: 'Berita, event, khutbah, struktur, dan lainnya.',
    icon: Building2,
  },
  {
    href: '/pengaturan',
    label: 'Pengaturan',
    description: 'Profil masjid dan daftar pengguna.',
    icon: Settings,
  },
] as const

function GuideLink({
  href,
  children,
}: Readonly<{
  href: string
  children: React.ReactNode
}>) {
  return (
    <Link
      href={href}
      className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
    >
      {children}
    </Link>
  )
}

export default function BantuanPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-2 sm:px-0">
      {/* Hero */}
      <header className="border-b border-border/80 pb-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 sm:size-16"
            aria-hidden
          >
            <CircleHelp className="size-8 text-primary sm:size-9" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Bantuan</h1>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Panduan singkat panel administrasi masjid. Pilih modul di bawah atau buka accordion untuk penjelasan
              lebih rinci.
            </p>
          </div>
        </div>
      </header>

      {/* Pintasan */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Pintasan modul</h2>
          <p className="mt-1 text-sm text-muted-foreground">Satu klik menuju halaman yang Anda butuhkan.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {shortcuts.map(({ href, label, description, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex min-h-22 gap-4 rounded-xl border border-border bg-card p-4 shadow-sm',
                  'transition-all duration-200',
                  'hover:border-primary/35 hover:bg-primary/4 hover:shadow-md',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="font-semibold leading-snug text-foreground">{label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Panduan */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20 px-5 py-5 sm:px-6">
          <CardTitle className="text-lg">Panduan per modul</CardTitle>
          <CardDescription>Klik judul untuk membuka penjelasan.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dashboard" className="border-b border-border px-5 last:border-b-0 sm:px-6">
              <AccordionTrigger className="group py-4 hover:no-underline">
                <span className="text-left font-medium text-foreground group-data-[state=open]:text-primary">
                  Dashboard &amp; profil masjid
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-muted-foreground">
                Di <strong className="font-semibold text-foreground">Dashboard</strong> Anda melihat ringkasan donasi,
                daftar donasi menunggu konfirmasi, dan aktivitas. Submenu{' '}
                <strong className="font-semibold text-foreground">Profil Masjid</strong> memuat tampilan profil singkat.
                Untuk mengubah data resmi masjid, buka{' '}
                <GuideLink href="/pengaturan">Pengaturan → Profil masjid</GuideLink>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="donasi-laporan" className="border-b border-border px-5 last:border-b-0 sm:px-6">
              <AccordionTrigger className="group py-4 hover:no-underline">
                <span className="text-left font-medium text-foreground group-data-[state=open]:text-primary">
                  Donasi &amp; laporan keuangan
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-muted-foreground">
                Modul <strong className="font-semibold text-foreground">Donasi</strong> untuk mengonfirmasi atau
                menangani donasi masuk; metode pembayaran (termasuk QRIS) di tab terkait. Di{' '}
                <strong className="font-semibold text-foreground">Laporan</strong> pilih periode (bulan ini, tiga bulan
                terakhir, tahun ini), lihat rincian per bulan, dan unduh{' '}
                <strong className="font-semibold text-foreground">Export CSV</strong> bila diperlukan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reservasi-jamaah" className="border-b border-border px-5 last:border-b-0 sm:px-6">
              <AccordionTrigger className="group py-4 hover:no-underline">
                <span className="text-left font-medium text-foreground group-data-[state=open]:text-primary">
                  Reservasi &amp; jamaah
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-foreground">Reservasi</strong> berisi permohonan pemakaian ruang
                atau fasilitas—setujui, tolak, atau sesuaikan jadwal sesuai kebijakan masjid.{' '}
                <strong className="font-semibold text-foreground">Jamaah</strong> untuk data keanggotaan dan kegiatan
                terkait (sesuai fitur yang aktif).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="inventaris-konten"
              className="border-b border-border px-5 last:border-b-0 sm:px-6"
            >
              <AccordionTrigger className="group py-4 hover:no-underline">
                <span className="text-left font-medium text-foreground group-data-[state=open]:text-primary">
                  Inventaris &amp; konten
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-foreground">Inventaris</strong> memisahkan aset tetap dan barang
                tidak tetap; gunakan export CSV untuk arsip. <strong className="font-semibold text-foreground">Konten</strong>{' '}
                mencakup tentang kami, event, berita, khutbah, sejarah, dan struktur—masing-masing di tab sendiri.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="akun" className="border-b border-border px-5 last:border-b-0 sm:px-6">
              <AccordionTrigger className="group py-4 hover:no-underline">
                <span className="text-left font-medium text-foreground group-data-[state=open]:text-primary">
                  Masuk, peran, dan keamanan
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-prose pb-5 text-[15px] leading-relaxed text-muted-foreground">
                Anda masuk dengan akun dari pengurus. Peran (admin, editor, dll.) membatasi fitur yang tampil. Jika sesi
                habis, Anda akan diarahkan ke login. Jangan membagikan kata sandi admin kepada orang yang tidak berwenang.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Dukungan */}
      <Card className="border-dashed border-primary/25 bg-muted/15 shadow-none">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 px-5 py-5 sm:px-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Headphones className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-2">
            <CardTitle className="text-base font-semibold">Butuh bantuan teknis?</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Untuk masalah akun, akses, atau bug, hubungi pengurus IT atau tim yang mengelola server. Lampirkan
              tangkapan layar dan langkah singkat agar cepat ditindak.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
