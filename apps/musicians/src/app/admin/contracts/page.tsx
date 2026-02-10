'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  MoreVertical,
  Loader2,
  Calendar,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@vertigo/ui'

interface Contract {
  id: string
  contractNumber: string
  title: string
  status: string
  language: string
  createdAt: string
  sentAt?: string
  signedAt?: string
  clientInfo: {
    name: string
    company?: string
  }
  eventDetails: {
    title: string
    date: string
  }
  financialTerms: {
    totalPrice: number
    currency: string
  }
  gig?: {
    id: string
    title: string
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Koncept', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300' },
  SENT: { label: 'Odesláno', color: 'bg-blue-100 text-blue-700' },
  SIGNED: { label: 'Podepsáno', color: 'bg-green-100 text-green-700' },
  ACTIVE: { label: 'Aktivní', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'Dokončeno', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Zrušeno', color: 'bg-red-100 text-red-700' },
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)

        const res = await fetch(`/api/contracts?${params}`)
        const data = await res.json()

        if (data.success) {
          setContracts(data.data.contracts)
        }
      } catch (error) {
        console.error('Failed to load contracts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [statusFilter])

  const filteredContracts = contracts.filter(c => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      c.title.toLowerCase().includes(term) ||
      c.contractNumber.toLowerCase().includes(term) ||
      c.clientInfo.name.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Smlouvy</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa smluv a dokumentů</p>
        </div>
        <Link href="/admin/contracts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nová smlouva
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Hledat smlouvy..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Všechny stavy</option>
              <option value="DRAFT">Koncepty</option>
              <option value="SENT">Odeslané</option>
              <option value="SIGNED">Podepsané</option>
              <option value="ACTIVE">Aktivní</option>
              <option value="COMPLETED">Dokončené</option>
              <option value="CANCELLED">Zrušené</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : filteredContracts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              {search || statusFilter ? 'Žádné smlouvy nenalezeny' : 'Zatím nemáte žádné smlouvy'}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {search || statusFilter
                ? 'Zkuste změnit vyhledávání nebo filtry'
                : 'Vytvořte svou první smlouvu pro gig'}
            </p>
            {!search && !statusFilter && (
              <Link href="/admin/contracts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Vytvořit smlouvu
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredContracts.map((contract) => {
            const status = STATUS_LABELS[contract.status] || STATUS_LABELS.DRAFT

            return (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-3 bg-primary-50 rounded-lg flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/admin/contracts/${contract.id}`}
                            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 truncate"
                          >
                            {contract.title}
                          </Link>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {contract.contractNumber}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {contract.clientInfo.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(contract.eventDetails.date).toLocaleDateString('cs-CZ')}
                          </span>
                          <span className="font-medium">
                            {contract.financialTerms.totalPrice.toLocaleString('cs-CZ')} {contract.financialTerms.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={`/api/contracts/${contract.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <Link href={`/admin/contracts/${contract.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
