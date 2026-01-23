'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  delay?: number
  className?: string
}

/**
 * Search input with debouncing
 * Prevents excessive API calls while user is typing
 */
export function SearchInput({
  value: externalValue = '',
  onChange,
  placeholder = 'Hledat...',
  delay = 500,
  className = '',
}: SearchInputProps) {
  // Local state for immediate UI updates
  const [internalValue, setInternalValue] = useState(externalValue)

  // Debounced value that triggers the onChange callback
  const debouncedValue = useDebounce(internalValue, delay)

  // Sync external changes to internal state
  useEffect(() => {
    setInternalValue(externalValue)
  }, [externalValue])

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== externalValue) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, externalValue, onChange])

  const handleClear = () => {
    setInternalValue('')
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {internalValue !== debouncedValue && (
        <span className="absolute left-0 top-full mt-1 text-xs text-gray-400">
          Hledá se...
        </span>
      )}
    </div>
  )
}
