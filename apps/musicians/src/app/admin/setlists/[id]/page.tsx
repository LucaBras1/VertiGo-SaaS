'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Music, Clock, Sparkles, Activity } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import EnergyFlowChart from '@/components/charts/EnergyFlowChart'
import { calculateAverageEnergy, getEnergyLabel } from '@/lib/utils/energy'
import toast from 'react-hot-toast'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@vertigo/ui'

interface SetlistSong {
  id: string
  title: string
  artist?: string
  duration: number
  key?: string
  bpm?: number
  mood?: string
  order: number
}

interface Setlist {
  id: string
  name: string
  status: string
  totalDuration: number
  mood?: string
  songs: SetlistSong[]
  aiGenerated: boolean
  notes?: string
  gig?: { id: string; title: string }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' }> = {
  DRAFT: { label: 'Rozpracovaný', variant: 'warning' },
  FINALIZED: { label: 'Finální', variant: 'success' },
  PERFORMED: { label: 'Odehraný', variant: 'default' },
}

const moodLabels: Record<string, string> = {
  energetic: 'Energická',
  party: 'Párty',
  romantic: 'Romantická',
  chill: 'Klidná',
  mixed: 'Smíšená',
}

export default function SetlistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [setlist, setSetlist] = useState<Setlist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSetlist()
  }, [params.id])

  const fetchSetlist = async () => {
    try {
      const response = await fetch(`/api/setlists/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/setlists')
          return
        }
        throw new Error('Failed to fetch')
      }
      setSetlist(await response.json())
    } catch (error) {
      toast.error('Nepodařilo se načíst setlist')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/setlists/${params.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Setlist smazán')
      router.push('/admin/setlists')
    } catch (error) {
      toast.error('Nepodařilo se smazat setlist')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/setlists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update')
      setSetlist(await response.json())
      toast.success('Status aktualizován')
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat')
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

  if (!setlist) return null

  const songs = (setlist.songs as SetlistSong[]) || []
  const status = statusConfig[setlist.status] || statusConfig.DRAFT
  const totalSeconds = songs.reduce((sum, s) => sum + s.duration, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/setlists" className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět na setlisty
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{setlist.name}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
            {setlist.aiGenerated && (
              <Badge variant="info"><Sparkles className="h-3 w-3 mr-1" />AI</Badge>
            )}
          </div>
          {setlist.gig && (
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Pro gig: <Link href={`/admin/gigs/${setlist.gig.id}`} className="text-primary-600 hover:underline">{setlist.gig.title}</Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/setlists/${setlist.id}/edit`}>
            <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Upravit</Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Smazat
          </Button>
        </div>
      </div>

      {/* Status Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Změnit status:</span>
            {Object.entries(statusConfig).map(([key, config]) => (
              <Button
                key={key}
                variant={setlist.status === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(key)}
                disabled={setlist.status === key}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy Flow Chart */}
      {songs.length > 0 && (
        <EnergyFlowChart songs={songs} title="Průběh energie setlistu" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Písně ({songs.length})
              </CardTitle>
              <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(totalSeconds)}
              </span>
            </CardHeader>
            <CardContent>
              {songs.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">Žádné písně</p>
              ) : (
                <ol className="space-y-2">
                  {songs.sort((a, b) => a.order - b.order).map((song, index) => (
                    <li key={song.id} className="flex items-center gap-4 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <span className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-700 rounded-full font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{song.title}</p>
                        {song.artist && <p className="text-sm text-neutral-500 dark:text-neutral-400">{song.artist}</p>}
                      </div>
                      <div className="text-right text-sm text-neutral-500 dark:text-neutral-400">
                        <p>{formatDuration(song.duration)}</p>
                        <div className="flex items-center gap-2 justify-end">
                          {song.key && <span>{song.key}</span>}
                          {song.bpm && <span className="text-xs">{song.bpm} BPM</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Detaily</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Nálada:</span>
                <span>{setlist.mood ? moodLabels[setlist.mood] || setlist.mood : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Délka:</span>
                <span>{setlist.totalDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Písní:</span>
                <span>{songs.length}</span>
              </div>
              {songs.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Energie:
                  </span>
                  <span>{getEnergyLabel(calculateAverageEnergy(songs))}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {setlist.notes && (
            <Card>
              <CardHeader><CardTitle>Poznámky</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm">{setlist.notes}</p></CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader><DialogTitle>Smazat setlist?</DialogTitle></DialogHeader>
        <DialogContent><p>Opravdu chcete smazat setlist &quot;{setlist.name}&quot;?</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Zrušit</Button>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>Smazat</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
