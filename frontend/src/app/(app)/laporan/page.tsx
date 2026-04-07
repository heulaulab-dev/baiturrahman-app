'use client'

import { useMemo, useState } from 'react'
import { BarChart3, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadLaporanKeuanganCsv } from '@/lib/laporan-csv'
import { useAuth } from '@/context/AuthContext'
import { useDonationStats } from '@/services/adminHooks'
import type { DonationStats } from '@/types'

type Period = 'bulan-ini' | '3-bulan' | 'tahun-ini'

const ID_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

function monthKeyToLabel(key: string): string {
  const [ys, ms] = key.split('-')
  const y = Number(ys)
  const mo = Number(ms)
  if (!y || !mo || mo < 1 || mo > 12) return key
  return `${ID_MONTHS[mo - 1]} ${y}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function LaporanPage() {
  const { hasPermission } = useAuth()
  const canAccessDonationReports = hasPermission('view_donation_reports')
  const [period, setPeriod] = useState<Period>('bulan-ini')
  const { data: stats, isLoading } = useDonationStats()

  const { periodLabel, periodMonthKeys, monthRowLabels, periodIncome, periodCount } = useMemo(() => {
    const currentDate = new Date()
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const monthKeysLast3 = Array.from({ length: 3 }, (_, idx) => {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - idx, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })
    const monthKeysThisYear = Array.from({ length: currentDate.getMonth() + 1 }, (_, idx) => {
      const d = new Date(currentDate.getFullYear(), idx, 1)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })

    let keys: string[] = [monthKey]
    let label = 'Bulan ini'
    if (period === '3-bulan') {
      keys = monthKeysLast3
      label = '3 bulan terakhir'
    }
    if (period === 'tahun-ini') {
      keys = monthKeysThisYear
      label = 'Tahun ini'
    }

    const byMonth = stats?.by_month ?? {}
    const income = keys.reduce((sum, key) => sum + ((byMonth[key] as { total?: number } | undefined)?.total ?? 0), 0)
    const count = keys.reduce((sum, key) => sum + ((byMonth[key] as { count?: number } | undefined)?.count ?? 0), 0)

    return {
      periodLabel: label,
      periodMonthKeys: keys,
      monthRowLabels: keys.map(monthKeyToLabel),
      periodIncome: income,
      periodCount: count,
    }
  }, [period, stats?.by_month])

  const categories = useMemo(() => {
    const raw = stats?.by_category ?? {}
    return Object.entries(raw).map(([key, value]) => ({
      key,
      total: (value as { total?: number }).total ?? 0,
      count: (value as { count?: number }).count ?? 0,
    }))
  }, [stats?.by_category])

  const maxCategoryTotal = Math.max(...categories.map((c) => c.total), 1)

  if (!canAccessDonationReports) {
    return (
      <div className="space-y-2 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Akses ditolak</h2>
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses laporan donasi.
        </p>
      </div>
    )
  }

  const handleExportCsv = () => {
    if (!stats) {
      toast.error('Data belum siap, tunggu sebentar')
      return
    }
    try {
      downloadLaporanKeuanganCsv({
        periodLabel,
        periodMonthKeys,
        monthRowLabels,
        periodIncome,
        periodCount,
        stats,
      })
      toast.success('CSV berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor CSV')
    }
  }

  const byMonth = stats?.by_month ?? {}

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-foreground">Laporan Keuangan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan donasi terverifikasi berdasarkan periode yang dipilih.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleExportCsv} disabled={isLoading || !stats}>
          <Download className="mr-2 size-4 shrink-0" aria-hidden />
          Export CSV
        </Button>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="w-full space-y-6">
        <TabsList className="grid h-auto w-full max-w-2xl grid-cols-3 gap-1 bg-muted/40 p-1">
          <TabsTrigger value="bulan-ini">Bulan ini</TabsTrigger>
          <TabsTrigger value="3-bulan">3 bulan terakhir</TabsTrigger>
          <TabsTrigger value="tahun-ini">Tahun ini</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-0 space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total pemasukan</CardTitle>
                <CardDescription>Donasi terkonfirmasi pada periode</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-36" />
                ) : (
                  <p className="font-mono text-2xl tabular-nums text-foreground">{formatCurrency(periodIncome)}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Transaksi</CardTitle>
                <CardDescription>Donasi terkonfirmasi pada periode</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-mono text-2xl tabular-nums text-foreground">{periodCount.toLocaleString('id-ID')}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu konfirmasi</CardTitle>
                <CardDescription>Seluruh waktu</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-mono text-2xl tabular-nums text-foreground">
                    {(stats?.pending_count ?? 0).toLocaleString('id-ID')}
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Terkonfirmasi</CardTitle>
                <CardDescription>Seluruh waktu</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="font-mono text-2xl tabular-nums text-foreground">
                    {(stats?.confirmed_count ?? 0).toLocaleString('id-ID')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Per bulan</CardTitle>
              <CardDescription>Nilai dan jumlah transaksi per bulan dalam periode yang dipilih.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bulan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Transaksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodMonthKeys.map((key, i) => {
                      const row = byMonth[key] as DonationStats['by_month'][string] | undefined
                      const total = row?.total ?? 0
                      const count = row?.count ?? 0
                      return (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{monthRowLabels[i]}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{formatCurrency(total)}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{count.toLocaleString('id-ID')}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Per kategori (terkonfirmasi)</h3>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {['a', 'b', 'c'].map((k) => (
                  <Skeleton key={k} className="h-24 w-full rounded-md" />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Belum ada donasi terkonfirmasi per kategori.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <div key={cat.key} className="rounded-md border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <BarChart3 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <span className="truncate text-sm font-medium text-foreground">{cat.key}</span>
                      </div>
                      <div className="shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
                        {formatCurrency(cat.total)}
                      </div>
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground">{cat.count.toLocaleString('id-ID')} transaksi</p>
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(cat.total / maxCategoryTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
