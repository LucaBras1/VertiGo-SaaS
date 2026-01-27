'use client'

import { useState, useEffect } from 'react'
import { Award, Loader2, RefreshCw, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { BadgeDisplay } from './BadgeDisplay'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: string
  earnedAt?: string
  notified?: boolean
}

interface BadgeGridProps {
  clientId?: string
  showAvailable?: boolean
  onBadgeClick?: (badge: Badge) => void
}

export function BadgeGrid({
  clientId,
  showAvailable = true,
  onBadgeClick,
}: BadgeGridProps) {
  const [earned, setEarned] = useState<Badge[]>([])
  const [available, setAvailable] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const fetchBadges = async () => {
    try {
      if (clientId) {
        const response = await fetch(`/api/clients/${clientId}/badges`)
        if (!response.ok) throw new Error('Failed to fetch badges')
        const data = await response.json()
        setEarned(data.earned)
        setAvailable(data.available)
      } else {
        const response = await fetch('/api/badges?includeStats=true')
        if (!response.ok) throw new Error('Failed to fetch badges')
        const data = await response.json()
        setEarned(data.badges.filter((b: Badge & { earnedCount?: number }) => b.earnedCount && b.earnedCount > 0))
        setAvailable(data.badges.filter((b: Badge & { earnedCount?: number }) => !b.earnedCount || b.earnedCount === 0))
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
      toast.error('Chyba při načítání odznaků')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [clientId])

  const checkBadges = async () => {
    if (!clientId) return
    setChecking(true)
    try {
      const response = await fetch(`/api/clients/${clientId}/badges`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.awarded?.length > 0) {
        toast.success(`Získány nové odznaky: ${data.awarded.join(', ')}`)
        fetchBadges()
      } else {
        toast.success('Žádné nové odznaky')
      }
    } catch (error) {
      console.error('Error checking badges:', error)
      toast.error('Chyba při kontrole odznaků')
    } finally {
      setChecking(false)
    }
  }

  const seedDefaults = async () => {
    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedDefaults: true }),
      })
      const data = await response.json()
      toast.success(data.message)
      fetchBadges()
    } catch (error) {
      console.error('Error seeding badges:', error)
      toast.error('Chyba při vytváření odznaků')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const isEmpty = earned.length === 0 && available.length === 0

  if (isEmpty) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné odznaky</h3>
        <p className="mt-1 text-sm text-gray-500">
          Začněte vytvořením výchozích odznaků.
        </p>
        <button
          onClick={seedDefaults}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Vytvořit výchozí odznaky
        </button>
      </div>
    )
  }

  const groupByCategory = (badges: Badge[]) => {
    return badges.reduce((acc, badge) => {
      const category = badge.category || 'other'
      if (!acc[category]) acc[category] = []
      acc[category].push(badge)
      return acc
    }, {} as Record<string, Badge[]>)
  }

  const categoryLabels: Record<string, string> = {
    consistency: 'Pravidelnost',
    progress: 'Pokrok',
    milestone: 'Milníky',
    social: 'Sociální',
    other: 'Ostatní',
  }

  const earnedByCategory = groupByCategory(earned)
  const availableByCategory = groupByCategory(available)

  return (
    <div className="space-y-8">
      {/* Header with check button */}
      {clientId && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {earned.length} z {earned.length + available.length} odznaků
            </p>
          </div>
          <button
            onClick={checkBadges}
            disabled={checking}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            Zkontrolovat
          </button>
        </div>
      )}

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Získané odznaky ({earned.length})
          </h3>
          {Object.entries(earnedByCategory).map(([category, badges]) => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                {categoryLabels[category] || category}
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => onBadgeClick?.(badge)}
                    className={onBadgeClick ? 'cursor-pointer' : ''}
                  >
                    <BadgeDisplay
                      name={badge.name}
                      description={badge.description}
                      icon={badge.icon}
                      color={badge.color}
                      earned={true}
                      earnedAt={badge.earnedAt}
                      size="md"
                      showDescription={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Badges */}
      {showAvailable && available.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4">
            Dostupné odznaky ({available.length})
          </h3>
          {Object.entries(availableByCategory).map(([category, badges]) => (
            <div key={category} className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-3">
                {categoryLabels[category] || category}
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => onBadgeClick?.(badge)}
                    className={onBadgeClick ? 'cursor-pointer' : ''}
                  >
                    <BadgeDisplay
                      name={badge.name}
                      description={badge.description}
                      icon={badge.icon}
                      color={badge.color}
                      earned={false}
                      size="md"
                      showDescription={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
