'use client'

/**
 * Combobox Component
 *
 * Autocomplete/searchable select
 * Uses Headless UI Combobox
 */

import { Fragment, useState } from 'react'
import { Combobox as HeadlessCombobox, Transition } from '@headlessui/react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface ComboboxProps {
  /** Available options */
  options: ComboboxOption[]

  /** Selected value */
  value: string | null

  /** Callback when selection changes */
  onChange: (value: string | null) => void

  /** Placeholder text */
  placeholder?: string

  /** Additional className */
  className?: string

  /** Allow clearing selection */
  nullable?: boolean

  /** Loading state */
  loading?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Vyhledat...',
  className,
  nullable = true,
  loading = false
}: ComboboxProps) {
  const [query, setQuery] = useState('')

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.label
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        )

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <HeadlessCombobox value={value} onChange={onChange} nullable={nullable}>
      <div className={cn('relative', className)}>
        <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left border border-gray-300 shadow-sm hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <HeadlessCombobox.Input
            className="w-full border-none py-2 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none placeholder:text-gray-500"
            displayValue={(value: string | null) =>
              value ? options.find(opt => opt.value === value)?.label || '' : ''
            }
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
          />
          <HeadlessCombobox.Button className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search
              className="h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </HeadlessCombobox.Button>
          <HeadlessCombobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown
              className="h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </HeadlessCombobox.Button>
        </div>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <HeadlessCombobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {loading ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                Načítání...
              </div>
            ) : filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                Nic nenalezeno
              </div>
            ) : (
              filteredOptions.map((option) => (
                <HeadlessCombobox.Option
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
                >
                  {({ selected, active }) => (
                    <>
                      <div>
                        <span
                          className={cn(
                            'block truncate',
                            selected ? 'font-medium' : 'font-normal'
                          )}
                        >
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="block text-xs text-gray-500 truncate">
                            {option.description}
                          </span>
                        )}
                      </div>
                      {selected && (
                        <span
                          className={cn(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-blue-600' : 'text-blue-600'
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </HeadlessCombobox.Option>
              ))
            )}
          </HeadlessCombobox.Options>
        </Transition>
      </div>
    </HeadlessCombobox>
  )
}
