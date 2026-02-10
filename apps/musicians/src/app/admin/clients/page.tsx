'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Users, Mail, Phone, MapPin, Building } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Button, Card, Input, Badge } from '@vertigo/ui'

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  type: string
  city?: string
  _count?: {
    gigs: number
    invoices: number
  }
}

const typeConfig: Record<string, { label: string; variant: 'default' | 'info' | 'success' }> = {
  INDIVIDUAL: { label: 'Soukromá osoba', variant: 'default' },
  CORPORATE: { label: 'Firma', variant: 'info' },
  VENUE: { label: 'Podnik', variant: 'success' },
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst klienty')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.city?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || client.type === typeFilter
    return matchesSearch && matchesType
  })

  const stats = {
    total: clients.length,
    active: clients.filter(c => (c._count?.gigs || 0) > 0).length,
    repeat: clients.filter(c => (c._count?.gigs || 0) > 1).length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Klienti</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Správa klientů a historie zakázek
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="w-4 h-4 mr-2" />
            Přidat klienta
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Hledat klienty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Všechny typy</option>
            <option value="INDIVIDUAL">Soukromá osoba</option>
            <option value="CORPORATE">Firma</option>
            <option value="VENUE">Podnik</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Celkem klientů</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Aktivní klienti</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Opakovaní klienti</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">{stats.repeat}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Firmy</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {clients.filter(c => c.type === 'CORPORATE').length}
          </div>
        </Card>
      </div>

      {/* Clients grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredClients.length === 0 ? (
          <Card className="p-12 text-center md:col-span-2">
            <Users className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Žádní klienti nenalezeni
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {searchQuery || typeFilter !== 'all'
                ? 'Zkuste upravit filtry'
                : 'Přidejte prvního klienta'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Button asChild>
                <Link href="/admin/clients/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat prvního klienta
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          filteredClients.map((client) => {
            const type = typeConfig[client.type] || typeConfig.INDIVIDUAL
            return (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        {client.firstName} {client.lastName}
                      </h3>
                      <Badge variant={type.variant}>{type.label}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>{client.company}</span>
                      </div>
                    )}
                    {client.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{client.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Gigy</div>
                      <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {client._count?.gigs || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Faktury</div>
                      <div className="text-lg font-semibold text-primary-600">
                        {client._count?.invoices || 0}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
