'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Music, Clock, TrendingUp } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Song {
  id: string
  title: string
  artist?: string
  genre?: string
  mood?: string
  duration: number
  key?: string
  bpm?: number
  timesPerformed: number
}

const moodConfig: Record<string, { label: string; variant: 'default' | 'danger' | 'warning' | 'info' }> = {
  romantic: { label: 'Romantická', variant: 'danger' },
  energetic: { label: 'Energická', variant: 'warning' },
  party: { label: 'Párty', variant: 'info' },
  chill: { label: 'Klidná', variant: 'default' },
}

export default function RepertoirePage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('all')

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/repertoire')
      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs || [])
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst repertoár')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMood = moodFilter === 'all' || song.mood === moodFilter
    return matchesSearch && matchesMood
  })

  const stats = {
    total: songs.length,
    mostPerformed: songs.length > 0 ? songs.sort((a, b) => b.timesPerformed - a.timesPerformed)[0]?.title : '-',
    totalDuration: Math.floor(songs.reduce((sum, s) => sum + s.duration, 0) / 60),
    genres: new Set(songs.map(s => s.genre).filter(Boolean)).size,
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Repertoár</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Správa vašeho katalogu písní
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/repertoire/import">Import CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/repertoire/new">
              <Plus className="w-4 h-4 mr-2" />
              Přidat píseň
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Hledat podle názvu, interpreta nebo žánru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Všechny nálady</option>
            <option value="romantic">Romantická</option>
            <option value="energetic">Energická</option>
            <option value="party">Párty</option>
            <option value="chill">Klidná</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Celkem písní</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Nejhranější</div>
          <div className="text-xl font-bold text-primary-600 mt-1 truncate">{stats.mostPerformed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Celková délka</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stats.totalDuration} min</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Žánry</div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{stats.genres}</div>
        </Card>
      </div>

      {/* Songs table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-neutral-50 dark:bg-neutral-950">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Píseň</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 hidden md:table-cell">Žánr</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Nálada</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 hidden lg:table-cell">Tónina / BPM</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 hidden sm:table-cell">Délka</th>
                <th className="text-left p-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Odehráno</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Music className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      Žádné písně nenalezeny
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      {searchQuery || moodFilter !== 'all'
                        ? 'Zkuste upravit filtry'
                        : 'Přidejte první píseň'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => {
                  const mood = moodConfig[song.mood || ''] || moodConfig.chill
                  return (
                    <tr
                      key={song.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition"
                      onClick={() => window.location.href = `/admin/repertoire/${song.id}`}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">{song.title}</div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">{song.artist || '-'}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400 hidden md:table-cell">
                        {song.genre || '-'}
                      </td>
                      <td className="p-4">
                        {song.mood ? (
                          <Badge variant={mood.variant}>{mood.label}</Badge>
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400 hidden lg:table-cell">
                        {song.key || '-'} {song.bpm ? `• ${song.bpm} BPM` : ''}
                      </td>
                      <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400 hidden sm:table-cell">
                        {formatDuration(song.duration)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-primary-600" />
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{song.timesPerformed}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
