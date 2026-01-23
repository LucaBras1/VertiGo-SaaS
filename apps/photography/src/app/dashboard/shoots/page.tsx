'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Plus, Search, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { format } from 'date-fns'

interface Shoot {
  id: string
  date: string
  startTime: string
  endTime: string
  venueName: string | null
  venueAddress: string | null
  package: {
    title: string
    eventType: string
    client: {
      name: string
    }
  }
}

export default function ShootsPage() {
  const [shoots, setShoots] = useState<Shoot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchShoots()
  }, [])

  const fetchShoots = async () => {
    try {
      const res = await fetch('/api/shoots')
      const data = await res.json()
      setShoots(data)
    } catch (error) {
      console.error('Failed to fetch shoots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredShoots = shoots.filter(shoot =>
    shoot.package.client.name.toLowerCase().includes(search.toLowerCase()) ||
    shoot.package.title.toLowerCase().includes(search.toLowerCase())
  )

  const upcomingShoots = filteredShoots.filter(s => new Date(s.date) >= new Date())
  const pastShoots = filteredShoots.filter(s => new Date(s.date) < new Date())

  if (isLoading) {
    return <div className="text-center py-12">Loading shoots...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photography Shoots</h1>
          <p className="text-gray-600 mt-1">Manage your scheduled photo sessions</p>
        </div>
        <Link href="/dashboard/shoots/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Schedule Shoot
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search shoots by client or package..."
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

      {/* Upcoming Shoots */}
      {upcomingShoots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Shoots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingShoots.map((shoot) => (
              <ShootCard key={shoot.id} shoot={shoot} isUpcoming />
            ))}
          </div>
        </div>
      )}

      {/* Past Shoots */}
      {pastShoots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Shoots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastShoots.map((shoot) => (
              <ShootCard key={shoot.id} shoot={shoot} isUpcoming={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredShoots.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No shoots found</h3>
            <p className="text-gray-600 mb-4">
              {search ? 'Try adjusting your search terms' : 'Schedule your first shoot to get started'}
            </p>
            <Link href="/dashboard/shoots/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Schedule Shoot
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

function ShootCard({ shoot, isUpcoming }: { shoot: Shoot; isUpcoming: boolean }) {
  return (
    <Link href={`/dashboard/shoots/${shoot.id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{shoot.package.client.name}</h3>
            <p className="text-sm text-gray-600">{shoot.package.eventType}</p>
          </div>
          <Badge variant={isUpcoming ? 'success' : 'default'} size="sm">
            {format(new Date(shoot.date), 'MMM d')}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{shoot.startTime} - {shoot.endTime}</span>
          </div>
          {shoot.venueName && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{shoot.venueName}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
