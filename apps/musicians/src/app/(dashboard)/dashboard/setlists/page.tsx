'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Sparkles,
  Music,
  Clock,
  Calendar,
  MoreVertical,
} from 'lucide-react'

// Mock data
const mockSetlists = [
  {
    id: '1',
    name: 'Wedding - Smith & Johnson',
    status: 'finalized',
    gigId: '1',
    totalDuration: 180,
    songCount: 24,
    mood: 'romantic',
    aiGenerated: true,
    createdAt: '2026-01-15',
    gigDate: '2026-02-15',
  },
  {
    id: '2',
    name: 'Corporate Event Mix',
    status: 'draft',
    gigId: '2',
    totalDuration: 120,
    songCount: 18,
    mood: 'energetic',
    aiGenerated: true,
    createdAt: '2026-01-18',
    gigDate: '2026-02-20',
  },
  {
    id: '3',
    name: 'Summer Party Classics',
    status: 'finalized',
    gigId: null,
    totalDuration: 240,
    songCount: 32,
    mood: 'party',
    aiGenerated: false,
    createdAt: '2025-12-10',
    gigDate: null,
  },
  {
    id: '4',
    name: 'Jazz Club Set',
    status: 'performed',
    gigId: '5',
    totalDuration: 90,
    songCount: 12,
    mood: 'chill',
    aiGenerated: false,
    createdAt: '2025-12-15',
    gigDate: '2025-12-20',
  },
]

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  finalized: 'bg-green-100 text-green-700',
  performed: 'bg-blue-100 text-blue-700',
}

const statusLabels = {
  draft: 'Draft',
  finalized: 'Finalized',
  performed: 'Performed',
}

const moodEmojis = {
  romantic: '💕',
  energetic: '⚡',
  party: '🎉',
  chill: '😌',
  mixed: '🎭',
}

export default function SetlistsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSetlists = mockSetlists.filter((setlist) =>
    setlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setlists</h1>
          <p className="text-gray-600 mt-1">
            Manage your performance setlists and song selections
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/setlists/new">
              <Plus className="w-4 h-4 mr-2" />
              New Setlist
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/setlists/generate">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search setlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Setlists</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {mockSetlists.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Finalized</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {mockSetlists.filter((s) => s.status === 'finalized').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">AI Generated</div>
          <div className="text-2xl font-bold text-primary-600 mt-1">
            {mockSetlists.filter((s) => s.aiGenerated).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Songs</div>
          <div className="text-2xl font-bold text-secondary-600 mt-1">
            {mockSetlists.reduce((sum, s) => sum + s.songCount, 0)}
          </div>
        </Card>
      </div>

      {/* Setlists grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSetlists.length === 0 ? (
          <Card className="p-12 text-center md:col-span-2 lg:col-span-3">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No setlists found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Create your first setlist to get started'}
            </p>
            {!searchQuery && (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/setlists/new">Create Manually</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard/setlists/generate">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          filteredSetlists.map((setlist) => (
            <Link key={setlist.id} href={`/dashboard/setlists/${setlist.id}`}>
              <Card className="p-6 hover:border-primary-300 hover:shadow-md transition cursor-pointer h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {setlist.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[setlist.status as keyof typeof statusColors]
                        }`}
                      >
                        {statusLabels[setlist.status as keyof typeof statusLabels]}
                      </span>
                      {setlist.aiGenerated && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    onClick={(e) => {
                      e.preventDefault()
                      // Handle menu
                    }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{setlist.songCount} songs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{setlist.totalDuration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {moodEmojis[setlist.mood as keyof typeof moodEmojis]}
                    </span>
                    <span className="capitalize">{setlist.mood}</span>
                  </div>
                  {setlist.gigDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(setlist.gigDate).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
