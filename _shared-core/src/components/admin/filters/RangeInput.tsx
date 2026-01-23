'use client'

/**
 * RangeInput Component
 *
 * Input for numeric range (min/max) filtering
 * Used for: price, amount, duration, player count
 */

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

export interface RangeInputProps {
  /** Field label */
  label?: string

  /** Minimum value */
  minValue?: number

  /** Maximum value */
  maxValue?: number

  /** Callback when min value changes */
  onMinChange: (value: number | undefined) => void

  /** Callback when max value changes */
  onMaxChange: (value: number | undefined) => void

  /** Unit label (e.g., "Kč", "min", "hráčů") */
  unit?: string

  /** Step for input */
  step?: number

  /** Minimum allowed value */
  min?: number

  /** Maximum allowed value */
  max?: number

  /** Placeholder for min input */
  minPlaceholder?: string

  /** Placeholder for max input */
  maxPlaceholder?: string

  /** Additional className */
  className?: string

  /** Debounce delay in ms */
  delay?: number
}

export function RangeInput({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
  step = 1,
  min,
  max,
  minPlaceholder = 'Od',
  maxPlaceholder = 'Do',
  className,
  delay = 500,
}: RangeInputProps) {
  // Local state for immediate UI updates
  const [internalMin, setInternalMin] = useState<string>(
    minValue !== undefined ? String(minValue) : ''
  )
  const [internalMax, setInternalMax] = useState<string>(
    maxValue !== undefined ? String(maxValue) : ''
  )

  // Debounced values
  const debouncedMin = useDebounce(internalMin, delay)
  const debouncedMax = useDebounce(internalMax, delay)

  // Sync external changes to internal state
  useEffect(() => {
    setInternalMin(minValue !== undefined ? String(minValue) : '')
  }, [minValue])

  useEffect(() => {
    setInternalMax(maxValue !== undefined ? String(maxValue) : '')
  }, [maxValue])

  // Call onChange when debounced values change
  useEffect(() => {
    const numValue = debouncedMin === '' ? undefined : Number(debouncedMin)
    if (numValue !== minValue) {
      onMinChange(numValue)
    }
  }, [debouncedMin, minValue, onMinChange])

  useEffect(() => {
    const numValue = debouncedMax === '' ? undefined : Number(debouncedMax)
    if (numValue !== maxValue) {
      onMaxChange(numValue)
    }
  }, [debouncedMax, maxValue, onMaxChange])

  const handleClear = () => {
    setInternalMin('')
    setInternalMax('')
    onMinChange(undefined)
    onMaxChange(undefined)
  }

  const hasValue = internalMin !== '' || internalMax !== ''

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={internalMin}
            onChange={(e) => setInternalMin(e.target.value)}
            placeholder={minPlaceholder}
            step={step}
            min={min}
            max={max}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-gray-400 text-sm">–</span>
        <div className="relative flex-1">
          <input
            type="number"
            value={internalMax}
            onChange={(e) => setInternalMax(e.target.value)}
            placeholder={maxPlaceholder}
            step={step}
            min={min}
            max={max}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {unit && (
          <span className="text-gray-500 text-sm whitespace-nowrap">{unit}</span>
        )}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
            title="Vymazat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
