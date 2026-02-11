'use client';

import * as React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils';
import { Button } from './Button';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  locale?: string;
  dayNames?: string[];
  formatDate?: (date: Date) => string;
  formatMonth?: (date: Date) => string;
  clearLabel?: string;
  todayLabel?: string;
  weekStartsOnMonday?: boolean;
}

const DEFAULT_DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function defaultFormatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function defaultFormatMonth(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  error,
  minDate,
  maxDate,
  className,
  dayNames = DEFAULT_DAY_NAMES,
  formatDate: formatDateProp,
  formatMonth: formatMonthProp,
  clearLabel = 'Clear',
  todayLabel = 'Today',
  weekStartsOnMonday = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(value || new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);

  const formatDateFn = formatDateProp || defaultFormatDate;
  const formatMonthFn = formatMonthProp || defaultFormatMonth;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const adjustedFirstDay = weekStartsOnMonday
    ? (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1)
    : firstDayOfMonth;

  const days: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    return (
      value.getDate() === day &&
      value.getMonth() === viewDate.getMonth() &&
      value.getFullYear() === viewDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
          'dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700',
          'transition-colors duration-200',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500'
        )}
      >
        <span className={value ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}>
          {value ? formatDateFn(value) : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
      </button>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:bg-neutral-900 dark:border-neutral-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatMonthFn(viewDate)}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="aspect-square">
                {day && (
                  <button
                    type="button"
                    onClick={() => !isDateDisabled(day) && handleDateSelect(day)}
                    disabled={isDateDisabled(day)}
                    className={cn(
                      'w-full h-full flex items-center justify-center rounded-lg text-sm transition-colors',
                      isSelected(day)
                        ? 'bg-brand-600 text-white'
                        : isToday(day)
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
                      isDateDisabled(day) && 'opacity-30 cursor-not-allowed'
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(undefined);
                setIsOpen(false);
              }}
            >
              {clearLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(new Date());
                setIsOpen(false);
              }}
            >
              {todayLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
DatePicker.displayName = 'DatePicker';

export { DatePicker };
