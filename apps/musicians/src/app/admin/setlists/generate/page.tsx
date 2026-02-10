'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Music,
  Clock,
  Users,
  Calendar,
  Loader2,
  ArrowLeft,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@vertigo/ui'

interface RepertoireSong {
  id: string
  title: string
  artist?: string
  duration: number
  genre?: string
  mood?: string
  bpm?: number
  key?: string
}

interface GeneratedSong {
  order: number
  title: string
  artist?: string
  duration: number
  key?: string
  bpm?: number
  mood: string
  notes?: string
  reason: string
}

interface GeneratedSet {
  setNumber: number
  duration: number
  songs: GeneratedSong[]
  totalDuration: number
  energyLevel: string
  transitionNotes?: string
}

interface GeneratedSetlist {
  sets: GeneratedSet[]
  totalDuration: number
  moodProgression: string
  recommendations: string[]
  contingencyPlan?: {
    extraSongs: string[]
    songsToSkip: string[]
  }
}

const eventTypeLabels: Record<string, string> = {
  wedding: 'Svatba',
  corporate: 'Firemní akce',
  party: 'Soukromá párty',
  concert: 'Koncert',
  festival: 'Festival',
}

const moodLabels: Record<string, string> = {
  energetic: 'Energická',
  romantic: 'Romantická',
  chill: 'Klidná',
  party: 'Párty',
  mixed: 'Smíšená',
}

const moodColors: Record<string, string> = {
  energetic: 'bg-orange-100 text-orange-700',
  romantic: 'bg-pink-100 text-pink-700',
  chill: 'bg-blue-100 text-blue-700',
  party: 'bg-purple-100 text-purple-700',
  mixed: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
}

