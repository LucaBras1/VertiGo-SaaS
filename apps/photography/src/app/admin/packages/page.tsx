'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Plus, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { format } from 'date-fns'
import { usePackages, PackageFilters, PackageStatus, STATUS_LABELS } from '@/hooks/usePackages'

const EVENT_TYPES = [
  { value: '', label: 'All Events' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'family', label: 'Family' },
  { value: 'product', label: 'Product' },
  { value: 'newborn', label: 'Newborn' },
  { value: 'maternity', label: 'Maternity' },
]

const STATUS_OPTIONS: { value: PackageStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'INQUIRY', label: 'Inquiry' },
  { value: 'QUOTE_SENT', label: 'Quote Sent' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function PackagesPage() {
  const [filters, setFilters] = useState<PackageFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error } = usePackages(filters)

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'INQUIRY': return 'default'
      case 'QUOTE_SENT': return 'info'
      case 'CONFIRMED': return 'success'
      case 'COMPLETED': return 'default'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load packages. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const packages = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Photography Packages</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your photography bookings and packages
            {pagination && ` (${pagination.totalCount} total)`}
          </p>
        </div>
        <Link href="/admin/packages/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            New Package
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search packages by title or client name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: e.target.value as PackageStatus || undefined,
                    page: 1
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Event Type</label>
                <select
                  value={filters.eventType || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    eventType: e.target.value || undefined,
                    page: 1
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {EVENT_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Sort By</label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as PackageFilters['sortBy']
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="eventDate">Event Date</option>
                  <option value="title">Title</option>
                  <option value="totalPrice">Price</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Order</label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortOrder: e.target.value as 'asc' | 'desc'
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* Packages Grid */}
      {!isLoading && packages.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No packages found</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {filters.search || filters.status || filters.eventType
                ? 'Try adjusting your search or filters'
                : 'Create your first photography package to get started'}
            </p>
            <Link href="/admin/packages/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Package
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        !isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Link key={pkg.id} href={`/admin/packages/${pkg.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1 truncate">{pkg.title}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">{pkg.client.name}</p>
                      </div>
                      <Badge variant={getStatusVariant(pkg.status)} size="sm">
                        {STATUS_LABELS[pkg.status]}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-600 dark:text-neutral-400">Event Type</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                          {pkg.eventType || 'N/A'}
                        </span>
                      </div>
                      {pkg.eventDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Date</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {format(new Date(pkg.eventDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      {pkg.shoots && pkg.shoots.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Shoots</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {pkg.shoots.length} scheduled
                          </span>
                        </div>
                      )}
                      {pkg.totalPrice !== null && pkg.totalPrice !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <span className="text-neutral-600 dark:text-neutral-400">Total</span>
                          <span className="text-lg font-bold text-amber-600">
                            ${pkg.totalPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount} packages
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!pagination.hasMore}
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
