/**
 * Admin Activities List Page
 * Display and manage all activities
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Plus, Edit, Trash2, Eye, Zap } from 'lucide-react'

interface Activity {
  id: string
  title: string
  slug: string
  category: string
  status: string
  featured: boolean
  safetyRating: string
  energyLevel?: string
  duration: number
  ageAppropriate: string[]
  createdAt: string
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    try {
      const response = await fetch('/api/activities')
      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Opravdu chcete smazat tuto aktivitu?')) return

    try {
      await fetch(`/api/activities/${id}`, { method: 'DELETE' })
      fetchActivities()
    } catch (error) {
      console.error('Error deleting activity:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info'> = {
      published: 'success',
      draft: 'warning',
      archived: 'info',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getSafetyBadge = (rating: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      VERY_SAFE: 'success',
      SAFE: 'success',
      REQUIRES_SUPERVISION: 'warning',
    }
    return <Badge variant={variants[rating] || 'default'} size="sm">{rating}</Badge>
  }

  const getEnergyLevel = (level?: string) => {
    if (!level) return null
    const icons = { CALM: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 }
    const count = icons[level as keyof typeof icons] || 0
    return (
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <Zap key={i} className="w-3 h-3 fill-partypal-yellow-500 text-partypal-yellow-500" />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aktivity</h1>
          <p className="text-gray-600 mt-1">Spravujte party aktivity</p>
        </div>
        <Link href="/admin/activities/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nová aktivita
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <Card key={activity.id} variant="outlined" className="flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activity.duration} minut
                  </p>
                </div>
                {getStatusBadge(activity.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bezpečnost:</span>
                  {getSafetyBadge(activity.safetyRating)}
                </div>
                {activity.energyLevel && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Energie:</span>
                    {getEnergyLevel(activity.energyLevel)}
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-3">
                  {activity.ageAppropriate.map((age) => (
                    <Badge key={age} variant="info" size="sm">
                      {age}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex items-center justify-between">
              <Link href={`/activities/${activity.slug}`} target="_blank">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-1.5" />
                  Zobrazit
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Link href={`/admin/activities/${activity.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(activity.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Žádné aktivity
            </h3>
            <p className="text-gray-600 mb-6">
              Začněte vytvořením první aktivity
            </p>
            <Link href="/admin/activities/new">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Vytvořit aktivitu
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
