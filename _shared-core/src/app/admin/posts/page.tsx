/**
 * Posts List Page - Client Component with Filters & Bulk Operations
 */
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Eye, CheckCircle, FileText, Star } from 'lucide-react'
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
  formatDateForExport,
  formatBooleanForExport,
  type ExportColumn,
} from '@/lib/export'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  status: string
  featured: boolean
  publishedAt: Date | null
  authorId: string | null
  createdAt: Date
  updatedAt: Date
}

const statusOptions = [
  { value: 'published', label: 'Publikováno', description: '✅ Zobrazeno na webu' },
  { value: 'draft', label: 'Koncept', description: '📝 Pouze draft' },
]

const exportColumns: ExportColumn<Post>[] = [
  { key: 'title', label: 'Název' },
  { key: 'slug', label: 'URL' },
  { key: 'excerpt', label: 'Perex' },
  { key: 'status', label: 'Stav' },
  {
    key: 'featured',
    label: 'Vyznačený',
    format: (value) => formatBooleanForExport(value),
  },
  {
    key: 'publishedAt',
    label: 'Datum publikace',
    format: (value) => formatDateForExport(value),
  },
  {
    key: 'createdAt',
    label: 'Vytvořeno',
    format: (value) => formatDateForExport(value),
  },
]

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
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
    items: posts,
    getId: (post) => post.id,
  })

  useEffect(() => {
    fetchPosts()
  }, [page, pageSize, filters])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      // Pagination
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      // Filters
      filters.status.forEach((s: string) => params.append('status', s))
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)

      const response = await fetch(`/api/admin/posts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast('Chyba při načítání aktualit', 'error')
    } finally {
      setIsLoading(false)
    }
  }


  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Opravdu chcete smazat ${selectedCount} ${selectedCount > 1 ? 'aktuality' : 'aktualitu'}?`
      )
    ) {
      return
    }

    try {
      const response = await fetch('/api/admin/posts/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Aktuality úspěšně smazány', 'success')
        await fetchPosts()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při mazání aktualit', 'error')
      }
    } catch (error) {
      toast('Chyba při mazání aktualit', 'error')
    }
  }

  const handleBulkUpdate = async (updateData: Partial<Post>) => {
    try {
      const response = await fetch('/api/admin/posts/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: updateData }),
      })

      if (response.ok) {
        const data = await response.json()
        toast(data.message || 'Aktuality úspěšně aktualizovány', 'success')
        await fetchPosts()
        clearSelection()
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba při aktualizaci aktualit', 'error')
      }
    } catch (error) {
      toast('Chyba při aktualizaci aktualit', 'error')
    }
  }

  const handlePublish = () => handleBulkUpdate({ status: 'published' })
  const handleMarkDraft = () => handleBulkUpdate({ status: 'draft' })
  const handleToggleFeatured = () => {
    const firstSelected = posts.find((p) => selectedIds.includes(p.id))
    handleBulkUpdate({ featured: !firstSelected?.featured })
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aktuality</h1>
          <p className="mt-2 text-sm text-gray-600">
            Správa blogových příspěvků a novinek
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <ExportButton
            data={posts}
            columns={exportColumns}
            filename={`aktuality-${new Date().toISOString().split('T')[0]}.csv`}
          />
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            + Přidat aktualitu
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
        <DateRangePicker
          label="Datum publikace"
          from={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
          to={filters.dateTo ? new Date(filters.dateTo) : undefined}
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
            values: (filters.status || []).map(
              (val: string) => statusOptions.find((opt) => opt.value === val)?.label || val
            ),
            onClear: () => clearFilter('status'),
          },
          {
            key: 'date',
            label: 'Datum publikace',
            values:
              filters.dateFrom || filters.dateTo
                ? [
                    `${filters.dateFrom ? format(new Date(filters.dateFrom), 'dd.MM.yyyy', { locale: cs }) : '...'} - ${filters.dateTo ? format(new Date(filters.dateTo), 'dd.MM.yyyy', { locale: cs }) : '...'}`,
                  ]
                : [],
            onClear: () => {
              clearFilter('dateFrom')
              clearFilter('dateTo')
            },
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
          <p className="text-gray-500">Načítám aktuality...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          {hasFilters ? (
            <>
              <p className="text-gray-500 mb-4">Žádné aktuality nevyhovují filtrům.</p>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Zrušit filtry
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500">Zatím nejsou žádné aktuality.</p>
              <Link
                href="/admin/posts/new"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Vytvořit první aktualitu
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
                    ? `Vybráno ${selectedCount} z ${posts.length}`
                    : `Všechny aktuality (${posts.length})`}
                </span>
              </div>
            </li>
            {posts.map((post) => (
              <li key={post.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <Checkbox
                        checked={isSelected(post.id)}
                        onChange={() => toggleItem(post.id)}
                      />

                      {post.featuredImageUrl && (
                        <div className="flex-shrink-0 ml-4">
                          <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-200">
                            <Image
                              src={post.featuredImageUrl}
                              alt={post.featuredImageAlt || post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className={post.featuredImageUrl ? 'ml-4' : 'ml-4'}>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {post.title}
                          </h3>
                          {post.featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Doporučujeme
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {post.status === 'published' ? '✓ Publikováno' : '📝 Koncept'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          {post.publishedAt && (
                            <>
                              <span>
                                {new Date(post.publishedAt).toLocaleDateString('cs-CZ')}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className="font-mono text-xs">{post.slug}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex gap-2">
                      <Link
                        href={`/aktuality/${post.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Zobrazit
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}`}
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
