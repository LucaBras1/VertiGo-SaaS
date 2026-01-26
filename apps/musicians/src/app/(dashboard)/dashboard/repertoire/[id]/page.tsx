'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Music, Clock, Gauge, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
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
  difficulty?: string
  vocals?: string
  timesPerformed: number
  spotifyUrl?: string
  youtubeUrl?: string
  notes?: string
}

const moodLabels: Record<string, string> = {
  energetic: 'Energická',
  romantic: 'Romantická',
  chill: 'Klidná',
  party: 'Párty',
}

export default function SongDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSong()
  }, [params.id])

  const fetchSong = async () => {
    try {
      const response = await fetch(`/api/repertoire/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/dashboard/repertoire')
          return
        }
        throw new Error('Failed to fetch')
      }
      setSong(await response.json())
    } catch (error) {
      toast.error('Nepodařilo se načíst píseň')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/repertoire/${params.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Píseň smazána')
      router.push('/dashboard/repertoire')
    } catch (error) {
      toast.error('Nepodařilo se smazat píseň')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  }

  if (!song) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/repertoire" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět na repertoár
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{song.title}</h1>
          {song.artist && <p className="text-gray-600 mt-1">{song.artist}</p>}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/repertoire/${song.id}/edit`}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Upravit</Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Smazat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Detaily</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Délka</p>
                <p className="font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(song.duration)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Žánr</p>
                <p className="font-medium">{song.genre || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nálada</p>
                <p className="font-medium">{song.mood ? moodLabels[song.mood] || song.mood : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tónina</p>
                <p className="font-medium">{song.key || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BPM</p>
                <p className="font-medium flex items-center gap-1">
                  <Gauge className="h-4 w-4" />
                  {song.bpm || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Obtížnost</p>
                <p className="font-medium">{song.difficulty || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vokály</p>
                <p className="font-medium">{song.vocals || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Zahráno</p>
                <p className="font-medium">{song.timesPerformed}x</p>
              </div>
            </CardContent>
          </Card>

          {song.notes && (
            <Card>
              <CardHeader><CardTitle>Poznámky</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{song.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {(song.spotifyUrl || song.youtubeUrl) && (
            <Card>
              <CardHeader><CardTitle>Odkazy</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {song.spotifyUrl && (
                  <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    Spotify
                  </a>
                )}
                {song.youtubeUrl && (
                  <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-600 hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    YouTube
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader><DialogTitle>Smazat píseň?</DialogTitle></DialogHeader>
        <DialogContent><p>Opravdu chcete smazat píseň "{song.title}"?</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Zrušit</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>Smazat</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
