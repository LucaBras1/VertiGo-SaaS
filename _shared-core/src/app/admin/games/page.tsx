'use client'

/**
 * Games List Page
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
import { Trash2, Archive, CheckCircle, Star, ExternalLink, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { formatBooleanForExport, type ExportColumn } from '@/lib/export'
import { useConfirmDialog } from '@/components/admin/modals/ConfirmDialog'

interface Game {
  id: string
  title: string
  slug: string
  category: string
  status: string
  duration: number
  minPlayers: number | null
  maxPlayers: number | null
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
  skill: '🎯 Dovednostní',
  team: '👥 Týmové',
  creative: '🎨 Tvořivé',
  active: '🏃 Pohybové',
}

const exportColumns: ExportColumn<Game>[] = [
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
    key: 'minPlayers',
    label: 'Min. hráčů',
    format: (value) => value?.toString() || '',
  },
  {
    key: 'maxPlayers',
    label: 'Max. hráčů',
    format: (value) => value?.toString() || '',
  },
  {
    key: 'featured',
    label: 'Zvýrazněno',
    format: (value) => formatBooleanForExport(value),
  },
  { key: 'order', label: 'Pořadí' },
]

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
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
  const { ConfirmDialogComponent, confirm } = useConfirmDialog()

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
    items: games,
    getId: (g) => g.id,
  })

  const categoryOptions = [
    { value: 'skill', label: 'Dovednostní', description: '🎯 Hry na rozvoj dovedností' },
    { value: 'team', label: 'Týmové', description: '👥 Hry pro týmovou spolupráci' },
    { value: 'creative', label: 'Tvořivé', description: '🎨 Kreativní a umělecké hry' },
    { value: 'active', label: 'Pohybové', description: '🏃 Aktivní a sportovní hry' },
  ]

  const statusOptions = [
    { value: 'active', label: 'Aktivní', description: '✓ Aktuálně dostupné' },
    { value: 'draft', label: 'Koncept', description: '📝 V přípravě' },
    { value: 'archived', label: 'Archivováno', description: '📦 Neaktivní' },
  ]

  useEffect(() => {
    const fetchGames = async () => {
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

        const response = await fetch(`/api/admin/games?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch games')

        const result = await response.json()
        setGames(result.data || [])
        setPagination(result.pagination)
      } catch (error) {
        console.error('Error fetching games:', error)
        setGames([])
        toast('Chyba při načítání her', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [filters, page, pageSize, toast])

  const handleBulkDelete = async () => {
    const confirmed = await confirm({
      title: 'Smazat hry',
      message: `Opravdu chcete smazat ${selectedCount} ${selectedCount === 1 ? 'hru' : selectedCount < 5 ? 'hry' : 'her'}? Tato akce je nevratná.`,
      confirmText: 'Smazat',
      cancelText: 'Zrušit',
      variant: 'danger',
    })

    if (!confirmed) return

    try {
      const response = await fetch('/api/admin/games/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to delete')

      toast(result.message, 'success')
      clearSelection()
      setGames(prev => prev.filter(g => !selectedIds.includes(g.id)))
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Chyba při mazání', 'error')
    }
  }

  const handleBulkUpdateStatus = async (status: string) => {
    try {
      const response = await fetch('/api/admin/games/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: { status } }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update')

      toast(result.message, 'success')
      clearSelection()
      setGames(prev => prev.map(g => (selectedIds.includes(g.id) ? { ...g, status } : g)))
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Chyba při aktualizaci', 'error')
    }
  }

  const handleBulkToggleFeatured = async (featured: boolean) => {
    try {
      const response = await fetch('/api/admin/games/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: { featured } }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update')

      toast(result.message, 'success')
      clearSelection()
      setGames(prev => prev.map(g => (selectedIds.includes(g.id) ? { ...g, featured } : g)))
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Chyba při aktualizaci', 'error')
    }
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hry a aktivity</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa her, aktivit a workshopů
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={games}
            columns={exportColumns}
            filename={`hry-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/games/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Přidat hru
          </Link>
        </div>
      </div>

      <FilterBar title="Filtrovat hry">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

      {hasFilters && (
        <ActiveFilters
          filterLabels={{ category: 'Kategorie', status: 'Status' }}
          valueFormatters={{
            category: (value) => {
              const values = Array.isArray(value) ? value : [value]
              return values.map(v => categoryOptions.find(opt => opt.value === v)?.label || v).join(', ')
            },
            status: (value) => {
              const values = Array.isArray(value) ? value : [value]
              return values.map(v => statusOptions.find(opt => opt.value === v)?.label || v).join(', ')
            },
          }}
        />
      )}

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

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Načítání her...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {hasFilters ? 'Žádné hry neodpovídají zvoleným filtrům.' : 'Zatím nejsou žádné hry.'}
          </p>
          {!hasFilters && (
            <Link
              href="/admin/games/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              Vytvořit první hru
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <label className="flex items-center">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={toggleAll}
                aria-label="Vybrat vše"
              />
              <span className="ml-2 text-sm text-gray-700">Vybrat vše ({games.length})</span>
            </label>
          </div>

          <ul className="divide-y divide-gray-200">
            {games.map((game) => (
              <li key={game.id} className={isSelected(game.id) ? 'bg-blue-50' : ''}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0 mr-3">
                        <Checkbox
                          checked={isSelected(game.id)}
                          onChange={() => toggleItem(game.id)}
                          aria-label={`Vybrat ${game.title}`}
                        />
                      </div>

                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-200">
                          <Image
                            src={game.featuredImageUrl}
                            alt={game.featuredImageAlt}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {game.title}
                          </h3>
                          {game.featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Doporučujeme
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>{categoryLabels[game.category] || game.category}</span>
                          <span>•</span>
                          <span>{statusLabels[game.status] || game.status}</span>
                          <span>•</span>
                          <span>{game.duration} min</span>
                          {(game.minPlayers || game.maxPlayers) && (
                            <>
                              <span>•</span>
                              <span>
                                {game.minPlayers || '?'}-{game.maxPlayers || '∞'} hráčů
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-mono text-xs">{game.slug}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0 flex gap-2">
                      <Link
                        href={`/hry/${game.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Zobrazit
                      </Link>
                      <Link
                        href={`/admin/games/${game.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Pencil className="w-4 h-4" />
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

      {/* Confirm Dialog */}
      {ConfirmDialogComponent}
    </div>
  )
}
