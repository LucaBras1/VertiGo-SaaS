/**
 * Services List Page - Client Component with Filters & Bulk Operations
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Eye, Archive, Star, ToggleLeft } from 'lucide-react'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { usePagination } from '@/hooks/usePagination'
import { FilterBar } from '@/components/admin/filters/FilterBar'
import { ActiveFilters } from '@/components/admin/filters/ActiveFilters'
import { MultiSelect } from '@/components/admin/filters/MultiSelect'
import { BulkActionsBar } from '@/components/admin/tables/BulkActionsBar'
import { ExportButton } from '@/components/admin/tables/ExportButton'
import { Pagination, type PaginationInfo } from '@/components/admin/tables/Pagination'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/hooks/useToast'
import {
  formatCurrencyForExport,
  formatBooleanForExport,
  type ExportColumn,
} from '@/lib/export'

type Service = {
  id: string
  title: string
  slug: string
  category: string
  priceFrom: number | null
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  isActive: boolean
  isFeatured: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

const categoryOptions = [
  { value: 'workshop', label: 'Workshop', description: '🎓 Vzdělávací workshopy' },
  { value: 'consultation', label: 'Konzultace', description: '💬 Konzultační služby' },
  { value: 'rental', label: 'Pronájem', description: '🎭 Pronájem prostor a rekvizit' },
  { value: 'other', label: 'Ostatní', description: '📦 Jiné služby' },
]

const statusOptions = [
  { value: 'active', label: 'Aktivní', description: '✅ Zobrazeno na webu' },
  { value: 'inactive', label: 'Neaktivní', description: '⏸️ Skryto na webu' },
]

const categoryLabels: Record<string, string> = {
  workshop: 'Workshop',
  consultation: 'Konzultace',
  rental: 'Pronájem',
  other: 'Ostatní',
}

const exportColumns: ExportColumn<Service>[] = [
  { key: 'title', label: 'Název' },
  { key: 'slug', label: 'URL' },
  {
    key: 'category',
    label: 'Kategorie',
    format: (value) => categoryLabels[value] || value,
  },
  {
    key: 'priceFrom',
    label: 'Cena od',
    format: (value) => (value ? formatCurrencyForExport(value) : ''),
  },
  {
    key: 'isActive',
    label: 'Aktivní',
    format: (value) => formatBooleanForExport(value),
  },
  {
    key: 'isFeatured',
    label: 'Zvýrazněno',
    format: (value) => formatBooleanForExport(value),
  },
  { key: 'order', label: 'Pořadí' },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const { toast } = useToast()

  const { filters, updateFilter, clearFilter, clearAllFilters, hasFilters } = useUrlFilters({
    category: { type: 'array', defaultValue: [] },
    status: { type: 'array', defaultValue: [] },
  })

  const { page, pageSize, setPage, setPageSize } = usePagination({ defaultPageSize: 25 })

  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    isIndeterminate,
    isSelected,
    toggleItem,
    toggleAll,
    clearSelection,
  } = useBulkSelection({
    items: services,
    getId: (service) => service.id,
  })

  useEffect(() => {
    fetchServices()
  }, [page, pageSize])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      // Filters
      filters.category.forEach((c: string) => params.append('category', c))
      filters.status.forEach((s: string) => params.append('status', s))

      const response = await fetch(`/api/admin/services?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast('Chyba při načítání služeb', 'error')
    } finally {
      setIsLoading(false)
    }
  }


  const categoryLabels: Record<string, string> = {
    workshop: '🎓 Workshop',
    consultation: '💬 Konzultace',
    rental: '🎭 Pronájem',
    other: '📦 Ostatní',
  }

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Opravdu chcete smazat ${selectedCount} služb${selectedCount > 1 ? 'y' : 'u'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/services/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Služby úspěšně smazány', 'success')
        await fetchServices()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání služeb', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání služeb', 'error')
    }
  }

  const handleBulkUpdate = async (updateData: Partial<Service>) => {
    try {
      const response = await fetch('/api/admin/services/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: updateData }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Služby úspěšně aktualizovány', 'success')
        await fetchServices()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při aktualizaci služeb', 'error')
      }
    } catch (error) {
      toast('Chyba při aktualizaci služeb', 'error')
    }
  }

  const handleMarkActive = () => handleBulkUpdate({ isActive: true })
  const handleMarkInactive = () => handleBulkUpdate({ isActive: false })
  const handleToggleFeatured = () => {
    const firstSelected = services.find((s) => selectedIds.includes(s.id))
    handleBulkUpdate({ isFeatured: !firstSelected?.isFeatured })
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Služby</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa workshopů, konzultací a dalších služeb
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={services}
            columns={exportColumns}
            filename={`sluzby-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/services/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Přidat službu
          </Link>
        </div>
      </div>

      <FilterBar onClear={clearAllFilters} hasFilters={hasFilters}>
        <MultiSelect
          label="Kategorie"
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => updateFilter('category', value)}
          placeholder="Vyberte kategorie..."
        />
        <MultiSelect
          label="Stav"
          options={statusOptions}
          value={filters.status}
          onChange={(value) => updateFilter('status', value)}
          placeholder="Vyberte stavy..."
        />
      </FilterBar>

      <ActiveFilters
        filters={[
          {
            key: 'category',
            label: 'Kategorie',
            values: (filters.category || []).map(
              (val: string) => categoryOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('category'),
          },
          {
            key: 'status',
            label: 'Stav',
            values: (filters.status || []).map(
              (val: string) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
          },
        ]}
        onClearAll={clearAllFilters}
      />

      {selectedCount > 0 && (
        <BulkActionsBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          primaryActions={[
            {
              id: 'delete',
              label: 'Smazat',
              icon: Trash2,
              onClick: handleBulkDelete,
              variant: 'danger',
            },
          ]}
          secondaryActions={[
            {
              id: 'mark-active',
              label: 'Označit aktivní',
              icon: ToggleLeft,
              onClick: handleMarkActive,
            },
            {
              id: 'mark-inactive',
              label: 'Označit neaktivní',
              icon: Archive,
              onClick: handleMarkInactive,
            },
            {
              id: 'toggle-featured',
              label: 'Přepnout featured',
              icon: Star,
              onClick: handleToggleFeatured,
            },
          ]}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Načítám služby...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádné služby nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">Zatím nejsou žádné služby.</p>
              <Link
                href="/admin/services/new"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Vytvořit první službu
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
              <div className="flex items-center">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={toggleAll}
                />
                <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {selectedCount > 0
                    ? `Vybráno ${selectedCount} z ${services.length}`
                    : `Všechny služby (${services.length})`}
                </span>
              </div>
            </li>
            {services.map((service) => (
              <li key={service.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected(service.id)}
                        onChange={() => toggleItem(service.id)}
                      />

                      {service.featuredImageUrl && (
                        <div className="flex-shrink-0 ml-4">
                          <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-200">
                            <Image
                              src={service.featuredImageUrl}
                              alt={service.featuredImageAlt || service.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className={service.featuredImageUrl ? 'ml-4' : 'ml-4'}>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {service.title}
                          </h3>
                          {service.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {!service.isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Neaktivní
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {categoryLabels[service.category] || service.category}
                          </span>
                          {service.priceFrom && (
                            <>
                              <span>•</span>
                              <span>od {service.priceFrom} Kč</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-mono text-xs">{service.slug}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex gap-2">
                      <Link
                        href={`/pro-poradatele#${service.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Zobrazit
                      </Link>
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Upravit
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  )
}
