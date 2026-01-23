'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users, Mail, Phone, MapPin, Star } from 'lucide-react'

// Mock data
const mockClients = [
  {
    id: '1',
    name: 'Emma Smith',
    email: 'emma@example.com',
    phone: '+420 123 456 789',
    type: 'individual',
    totalGigs: 3,
    totalRevenue: 135000,
    rating: 5,
    location: 'Prague',
    lastContact: '2026-01-20',
  },
  {
    id: '2',
    name: 'Tech Corp Ltd.',
    email: 'events@techcorp.com',
    phone: '+420 234 567 890',
    type: 'corporate',
    totalGigs: 5,
    totalRevenue: 245000,
    rating: 5,
    location: 'Brno',
    lastContact: '2026-01-18',
  },
  {
    id: '3',
    name: 'Grand Hotel Prague',
    email: 'bookings@grandhotel.cz',
    phone: '+420 345 678 901',
    type: 'venue',
    totalGigs: 12,
    totalRevenue: 540000,
    rating: 4,
    location: 'Prague',
    lastContact: '2026-01-15',
  },
  {
    id: '4',
    name: 'Jazz Republic',
    email: 'info@jazzrepublic.cz',
    phone: '+420 456 789 012',
    type: 'venue',
    totalGigs: 8,
    totalRevenue: 280000,
    rating: 5,
    location: 'Prague',
    lastContact: '2026-01-10',
  },
]

const typeColors = {
  individual: 'bg-blue-100 text-blue-700',
  corporate: 'bg-purple-100 text-purple-700',
  venue: 'bg-green-100 text-green-700',
}

const typeLabels = {
  individual: 'Individual',
  corporate: 'Corporate',
  venue: 'Venue',
}

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || client.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your client relationships and booking history
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
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
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
            <option value="venue">Venue</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Clients</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockClients.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Active Clients</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {mockClients.filter((c) => c.totalGigs > 0).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Repeat Clients</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {mockClients.filter((c) => c.totalGigs > 1).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Lifetime Value</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {(mockClients.reduce((sum, c) => sum + c.totalRevenue, 0) / 1000).toFixed(0)}k CZK
          </div>
        </Card>
      </div>

      {/* Clients grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredClients.length === 0 ? (
          <Card className="p-12 text-center md:col-span-2">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No clients found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first client to get started'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Button asChild>
                <Link href="/dashboard/clients/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Client
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {client.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        typeColors[client.type as keyof typeof typeColors]
                      }`}
                    >
                      {typeLabels[client.type as keyof typeof typeLabels]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {client.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{client.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-xs text-gray-500">Total Gigs</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {client.totalGigs}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Revenue</div>
                    <div className="text-lg font-semibold text-primary-600">
                      {(client.totalRevenue / 1000).toFixed(0)}k CZK
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
