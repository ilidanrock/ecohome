'use client';

import * as React from 'react';
import { addYears, endOfMonth, format, startOfMonth, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const today = new Date();
const NAV_START = startOfMonth(subYears(today, 50));
const NAV_END = endOfMonth(addYears(today, 10));

type DatePickerFieldProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Elegir fecha',
  disabled = false,
  id,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-9 w-full justify-start text-left font-normal min-w-[10rem] border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" aria-hidden />
          {value ? format(value, 'd MMM yyyy', { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-border bg-popover shadow-lg max-w-[calc(100vw-1rem)]"
        align="start"
        sideOffset={6}
      >
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => {
            onChange(date ?? null);
            setOpen(false);
          }}
          defaultMonth={value ?? undefined}
          locale={es}
          captionLayout="dropdown"
          startMonth={NAV_START}
          endMonth={NAV_END}
        />
      </PopoverContent>
    </Popover>
  );
}
