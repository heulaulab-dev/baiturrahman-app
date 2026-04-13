'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSponsorsForLanding } from '@/services/hooks'
import { resolveBackendAssetUrl } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function SponsorsLandingSection() {
  const { data: sponsors = [], isLoading } = useSponsorsForLanding()

  if (isLoading || sponsors.length === 0) {
    return null
  }

  return (
    <section className="border-y border-sacred-green/10 bg-muted/20 py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sacred-green/80">
              Mitra &amp; sponsor
            </p>
            <h2 className="mt-1 font-serif text-2xl text-sacred-green md:text-3xl">
              Yang mendukung kita
            </h2>
          </div>
          <Button variant="outline" size="sm" className="mx-auto shrink-0 sm:mx-0" asChild>
            <Link href="/mitra">Lihat semua mitra</Link>
          </Button>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {sponsors.map((s) => {
            const src = resolveBackendAssetUrl(s.logo_url)
            const inner = (
              <div className="flex h-16 w-32 items-center justify-center md:h-20 md:w-40">
                {src ? (
                  <Image
                    src={src}
                    alt={s.name}
                    width={160}
                    height={80}
                    className="max-h-16 w-auto object-contain md:max-h-20"
                  />
                ) : (
                  <span className="text-center text-sm font-medium text-sacred-green/80">{s.name}</span>
                )}
              </div>
            )
            if (s.website_url?.trim()) {
              return (
                <li key={s.id}>
                  <a
                    href={s.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block opacity-90 transition-opacity hover:opacity-100"
                  >
                    {inner}
                  </a>
                </li>
              )
            }
            return <li key={s.id}>{inner}</li>
          })}
        </ul>
      </div>
    </section>
  )
}
