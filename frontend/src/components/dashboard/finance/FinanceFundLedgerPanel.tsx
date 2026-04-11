'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useFinanceBalance, useFinanceTransactions } from '@/services/financeHooks'
import type { FinanceFundType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FinanceTransactionDialog,
  type FinanceManualTxMode,
} from '@/components/dashboard/finance/FinanceTransactionDialog'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatTxDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export interface FinanceFundLedgerPanelProps {
  fundType: FinanceFundType
  title: string
}

export function FinanceFundLedgerPanel({ fundType, title }: FinanceFundLedgerPanelProps) {
  const { hasPermission } = useAuth()
  const canView = hasPermission('finance.view_reports')
  const canCreateTx = hasPermission('finance.create_transaction')
  const canAdjust = hasPermission('finance.adjust_opening_balance')

  const [page, setPage] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<FinanceManualTxMode>('pemasukan')

  const params = useMemo(
    () => ({
      fund_type: fundType,
      page,
      limit: 20,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [fundType, page, from, to]
  )

  const { data: balanceData } = useFinanceBalance(fundType)
  const { data, isLoading, error, refetch } = useFinanceTransactions(params)

  function openDialog(mode: FinanceManualTxMode) {
    setDialogMode(mode)
    setDialogOpen(true)
  }

  if (!canView) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-muted-foreground">Anda tidak memiliki izin melihat laporan keuangan.</p>
      </div>
    )
  }

  const rows = data?.data ?? []
  const totalPages = Math.max(1, data?.total_pages ?? 1)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            Saldo saat ini:{' '}
            <span className="font-medium text-foreground">
              {formatCurrency(Math.round(balanceData?.balance ?? 0))}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canCreateTx && (
            <>
              <Button type="button" size="sm" onClick={() => openDialog('pemasukan')}>
                Pemasukan
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => openDialog('pengeluaran')}>
                Pengeluaran
              </Button>
            </>
          )}
          {canAdjust && (
            <>
              <Button type="button" size="sm" variant="outline" onClick={() => openDialog('opening_balance')}>
                Saldo awal
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => openDialog('adjustment')}>
                Penyesuaian
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Dari</label>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} className="w-[160px]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Sampai</label>
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} className="w-[160px]" />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setFrom(''); setTo(''); setPage(1) }}>
          Reset filter
        </Button>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Memuat transaksi…</p>
        ) : error ? (
          <div className="p-4 text-sm">
            <p className="text-destructive mb-2">Gagal memuat data</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Belum ada transaksi untuk filter ini.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">{formatTxDate(row.tx_date)}</TableCell>
                  <TableCell>{row.tx_type}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.description}>
                    {row.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                  <TableCell>{row.approval_status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages} ({data?.total ?? 0} transaksi)
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}

      <FinanceTransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fundType={fundType}
        mode={dialogMode}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
