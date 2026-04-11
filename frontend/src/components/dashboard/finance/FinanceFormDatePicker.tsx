'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
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

/** Single date bound to `YYYY-MM-DD` string for finance API filters and forms. */
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
            data-empty={!selected}
            className={cn(
              'w-full justify-start font-normal data-[empty=true]:text-muted-foreground',
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {selected ? (
              format(selected, 'd MMMM yyyy', { locale: idLocale })
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
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
