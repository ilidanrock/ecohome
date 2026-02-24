'use client';

import * as React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DayPicker,
  getDefaultClassNames,
  type DropdownOption,
  type DropdownProps,
} from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const defaultClassNames = getDefaultClassNames();

const selectBase =
  'h-9 w-full min-h-9 rounded-lg border border-input bg-background pl-3 pr-8 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer [&>option]:bg-background';

/** Dropdown que solo renderiza un <select> limpio (sin overlay de texto duplicado). */
function CalendarDropdown(props: DropdownProps) {
  const { options, className, classNames, ...selectProps } = props;
  return (
    <span className={cn('relative flex min-w-0 flex-1 items-center', classNames?.dropdown_root)}>
      <select className={cn(selectBase, classNames?.dropdown, className)} {...selectProps}>
        {options?.map((opt: DropdownOption) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </span>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn(
        'rounded-xl border border-border bg-card shadow-md',
        'min-w-[min(100vw-2rem,18rem)] max-w-[22rem] w-full',
        'p-3 sm:p-4',
        className
      )}
      classNames={{
        ...defaultClassNames,
        root: cn('w-full', defaultClassNames.root),
        months: 'flex flex-col sm:flex-row gap-4 sm:gap-6',
        month:
          'grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr] gap-x-2 gap-y-3 sm:gap-4 w-full min-w-0 [&>:nth-child(1)]:col-[1] [&>:nth-child(1)]:row-[1] [&>:nth-child(2)]:col-[2] [&>:nth-child(2)]:row-[1] [&>:nth-child(3)]:col-[3] [&>:nth-child(3)]:row-[1] [&>:nth-child(4)]:col-[1/_-1] [&>:nth-child(4)]:row-[2]',
        month_caption:
          'flex justify-center items-center min-h-11 shrink-0 bg-inherit pb-1 border-b border-border/60',
        nav: 'hidden',
        button_previous: cn(
          'inline-flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background justify-self-start touch-manipulation'
        ),
        button_next: cn(
          'inline-flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background justify-self-end touch-manipulation'
        ),
        caption_label: 'text-[0.9375rem] font-semibold tracking-tight text-foreground capitalize',
        dropdowns: 'flex flex-wrap items-center justify-center gap-2 sm:gap-3 min-h-[2.75rem] py-1',
        dropdown_root: 'relative flex min-w-0 max-w-[7.5rem] sm:max-w-[8rem] flex-1 basis-0',
        dropdown: selectBase,
        months_dropdown: cn(selectBase, 'min-w-0 sm:min-w-[6.5rem] max-w-[7.5rem] sm:max-w-[8rem]'),
        years_dropdown: cn(selectBase, 'min-w-0 sm:min-w-[4.5rem] max-w-[5.5rem] sm:max-w-[6rem]'),
        weekdays: 'flex border-b border-border/50',
        weekday:
          'w-8 sm:w-9 shrink-0 py-2 text-center text-[0.65rem] sm:text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground',
        week: 'flex mt-0.5 sm:mt-1',
        day: 'relative p-0.5 text-center text-sm focus-within:relative focus-within:z-[1] [&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected].day-outside)]:bg-primary/5 [&:has([aria-selected].day-range-end)]:rounded-r-md',
        day_button: cn(
          'inline-flex h-8 w-8 sm:h-9 sm:w-9 min-h-8 min-w-8 sm:min-h-9 sm:min-w-9 items-center justify-center rounded-lg p-0 text-[0.8125rem] sm:text-sm font-medium text-foreground transition-colors touch-manipulation',
          'hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'aria-selected:opacity-100'
        ),
        range_start:
          'day-range-start rounded-l-lg bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        range_end:
          'day-range-end rounded-r-lg bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-lg font-medium shadow-sm',
        today: 'bg-muted/80 font-semibold text-foreground ring-1 ring-border',
        outside:
          'day-outside text-muted-foreground opacity-40 aria-selected:bg-primary/5 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-40 cursor-not-allowed',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...p }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden {...p} />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden {...p} />
          ),
        Dropdown: CalendarDropdown,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
