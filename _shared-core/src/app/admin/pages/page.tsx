/**
 * Pages List Page - Client Component with Filters & Bulk Operations
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, Eye, CheckCircle, FileText } from 'lucide-react'
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
import { formatDateForExport, type ExportColumn } from '@/lib/export'

type Page = {
  id: string
  title: string
  slug: string
  content: string
  status: string
  metaTitle: string | null
  metaDescription: string | null
  createdAt: Date
  updatedAt: Date
}

const statusOptions = [
  { value: 'published', label: 'Publikováno', description: '✅ Zobrazeno na webu' },
  { value: 'draft', label: 'Koncept', description: '📝 Pouze draft' },
]

const exportColumns: ExportColumn<Page>[] = [
  { key: 'title', label: 'Název' },
  { key: 'slug', label: 'URL' },
  { key: 'status', label: 'Stav' },
  { key: 'metaTitle', label: 'SEO název' },
  { key: 'metaDescription', label: 'SEO popis' },
  {
    key: 'createdAt',
    label: 'Vytvořeno',
    format: (value) => formatDateForExport(value),
  },
  {
    key: 'updatedAt',
    label: 'Aktualizováno',
    format: (value) => formatDateForExport(value),
  },
]

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
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
    items: pages,
    getId: (page) => page.id,
  })

  useEffect(() => {
    fetchPages()
  }, [page, pageSize, filters])

  const fetchPages = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      // Filters
      filters.status.forEach((s: string) => params.append('status', s))

      const response = await fetch(`/api/admin/pages?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast('Chyba při načítání stránek', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Opravdu chcete smazat ${selectedCount} ${selectedCount > 1 ? 'stránky' : 'stránku'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/pages/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Stránky úspěšně smazány', 'success')
        await fetchPages()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání stránek', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání stránek', 'error')
    }
  }

  const handleBulkUpdate = async (updateData: Partial<Page>) => {
    try {
      const response = await fetch('/api/admin/pages/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: updateData }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Stránky úspěšně aktualizovány', 'success')
        await fetchPages()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při aktualizaci stránek', 'error')
      }
    } catch (error) {
      toast('Chyba při aktualizaci stránek', 'error')
    }
  }

  const handlePublish = () => handleBulkUpdate({ status: 'published' })
  const handleMarkDraft = () => handleBulkUpdate({ status: 'draft' })

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stránky</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa statických stránek webu
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={pages}
            columns={exportColumns}
            filename={`stranky-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Přidat stránku
          </Link>
        </div>
      </div>

      <FilterBar onClear={clearAllFilters} hasFilters={hasFilters}>
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
            key: 'status',
            label: 'Stav',
            values: (filters.status || []).map(
              (val: string) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
          },
        ].filter(f => (f.values as string[]).length > 0)}
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
              id: 'publish',
              label: 'Publikovat',
              icon: CheckCircle,
              onClick: handlePublish,
            },
            {
              id: 'mark-draft',
              label: 'Označit jako koncept',
              icon: FileText,
              onClick: handleMarkDraft,
            },
          ]}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Načítám stránky...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádné stránky nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">Zatím nejsou žádné stránky.</p>
              <Link
                href="/admin/pages/new"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Vytvořit první stránku
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
                    ? `Vybráno ${selectedCount} z ${pages.length}`
                    : `Všechny stránky (${pages.length})`}
                </span>
              </div>
            </li>
            {pages.map((page) => (
              <li key={page.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected(page.id)}
                        onChange={() => toggleItem(page.id)}
                      />

                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {page.title}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              page.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {page.status === 'published' ? '✓ Publikováno' : '📝 Koncept'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-mono text-xs">/{page.slug}</span>
                          <span>•</span>
                          <span>
                            Aktualizováno:{' '}
                            {new Date(page.updatedAt).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex gap-2">
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Zobrazit
                      </Link>
                      <Link
                        href={`/admin/pages/${page.id}`}
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
