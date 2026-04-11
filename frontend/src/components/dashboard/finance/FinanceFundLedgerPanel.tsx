'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, Plus, Receipt, Wallet, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useFinanceBalance, useFinanceTransactions } from '@/services/financeHooks'
import type { FinanceApprovalStatus, FinanceFundType, FinanceTxType } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
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

function TableLoadingSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-border/60 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,0.75fr)_minmax(0,0.65fr)] sm:items-center sm:gap-3"
        >
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-full max-w-[120px]" />
          <Skeleton className="h-5 w-full max-w-[200px]" />
          <Skeleton className="h-5 w-32 justify-self-start sm:justify-self-end" />
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
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

  const { data: balanceData, isLoading: balanceLoading } = useFinanceBalance(fundType)
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
  const balance = Math.round(balanceData?.balance ?? 0)

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
              <CardDescription>Saldo dan riwayat mutasi untuk kas ini.</CardDescription>
            </div>
          </div>
          {showAddMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="sm" className="gap-2 self-start sm:self-auto">
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
        </CardHeader>
        <CardContent className="border-t bg-muted/30 pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Saldo saat ini</p>
          {balanceLoading ? (
            <Skeleton className="mt-2 h-9 w-48 max-w-full" />
          ) : (
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
              {formatCurrency(balance)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filter tanggal</CardTitle>
          <CardDescription>Batasi daftar berdasarkan periode; kosongkan untuk menampilkan semua.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  setFrom('')
                  setPage(1)
                }}
                aria-label="Hapus filter dari tanggal"
              >
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  setTo('')
                  setPage(1)
                }}
                aria-label="Hapus filter sampai tanggal"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start sm:self-auto"
            onClick={() => {
              setFrom('')
              setTo('')
              setPage(1)
            }}
          >
            Reset filter
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base">Riwayat transaksi</CardTitle>
          <CardDescription>
            {data != null
              ? `${data.total?.toLocaleString('id-ID') ?? 0} entri sesuai filter`
              : 'Memuat ringkasan…'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableLoadingSkeleton />
          ) : error ? (
            <div className="p-6 text-sm">
              <p className="mb-3 text-destructive">Gagal memuat data</p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </div>
          ) : rows.length === 0 ? (
            <Empty className="min-h-[220px] border-0 bg-transparent md:min-h-[280px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Receipt className="size-6" aria-hidden />
                </EmptyMedia>
                <EmptyTitle>Belum ada transaksi</EmptyTitle>
                <EmptyDescription>
                  Ubah rentang tanggal atau tambah pemasukan dan pengeluaran untuk mulai mencatat mutasi di buku kas ini.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
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
                      <TableCell className="text-right font-medium tabular-nums">{formatCurrency(row.amount)}</TableCell>
                      <TableCell>
                        <ApprovalBadge status={row.approval_status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
