'use client'

import { useMemo, useState } from 'react'
import { useExportFinanceMonthlyCsv, useExportFinanceMonthlyPdf, useFinanceMonthlyReport } from '@/services/financeHooks'
import type { FinanceFundType } from '@/types'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function LaporanKeuanganPage() {
  const now = new Date()
  const [fundType, setFundType] = useState<FinanceFundType>('kas_kecil')
  const [year, setYear] = useState<number>(now.getFullYear())
  const [month, setMonth] = useState<number>(now.getMonth() + 1)
  const { data, isLoading } = useFinanceMonthlyReport({ fund_type: fundType, year, month })
  const exportCsv = useExportFinanceMonthlyCsv()
  const exportPdf = useExportFinanceMonthlyPdf()

  const monthLabel = useMemo(() => new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), [year, month])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Laporan Bulanan</h2>
        <p className="text-sm text-muted-foreground">Preview laporan kas bulanan untuk export PDF/CSV.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={fundType}
          onChange={(e) => setFundType(e.target.value as FinanceFundType)}
        >
          <option value="kas_besar">Kas Besar</option>
          <option value="kas_kecil">Kas Kecil</option>
        </select>
        <input
          className="w-28 rounded-md border bg-background px-3 py-2 text-sm"
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        />
        <input
          className="w-24 rounded-md border bg-background px-3 py-2 text-sm"
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        />
        <button
          type="button"
          className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
          disabled={exportCsv.isPending}
          onClick={() => exportCsv.mutate({ fund_type: fundType, year, month })}
        >
          {exportCsv.isPending ? 'Mengunduh...' : 'Download CSV'}
        </button>
        <button
          type="button"
          className="rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
          disabled={exportPdf.isPending}
          onClick={() => exportPdf.mutate({ fund_type: fundType, year, month })}
        >
          {exportPdf.isPending ? 'Mengunduh...' : 'Download PDF'}
        </button>
      </div>

      <div className="rounded-lg border p-4">
        {isLoading || !data ? (
          <p className="text-sm text-muted-foreground">Memuat laporan...</p>
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
      </div>
    </div>
  )
}

