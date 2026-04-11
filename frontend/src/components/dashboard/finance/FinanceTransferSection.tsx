'use client'

import { useMemo, useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  useApproveFinanceTransfer,
  useCreateFinanceTransfer,
  useFinanceTransfers,
  useRejectFinanceTransfer,
} from '@/services/financeHooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
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
        <div className="rounded-md border border-border p-4 space-y-4 max-w-lg">
          <h3 className="text-sm font-medium">Ajukan transfer</h3>
          <form onSubmit={handleSubmit(onSubmitTransfer)} className="space-y-3">
            <Field>
              <FieldLabel htmlFor="tr-tx-date">Tanggal</FieldLabel>
              <Input id="tr-tx-date" type="date" {...register('tx_date')} />
              {errors.tx_date && <FieldError>{errors.tx_date.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="tr-amount">Nominal (Rp)</FieldLabel>
              <Input id="tr-amount" type="text" inputMode="decimal" placeholder="0" {...register('amount')} />
              {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="tr-desc">Keterangan</FieldLabel>
              <Input id="tr-desc" {...register('description')} />
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Status</span>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
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
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Dari</label>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} className="w-[160px]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Sampai</label>
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} className="w-[160px]" />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setStatus('all'); setFrom(''); setTo(''); setPage(1) }}>
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
                {canApprove && <TableHead className="text-right">Aksi</TableHead>}
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
                    <TableCell>{row.approval_status}</TableCell>
                    {canApprove && (
                      <TableCell className="text-right">
                        {row.approval_status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={busy}
                              onClick={() => onApprove(linkId)}
                            >
                              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Setujui'}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => onReject(linkId)}
                            >
                              Tolak
                            </Button>
                          </div>
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
        <div className="flex items-center justify-between text-sm">
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
