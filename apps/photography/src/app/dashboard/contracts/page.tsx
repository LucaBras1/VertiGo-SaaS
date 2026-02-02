'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ContractList } from '@/components/contracts/ContractList'
import type { Contract, Client, Package, ContractStatus } from '@/generated/prisma'

interface ContractWithRelations extends Contract {
  client: Client | null
  package: Package | null
}

const STATUS_OPTIONS: { value: ContractStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'VIEWED', label: 'Viewed' },
  { value: 'SIGNED', label: 'Signed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
]

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('')

  const fetchContracts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (searchInput) params.set('search', searchInput)
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/contracts?${params}`)
      if (!res.ok) throw new Error('Failed to fetch contracts')

      const data = await res.json()
      setContracts(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts')
    } finally {
      setIsLoading(false)
    }
  }, [searchInput, statusFilter])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handleSearch = () => {
    fetchContracts()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Stats
  const stats = {
    total: contracts.length,
    draft: contracts.filter((c) => c.status === 'DRAFT').length,
    pending: contracts.filter((c) => ['SENT', 'VIEWED'].includes(c.status)).length,
    signed: contracts.filter((c) => c.status === 'SIGNED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-gray-600">Manage client contracts and agreements</p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Pending Signature</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Signed</p>
          <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search contracts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContractStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Content */}
      {error ? (
        <Card className="p-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchContracts}>Try Again</Button>
        </Card>
      ) : isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-gray-500 mt-4">Loading contracts...</p>
        </Card>
      ) : (
        <ContractList contracts={contracts} onRefresh={fetchContracts} />
      )}
    </div>
  )
}
