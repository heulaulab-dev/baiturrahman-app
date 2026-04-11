'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useFinanceBalance, useFinanceTransactions } from '@/services/financeHooks'
import type { FinanceApprovalStatus, FinanceFundType, FinanceTxType } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FinanceFormDatePicker } from '@/components/dashboard/finance/FinanceFormDatePicker'
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

const TX_LABEL: Partial<Record<FinanceTxType, string>> = {
  pemasukan: 'Pemasukan',
  pengeluaran: 'Pengeluaran',
  transfer_out: 'Transfer keluar',
  transfer_in: 'Transfer masuk',
  opening_balance: 'Saldo awal',
  adjustment: 'Penyesuaian',
}

function TxTypeBadge({ type }: { type: FinanceTxType }) {
  const label = TX_LABEL[type] ?? type
  return (
    <Badge variant="outline" className="font-normal">
      {label}
    </Badge>
  )
}

function ApprovalBadge({ status }: { status: FinanceApprovalStatus }) {
  if (status === 'pending') {
    return (
      <Badge variant="secondary" className="font-normal">
        Menunggu
      </Badge>
    )
  }
  if (status === 'approved') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 bg-emerald-500/10 font-normal text-emerald-800 dark:text-emerald-200"
      >
        Disetujui
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="font-normal">
      Ditolak
    </Badge>
  )
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

  const showAddMenu = canCreateTx || canAdjust

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
        {showAddMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" className="gap-2 self-start">
                <Plus className="h-4 w-4" />
                Tambah transaksi
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {canCreateTx && (
                <>
                  <DropdownMenuItem onClick={() => openDialog('pemasukan')}>Pemasukan</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog('pengeluaran')}>Pengeluaran</DropdownMenuItem>
                </>
              )}
              {canCreateTx && canAdjust && <DropdownMenuSeparator />}
              {canAdjust && (
                <>
                  <DropdownMenuItem onClick={() => openDialog('opening_balance')}>Saldo awal</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDialog('adjustment')}>Penyesuaian</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-md border border-border p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-wrap items-end gap-2">
          <FinanceFormDatePicker
            id={`ledger-from-${fundType}`}
            label="Dari tanggal"
            value={from}
            onChange={(v) => {
              setFrom(v)
              setPage(1)
            }}
            placeholder="Semua"
            buttonClassName="sm:w-[220px]"
          />
          {from ? (
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => { setFrom(''); setPage(1) }} aria-label="Hapus filter dari tanggal">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <FinanceFormDatePicker
            id={`ledger-to-${fundType}`}
            label="Sampai tanggal"
            value={to}
            onChange={(v) => {
              setTo(v)
              setPage(1)
            }}
            placeholder="Semua"
            buttonClassName="sm:w-[220px]"
          />
          {to ? (
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => { setTo(''); setPage(1) }} aria-label="Hapus filter sampai tanggal">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="sm" className="self-start sm:self-auto" onClick={() => { setFrom(''); setTo(''); setPage(1) }}>
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
                  <TableCell>
                    <TxTypeBadge type={row.tx_type} />
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={row.description}>
                    {row.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                  <TableCell>
                    <ApprovalBadge status={row.approval_status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
