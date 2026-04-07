import type { AsetTetap, BarangTidakTetap } from '@/services/inventaris'

function csvCell(value: string | number | boolean | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function downloadInventarisCsv(aset: AsetTetap[], barang: BarangTidakTetap[]): void {
  const lines: string[] = []
  const bom = '\uFEFF'

  lines.push('ASET TETAP')
  lines.push(['no', 'nama_aset', 'luas', 'updated_at'].map(csvCell).join(','))
  aset.forEach((a, i) => {
    lines.push([i + 1, a.nama_aset, a.luas ?? '', a.updated_at].map(csvCell).join(','))
  })

  lines.push('')
  lines.push('BARANG TIDAK TETAP')
  lines.push(
    ['no', 'kategori', 'nama_barang', 'jumlah', 'satuan', 'kondisi', 'keterangan', 'updated_at']
      .map(csvCell)
      .join(',')
  )
  barang.forEach((b, i) => {
    lines.push(
      [
        i + 1,
        b.kategori,
        b.nama_barang,
        b.jumlah ?? '',
        b.satuan ?? '',
        b.kondisi_baik ? 'Baik' : 'Rusak',
        b.keterangan ?? '',
        b.updated_at,
      ]
        .map(csvCell)
        .join(',')
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
  anchor.download = `inventaris-${y}-${m}-${day}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}
