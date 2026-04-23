'use client';

import Link from 'next/link';
import { HeartHandshake, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePublicQurbanSummary } from '@/services/hooks';

export function QurbanSection() {
  const { data: qurbanSummary = [], isLoading } = usePublicQurbanSummary();

  return (
    <section id="qurban" className="py-16 md:py-20 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-sacred-gold/20 bg-sacred-green/5 p-6 md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sacred-gold/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-sacred-green">
            <HeartHandshake className="size-3.5" />
            Program Idul Adha
          </div>
          <h2 className="text-2xl font-semibold text-sacred-green md:text-3xl">
            Kantong Qurban Patungan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-sacred-green/80 md:text-base">
            Pantau informasi qurban masjid, termasuk skema patungan per hewan. Panitia dapat mengelola
            slot peserta dan daftar nama melalui dashboard agar proses pendataan lebih rapi.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-sacred-green/80">
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2">
              <Users className="size-4" />
              Slot patungan dinamis per jenis hewan
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login?redirect=%2Fqurban">Masuk Dashboard Qurban</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="#donasi">Lihat Info Donasi</Link>
            </Button>
          </div>

          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-sacred-green">Daftar Kantong Qurban</h3>
            {isLoading ? (
              <p className="text-sm text-sacred-green/70">Memuat data qurban...</p>
            ) : qurbanSummary.length === 0 ? (
              <p className="text-sm text-sacred-green/70">Data qurban belum tersedia.</p>
            ) : (
              <div className="space-y-3">
                {qurbanSummary.map((animal) => (
                  <div key={animal.id} className="rounded-lg border border-sacred-gold/20 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-sacred-green">
                        {animal.label} ({animal.animal_type})
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={animal.status === 'full' ? 'destructive' : 'secondary'}>
                          {animal.status === 'full' ? 'Full' : 'Open'}
                        </Badge>
                        <span className="text-xs text-sacred-green/70">
                          {animal.participant_count}/{animal.effective_max_participants}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-sacred-green/80">
                      {animal.participants.length > 0 ? (
                        <p>Peserta: {animal.participants.map((participant) => participant.name).join(', ')}</p>
                      ) : (
                        <p>Belum ada peserta.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
