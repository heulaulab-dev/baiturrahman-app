'use client';

import Image from 'next/image';
import { Users } from 'lucide-react';
import { usePublicStrukturs } from '@/services/hooks';
import { ApiResponse, Struktur } from '@/types';

const roleConfig = {
  ketua: { label: 'Ketua', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  sekretaris: { label: 'Sekretaris', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  bendahara: { label: 'Bendahara', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  humas: { label: 'Humas', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  imam_syah: { label: 'Imam Syah', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  muadzin: { label: 'Muadzin', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
  dai_amil: { label: 'Dai Amil', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' },
  marbot: { label: 'Marbot', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400' },
  lainnya: { label: 'Lainnya', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
};

export function StrukturSection() {
  const { data, isLoading } = usePublicStrukturs();

  const strukturs = (data as unknown as ApiResponse<Struktur[]>) || [];

  if (isLoading) {
    return (
      <section id="struktur" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto container">
          <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (!strukturs || (strukturs as unknown as Struktur[]).length === 0) {
    return (
      <section id="struktur" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto container">
          <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  return (
    <section id="struktur" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif-cormorant font-semibold text-sacred-green mb-4">
            Struktur Kepengurusan
          </h2>
          <div className="w-16 h-1 bg-sacred-gold mx-auto" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(strukturs as unknown as Struktur[]).map((struktur: Struktur) => {
              const config = roleConfig[struktur.role] || roleConfig.lainnya;

              return (
                <div
                  key={struktur.id}
                  className="group bg-gradient-to-br from-white to-muted/30 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  {/* Photo */}
                  <div className="flex justify-center mb-4">
                    {struktur.photo_url ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
                        <Image
                          src={struktur.photo_url}
                          alt={struktur.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-sacred-green/10 border-4 border-white flex items-center justify-center">
                        <Users className="w-10 h-10 text-sacred-green" />
                      </div>
                    )}
                  </div>

                  {/* Name & Role */}
                  <div className="text-center mb-4">
                    <span className={`inline-block px-3 py-1 text-xs font-medium tracking-wider rounded-full mb-2 ${config.color}`}>
                      {config.label}
                    </span>
                    <h3 className="text-lg font-semibold text-sacred-text">
                      {struktur.name}
                    </h3>
                    {struktur.department && (
                      <p className="text-sm text-muted">{struktur.department}</p>
                    )}
                  </div>

                  {/* Contact Info */}
                  {(struktur.email || struktur.phone) && (
                    <div className="space-y-2 text-sm text-muted mb-4">
                      {struktur.email && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>
                          <span className="truncate">{struktur.email}</span>
                        </div>
                      )}
                      {struktur.phone && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Telepon:</span>
                          <span>{struktur.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bio */}
                  {struktur.bio && (
                    <p className="text-sm text-sacred-text/90 line-clamp-3">
                      {struktur.bio}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