export default function GenerateSetlistPage() {
  const router = useRouter()
  const [repertoire, setRepertoire] = useState<RepertoireSong[]>([])
  const [isLoadingRepertoire, setIsLoadingRepertoire] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedSetlist, setGeneratedSetlist] = useState<GeneratedSetlist | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    eventType: 'wedding' as const,
    duration: 180,
    numberOfSets: 2,
    breakDuration: 15,
    mood: 'mixed' as const,
    audienceAge: '25-45',
    venueType: 'indoor' as const,
    setlistName: '',
  })

  // Fetch real repertoire on mount
  useEffect(() => {
    fetchRepertoire()
  }, [])

  const fetchRepertoire = async () => {
    setIsLoadingRepertoire(true)
    try {
      const response = await fetch('/api/repertoire')
      if (!response.ok) throw new Error('Failed to fetch repertoire')
      const data = await response.json()
      setRepertoire(data.songs || [])
    } catch (err) {
      console.error('Failed to fetch repertoire:', err)
      toast.error('Nepodařilo se načíst repertoár')
    } finally {
      setIsLoadingRepertoire(false)
    }
  }

  const handleGenerate = async () => {
    if (repertoire.length === 0) {
      setError('Nemáte žádné písně v repertoáru. Přidejte nejprve písně.')
      return
    }

    if (repertoire.length < 5) {
      setError('Pro generování setlistu potřebujete alespoň 5 písní v repertoáru.')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)
      setGeneratedSetlist(null)

      const response = await fetch('/api/ai/setlist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: formData.eventType,
          duration: formData.duration,
          numberOfSets: formData.numberOfSets,
          breakDuration: formData.breakDuration,
          mood: formData.mood,
          audienceAge: formData.audienceAge,
          venueType: formData.venueType,
          repertoire: repertoire.map((song) => ({
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            genre: song.genre,
            mood: song.mood,
            bpm: song.bpm,
            key: song.key,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate setlist')
      }

      const result = await response.json()
      setGeneratedSetlist(result.data)
      toast.success('Setlist vygenerován!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate setlist')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedSetlist) return

    const name = formData.setlistName.trim() || `${eventTypeLabels[formData.eventType]} - ${new Date().toLocaleDateString('cs-CZ')}`

    try {
      setIsSaving(true)

      // Flatten all songs from all sets with proper order
      const allSongs: Array<{
        id: string
        title: string
        artist?: string
        duration: number
        key?: string
        bpm?: number
        notes?: string
        order: number
      }> = []

      let globalOrder = 0
      generatedSetlist.sets.forEach((set) => {
        set.songs.forEach((song) => {
          // Find matching song ID from repertoire
          const repertoireSong = repertoire.find(
            (r) => r.title.toLowerCase() === song.title.toLowerCase()
          )

          allSongs.push({
            id: repertoireSong?.id || `generated-${globalOrder}`,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            key: song.key,
            bpm: song.bpm,
            notes: song.notes || song.reason,
            order: globalOrder++,
          })
        })
      })

      const response = await fetch('/api/setlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          totalDuration: generatedSetlist.totalDuration * 60, // Convert to seconds
          mood: formData.mood,
          songs: allSongs,
          aiGenerated: true,
          aiPrompt: JSON.stringify({
            eventType: formData.eventType,
            duration: formData.duration,
            numberOfSets: formData.numberOfSets,
            mood: formData.mood,
            moodProgression: generatedSetlist.moodProgression,
            recommendations: generatedSetlist.recommendations,
          }),
          notes: `Automaticky vygenerováno pro ${eventTypeLabels[formData.eventType]}\n\nMood progression: ${generatedSetlist.moodProgression}\n\nDoporučení:\n${generatedSetlist.recommendations.map((r) => `• ${r}`).join('\n')}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save setlist')
      }

      const savedSetlist = await response.json()
      toast.success('Setlist uložen!')
      router.push(`/admin/setlists/${savedSetlist.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nepodařilo se uložit setlist')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const totalRepertoireDuration = repertoire.reduce((sum, song) => sum + song.duration, 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/admin/setlists"
          className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zpět na setlisty
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary-600" />
          Generovat AI Setlist
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          AI vytvoří optimální setlist na základě vašeho repertoáru a parametrů akce
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detaily akce
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Typ akce
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value as typeof formData.eventType })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isGenerating}
                >
                  <option value="wedding">Svatba</option>
                  <option value="corporate">Firemní akce</option>
                  <option value="party">Soukromá párty</option>
                  <option value="concert">Koncert</option>
                  <option value="festival">Festival</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Délka (minut)
                  </label>
                  <Input
                    type="number"
                    min="30"
                    max="480"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 180 })}
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <Music className="w-4 h-4 inline mr-1" />
                    Počet setů
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.numberOfSets}
                    onChange={(e) => setFormData({ ...formData, numberOfSets: parseInt(e.target.value) || 2 })}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Požadovaná atmosféra
                  </label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value as typeof formData.mood })}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={isGenerating}
                  >
                    <option value="energetic">Energická</option>
                    <option value="romantic">Romantická</option>
                    <option value="chill">Klidná</option>
                    <option value="party">Párty</option>
                    <option value="mixed">Smíšená</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Věk publika
                  </label>
                  <Input
                    placeholder="např. 25-45"
                    value={formData.audienceAge}
                    onChange={(e) => setFormData({ ...formData, audienceAge: e.target.value })}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Typ prostoru
                </label>
                <select
                  value={formData.venueType}
                  onChange={(e) => setFormData({ ...formData, venueType: e.target.value as typeof formData.venueType })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isGenerating}
                >
                  <option value="indoor">Interiér</option>
                  <option value="outdoor">Exteriér</option>
                  <option value="club">Klub</option>
                  <option value="theater">Divadlo/Sál</option>
                  <option value="restaurant">Restaurace</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Repertoire Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Váš repertoár
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRepertoire ? (
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Načítám repertoár...
                </div>
              ) : repertoire.length === 0 ? (
                <div className="text-center py-4">
                  <Music className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-600 dark:text-neutral-400">Nemáte žádné písně v repertoáru</p>
                  <Button variant="outline" className="mt-3" asChild>
                    <Link href="/admin/repertoire/new">Přidat písně</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Počet písní:</span>
                    <span className="font-medium">{repertoire.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Celková délka:</span>
                    <span className="font-medium">{Math.floor(totalRepertoireDuration / 60)} min</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['energetic', 'romantic', 'chill', 'party'].map((mood) => {
                      const count = repertoire.filter((s) => s.mood === mood).length
                      if (count === 0) return null
                      return (
                        <Badge key={mood} className={moodColors[mood]}>
                          {moodLabels[mood]}: {count}
                        </Badge>
                      )
                    })}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Písně budou vybrány na základě atmosféry, tempa a energie
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full"
            disabled={isGenerating || isLoadingRepertoire || repertoire.length < 5}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generuji setlist...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Vygenerovat setlist
              </>
            )}
          </Button>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {generatedSetlist ? (
            <>
              {/* Save Section */}
              <Card className="border-primary-200 bg-primary-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Check className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-900">Setlist připraven k uložení</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Název setlistu
                      </label>
                      <Input
                        placeholder={`${eventTypeLabels[formData.eventType]} - ${new Date().toLocaleDateString('cs-CZ')}`}
                        value={formData.setlistName}
                        onChange={(e) => setFormData({ ...formData, setlistName: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Uložit setlist
                      </Button>
                      <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Sets Preview */}
              {generatedSetlist.sets.map((set) => (
                <Card key={set.setNumber}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span>Set {set.setNumber}</span>
                      <div className="flex items-center gap-2 text-sm font-normal">
                        <Badge
                          variant={set.energyLevel === 'high' ? 'success' : set.energyLevel === 'medium' ? 'warning' : 'default'}
                        >
                          {set.energyLevel === 'high' ? 'Vysoká energie' : set.energyLevel === 'medium' ? 'Střední energie' : 'Nízká energie'}
                        </Badge>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {Math.floor(set.totalDuration / 60)} min
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {set.songs.map((song, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs flex items-center justify-center">
                              {song.order + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm">{song.title}</p>
                              {song.artist && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{song.artist}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${moodColors[song.mood] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'} text-xs`}>
                              {moodLabels[song.mood] || song.mood}
                            </Badge>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              {formatDuration(song.duration)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {set.transitionNotes && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 italic">
                        {set.transitionNotes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Recommendations */}
              {generatedSetlist.recommendations.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Doporučení</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedSetlist.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                    {generatedSetlist.moodProgression && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 pt-4 border-t">
                        <span className="font-medium">Průběh atmosféry: </span>
                        {generatedSetlist.moodProgression}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Sparkles className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  Vyplňte parametry a klikněte na &quot;Vygenerovat setlist&quot;
                </p>
                <p className="text-sm text-neutral-400 mt-2">
                  AI vytvoří optimální playlist s ohledem na energii a atmosféru
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
