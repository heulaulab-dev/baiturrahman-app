'use client';

import { Calendar, Landmark, Trophy, Sparkles } from 'lucide-react';
import { useHistoryEntries } from '@/services/hooks';
import { HistoryEntry } from '@/types';

const categoryConfig = {
  milestone: { icon: Landmark, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', label: 'Milestone' },
  achievement: { icon: Trophy, color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400', label: 'Achievement' },
  event: { icon: Sparkles, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Event' },
};

export function SejarahSection() {
  const { data, isLoading } = useHistoryEntries({ status: 'published' });

  const entries = data?.data || [];

  if (isLoading) {
    return (
      <section id="sejarah" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto container">
          <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <section id="sejarah" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif-cormorant font-semibold text-sacred-green mb-4">
            Sejarah Masjid
          </h2>
          <div className="w-16 h-1 bg-sacred-gold mx-auto" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-sacred-green/30" />

            <div className="space-y-12 md:space-y-16 pl-0 md:pl-16">
              {entries.map((entry: HistoryEntry) => {
                const config = categoryConfig[entry.category] || categoryConfig.event;
                const Icon = config.icon;

                return (
                  <div key={entry.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-8 md:-left-8 top-6 w-4 h-4 rounded-full border-4 border-white bg-sacred-green flex items-center justify-center">
                      <Icon className="w-2 h-2 text-white" />
                    </div>

                    {/* Content Card */}
                    <div className="ml-12 md:ml-16 pb-8">
                      <div className={`p-6 rounded-lg ${config.color}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 text-xs font-medium tracking-wider rounded-full ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-sm text-muted">
                            {new Date(entry.entry_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {entry.title && (
                          <h3 className="text-xl font-serif-cormorant font-semibold mb-3">
                            {entry.title}
                          </h3>
                        )}

                        {entry.content && (
                          <p className="text-sacred-text/90 prose prose max-w-none">
                            {entry.content}
                          </p>
                        )}

                        {entry.image_url && (
                          <div className="mt-4">
                            <img
                              src={entry.image_url}
                              alt={entry.title}
                              className="rounded-lg object-cover max-h-64 w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </section>
  );

}
