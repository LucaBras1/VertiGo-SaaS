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
  Sparkles,
  Music,
  Clock,
  Calendar,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Setlist {
  id: string
  name: string
  status: string
  totalDuration: number
  mood?: string
  aiGenerated: boolean
  songs?: { id: string }[]
  gig?: {
    id: string
    title: string
    eventDate: string
  }
  createdAt: string
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' }> = {
  DRAFT: { label: 'Rozpracovaný', variant: 'warning' },
  FINALIZED: { label: 'Finální', variant: 'success' },
  PERFORMED: { label: 'Odehraný', variant: 'default' },
}

const moodEmojis: Record<string, string> = {
  romantic: '💕',
  energetic: '⚡',
  party: '🎉',
  chill: '😌',
  mixed: '🎭',
}

const moodLabels: Record<string, string> = {
  romantic: 'Romantická',
  energetic: 'Energická',
  party: 'Párty',
  chill: 'Klidná',
  mixed: 'Smíšená',
}

export default function SetlistsPage() {
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSetlists()
  }, [])

  const fetchSetlists = async () => {
    try {
      const response = await fetch('/api/setlists')
      if (response.ok) {
        const data = await response.json()
        setSetlists(data.setlists || [])
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst setlisty')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSetlists = setlists.filter((setlist) =>
    setlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: setlists.length,
    finalized: setlists.filter(s => s.status === 'FINALIZED').length,
    aiGenerated: setlists.filter(s => s.aiGenerated).length,
    totalSongs: setlists.reduce((sum, s) => sum + (s.songs?.length || 0), 0),
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Setlisty</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Správa setlistů pro vaše vystoupení
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/setlists/new">
              <Plus className="w-4 h-4 mr-2" />
              Nový setlist
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/setlists/generate">
              <Sparkles className="w-4 h-4 mr-2" />
              AI generovat
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Hledat setlisty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Celkem setlistů</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Finální</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.finalized}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">AI generované</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">{stats.aiGenerated}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Celkem písní</div>
          <div className="text-2xl font-bold text-secondary-600 mt-1">{stats.totalSongs}</div>
        </Card>
      </div>

      {/* Setlists grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSetlists.length === 0 ? (
          <Card className="p-12 text-center md:col-span-2 lg:col-span-3">
            <Music className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Žádné setlisty nenalezeny
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {searchQuery
                ? 'Zkuste upravit vyhledávání'
                : 'Vytvořte první setlist'}
            </p>
            {!searchQuery && (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/setlists/new">Vytvořit manuálně</Link>
                </Button>
                <Button asChild>
                  <Link href="/admin/setlists/generate">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI generovat
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          filteredSetlists.map((setlist) => {
            const status = statusConfig[setlist.status] || statusConfig.DRAFT
            return (
              <Link key={setlist.id} href={`/admin/setlists/${setlist.id}`}>
                <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        {setlist.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {setlist.aiGenerated && (
                          <Badge variant="info">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span>{setlist.songs?.length || 0} písní</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{setlist.totalDuration} minut</span>
                    </div>
                    {setlist.mood && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{moodEmojis[setlist.mood] || '🎵'}</span>
                        <span>{moodLabels[setlist.mood] || setlist.mood}</span>
                      </div>
                    )}
                    {setlist.gig && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(new Date(setlist.gig.eventDate))}</span>
                      </div>
                    )}
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
