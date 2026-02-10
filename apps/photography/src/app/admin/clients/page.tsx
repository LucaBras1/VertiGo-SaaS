'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Plus, Search, Mail, Phone, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useClients, ClientFilters, CLIENT_TYPE_LABELS } from '@/hooks/useClients'
import { Badge, Button, Card, Input } from '@vertigo/ui'

const TYPE_OPTIONS: { value: ClientFilters['type'] | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'couple', label: 'Couple' },
  { value: 'business', label: 'Business' },
]

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
]

export default function ClientsPage() {
  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })
  const [searchInput, setSearchInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, error } = useClients(filters)

  // Extract clients and pagination from server response
  const clients = data?.clients ?? []
  const pagination = data?.pagination ?? { page: 1, limit: 12, totalCount: 0, totalPages: 0, hasMore: false }
  const { page, totalCount, totalPages, hasMore, limit } = pagination

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'individual': return 'default'
      case 'couple': return 'info'
      case 'business': return 'success'
      default: return 'default'
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load clients. Please try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Clients</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your photography clients
            {totalCount > 0 && ` (${totalCount} total)`}
          </p>
        </div>
        <Link href="/admin/clients/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search clients by name or email..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Client Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    type: e.target.value as ClientFilters['type'] || undefined,
                    page: 1
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {TYPE_OPTIONS.map(opt => (
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
                    sortBy: e.target.value as ClientFilters['sortBy']
                  }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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

      {/* Clients Grid */}
      {!isLoading && clients.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No clients found</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {filters.search || filters.type
                ? 'Try adjusting your search or filters'
                : 'Add your first client to get started'}
            </p>
            <Link href="/admin/clients/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Add Client
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        !isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Link key={client.id} href={`/admin/clients/${client.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{client.name}</h3>
                        <Badge variant={getTypeVariant(client.type)} size="sm">
                          {CLIENT_TYPE_LABELS[client.type] || client.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {client.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                          {client.tags.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{client.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Showing {((page - 1) * limit) + 1} to{' '}
                  {Math.min(page * limit, totalCount)} of{' '}
                  {totalCount} clients
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!hasMore}
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
