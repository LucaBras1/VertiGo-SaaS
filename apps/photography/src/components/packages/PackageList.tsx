'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Calendar, DollarSign, User, MoreVertical, Eye, Edit, Trash2, Camera } from 'lucide-react'
import { PackageFilters, PackageFiltersState } from './PackageFilters'
import { Badge, Button, Card } from '@vertigo/ui'

interface PackageData {
  id: string
  title: string
  status: string
  eventType: string | null
  eventDate: string | null
  totalPrice: number | null
  createdAt: string
  client: {
    id: string
    name: string
    email: string
  } | null
  shoots: Array<{ id: string; date: string }>
  invoices: Array<{ id: string; status: string }>
  shotLists: Array<{ id: string }>
}

interface PackageListProps {
  initialPackages?: PackageData[]
  clients?: { id: string; name: string }[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'danger' }> = {
  INQUIRY: { label: 'Poptávka', variant: 'secondary' },
  QUOTE_SENT: { label: 'Nabídka odeslána', variant: 'default' },
  CONFIRMED: { label: 'Potvrzeno', variant: 'warning' },
  IN_PRODUCTION: { label: 'Ve výrobě', variant: 'default' },
  COMPLETED: { label: 'Dokončeno', variant: 'success' },
  CANCELLED: { label: 'Zrušeno', variant: 'danger' }
}

const eventTypeLabels: Record<string, string> = {
  WEDDING: 'Svatba',
  PORTRAIT: 'Portrét',
  FAMILY: 'Rodinné focení',
  CORPORATE: 'Firemní',
  EVENT: 'Událost',
  PRODUCT: 'Produktové',
  OTHER: 'Jiné'
}

export function PackageList({ initialPackages = [], clients = [] }: PackageListProps) {
  const router = useRouter()
  const [packages, setPackages] = useState<PackageData[]>(initialPackages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasMore: false
  })
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchPackages = useCallback(async (filters: PackageFiltersState, page = 1) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pagination.limit))

      if (filters.search) params.set('search', filters.search)
      if (filters.statuses.length > 0) params.set('statuses', filters.statuses.join(','))
      if (filters.clientId) params.set('clientId', filters.clientId)
      if (filters.eventType) params.set('eventType', filters.eventType)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      if (filters.sortBy) params.set('sortBy', filters.sortBy)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/packages?${params}`)
      if (!response.ok) throw new Error('Failed to fetch packages')

      const result = await response.json()
      setPackages(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch packages')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  const handleFilterChange = useCallback((filters: PackageFiltersState) => {
    fetchPackages(filters, 1)
  }, [fetchPackages])

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto zakázku?')) return

    try {
      const response = await fetch(`/api/packages/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete package')

      setPackages(prev => prev.filter(p => p.id !== id))
      setActiveMenu(null)
    } catch (err) {
      alert('Nepodařilo se smazat zakázku')
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return

    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/packages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          })
        )
      )

      setPackages(prev =>
        prev.map(p =>
          selectedIds.has(p.id) ? { ...p, status: newStatus } : p
        )
      )
      setSelectedIds(new Set())
    } catch (err) {
      alert('Nepodařilo se změnit status')
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === packages.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(packages.map(p => p.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return '-'
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    }).format(price / 100)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('cs-CZ')
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <PackageFilters onFilterChange={handleFilterChange} clients={clients} />

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-sm font-medium text-amber-800">
            Vybráno: {selectedIds.size} zakázek
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange('CONFIRMED')}
            >
              Potvrdit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange('IN_PRODUCTION')}
            >
              Do výroby
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange('COMPLETED')}
            >
              Dokončit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              Zrušit výběr
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Package Table */}
      {!loading && packages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === packages.length && packages.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Zakázka
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Klient
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Typ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Datum akce
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Cena
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {packages.map(pkg => (
                  <tr
                    key={pkg.id}
                    className={`hover:bg-gray-50 ${selectedIds.has(pkg.id) ? 'bg-amber-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(pkg.id)}
                        onChange={() => toggleSelect(pkg.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/packages/${pkg.id}`}
                        className="font-medium text-gray-900 hover:text-amber-600"
                      >
                        {pkg.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        {pkg.shoots.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {pkg.shoots.length} focení
                          </span>
                        )}
                        {pkg.shotLists.length > 0 && (
                          <span>{pkg.shotLists.length} shot listů</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {pkg.client ? (
                        <div>
                          <span className="text-gray-900">{pkg.client.name}</span>
                          <span className="block text-xs text-gray-500">{pkg.client.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[pkg.status]?.variant || 'default'}>
                        {statusConfig[pkg.status]?.label || pkg.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pkg.eventType ? eventTypeLabels[pkg.eventType] || pkg.eventType : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(pkg.eventDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {formatPrice(pkg.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex items-center justify-center">
                        <button
                          onClick={() => setActiveMenu(activeMenu === pkg.id ? null : pkg.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {activeMenu === pkg.id && (
                          <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                            <Link
                              href={`/dashboard/packages/${pkg.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              Zobrazit detail
                            </Link>
                            <Link
                              href={`/dashboard/packages/${pkg.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Upravit
                            </Link>
                            <button
                              onClick={() => handleDelete(pkg.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Smazat
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Zobrazeno {(pagination.page - 1) * pagination.limit + 1} -{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} z{' '}
                {pagination.totalCount}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => {
                    // Re-fetch with previous page
                  }}
                >
                  Předchozí
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!pagination.hasMore}
                  onClick={() => {
                    // Re-fetch with next page
                  }}
                >
                  Další
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && packages.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Žádné zakázky
            </h3>
            <p className="text-gray-500 mb-4">
              Zatím nemáte žádné zakázky nebo odpovídající filtrům.
            </p>
            <Button onClick={() => router.push('/dashboard/packages/new')}>
              Vytvořit první zakázku
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
