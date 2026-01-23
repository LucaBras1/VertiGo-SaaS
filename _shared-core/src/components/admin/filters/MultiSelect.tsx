'use client'

/**
 * MultiSelect Component
 *
 * Multi-select dropdown with checkboxes
 * Uses Headless UI Listbox
 */

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectProps {
  /** Field label */
  label?: string

  /** Available options */
  options: MultiSelectOption[]

  /** Selected values */
  value: string[]

  /** Callback when selection changes */
  onChange: (value: string[]) => void

  /** Placeholder text */
  placeholder?: string

  /** Additional className */
  className?: string

  /** Show clear button */
  clearable?: boolean
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Vybrat...',
  className,
  clearable = true
}: MultiSelectProps) {
  const safeValue = value || []
  const selectedOptions = options.filter(opt => safeValue.includes(opt.value))

  const handleToggle = (optionValue: string) => {
    if (safeValue.includes(optionValue)) {
      onChange(safeValue.filter(v => v !== optionValue))
    } else {
      onChange([...safeValue, optionValue])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const displayText = selectedOptions.length > 0
    ? selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} vybráno`
    : placeholder

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <Listbox value={value} onChange={() => {}} multiple>
        <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          <span className={cn(
            'block truncate',
            selectedOptions.length === 0 && 'text-gray-500'
          )}>
            {displayText}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {clearable && selectedOptions.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="pointer-events-auto p-0.5 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.length === 0 ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                Žádné možnosti
              </div>
            ) : (
              options.map((option) => {
                const isSelected = safeValue.includes(option.value)

                return (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={({ active }) =>
                      cn(
                        'relative cursor-pointer select-none py-2 pl-10 pr-4',
                        active ? 'bg-blue-50 text-blue-900' : 'text-gray-900',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )
                    }
                    onClick={() => !option.disabled && handleToggle(option.value)}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={cn(
                          'block truncate',
                          isSelected ? 'font-medium' : 'font-normal'
                        )}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <span className={cn(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-blue-600' : 'text-blue-600'
                          )}>
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                )
              })
            )}
          </Listbox.Options>
        </Transition>
        </div>
      </Listbox>
    </div>
  )
}
