'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { useEvents } from '@/services/hooks'
import Image from 'next/image'
import Link from 'next/link'
import { eventVisibleOnPublicPages, formatEventClockLabel, formatEventDateIso } from '@/lib/event-display'
import { resolveBackendAssetUrl } from '@/lib/utils'

export function EventsSection() {
  const { data: events, isLoading } = useEvents()

  const eventsArray = Array.isArray(events) ? events : []
  const upcomingEvents = eventsArray
    .filter(eventVisibleOnPublicPages)
    .sort(
      (a, b) => formatEventDateIso(a.event_date).getTime() - formatEventDateIso(b.event_date).getTime()
    )
    .slice(0, 3)

  return (
    <section id="events" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 dark:text-white">Acara Mendatang</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Ikuti berbagai kegiatan dan acara bermanfaat bersama kami
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-900">
                  {resolveBackendAssetUrl(event.image_url ?? undefined) ? (
                    <Image
                      src={resolveBackendAssetUrl(event.image_url ?? undefined)!}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar size={48} className="text-white/50" />
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1 dark:text-white">{event.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{event.description}</p>

                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {formatEventDateIso(event.event_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{formatEventClockLabel(event.event_time) ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span className="line-clamp-1">{event.location ?? '—'}</span>
                    </div>
                  </div>

                  <Link href={`/events/${event.slug}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      Lihat Detail
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
