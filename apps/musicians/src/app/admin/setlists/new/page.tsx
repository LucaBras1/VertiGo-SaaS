'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SortableSongList } from '@/components/setlist/SortableSongList'
import { formatDuration } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Song {
  id: string
  title: string
  artist?: string
  duration: number
  key?: string
  bpm?: number
}

const moods: SelectOption[] = [
  { value: 'energetic', label: 'Energická' },
  { value: 'romantic', label: 'Romantická' },
  { value: 'chill', label: 'Klidná' },
  { value: 'mixed', label: 'Smíšená' },
]

export default function NewSetlistPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gigId = searchParams.get('gigId')

  const [name, setName] = useState('')
  const [mood, setMood] = useState('')
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/repertoire')
      if (response.ok) {
        const data = await response.json()
        setAvailableSongs(data.songs || [])
      }
    } catch (error) {
      console.error('Failed to fetch songs')
    } finally {
      setIsFetching(false)
    }
  }

  const addSong = (song: Song) => {
    if (!selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song])
    }
  }

  const removeSong = (id: string) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== id))
  }

  const handleReorder = (reorderedSongs: Song[]) => {
    setSelectedSongs(reorderedSongs)
  }

  const totalDuration = selectedSongs.reduce((sum, s) => sum + s.duration, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || selectedSongs.length === 0) {
      toast.error('Vyplňte název a přidejte alespoň jednu píseň')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/setlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mood: mood || undefined,
          gigId: gigId || undefined,
          totalDuration: Math.ceil(totalDuration / 60),
          songs: selectedSongs.map((song, index) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            key: song.key,
            bpm: song.bpm,
            order: index,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to create')

      const setlist = await response.json()
      toast.success('Setlist vytvořen')
      router.push(`/admin/setlists/${setlist.id}`)
    } catch (error) {
      toast.error('Nepodařilo se vytvořit setlist')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/setlists" className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na setlisty
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nový setlist</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Sestavte setlist z vašeho repertoáru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Setlist builder */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Základní údaje</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label required>Název setlistu</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="např. Svatba - hlavní set"
                      required
                    />
                  </div>
                  <div>
                    <Label>Nálada</Label>
                    <Select
                      options={moods}
                      placeholder="Vyberte"
                      value={mood}
                      onChange={e => setMood(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Písně v setlistu ({selectedSongs.length})</CardTitle>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  Celková délka: {formatDuration(totalDuration)}
                </span>
              </CardHeader>
              <CardContent>
                <SortableSongList
                  songs={selectedSongs}
                  onReorder={handleReorder}
                  onRemove={removeSong}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Zrušit
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Vytvořit setlist
              </Button>
            </div>
          </div>

          {/* Right - Song picker */}
          <div>
            <Card className="sticky top-6">
              <CardHeader><CardTitle>Repertoár</CardTitle></CardHeader>
              <CardContent>
                {isFetching ? (
                  <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">Načítání...</p>
                ) : availableSongs.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-neutral-500 dark:text-neutral-400 mb-2">Žádné písně</p>
                    <Link href="/admin/repertoire/new">
                      <Button variant="outline" size="sm">Přidat píseň</Button>
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-1 max-h-[500px] overflow-y-auto">
                    {availableSongs.map(song => {
                      const isSelected = selectedSongs.some(s => s.id === song.id)
                      return (
                        <li key={song.id}>
                          <button
                            type="button"
                            onClick={() => addSong(song)}
                            disabled={isSelected}
                            className={`w-full text-left p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-primary-50 text-primary-700'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <p className="font-medium text-sm">{song.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {song.artist} • {formatDuration(song.duration)}
                            </p>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
