'use client';

import * as React from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
	id: string;
	label: string;
	value?: Date;
	onChange: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
	labelClassName?: string;
	buttonClassName?: string;
	disabled?: boolean;
}

export function DatePicker({
	id,
	label,
	value,
	onChange,
	placeholder = 'Pilih tanggal',
	className,
	labelClassName,
	buttonClassName,
	disabled,
}: Readonly<DatePickerProps>) {
	const [open, setOpen] = React.useState(false);

	return (
		<Field className={cn(className)}>
			<FieldLabel htmlFor={id} className={labelClassName}>
				{label}
			</FieldLabel>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						id={id}
						type="button"
						disabled={disabled}
						data-empty={!value}
						className={cn(
							'w-full justify-start font-normal data-[empty=true]:text-muted-foreground',
							buttonClassName
						)}
					>
						{value ? format(value, 'PPP') : <span>{placeholder}</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={value}
						defaultMonth={value}
						onSelect={(d) => {
							onChange(d);
							setOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</Field>
	);
}

export function DatePickerSimple() {
	const [date, setDate] = React.useState<Date>();

	return (
		<DatePicker
			id="date-picker-simple"
			label="Date"
			placeholder="Pick a date"
			value={date}
			onChange={setDate}
			className="mx-auto w-44"
		/>
	);
}
