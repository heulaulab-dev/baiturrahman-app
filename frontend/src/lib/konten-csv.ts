import type { Announcement, Event, Khutbah } from '@/types'

function csvCell(value: string | number | boolean | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function clip(text: string, max = 200): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

export interface KontenCsvPayload {
  events: Event[]
  announcements: Announcement[]
  khutbahs: Khutbah[]
}

export function downloadKontenRingkasanCsv(payload: KontenCsvPayload): void {
  const { events, announcements, khutbahs } = payload
  const bom = '\uFEFF'
  const lines: string[] = []

  lines.push('RINGKASAN KONTEN')
  lines.push('')

  lines.push('EVENT')
  lines.push(['id', 'judul', 'tanggal', 'terbit', 'deskripsi_ringkas'].map(csvCell).join(','))
  events.forEach((e) => {
    lines.push(
      [e.id, e.title, e.date, e.is_published ? 'ya' : 'tidak', clip(e.description ?? '')]
        .map(csvCell)
        .join(',')
    )
  })

  lines.push('')
  lines.push('BERITA')
  lines.push(['id', 'judul', 'dibuat', 'ringkas'].map(csvCell).join(','))
  announcements.forEach((a) => {
    lines.push([a.id, a.title, a.created_at, clip(a.content ?? '')].map(csvCell).join(','))
  })

  lines.push('')
  lines.push('KHUTBAH')
  lines.push(['id', 'tema', 'khatib', 'tanggal', 'status', 'file_url'].map(csvCell).join(','))
  khutbahs.forEach((k) => {
    lines.push(
      [k.id, k.tema, k.khatib, k.date, k.status, k.file_url ?? ''].map(csvCell).join(',')
    )
  })

  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  anchor.href = url
  anchor.download = `konten-ringkasan_${y}-${m}-${day}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
