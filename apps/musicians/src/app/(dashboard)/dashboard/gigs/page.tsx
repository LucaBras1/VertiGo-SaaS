'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Music,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Gig {
  id: string
  title: string
  eventType: string
  status: string
  eventDate: string
  venueName?: string
  venueCity?: string
  agreedPrice?: number
  customer?: {
    firstName: string
    lastName: string
    company?: string
  }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'danger' | 'info' }> = {
  INQUIRY: { label: 'Poptávka', variant: 'default' },
  QUOTE_SENT: { label: 'Nabídka odeslána', variant: 'warning' },
  CONFIRMED: { label: 'Potvrzeno', variant: 'success' },
  COMPLETED: { label: 'Dokončeno', variant: 'info' },
  CANCELLED: { label: 'Zrušeno', variant: 'danger' },
}

const eventTypeLabels: Record<string, string> = {
  wedding: 'Svatba',
  corporate: 'Firemní akce',
  party: 'Párty',
  concert: 'Koncert',
  festival: 'Festival',
  other: 'Jiné',
}

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchGigs()
  }, [])

  const fetchGigs = async () => {
    try {
      const response = await fetch('/api/gigs')
      if (response.ok) {
        const data = await response.json()
        setGigs(data.gigs || [])
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst gigy')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || gig.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: gigs.length,
    confirmed: gigs.filter(g => g.status === 'CONFIRMED').length,
    pending: gigs.filter(g => g.status === 'INQUIRY' || g.status === 'QUOTE_SENT').length,
    totalValue: gigs.filter(g => g.agreedPrice).reduce((sum, g) => sum + (g.agreedPrice || 0), 0),
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
          <h1 className="text-3xl font-bold text-gray-900">Gigy</h1>
          <p className="text-gray-600 mt-1">Správa vašich zakázek a vystoupení</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gigs/new">
            <Plus className="w-4 h-4 mr-2" />
            Nový gig
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Hledat podle názvu, místa nebo klienta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Všechny stavy</option>
              <option value="INQUIRY">Poptávka</option>
              <option value="QUOTE_SENT">Nabídka odeslána</option>
              <option value="CONFIRMED">Potvrzeno</option>
              <option value="COMPLETED">Dokončeno</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Celkem gigů</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Potvrzeno</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Čeká</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Celková hodnota</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {formatCurrency(stats.totalValue / 100)}
          </div>
        </Card>
      </div>

      {/* Gigs list */}
      <div className="space-y-3">
        {filteredGigs.length === 0 ? (
          <Card className="p-12 text-center">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Žádné gigy nenalezeny
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Zkuste upravit filtry'
                : 'Začněte vytvořením prvního gigu'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/dashboard/gigs/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Vytvořit první gig
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          filteredGigs.map((gig) => {
            const status = statusConfig[gig.status] || statusConfig.INQUIRY
            return (
              <Link key={gig.id} href={`/dashboard/gigs/${gig.id}`}>
                <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {gig.title}
                        </h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(new Date(gig.eventDate))}</span>
                        </div>
                        {gig.venueName && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{gig.venueName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          <span>{eventTypeLabels[gig.eventType] || gig.eventType}</span>
                        </div>
                        {gig.agreedPrice && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(gig.agreedPrice / 100)}
                            </span>
                          </div>
                        )}
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
