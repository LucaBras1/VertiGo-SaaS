'use client'

/**
 * Performances List Page
 *
 * Shows all performances with options to create, edit, delete
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { Trash2, Archive, CheckCircle, Star } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { formatBooleanForExport, type ExportColumn } from '@/lib/export'

interface Performance {
  id: string
  title: string
  slug: string
  category: string
  status: string
  duration: number
  featured: boolean
  featuredImageUrl: string
  featuredImageAlt: string
  order: number
}

const statusLabels: Record<string, string> = {
  active: '✓ Aktivní',
  archived: '📦 Archivováno',
  draft: '📝 Koncept',
}

const categoryLabels: Record<string, string> = {
  theatre: '🎭 Divadlo',
  stilts: '🚶 Chůdy',
  music: '🎵 Hudba',
  special: '⭐ Speciál',
}

const exportColumns: ExportColumn<Performance>[] = [
  { key: 'title', label: 'Název' },
  { key: 'slug', label: 'URL' },
  {
    key: 'category',
    label: 'Kategorie',
    format: (value) => categoryLabels[value] || value,
  },
  {
    key: 'status',
    label: 'Stav',
    format: (value) => statusLabels[value] || value,
  },
  {
    key: 'duration',
    label: 'Délka (min)',
  },
  {
    key: 'featured',
    label: 'Zvýrazněno',
    format: (value) => formatBooleanForExport(value),
  },
  { key: 'order', label: 'Pořadí' },
]

export default function PerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 25,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const { filters, setFilter, hasFilters } = useUrlFilters()
  const { page, pageSize, setPage, setPageSize } = usePagination({ defaultPageSize: 25 })
  const { toast } = useToast()

  // Bulk selection
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
    items: performances,
    getId: (p) => p.id,
  })

  // Filter options
  const categoryOptions = [
    { value: 'theatre', label: 'Divadlo', description: '🎭 Divadelní představení' },
    { value: 'stilts', label: 'Chůdy', description: '🚶 Programy na chůdách' },
    { value: 'music', label: 'Hudba', description: '🎵 Hudební programy' },
    { value: 'special', label: 'Speciál', description: '⭐ Speciální programy' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Aktivní', description: '✓ Aktuálně dostupné' },
    { value: 'draft', label: 'Koncept', description: '📝 V přípravě' },
    { value: 'archived', label: 'Archivováno', description: '📦 Neaktivní' },
  ]

  // Fetch performances
  useEffect(() => {
    const fetchPerformances = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()

        // Pagination
        params.set('page', page.toString())
        params.set('pageSize', pageSize.toString())

        // Filters
        if (filters.category) {
          const categories = Array.isArray(filters.category) ? filters.category : [filters.category]
          categories.forEach(c => params.append('category', c as string))
        }
        if (filters.status) {
          const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
          statuses.forEach(s => params.append('status', s as string))
        }

        const response = await fetch(`/api/admin/performances?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch performances')

        const result = await response.json()
        setPerformances(result.data || [])
        setPagination(result.pagination)
      } catch (error) {
        console.error('Error fetching performances:', error)
        setPerformances([])
        toast('Chyba při načítání inscenací', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchPerformances()
  }, [filters, page, pageSize, toast])

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (!confirm(`Opravdu chcete smazat ${selectedCount} ${selectedCount === 1 ? 'inscenaci' : selectedCount < 5 ? 'inscenace' : 'inscenací'}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/performances/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete')

      toast(result.message, 'success')
      clearSelection()
      setPerformances(prev => prev.filter(p => !selectedIds.includes(p.id)))
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Chyba při mazání', 'error')
    }
  }

  // Bulk update status
  const handleBulkUpdateStatus = async (status: string) => {
    try {
      const response = await fetch('/api/admin/performances/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: { status } }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update')

      toast(result.message, 'success')
      clearSelection()

      // Refresh data
      setPerformances(prev =>
        prev.map(p => (selectedIds.includes(p.id) ? { ...p, status } : p))
      )
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Chyba při aktualizaci', 'error')
    }
  }

  // Toggle featured
  const handleBulkToggleFeatured = async (featured: boolean) => {
    try {
      const response = await fetch('/api/admin/performances/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: { featured } }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update')

      toast(result.message, 'success')
      clearSelection()

      setPerformances(prev =>
        prev.map(p => (selectedIds.includes(p.id) ? { ...p, featured } : p))
      )
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Chyba při aktualizaci', 'error')
    }
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inscenace</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa divadelních představení, představení na chůdách, hudebních programů a speciálů
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={performances}
            columns={exportColumns}
            filename={`inscenace-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/performances/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Přidat inscenaci
          </Link>
        </div>
      </div>

      {/* Filters */}
      <FilterBar title="Filtrovat inscenace">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategorie
          </label>
          <MultiSelect
            options={categoryOptions}
            value={
              Array.isArray(filters.category)
                ? filters.category as string[]
                : filters.category
                ? [filters.category as string]
                : []
            }
            onChange={(values) => setFilter('category', values.length > 0 ? values : null)}
            placeholder="Všechny kategorie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <MultiSelect
            options={statusOptions}
            value={
              Array.isArray(filters.status)
                ? filters.status as string[]
                : filters.status
                ? [filters.status as string]
                : []
            }
            onChange={(values) => setFilter('status', values.length > 0 ? values : null)}
            placeholder="Všechny statusy"
          />
        </div>
      </FilterBar>

      {/* Active Filters */}
      {hasFilters && (
        <ActiveFilters
          filterLabels={{
            category: 'Kategorie',
            status: 'Status',
          }}
          valueFormatters={{
            category: (value) => {
              const values = Array.isArray(value) ? value : [value]
              return values
                .map(v => categoryOptions.find(opt => opt.value === v)?.label || v)
                .join(', ')
            },
            status: (value) => {
              const values = Array.isArray(value) ? value : [value]
              return values
                .map(v => statusOptions.find(opt => opt.value === v)?.label || v)
                .join(', ')
            },
          }}
        />
      )}

      {/* Bulk Actions Bar */}
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
              label: 'Označit jako aktivní',
              icon: CheckCircle,
              onClick: () => handleBulkUpdateStatus('active'),
            },
            {
              id: 'mark-archived',
              label: 'Archivovat',
              icon: Archive,
              onClick: () => handleBulkUpdateStatus('archived'),
            },
            {
              id: 'feature',
              label: 'Označit jako doporučené',
              icon: Star,
              onClick: () => handleBulkToggleFeatured(true),
            },
            {
              id: 'unfeature',
              label: 'Odebrat z doporučených',
              onClick: () => handleBulkToggleFeatured(false),
            },
          ]}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Načítání inscenací...</p>
        </div>
      ) : performances.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {hasFilters
              ? 'Žádné inscenace neodpovídají zvoleným filtrům.'
              : 'Zatím nejsou žádné inscenace.'}
          </p>
          {!hasFilters && (
            <Link
              href="/admin/performances/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              Vytvořit první inscenaci
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {/* Select All Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <label className="flex items-center">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={toggleAll}
                aria-label="Vybrat vše"
              />
              <span className="ml-2 text-sm text-gray-700">
                Vybrat vše ({performances.length})
              </span>
            </label>
          </div>

          <ul className="divide-y divide-gray-200">
            {performances.map((performance) => (
              <li
                key={performance.id}
                className={isSelected(performance.id) ? 'bg-blue-50' : ''}
              >
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 mr-3">
                        <Checkbox
                          checked={isSelected(performance.id)}
                          onChange={() => toggleItem(performance.id)}
                          aria-label={`Vybrat ${performance.title}`}
                        />
                      </div>

                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-200">
                          <Image
                            src={performance.featuredImageUrl}
                            alt={performance.featuredImageAlt}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {performance.title}
                          </h3>
                          {performance.featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Doporučujeme
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>{categoryLabels[performance.category] || performance.category}</span>
                          <span>•</span>
                          <span>{statusLabels[performance.status] || performance.status}</span>
                          <span>•</span>
                          <span>{performance.duration} min</span>
                          <span>•</span>
                          <span className="font-mono text-xs">{performance.slug}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex-shrink-0 flex gap-2">
                      <Link
                        href={`/repertoar/${performance.slug}`}
                        target="_blank"
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Zobrazit
                      </Link>
                      <Link
                        href={`/admin/performances/${performance.id}`}
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
