import { format, isValid, parseISO } from 'date-fns'
import type { Event } from '@/types'

/** Backend status; cancelled events hidden on marketing site. */
export function eventVisibleOnPublicPages(e: Event): boolean {
  return e.status !== 'cancelled'
}

export function formatEventDateIso(eventDate: string): Date {
  return parseISO(eventDate.length <= 10 ? `${eventDate}T12:00:00` : eventDate)
}

export function formatEventClockLabel(eventTime: string | null | undefined): string | null {
  if (!eventTime) return null
  const d = parseISO(eventTime)
  if (!isValid(d)) return null
  return format(d, 'HH:mm')
}
