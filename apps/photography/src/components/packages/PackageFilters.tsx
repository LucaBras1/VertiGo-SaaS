'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PackageFiltersProps {
  onFilterChange: (filters: PackageFiltersState) => void
  clients?: { id: string; name: string }[]
}

export interface PackageFiltersState {
  search: string
  statuses: string[]
  clientId: string
  eventType: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const statusOptions = [
  { value: 'INQUIRY', label: 'Poptávka' },
  { value: 'QUOTE_SENT', label: 'Nabídka odeslána' },
  { value: 'CONFIRMED', label: 'Potvrzeno' },
  { value: 'IN_PRODUCTION', label: 'Ve výrobě' },
  { value: 'COMPLETED', label: 'Dokončeno' },
  { value: 'CANCELLED', label: 'Zrušeno' }
]

const eventTypeOptions = [
  { value: 'WEDDING', label: 'Svatba' },
  { value: 'PORTRAIT', label: 'Portrét' },
  { value: 'FAMILY', label: 'Rodinné focení' },
  { value: 'CORPORATE', label: 'Firemní' },
  { value: 'EVENT', label: 'Událost' },
  { value: 'PRODUCT', label: 'Produktové' },
  { value: 'OTHER', label: 'Jiné' }
]

const sortOptions = [
  { value: 'createdAt', label: 'Datum vytvoření' },
  { value: 'eventDate', label: 'Datum akce' },
  { value: 'title', label: 'Název' },
  { value: 'totalPrice', label: 'Cena' }
]

export function PackageFilters({ onFilterChange, clients = [] }: PackageFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<PackageFiltersState>({
    search: '',
    statuses: [],
    clientId: '',
    eventType: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const updateFilters = (updates: Partial<PackageFiltersState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status]
    updateFilters({ statuses: newStatuses })
  }

  const clearFilters = () => {
    const defaultFilters: PackageFiltersState = {
      search: '',
      statuses: [],
      clientId: '',
      eventType: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.search ||
    filters.statuses.length > 0 ||
    filters.clientId ||
    filters.eventType ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat zakázky..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Status Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.slice(0, 4).map(option => (
            <button
              key={option.value}
              onClick={() => toggleStatus(option.value)}
              className={`
                px-3 py-1.5 text-sm rounded-full border transition-colors
                ${filters.statuses.includes(option.value)
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Filter className="w-4 h-4" />
          Filtry
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Client Filter */}
          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Klient
              </label>
              <select
                value={filters.clientId}
                onChange={(e) => updateFilters({ clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Všichni klienti</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ akce
            </label>
            <select
              value={filters.eventType}
              onChange={(e) => updateFilters({ eventType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Všechny typy</option>
              {eventTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum od
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum do
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Řadit podle
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Směr řazení
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilters({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="desc">Nejnovější první</option>
              <option value="asc">Nejstarší první</option>
            </select>
          </div>

          {/* Additional Status Filters */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Další stavy
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.slice(4).map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className={`
                    px-3 py-1.5 text-sm rounded-full border transition-colors
                    ${filters.statuses.includes(option.value)
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary & Clear */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                Hledání: "{filters.search}"
                <button onClick={() => updateFilters({ search: '' })} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.statuses.map(status => (
              <span key={status} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-sm">
                {statusOptions.find(s => s.value === status)?.label}
                <button onClick={() => toggleStatus(status)} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Zrušit filtry
          </Button>
        </div>
      )}
    </div>
  )
}
