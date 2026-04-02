import type { DonationStats } from '@/types'

function csvCell(value: string | number | boolean | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export interface LaporanCsvPayload {
  periodLabel: string
  periodMonthKeys: string[]
  monthRowLabels: string[]
  periodIncome: number
  periodCount: number
  stats: DonationStats
}

export function downloadLaporanKeuanganCsv(payload: LaporanCsvPayload): void {
  const { periodLabel, periodMonthKeys, monthRowLabels, periodIncome, periodCount, stats } = payload
  const bom = '\uFEFF'
  const lines: string[] = []

  lines.push('LAPORAN KEUANGAN — DONASI')
  lines.push(['periode_filter', periodLabel].map(csvCell).join(','))
  lines.push('')
  lines.push('RINGKASAN')
  lines.push(
    ['total_pemasukan_periode', 'jumlah_transaksi_periode', 'pending', 'confirmed', 'cancelled']
      .map(csvCell)
      .join(',')
  )
  lines.push(
    [
      Math.round(periodIncome),
      periodCount,
      stats.pending_count,
      stats.confirmed_count,
      stats.cancelled_count,
    ]
      .map(csvCell)
      .join(',')
  )
  lines.push('')
  lines.push('PER BULAN (DALAM PERIODE)')
  lines.push(['bulan_key', 'label', 'total', 'jumlah_transaksi'].map(csvCell).join(','))
  const byMonth = stats.by_month ?? {}
  periodMonthKeys.forEach((key, i) => {
    const row = byMonth[key] as { total?: number; count?: number } | undefined
    lines.push(
      [key, monthRowLabels[i] ?? key, Math.round(row?.total ?? 0), row?.count ?? 0].map(csvCell).join(',')
    )
  })
  lines.push('')
  lines.push('PER KATEGORI (TERKONFIRMASI, AKUMULASI)')
  lines.push(['kategori', 'total', 'jumlah_transaksi'].map(csvCell).join(','))
  Object.entries(stats.by_category ?? {}).forEach(([key, value]) => {
    const v = value as { total?: number; count?: number }
    lines.push([key, Math.round(v?.total ?? 0), v?.count ?? 0].map(csvCell).join(','))
  })

  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const safePeriod = periodLabel.replace(/\s+/g, '_').replace(/[^\w\-]/g, '')
  anchor.href = url
  anchor.download = `laporan-keuangan_${safePeriod}_${y}-${m}-${day}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
