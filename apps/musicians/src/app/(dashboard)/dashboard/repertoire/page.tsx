'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search, Music, Clock, Tag, TrendingUp } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

// Mock data
const mockSongs = [
  {
    id: '1',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    genre: 'Pop',
    mood: 'romantic',
    duration: 281,
    key: 'D',
    bpm: 79,
    timesPerformed: 45,
    tags: ['wedding', 'slow dance'],
  },
  {
    id: '2',
    title: 'Uptown Funk',
    artist: 'Bruno Mars',
    genre: 'Funk',
    mood: 'energetic',
    duration: 270,
    key: 'Dm',
    bpm: 115,
    timesPerformed: 38,
    tags: ['party', 'dance'],
  },
  {
    id: '3',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    genre: 'Pop',
    mood: 'romantic',
    duration: 263,
    key: 'Ab',
    bpm: 95,
    timesPerformed: 52,
    tags: ['wedding', 'first dance'],
  },
  {
    id: '4',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    genre: 'Pop',
    mood: 'party',
    duration: 234,
    key: 'C#m',
    bpm: 96,
    timesPerformed: 41,
    tags: ['dance', 'upbeat'],
  },
  {
    id: '5',
    title: 'Can\'t Stop the Feeling',
    artist: 'Justin Timberlake',
    genre: 'Pop',
    mood: 'party',
    duration: 236,
    key: 'C',
    bpm: 113,
    timesPerformed: 36,
    tags: ['party', 'feel-good'],
  },
]

const moodColors = {
  romantic: 'bg-pink-100 text-pink-700',
  energetic: 'bg-orange-100 text-orange-700',
  party: 'bg-purple-100 text-purple-700',
  chill: 'bg-blue-100 text-blue-700',
}

export default function RepertoirePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('all')

  const filteredSongs = mockSongs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMood = moodFilter === 'all' || song.mood === moodFilter
    return matchesSearch && matchesMood
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repertoire</h1>
          <p className="text-gray-600 mt-1">
            Manage your song catalog and performance history
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/repertoire/import">Import CSV</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/repertoire/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Song
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by song, artist, or genre..."
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
            <option value="all">All Moods</option>
            <option value="romantic">Romantic</option>
            <option value="energetic">Energetic</option>
            <option value="party">Party</option>
            <option value="chill">Chill</option>
          </select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Songs</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockSongs.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Most Performed</div>
          <div className="text-xl font-bold text-primary-600 mt-1 truncate">
            {mockSongs.sort((a, b) => b.timesPerformed - a.timesPerformed)[0]?.title}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Duration</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {Math.floor(mockSongs.reduce((sum, s) => sum + s.duration, 0) / 60)} min
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Genres</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {new Set(mockSongs.map((s) => s.genre)).size}
          </div>
        </Card>
      </div>

      {/* Songs table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Song
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 hidden md:table-cell">
                  Genre
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Mood
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">
                  Key / BPM
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 hidden sm:table-cell">
                  Duration
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900">
                  Performed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No songs found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || moodFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Add your first song to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => (
                  <tr
                    key={song.id}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-600">{song.artist}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 hidden md:table-cell">
                      {song.genre}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                          moodColors[song.mood as keyof typeof moodColors]
                        }`}
                      >
                        {song.mood}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 hidden lg:table-cell">
                      {song.key} • {song.bpm} BPM
                    </td>
                    <td className="p-4 text-sm text-gray-600 hidden sm:table-cell">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-primary-600" />
                        <span className="font-semibold text-gray-900">
                          {song.timesPerformed}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
