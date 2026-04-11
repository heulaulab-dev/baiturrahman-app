'use client'

import { useMemo, useState } from 'react'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { ArrowLeftRight, Loader2, MoreHorizontal, Receipt, X } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
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

function TransferTableSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-border/60 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,3rem)] sm:items-center sm:gap-3"
        >
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-full max-w-[220px]" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-9 justify-self-start sm:justify-self-end" />
        </div>
      ))}
    </div>
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
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:space-y-0">
          <div className="flex gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowLeftRight className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-xl sm:text-2xl">Transfer kas</CardTitle>
              <CardDescription>
                Dari kas besar ke kas kecil. Persetujuan memerlukan izin khusus.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {canRequest && (
        <Card className="max-w-lg shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Ajukan transfer</CardTitle>
            <CardDescription>Isi tanggal, nominal, dan keterangan singkat.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filter daftar</CardTitle>
          <CardDescription>Status dan rentang tanggal untuk permintaan transfer.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
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
        <Button type="button" variant="outline" size="sm" className="self-start sm:self-auto" onClick={() => { setStatus('all'); setFrom(''); setTo(''); setPage(1) }}>
          Reset filter
        </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base">Permintaan transfer</CardTitle>
          <CardDescription>
            {data != null ? `${data.total?.toLocaleString('id-ID') ?? 0} entri` : 'Memuat…'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
        {isLoading ? (
          <TransferTableSkeleton />
        ) : error ? (
          <div className="p-6 text-sm">
            <p className="mb-3 text-destructive">Gagal memuat data</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <Empty className="min-h-[200px] border-0 bg-transparent md:min-h-[240px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt className="size-6" aria-hidden />
              </EmptyMedia>
              <EmptyTitle>Tidak ada transfer</EmptyTitle>
              <EmptyDescription>
                Sesuaikan filter atau ajukan transfer baru dari formulir di atas.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
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
          </div>
        )}
        </CardContent>
      </Card>

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
