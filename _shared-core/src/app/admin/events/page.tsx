/**
 * Events List Page - Client Component with Filters & Bulk Operations
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, CheckCircle, XCircle, HelpCircle, Eye, ToggleLeft } from 'lucide-react'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useBulkSelection } from '@/hooks/useBulkSelection'
import { usePagination } from '@/hooks/usePagination'
import { FilterBar } from '@/components/admin/filters/FilterBar'
import { ActiveFilters } from '@/components/admin/filters/ActiveFilters'
import { MultiSelect } from '@/components/admin/filters/MultiSelect'
import { DateRangePicker } from '@/components/admin/filters/DateRangePicker'
import { BulkActionsBar } from '@/components/admin/tables/BulkActionsBar'
import { ExportButton } from '@/components/admin/tables/ExportButton'
import { Pagination, type PaginationInfo } from '@/components/admin/tables/Pagination'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
  formatDateTimeForExport,
  formatBooleanForExport,
  type ExportColumn,
} from '@/lib/export'

type Event = {
  id: string
  performanceId: string | null
  gameId: string | null
  date: Date
  venue: any
  status: string
  isPublic: boolean
  notes: string | null
  createdAt: Date
  updatedAt: Date
  performance?: {
    id: string
    title: string
    slug: string
  } | null
  game?: {
    id: string
    title: string
    slug: string
  } | null
}

const statusOptions = [
  { value: 'confirmed', label: 'Potvrzeno', description: '✅ Akce potvrzena' },
  { value: 'tentative', label: 'Nezávazně', description: '❓ Akce nezávazně' },
  { value: 'cancelled', label: 'Zrušeno', description: '❌ Akce zrušena' },
]

const visibilityOptions = [
  { value: 'public', label: 'Veřejné', description: '👁 Zobrazeno na webu' },
  { value: 'private', label: 'Neveřejné', description: '🔒 Pouze interní' },
]

const exportColumns: ExportColumn<Event>[] = [
  {
    key: 'performance',
    label: 'Inscenace/Hra',
    format: (value, item) => item.performance?.title || item.game?.title || '',
  },
  {
    key: 'date',
    label: 'Datum a čas',
    format: (value) => formatDateTimeForExport(value),
  },
  {
    key: 'venue',
    label: 'Místo',
    format: (value) => value?.name || '',
  },
  { key: 'status', label: 'Stav' },
  {
    key: 'isPublic',
    label: 'Veřejné',
    format: (value) => formatBooleanForExport(value),
  },
  { key: 'notes', label: 'Poznámky' },
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
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
    visibility: { type: 'array', defaultValue: [] },
    dateFrom: { type: 'string', defaultValue: null },
    dateTo: { type: 'string', defaultValue: null },
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
    items: events,
    getId: (event) => event.id,
  })

  useEffect(() => {
    fetchEvents()
  }, [page, pageSize, filters])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      // Filters
      const statuses = (filters.status as string[]) || []
      const visibilities = (filters.visibility as string[]) || []
      statuses.forEach(s => params.append('status', s))
      visibilities.forEach(v => params.append('visibility', v))
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom as string)
      if (filters.dateTo) params.set('dateTo', filters.dateTo as string)

      const response = await fetch(`/api/admin/events?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast('Chyba při načítání akcí', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Opravdu chcete smazat ${selectedCount} ${selectedCount > 1 ? 'akce' : 'akci'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/events/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Akce úspěšně smazány', 'success')
        await fetchEvents()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání akcí', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání akcí', 'error')
    }
  }

  const handleBulkUpdate = async (updateData: Partial<Event>) => {
    try {
      const response = await fetch('/api/admin/events/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: updateData }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Akce úspěšně aktualizovány', 'success')
        await fetchEvents()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při aktualizaci akcí', 'error')
      }
    } catch (error) {
      toast('Chyba při aktualizaci akcí', 'error')
    }
  }

  const handleConfirm = () => handleBulkUpdate({ status: 'confirmed' })
  const handleCancel = () => handleBulkUpdate({ status: 'cancelled' })
  const handleToggleVisibility = () => {
    const firstSelected = events.find((e) => selectedIds.includes(e.id))
    handleBulkUpdate({ isPublic: !firstSelected?.isPublic })
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Akce</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa veřejných a interních akcí
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={events}
            columns={exportColumns}
            filename={`akce-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/events/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Přidat akci
          </Link>
        </div>
      </div>

      <FilterBar onClear={clearAllFilters} hasFilters={hasFilters}>
        <MultiSelect
          label="Stav"
          options={statusOptions}
          value={(filters.status as string[]) || []}
          onChange={(value) => updateFilter('status', value)}
          placeholder="Vyberte stavy..."
        />
        <MultiSelect
          label="Viditelnost"
          options={visibilityOptions}
          value={(filters.visibility as string[]) || []}
          onChange={(value) => updateFilter('visibility', value)}
          placeholder="Vyberte viditelnost..."
        />
        <DateRangePicker
          label="Datum akce"
          from={filters.dateFrom ? new Date(filters.dateFrom as string) : undefined}
          to={filters.dateTo ? new Date(filters.dateTo as string) : undefined}
          onSelect={(range) => {
            updateFilter('dateFrom', range?.from ? range.from.toISOString() : null)
            updateFilter('dateTo', range?.to ? range.to.toISOString() : null)
          }}
        />
      </FilterBar>

      <ActiveFilters
        filters={[
          {
            key: 'status',
            label: 'Stav',
            values: ((filters.status as string[]) || []).map(
              (val) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
          },
          {
            key: 'visibility',
            label: 'Viditelnost',
            values: ((filters.visibility as string[]) || []).map(
              (val) => visibilityOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('visibility'),
          },
          {
            key: 'date',
            label: 'Datum akce',
            values:
              filters.dateFrom || filters.dateTo
                ? [
                    `${filters.dateFrom ? format(new Date(filters.dateFrom as string), 'dd.MM.yyyy', { locale: cs }) : '...'} - ${filters.dateTo ? format(new Date(filters.dateTo as string), 'dd.MM.yyyy', { locale: cs }) : '...'}`,
                  ]
                : [],
            onClear: () => {
              clearFilter('dateFrom')
              clearFilter('dateTo')
            },
          },
        ].filter(f => f.values.length > 0)}
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
              id: 'confirm',
              label: 'Potvrdit',
              icon: CheckCircle,
              onClick: handleConfirm,
            },
            {
              id: 'cancel',
              label: 'Zrušit',
              icon: XCircle,
              onClick: handleCancel,
            },
            {
              id: 'toggle-visibility',
              label: 'Přepnout viditelnost',
              icon: ToggleLeft,
              onClick: handleToggleVisibility,
            },
          ]}
        />
      )}

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Načítám akce...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádné akce nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">Zatím nejsou žádné akce.</p>
              <Link
                href="/admin/events/new"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Vytvořit první akci
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
                    ? `Vybráno ${selectedCount} z ${events.length}`
                    : `Všechny akce (${events.length})`}
                </span>
              </div>
            </li>
            {events.map((event) => {
              const venueName =
                event.venue && typeof event.venue === 'object'
                  ? (event.venue as any).name
                  : 'Neurčeno'
              const venueCity =
                event.venue && typeof event.venue === 'object'
                  ? (event.venue as any).city
                  : ''

              return (
                <li key={event.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <Checkbox
                          checked={isSelected(event.id)}
                          onChange={() => toggleItem(event.id)}
                        />

                        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-center min-w-[80px] ml-4">
                          <div className="text-xs font-medium text-blue-600 uppercase">
                            {new Date(event.date).toLocaleDateString('cs-CZ', {
                              month: 'short',
                            })}
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {new Date(event.date).getDate()}
                          </div>
                        </div>

                        <div className="flex-1 ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {event.performance ? (
                              <span>🎭 {event.performance.title}</span>
                            ) : event.game ? (
                              <span>🎮 {event.game.title}</span>
                            ) : (
                              <span className="text-gray-500">Vlastní akce</span>
                            )}
                          </h3>

                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              📍 {venueName}
                              {venueCity && `, ${venueCity}`}
                            </span>
                            <span>•</span>
                            <span>🕐 {formatTime(event.date)}</span>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                event.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : event.status === 'tentative'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {event.status === 'confirmed' && '✓ Potvrzeno'}
                              {event.status === 'tentative' && '? Nezávazně'}
                              {event.status === 'cancelled' && '✗ Zrušeno'}
                            </span>
                            {event.isPublic ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                👁 Veřejné
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                🔒 Neveřejné
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 flex gap-2">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Upravit
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
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
