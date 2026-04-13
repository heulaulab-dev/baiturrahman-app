'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSponsors } from '@/services/hooks'
import { resolveBackendAssetUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function MitraPage() {
  const { data: sponsors = [], isLoading, isError } = useSponsors()

  return (
    <div className="bg-white py-16 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sacred-green/80">
            Mitra &amp; sponsor
          </p>
          <h1 className="mt-2 font-serif text-3xl text-sacred-green md:text-4xl">Mitra kami</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Terima kasih kepada mitra yang mendukung kegiatan dan operasional masjid.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Memuat…</p>
        ) : isError ? (
          <p className="text-center text-sm text-destructive">Gagal memuat daftar mitra.</p>
        ) : sponsors.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Belum ada mitra untuk ditampilkan.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {sponsors.map((s) => {
              const src = resolveBackendAssetUrl(s.logo_url)
              return (
                <li
                  key={s.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-6 shadow-sm"
                >
                  <div className="flex min-h-[72px] items-center justify-center">
                    {src ? (
                      <Image
                        src={src}
                        alt={s.name}
                        width={200}
                        height={100}
                        className="max-h-20 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-sacred-green">{s.name}</span>
                    )}
                  </div>
                  <div className="text-center">
                    {src ? (
                      <h2 className="font-semibold text-sacred-green">{s.name}</h2>
                    ) : null}
                    {s.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                    ) : null}
                    {s.website_url?.trim() ? (
                      <Button variant="link" className="mt-2 h-auto p-0" asChild>
                        <a href={s.website_url} target="_blank" rel="noopener noreferrer">
                          Kunjungi situs
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
