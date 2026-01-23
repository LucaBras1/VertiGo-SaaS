'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, User, Building, Mail, Phone, Hash, ChevronDown } from 'lucide-react'

interface Customer {
  id?: string
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  organization?: string
  ico?: string
}

// Helper to get customer ID (handles both id and _id)
const getCustomerId = (customer: Customer): string => {
  return customer.id || customer._id || ''
}

interface CustomerSearchProps {
  customers: Customer[]
  selectedId: string
  onSelect: (customerId: string) => void
  placeholder?: string
}

type SearchField = 'all' | 'name' | 'organization' | 'ico' | 'email' | 'phone'

const SEARCH_FIELDS: { value: SearchField; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Vše', icon: <Search className="w-3 h-3" /> },
  { value: 'name', label: 'Jméno', icon: <User className="w-3 h-3" /> },
  { value: 'organization', label: 'Organizace', icon: <Building className="w-3 h-3" /> },
  { value: 'ico', label: 'IČO', icon: <Hash className="w-3 h-3" /> },
  { value: 'email', label: 'Email', icon: <Mail className="w-3 h-3" /> },
  { value: 'phone', label: 'Telefon', icon: <Phone className="w-3 h-3" /> },
]

export function CustomerSearch({
  customers,
  selectedId,
  onSelect,
  placeholder = 'Hledat zákazníka...',
}: CustomerSearchProps) {
  const [query, setQuery] = useState('')
  const [searchField, setSearchField] = useState<SearchField>('all')
  const [isOpen, setIsOpen] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get selected customer for display
  const selectedCustomer = customers.find(c => getCustomerId(c) === selectedId)

  // Filter customers based on query and selected field
  useEffect(() => {
    if (!query.trim()) {
      setFilteredCustomers(customers.slice(0, 20))
      return
    }

    const q = query.toLowerCase().trim()
    const filtered = customers.filter(c => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
      const org = c.organization?.toLowerCase() || ''
      const email = c.email.toLowerCase()
      const phone = c.phone?.toLowerCase() || ''
      const ico = c.ico?.toLowerCase() || ''

      switch (searchField) {
        case 'name':
          return fullName.includes(q)
        case 'organization':
          return org.includes(q)
        case 'ico':
          return ico.includes(q)
        case 'email':
          return email.includes(q)
        case 'phone':
          return phone.includes(q)
        default: // 'all'
          return (
            fullName.includes(q) ||
            org.includes(q) ||
            email.includes(q) ||
            phone.includes(q) ||
            ico.includes(q)
          )
      }
    }).slice(0, 20)

    setFilteredCustomers(filtered)
    setHighlightedIndex(0)
  }, [query, customers, searchField])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(i => Math.min(i + 1, filteredCustomers.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCustomers[highlightedIndex]) {
          handleSelect(filteredCustomers[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (customer: Customer) => {
    onSelect(getCustomerId(customer))
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onSelect('')
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Selected customer display */}
      {selectedCustomer && !isOpen ? (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {selectedCustomer.organization && (
                  <span className="flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {selectedCustomer.organization}
                  </span>
                )}
                {selectedCustomer.ico && (
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {selectedCustomer.ico}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">{selectedCustomer.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-blue-100 rounded"
          >
            <X className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      ) : (
        <>
          {/* Search field selector */}
          <div className="flex gap-1 mb-2 flex-wrap">
            {SEARCH_FIELDS.map(field => (
              <button
                key={field.value}
                type="button"
                onClick={() => {
                  setSearchField(field.value)
                  inputRef.current?.focus()
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  searchField === field.value
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {field.icon}
                {field.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={`${placeholder} (${SEARCH_FIELDS.find(f => f.value === searchField)?.label})`}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
            >
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {query ? 'Žádní zákazníci nenalezeni' : 'Začněte psát pro vyhledávání'}
                </div>
              ) : (
                <ul>
                  {filteredCustomers.map((customer, index) => (
                    <li key={getCustomerId(customer) || index}>
                      <button
                        type="button"
                        onClick={() => handleSelect(customer)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`w-full p-3 text-left border-b border-gray-100 last:border-0 transition-colors ${
                          index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                              {customer.organization && (
                                <span className="flex items-center gap-1 truncate">
                                  <Building className="w-3 h-3 flex-shrink-0" />
                                  {customer.organization}
                                </span>
                              )}
                              {customer.ico && (
                                <span className="flex items-center gap-1">
                                  <Hash className="w-3 h-3 flex-shrink-0" />
                                  IČO: {customer.ico}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 flex flex-wrap gap-x-3">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </span>
                              {customer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {customer.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
