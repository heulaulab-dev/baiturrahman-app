'use client'

import { useEffect } from 'react'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FinanceFormDatePicker } from '@/components/dashboard/finance/FinanceFormDatePicker'
import { useCreateFinanceTransaction } from '@/services/financeHooks'
import type { FinanceFundType } from '@/types'

export type FinanceManualTxMode = 'pemasukan' | 'pengeluaran' | 'opening_balance' | 'adjustment'

const PRESET_CATEGORIES = [
  { value: 'listrik', label: 'Listrik / utilitas' },
  { value: 'air', label: 'Air' },
  { value: 'kotak_jumat', label: 'Kotak amal Jumat' },
  { value: 'kotak_luar', label: 'Kotak amal luar' },
  { value: 'bisaroh_khotib', label: 'Bisaroh / honor khatib' },
  { value: 'anak_yatim_duafa', label: 'Anak yatim & duafa' },
  { value: 'pemeliharaan', label: 'Pemeliharaan / perbaikan' },
  { value: 'kebersihan', label: 'Kebersihan' },
] as const

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

function categorySelectValue(category: string): string | undefined {
  if (!category) return undefined
  return PRESET_CATEGORIES.some((p) => p.value === category) ? category : 'lainnya'
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
    control,
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
  const categoryField = watch('category')
  const categoryBinding = categorySelectValue(categoryField)
  const showCategoryCustom = categoryBinding === 'lainnya'

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
          <Controller
            name="tx_date"
            control={control}
            render={({ field }) => (
              <FinanceFormDatePicker
                id="finance-tx-date"
                label="Tanggal"
                value={field.value}
                onChange={field.onChange}
                error={errors.tx_date?.message}
              />
            )}
          />
          <Field>
            <FieldLabel htmlFor="finance-tx-amount">Nominal (Rp)</FieldLabel>
            <Input id="finance-tx-amount" type="text" inputMode="decimal" placeholder="0" {...register('amount')} />
            {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel>Kategori</FieldLabel>
            <Select
              value={categoryBinding}
              onValueChange={(v) => {
                if (v === 'lainnya') {
                  setValue('category', categoryField && !PRESET_CATEGORIES.some((p) => p.value === categoryField) ? categoryField : '')
                } else {
                  setValue('category', v)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
                <SelectItem value="lainnya">Lainnya (ketik manual)</SelectItem>
              </SelectContent>
            </Select>
            {showCategoryCustom && (
              <Input
                className="mt-2"
                id="finance-tx-category-custom"
                placeholder="Nama kategori"
                {...register('category')}
              />
            )}
            {errors.category && <FieldError>{errors.category.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="finance-tx-desc">Keterangan</FieldLabel>
            <Textarea id="finance-tx-desc" rows={3} className="resize-y min-h-[80px]" {...register('description')} />
            {errors.description && <FieldError>{errors.description.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="finance-tx-ref">No. referensi (opsional)</FieldLabel>
            <Input id="finance-tx-ref" {...register('reference_no')} />
          </Field>
          {showDisplayBelow && (
            <div className="flex items-start gap-3 space-y-0">
              <Checkbox
                id="finance-display-below"
                checked={Boolean(displayBelowChecked)}
                onCheckedChange={(c) => setValue('display_below', c === true)}
              />
              <Label htmlFor="finance-display-below" className="text-sm font-normal leading-snug cursor-pointer">
                Tampilkan terpisah di bawah saldo akhir laporan
              </Label>
            </div>
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
