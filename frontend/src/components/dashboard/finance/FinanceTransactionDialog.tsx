'use client'

import { useEffect } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { useCreateFinanceTransaction } from '@/services/financeHooks'
import type { FinanceFundType } from '@/types'

export type FinanceManualTxMode = 'pemasukan' | 'pengeluaran' | 'opening_balance' | 'adjustment'

const formSchema = z.object({
  tx_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD')
    .refine((s) => !Number.isNaN(Date.parse(`${s}T12:00:00`)), 'Tanggal tidak valid'),
  amount: z
    .string()
    .min(1, 'Nominal wajib diisi')
    .refine((s) => /^\d+(\.\d{1,2})?$/.test(s.trim()) && Number(s) > 0, 'Nominal harus lebih dari 0'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string().min(1, 'Keterangan wajib diisi'),
  reference_no: z.string().optional(),
  display_below: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

const modeTitle: Record<FinanceManualTxMode, string> = {
  pemasukan: 'Catat pemasukan',
  pengeluaran: 'Catat pengeluaran',
  opening_balance: 'Saldo awal',
  adjustment: 'Penyesuaian saldo',
}

function defaultValues(): FormValues {
  return {
    tx_date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: '',
    description: '',
    reference_no: '',
    display_below: false,
  }
}

export interface FinanceTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundType: FinanceFundType
  mode: FinanceManualTxMode
  onSuccess?: () => void
}

export function FinanceTransactionDialog({
  open,
  onOpenChange,
  fundType,
  mode,
  onSuccess,
}: FinanceTransactionDialogProps) {
  const createMutation = useCreateFinanceTransaction()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues())
    }
  }, [open, mode, reset])

  const showDisplayBelow = mode === 'pemasukan'
  const displayBelowChecked = watch('display_below')

  async function onSubmit(values: FormValues) {
    try {
      await createMutation.mutateAsync({
        fund_type: fundType,
        tx_type: mode,
        tx_date: values.tx_date,
        amount: Number(values.amount),
        category: values.category.trim(),
        description: values.description.trim(),
        reference_no: values.reference_no?.trim() || undefined,
        display_below: showDisplayBelow ? Boolean(displayBelowChecked) : false,
      })
      toast.success('Transaksi tersimpan')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        toast.error(msg ?? 'Gagal menyimpan transaksi')
      } else {
        toast.error('Gagal menyimpan transaksi')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modeTitle[mode]}</DialogTitle>
          <DialogDescription>
            Kas {fundType === 'kas_besar' ? 'besar (bank)' : 'kecil (tunai)'} — pastikan nominal dan kategori sesuai
            arsip.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="finance-tx-date">Tanggal</FieldLabel>
            <Input id="finance-tx-date" type="date" {...register('tx_date')} />
            {errors.tx_date && <FieldError>{errors.tx_date.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="finance-tx-amount">Nominal (Rp)</FieldLabel>
            <Input id="finance-tx-amount" type="text" inputMode="decimal" placeholder="0" {...register('amount')} />
            {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="finance-tx-category">Kategori</FieldLabel>
            <Input id="finance-tx-category" placeholder="contoh: listrik, kotak_jumat" {...register('category')} />
            {errors.category && <FieldError>{errors.category.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="finance-tx-desc">Keterangan</FieldLabel>
            <Input id="finance-tx-desc" {...register('description')} />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="finance-tx-ref">No. referensi (opsional)</FieldLabel>
            <Input id="finance-tx-ref" {...register('reference_no')} />
          </Field>
          {showDisplayBelow && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border-input"
                checked={Boolean(displayBelowChecked)}
                onChange={(e) => setValue('display_below', e.target.checked)}
              />
              Tampilkan terpisah di bawah saldo akhir laporan
            </label>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
