'use client'

import { useMemo, useState } from 'react'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2, MoreHorizontal, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  useApproveFinanceTransfer,
  useCreateFinanceTransfer,
  useFinanceTransfers,
  useRejectFinanceTransfer,
} from '@/services/financeHooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FinanceFormDatePicker } from '@/components/dashboard/finance/FinanceFormDatePicker'

const transferFormSchema = z.object({
  tx_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD')
    .refine((s) => !Number.isNaN(Date.parse(`${s}T12:00:00`)), 'Tanggal tidak valid'),
  amount: z
    .string()
    .min(1, 'Nominal wajib diisi')
    .refine((s) => /^\d+(\.\d{1,2})?$/.test(s.trim()) && Number(s) > 0, 'Nominal harus lebih dari 0'),
  description: z.string().min(1, 'Keterangan wajib diisi'),
})

type TransferFormValues = z.infer<typeof transferFormSchema>

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

function transferErrorMessage(raw: string | undefined): string {
  if (!raw) return 'Permintaan transfer gagal'
  if (/insufficient/i.test(raw)) {
    return 'Saldo kas besar tidak cukup untuk transfer ini.'
  }
  return raw
}

function StatusBadge({ status }: { status: string }) {
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
  if (status === 'rejected') {
    return (
      <Badge variant="destructive" className="font-normal">
        Ditolak
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="font-normal">
      {status}
    </Badge>
  )
}

export function FinanceTransferSection() {
  const { hasPermission } = useAuth()
  const canView = hasPermission('finance.view_reports')
  const canRequest = hasPermission('finance.request_transfer')
  const canApprove = hasPermission('finance.approve_transfer')

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [actingId, setActingId] = useState<string | null>(null)

  const transferParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(status !== 'all' ? { status: status as 'pending' | 'approved' | 'rejected' } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [page, status, from, to]
  )

  const { data, isLoading, error, refetch } = useFinanceTransfers(transferParams)
  const createMutation = useCreateFinanceTransfer()
  const approveMutation = useApproveFinanceTransfer()
  const rejectMutation = useRejectFinanceTransfer()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      tx_date: new Date().toISOString().slice(0, 10),
      amount: '',
      description: '',
    },
  })

  async function onSubmitTransfer(values: TransferFormValues) {
    try {
      await createMutation.mutateAsync({
        tx_date: values.tx_date,
        amount: Number(values.amount),
        description: values.description.trim(),
      })
      toast.success('Permintaan transfer dikirim')
      reset({
        tx_date: new Date().toISOString().slice(0, 10),
        amount: '',
        description: '',
      })
      refetch()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        toast.error(transferErrorMessage(msg))
      } else {
        toast.error('Permintaan transfer gagal')
      }
    }
  }

  async function onApprove(linkId: string) {
    setActingId(linkId)
    try {
      await approveMutation.mutateAsync(linkId)
      toast.success('Transfer disetujui')
      refetch()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        toast.error(transferErrorMessage(msg))
      } else {
        toast.error('Gagal menyetujui transfer')
      }
    } finally {
      setActingId(null)
    }
  }

  async function onReject(linkId: string) {
    setActingId(linkId)
    try {
      await rejectMutation.mutateAsync(linkId)
      toast.success('Transfer ditolak')
      refetch()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        toast.error(msg ?? 'Gagal menolak transfer')
      } else {
        toast.error('Gagal menolak transfer')
      }
    } finally {
      setActingId(null)
    }
  }

  if (!canView) {
    return <p className="text-sm text-muted-foreground">Anda tidak memiliki izin melihat transfer kas.</p>
  }

  const rows = data?.data ?? []
  const totalPages = Math.max(1, data?.total_pages ?? 1)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Transfer Kas</h2>
        <p className="text-sm text-muted-foreground">Dari kas besar menuju kas kecil. Persetujuan memerlukan izin khusus.</p>
      </div>

      {canRequest && (
        <div className="max-w-lg space-y-4 rounded-md border border-border p-4">
          <h3 className="text-sm font-medium">Ajukan transfer</h3>
          <form onSubmit={handleSubmit(onSubmitTransfer)} className="space-y-3">
            <Controller
              name="tx_date"
              control={control}
              render={({ field }) => (
                <FinanceFormDatePicker
                  id="transfer-form-date"
                  label="Tanggal"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.tx_date?.message}
                />
              )}
            />
            <Field>
              <FieldLabel htmlFor="tr-amount">Nominal (Rp)</FieldLabel>
              <Input id="tr-amount" type="text" inputMode="decimal" placeholder="0" {...register('amount')} />
              {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="tr-desc">Keterangan</FieldLabel>
              <Textarea id="tr-desc" rows={3} className="resize-y min-h-[72px]" {...register('description')} />
              {errors.description && <FieldError>{errors.description.message}</FieldError>}
            </Field>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim…
                </>
              ) : (
                'Kirim permintaan'
              )}
            </Button>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Status</span>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <FinanceFormDatePicker
            id="transfer-filter-from"
            label="Dari tanggal"
            value={from}
            onChange={(v) => {
              setFrom(v)
              setPage(1)
            }}
            placeholder="Semua"
            buttonClassName="sm:w-[200px]"
          />
          {from ? (
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => { setFrom(''); setPage(1) }} aria-label="Hapus filter dari tanggal">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <FinanceFormDatePicker
            id="transfer-filter-to"
            label="Sampai tanggal"
            value={to}
            onChange={(v) => {
              setTo(v)
              setPage(1)
            }}
            placeholder="Semua"
            buttonClassName="sm:w-[200px]"
          />
          {to ? (
            <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => { setTo(''); setPage(1) }} aria-label="Hapus filter sampai tanggal">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="sm" className="self-start sm:self-auto" onClick={() => { setStatus('all'); setFrom(''); setTo(''); setPage(1) }}>
          Reset filter
        </Button>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Memuat transfer…</p>
        ) : error ? (
          <div className="p-4 text-sm">
            <p className="text-destructive mb-2">Gagal memuat data</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Tidak ada transfer untuk filter ini.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Status</TableHead>
                {canApprove && <TableHead className="text-right w-[100px]">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const linkId = row.linked_transfer_id ?? row.id
                const busy = actingId === linkId
                return (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">{formatTxDate(row.tx_date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(row.amount)}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={row.description}>
                      {row.description}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.approval_status} />
                    </TableCell>
                    {canApprove && (
                      <TableCell className="text-right">
                        {row.approval_status === 'pending' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="outline" size="icon" disabled={busy} aria-label="Aksi transfer">
                                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onApprove(linkId)}>Setujui transfer</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onReject(linkId)}
                              >
                                Tolak transfer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            Halaman {page} dari {totalPages}
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
    </div>
  )
}
