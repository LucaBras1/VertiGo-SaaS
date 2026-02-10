'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectOption } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  order?: number
}

const moods: SelectOption[] = [
  { value: 'energetic', label: 'Energická' },
  { value: 'romantic', label: 'Romantická' },
  { value: 'chill', label: 'Klidná' },
  { value: 'mixed', label: 'Smíšená' },
]

const statuses: SelectOption[] = [
  { value: 'DRAFT', label: 'Rozpracovaný' },
  { value: 'FINALIZED', label: 'Finální' },
  { value: 'PERFORMED', label: 'Odehraný' },
]

export default function EditSetlistPage() {
  const params = useParams()
  const router = useRouter()

  const [name, setName] = useState('')
  const [mood, setMood] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [notes, setNotes] = useState('')
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/setlists/${params.id}`).then(r => r.ok ? r.json() : null),
      fetch('/api/repertoire').then(r => r.json()),
    ]).then(([setlistData, songsData]) => {
      if (!setlistData) {
        router.push('/admin/setlists')
        return
      }
      setName(setlistData.name || '')
      setMood(setlistData.mood || '')
      setStatus(setlistData.status || 'DRAFT')
      setNotes(setlistData.notes || '')
      setSelectedSongs(setlistData.songs || [])
      setAvailableSongs(songsData.songs || [])
      setIsFetching(false)
    }).catch(() => {
      toast.error('Nepodařilo se načíst data')
      setIsFetching(false)
    })
  }, [params.id, router])

  const addSong = (song: Song) => {
    if (!selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, { ...song, order: selectedSongs.length }])
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
      const response = await fetch(`/api/setlists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mood: mood || undefined,
          status,
          notes: notes || undefined,
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

      if (!response.ok) throw new Error('Failed to update')

      toast.success('Setlist aktualizován')
      router.push(`/admin/setlists/${params.id}`)
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat setlist')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/setlists/${params.id}`} className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na detail
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Upravit setlist</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Upravte skladbu setlistu</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Základní údaje</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <Label>Status</Label>
                    <Select
                      options={statuses}
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Poznámky</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Interní poznámky k setlistu..."
                  />
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
                Uložit změny
              </Button>
            </div>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader><CardTitle>Repertoár</CardTitle></CardHeader>
              <CardContent>
                {availableSongs.length === 0 ? (
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
