'use client'

import { useMemo, useState } from 'react'
import { FileBarChart, Loader2 } from 'lucide-react'
import {
  useExportFinanceMonthlyPdf,
  useExportFinanceMonthlyXlsx,
  useExportFinanceWeeklyPdf,
  useExportFinanceWeeklyXlsx,
  useFinanceMonthlyReport,
  useFinanceWeeklyReport,
} from '@/services/financeHooks'
import type { FinanceFundType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { FinanceFormDatePicker } from '@/components/dashboard/finance/FinanceFormDatePicker'

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

function StatBlock({
  label,
  value,
  loading,
  emphasize,
}: Readonly<{
  label: string
  value: string
  loading?: boolean
  emphasize?: boolean
}>) {
  return (
    <div className="rounded-lg border bg-card/50 p-4 shadow-xs">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className={emphasize ? 'mt-2 h-8 w-40' : 'mt-2 h-6 w-36'} />
      ) : (
        <p className={`mt-1 tabular-nums ${emphasize ? 'text-lg font-semibold sm:text-xl' : 'text-sm font-medium'}`}>
          {value}
        </p>
      )}
    </div>
  )
}

export default function LaporanKeuanganPage() {
  const now = new Date()
  const toDateInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const [fundType, setFundType] = useState<FinanceFundType>('kas_kecil')
  const [periodType, setPeriodType] = useState<'monthly' | 'weekly'>('monthly')
  const [year, setYear] = useState<number>(now.getFullYear())
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const [anchorDate, setAnchorDate] = useState<string>(toDateInput(now))
  const { data: monthlyData, isLoading: isMonthlyLoading } = useFinanceMonthlyReport({ fund_type: fundType, year, month })
  const { data: weeklyData, isLoading: isWeeklyLoading } = useFinanceWeeklyReport({ anchor_date: anchorDate }, periodType === 'weekly')
  const exportXlsx = useExportFinanceMonthlyXlsx()
  const exportPdf = useExportFinanceMonthlyPdf()
  const exportWeeklyXlsx = useExportFinanceWeeklyXlsx()
  const exportWeeklyPdf = useExportFinanceWeeklyPdf()

  const monthLabel = useMemo(
    () => new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    [year, month]
  )
  const isWeekly = periodType === 'weekly'
  const isMonthly = periodType === 'monthly'
  const isLoading = isWeekly ? isWeeklyLoading : isMonthlyLoading
  const data = isWeekly ? weeklyData : monthlyData
  const periodLabel = isWeekly ? weeklyData?.period_label ?? 'Memuat periode minggu…' : monthLabel
  const xlsxPending = isWeekly ? exportWeeklyXlsx.isPending : exportXlsx.isPending
  const pdfPending = isWeekly ? exportWeeklyPdf.isPending : exportPdf.isPending

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileBarChart className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Laporan keuangan</CardTitle>
              <CardDescription>
                Ringkasan mutasi per periode pilihan (bulanan atau mingguan) dan unduhan PDF atau Excel.
              </CardDescription>
            </div>
          </div>
          <div className="inline-flex rounded-lg border bg-background p-1">
            <button
              type="button"
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isMonthly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}
              onClick={() => setPeriodType('monthly')}
            >
              Bulanan
            </button>
            <button
              type="button"
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isWeekly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}
              onClick={() => setPeriodType('weekly')}
            >
              Mingguan
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 border-t bg-muted/20 pt-6 sm:flex-row sm:flex-wrap sm:items-end">
          {isMonthly ? (
            <>
              <Field className="min-w-0 sm:w-[200px]">
                <FieldLabel>Kas</FieldLabel>
                <Select value={fundType} onValueChange={(v) => setFundType(v as FinanceFundType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kas_besar">Kas besar</SelectItem>
                    <SelectItem value="kas_kecil">Kas kecil</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="min-w-0 sm:w-[200px]">
                <FieldLabel>Bulan</FieldLabel>
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="w-full">
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
              </Field>
              <Field className="min-w-0 sm:w-[120px]">
                <FieldLabel htmlFor="laporan-year">Tahun</FieldLabel>
                <Input
                  id="laporan-year"
                  type="number"
                  min={2000}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </Field>
            </>
          ) : (
            <FinanceFormDatePicker
              id="laporan-anchor-date"
              label="Tanggal acuan minggu"
              value={anchorDate}
              onChange={setAnchorDate}
              className="min-w-0 sm:w-[260px]"
              buttonClassName="h-10"
            />
          )}
          <div className="flex flex-wrap gap-2 pb-0.5">
            <Button
              type="button"
              variant="outline"
              disabled={xlsxPending}
              onClick={() => {
                if (isWeekly) {
                  exportWeeklyXlsx.mutate({ anchor_date: anchorDate })
                  return
                }
                exportXlsx.mutate({ fund_type: fundType, year, month })
              }}
            >
              {xlsxPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengunduh…
                </>
              ) : (
                'Download Excel'
              )}
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={pdfPending}
              onClick={() => {
                if (isWeekly) {
                  exportWeeklyPdf.mutate({ anchor_date: anchorDate })
                  return
                }
                exportPdf.mutate({ fund_type: fundType, year, month })
              }}
            >
              {pdfPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengunduh…
                </>
              ) : (
                'Download PDF'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base">Ringkasan periode</CardTitle>
          <CardDescription>
            {isLoading || !data ? 'Memuat angka…' : periodLabel}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading || !data ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatBlock label="Saldo awal" value="" loading />
              <StatBlock label="Total pemasukan" value="" loading />
              <StatBlock label="Total pengeluaran" value="" loading />
              <StatBlock label="Saldo akhir" value="" loading emphasize />
              <StatBlock label="Jumlah transaksi" value="" loading />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-foreground">{periodLabel}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatBlock label="Saldo awal" value={formatCurrency(data.opening_balance)} />
                <StatBlock label="Total pemasukan" value={formatCurrency(data.total_income)} />
                <StatBlock label="Total pengeluaran" value={formatCurrency(data.total_expense)} />
                <StatBlock label="Saldo akhir" value={formatCurrency(data.closing_balance)} emphasize />
                <StatBlock
                  label="Jumlah transaksi"
                  value={data.rows.length.toLocaleString('id-ID')}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
