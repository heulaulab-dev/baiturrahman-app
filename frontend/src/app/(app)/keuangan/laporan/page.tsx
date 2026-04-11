'use client'

import { useMemo, useState } from 'react'
import { useExportFinanceMonthlyCsv, useExportFinanceMonthlyPdf, useFinanceMonthlyReport } from '@/services/financeHooks'
import type { FinanceFundType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const monthIndex = i
  const label = new Date(2000, monthIndex, 1).toLocaleDateString('id-ID', { month: 'long' })
  return { value: monthIndex + 1, label }
})

export default function LaporanKeuanganPage() {
  const now = new Date()
  const [fundType, setFundType] = useState<FinanceFundType>('kas_kecil')
  const [year, setYear] = useState<number>(now.getFullYear())
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const { data, isLoading } = useFinanceMonthlyReport({ fund_type: fundType, year, month })
  const exportCsv = useExportFinanceMonthlyCsv()
  const exportPdf = useExportFinanceMonthlyPdf()

  const monthLabel = useMemo(
    () => new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    [year, month]
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Laporan Bulanan</h2>
        <p className="text-sm text-muted-foreground">Preview laporan kas bulanan untuk export PDF/CSV.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Kas</span>
          <Select value={fundType} onValueChange={(v) => setFundType(v as FinanceFundType)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Pilih kas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kas_besar">Kas besar</SelectItem>
              <SelectItem value="kas_kecil">Kas kecil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Bulan</span>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="laporan-year" className="text-xs text-muted-foreground">
            Tahun
          </label>
          <Input
            id="laporan-year"
            type="number"
            className="w-full sm:w-[120px]"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={exportCsv.isPending}
            onClick={() => exportCsv.mutate({ fund_type: fundType, year, month })}
          >
            {exportCsv.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengunduh…
              </>
            ) : (
              'Download CSV'
            )}
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={exportPdf.isPending}
            onClick={() => exportPdf.mutate({ fund_type: fundType, year, month })}
          >
            {exportPdf.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengunduh…
              </>
            ) : (
              'Download PDF'
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading || !data ? (
            <p className="text-sm text-muted-foreground">Memuat laporan…</p>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Periode: {monthLabel}</p>
              <p>Saldo awal: {formatCurrency(data.opening_balance)}</p>
              <p>Total pemasukan: {formatCurrency(data.total_income)}</p>
              <p>Total pengeluaran: {formatCurrency(data.total_expense)}</p>
              <p className="font-semibold">Saldo akhir: {formatCurrency(data.closing_balance)}</p>
              <p className="text-muted-foreground">Jumlah transaksi: {data.rows.length.toLocaleString('id-ID')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
