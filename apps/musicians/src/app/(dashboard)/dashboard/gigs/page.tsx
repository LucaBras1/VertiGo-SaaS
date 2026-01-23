'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Music,
  DollarSign,
  MapPin,
  MoreVertical,
} from 'lucide-react'

// Mock data
const mockGigs = [
  {
    id: '1',
    title: 'Wedding - Smith & Johnson',
    eventType: 'wedding',
    status: 'confirmed',
    date: '2026-02-15',
    venue: 'Grand Hotel Prague',
    city: 'Prague',
    price: 45000,
    client: 'Emma Smith',
  },
  {
    id: '2',
    title: 'Corporate Event - Tech Corp',
    eventType: 'corporate',
    status: 'confirmed',
    date: '2026-02-20',
    venue: 'Conference Center',
    city: 'Brno',
    price: 38000,
    client: 'Tech Corp Ltd.',
  },
  {
    id: '3',
    title: 'Private Birthday Party',
    eventType: 'party',
    status: 'quote_sent',
    date: '2026-02-28',
    venue: 'Villa Richter',
    city: 'Prague',
    price: 35000,
    client: 'John Doe',
  },
  {
    id: '4',
    title: 'Jazz Club Performance',
    eventType: 'concert',
    status: 'inquiry',
    date: '2026-03-05',
    venue: 'Jazz Republic',
    city: 'Prague',
    price: null,
    client: 'Jazz Republic',
  },
  {
    id: '5',
    title: 'Music Festival',
    eventType: 'festival',
    status: 'completed',
    date: '2025-12-20',
    venue: 'Metronome Festival',
    city: 'Prague',
    price: 65000,
    client: 'Festival Production',
  },
]

const statusColors = {
  inquiry: 'bg-gray-100 text-gray-700',
  quote_sent: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels = {
  inquiry: 'Inquiry',
  quote_sent: 'Quote Sent',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function GigsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredGigs = mockGigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || gig.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gigs</h1>
          <p className="text-gray-600 mt-1">Manage your bookings and performances</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gigs/new">
            <Plus className="w-4 h-4 mr-2" />
            New Gig
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search gigs by name, venue, or client..."
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
              <option value="all">All Status</option>
              <option value="inquiry">Inquiry</option>
              <option value="quote_sent">Quote Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
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
          <div className="text-sm text-gray-600">Total Gigs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockGigs.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Confirmed</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {mockGigs.filter((g) => g.status === 'confirmed').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {
              mockGigs.filter(
                (g) => g.status === 'inquiry' || g.status === 'quote_sent'
              ).length
            }
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {mockGigs
              .filter((g) => g.price)
              .reduce((sum, g) => sum + (g.price || 0), 0)
              .toLocaleString('cs-CZ')}{' '}
            CZK
          </div>
        </Card>
      </div>

      {/* Gigs list */}
      <div className="space-y-3">
        {filteredGigs.length === 0 ? (
          <Card className="p-12 text-center">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No gigs found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first gig'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href="/dashboard/gigs/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Gig
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          filteredGigs.map((gig) => (
            <Link key={gig.id} href={`/dashboard/gigs/${gig.id}`}>
              <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {gig.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[gig.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[gig.status as keyof typeof statusLabels]}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(gig.date).toLocaleDateString('cs-CZ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{gig.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        <span className="capitalize">{gig.eventType}</span>
                      </div>
                      {gig.price && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-gray-900">
                            {gig.price.toLocaleString('cs-CZ')} CZK
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    onClick={(e) => {
                      e.preventDefault()
                      // Handle menu open
                    }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
