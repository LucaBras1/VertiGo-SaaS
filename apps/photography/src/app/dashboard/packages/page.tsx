'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Plus, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { format } from 'date-fns'

interface Package {
  id: string
  title: string
  status: string
  eventType: string
  eventDate: string | null
  totalPrice: number | null
  client: {
    name: string
  }
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(search.toLowerCase()) ||
    pkg.client.name.toLowerCase().includes(search.toLowerCase())
  )

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

  if (isLoading) {
    return <div className="text-center py-12">Loading packages...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photography Packages</h1>
          <p className="text-gray-600 mt-1">Manage your photography bookings and packages</p>
        </div>
        <Link href="/dashboard/packages/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            New Package
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search packages by title or client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary">
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600 mb-4">
              {search ? 'Try adjusting your search terms' : 'Create your first photography package to get started'}
            </p>
            <Link href="/dashboard/packages/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Package
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Link key={pkg.id} href={`/dashboard/packages/${pkg.id}`}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{pkg.title}</h3>
                    <p className="text-sm text-gray-600">{pkg.client.name}</p>
                  </div>
                  <Badge variant={getStatusVariant(pkg.status)} size="sm">
                    {pkg.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Event Type</span>
                    <span className="font-medium text-gray-900">{pkg.eventType || 'N/A'}</span>
                  </div>
                  {pkg.eventDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium text-gray-900">
                        {format(new Date(pkg.eventDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {pkg.totalPrice && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Total</span>
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
      )}
    </div>
  )
}
