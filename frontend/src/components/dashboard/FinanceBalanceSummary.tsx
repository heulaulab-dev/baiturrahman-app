'use client'

import Link from 'next/link'
import { Landmark, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useFinanceBalance } from '@/services/financeHooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function FinanceBalanceSummary() {
  const { hasPermission } = useAuth()
  const canView = hasPermission('finance.view_reports')

  const { data: besar, isLoading: loadingBesar, isError: errBesar } = useFinanceBalance('kas_besar', canView)
  const { data: kecil, isLoading: loadingKecil, isError: errKecil } = useFinanceBalance('kas_kecil', canView)

  if (!canView) {
    return null
  }

  const saldoBesar = Math.round(besar?.balance ?? 0)
  const saldoKecil = Math.round(kecil?.balance ?? 0)
  const total = saldoBesar + saldoKecil
  const loading = loadingBesar || loadingKecil
  const hasError = errBesar || errKecil

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle className="text-base font-semibold">Ringkasan kas masjid</CardTitle>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/keuangan/laporan">Laporan keuangan</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat saldo…
          </div>
        ) : hasError ? (
          <p className="py-4 text-sm text-destructive">Gagal memuat saldo kas. Coba muat ulang halaman.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kas</TableHead>
                <TableHead className="hidden sm:table-cell">Keterangan</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="w-[100px] text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Kas besar</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">Tabungan / bank</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatCurrency(saldoBesar)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link href="/keuangan/kas-besar">Buka</Link>
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Kas kecil</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">Tunai operasional</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatCurrency(saldoKecil)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link href="/keuangan/kas-kecil">Buka</Link>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-semibold">
                  Total gabungan
                </TableCell>
                <TableCell className="text-right font-mono text-base font-semibold tabular-nums">
                  {formatCurrency(total)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link href="/keuangan/transfer">Transfer</Link>
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
