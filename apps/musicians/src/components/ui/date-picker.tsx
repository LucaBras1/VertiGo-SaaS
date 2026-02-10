'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@vertigo/ui'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Vyberte datum',
  disabled,
  error,
  minDate,
  maxDate,
  className,
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewDate, setViewDate] = React.useState(value || new Date())
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 // Monday start

  const days = []
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange?.(newDate)
    setIsOpen(false)
  }

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const isSelected = (day: number) => {
    if (!value) return false
    return (
      value.getDate() === day &&
      value.getMonth() === viewDate.getMonth() &&
      value.getFullYear() === viewDate.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    )
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
          'transition-colors duration-200',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? format(value, 'd. MMMM yyyy', { locale: cs }) : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-500" />
      </button>

      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium">
              {format(viewDate, 'LLLL yyyy', { locale: cs })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
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
                        ? 'bg-primary-600 text-white'
                        : isToday(day)
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100',
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
          <div className="mt-3 pt-3 border-t flex justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(undefined)
                setIsOpen(false)
              }}
            >
              Vymazat
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange?.(new Date())
                setIsOpen(false)
              }}
            >
              Dnes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DatePicker }
