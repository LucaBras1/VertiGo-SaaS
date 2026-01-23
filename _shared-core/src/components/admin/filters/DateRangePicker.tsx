'use client'

/**
 * DateRangePicker Component
 *
 * Date range picker with presets
 * Uses react-day-picker + Headless UI Dialog
 */

import { useState, useRef } from 'react'
import { Dialog } from '@headlessui/react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-day-picker/dist/style.css'

export interface DateRangePickerProps {
  /** Field label */
  label?: string

  /** Current date range - for old API */
  value?: { from?: Date; to?: Date }

  /** From date - for new API */
  from?: Date

  /** To date - for new API */
  to?: Date

  /** Callback when range changes */
  onChange?: (range: { from?: Date; to?: Date }) => void

  /** Callback when range changes - for new API */
  onSelect?: (range: { from?: Date; to?: Date } | undefined) => void

  /** Placeholder text */
  placeholder?: string

  /** Additional className */
  className?: string
}

// Preset ranges
const presets = [
  {
    label: 'Dnes',
    getValue: () => ({
      from: new Date(),
      to: new Date()
    })
  },
  {
    label: 'Včera',
    getValue: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1)
    })
  },
  {
    label: 'Posledních 7 dní',
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date()
    })
  },
  {
    label: 'Posledních 30 dní',
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date()
    })
  },
  {
    label: 'Tento týden',
    getValue: () => ({
      from: startOfWeek(new Date(), { locale: cs }),
      to: endOfWeek(new Date(), { locale: cs })
    })
  },
  {
    label: 'Tento měsíc',
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Posledních 3 měsíce',
    getValue: () => ({
      from: subMonths(new Date(), 3),
      to: new Date()
    })
  }
]

export function DateRangePicker({
  label,
  value,
  from,
  to,
  onChange,
  onSelect,
  placeholder = 'Vybrat období',
  className
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Support both old and new API
  const initialRange = value || (from || to ? { from, to } : undefined)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    initialRange as DateRange | undefined
  )

  // Handler that supports both APIs
  const handleChange = (range: { from?: Date; to?: Date } | undefined) => {
    if (onSelect) {
      onSelect(range)
    }
    if (onChange) {
      onChange(range || {})
    }
  }

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    if (range?.from && range?.to) {
      handleChange(range)
      setIsOpen(false)
    }
  }

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue()
    setSelectedRange(range)
    handleChange(range)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedRange(undefined)
    handleChange(undefined)
  }

  // Format display text
  const displayText = selectedRange?.from && selectedRange?.to
    ? `${format(selectedRange.from, 'd. M. yyyy', { locale: cs })} - ${format(selectedRange.to, 'd. M. yyyy', { locale: cs })}`
    : placeholder

  const hasValue = selectedRange?.from && selectedRange?.to

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          className
        )}
      >
        <span className={cn(
          'flex items-center gap-2 text-sm',
          !hasValue && 'text-gray-500'
        )}>
          <Calendar className="h-4 w-4" />
          {displayText}
        </span>
        {hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="p-0.5 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden text-gray-900">
            <div className="flex">
              {/* Presets sidebar */}
              <div className="w-48 bg-gray-50 border-r border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Rychlý výběr
                </h3>
                <div className="space-y-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white hover:shadow-sm transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div className="flex-1 p-6">
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleSelect}
                  locale={cs}
                  numberOfMonths={2}
                  className="!m-0"
                  classNames={{
                    months: "flex gap-4",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50",
                    day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-blue-900",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Vymazat
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
