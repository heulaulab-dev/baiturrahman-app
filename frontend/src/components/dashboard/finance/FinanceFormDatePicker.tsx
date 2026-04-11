'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function parseYmdToDate(s: string): Date | undefined {
  if (!s?.trim()) return undefined
  const d = new Date(`${s}T12:00:00`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function dateToYmd(d: Date | undefined): string {
  if (!d) return ''
  return format(d, 'yyyy-MM-dd')
}

export interface FinanceFormDatePickerProps {
  id: string
  label: string
  value: string
  onChange: (ymd: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  error?: string
}

/** Single date bound to `YYYY-MM-DD` for finance APIs — matches shadcn Popover + Calendar composition. */
export function FinanceFormDatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  disabled,
  className,
  buttonClassName,
  error,
}: FinanceFormDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = React.useMemo(() => parseYmdToDate(value), [value])

  return (
    <Field className={cn(className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={id}
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              'h-10 w-full justify-between gap-2 rounded-md border-input bg-background px-3 text-left text-sm font-normal shadow-xs transition-[color,box-shadow] outline-none',
              'hover:bg-accent/50 hover:text-accent-foreground',
              'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              !selected && 'text-muted-foreground',
              buttonClassName
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <CalendarIcon className="size-4 shrink-0 opacity-60" aria-hidden />
              <span className="truncate">
                {selected ? format(selected, 'd MMMM yyyy', { locale: idLocale }) : placeholder}
              </span>
            </span>
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto overflow-hidden rounded-xl border bg-popover p-0 shadow-lg outline-none"
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            className="rounded-lg [--cell-size:2.5rem] p-2"
            onSelect={(d) => {
              onChange(dateToYmd(d))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
