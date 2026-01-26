'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectOption } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const songSchema = z.object({
  title: z.string().min(1, 'Název je povinný'),
  artist: z.string().optional(),
  genre: z.string().optional(),
  mood: z.string().optional(),
  durationMinutes: z.number().min(0),
  durationSeconds: z.number().min(0).max(59),
  key: z.string().optional(),
  bpm: z.number().optional(),
  difficulty: z.string().optional(),
  vocals: z.string().optional(),
  spotifyUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type SongFormData = z.infer<typeof songSchema>

interface SongFormProps {
  initialData?: Partial<SongFormData> & { id?: string; duration?: number }
  onSuccess?: () => void
}

const moods: SelectOption[] = [
  { value: 'energetic', label: 'Energická' },
  { value: 'romantic', label: 'Romantická' },
  { value: 'chill', label: 'Klidná' },
  { value: 'party', label: 'Párty' },
]

const difficulties: SelectOption[] = [
  { value: 'easy', label: 'Snadná' },
  { value: 'medium', label: 'Střední' },
  { value: 'hard', label: 'Obtížná' },
]

const vocalTypes: SelectOption[] = [
  { value: 'lead', label: 'Hlavní zpěv' },
  { value: 'harmony', label: 'Harmonie' },
  { value: 'none', label: 'Instrumentální' },
]

const genres: SelectOption[] = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'funk', label: 'Funk' },
  { value: 'soul', label: 'Soul' },
  { value: 'disco', label: 'Disco' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'folk', label: 'Folk' },
  { value: 'country', label: 'Country' },
  { value: 'classical', label: 'Klasická' },
  { value: 'other', label: 'Jiné' },
]

export function SongForm({ initialData, onSuccess }: SongFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!initialData?.id

  // Convert duration (seconds) to minutes and seconds
  const initialDuration = initialData?.duration || 0
  const initialMinutes = Math.floor(initialDuration / 60)
  const initialSeconds = initialDuration % 60

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      ...initialData,
      durationMinutes: initialMinutes,
      durationSeconds: initialSeconds,
    },
  })

  const onSubmit = async (data: SongFormData) => {
    setIsLoading(true)

    try {
      // Convert minutes and seconds to total seconds
      const duration = (data.durationMinutes * 60) + data.durationSeconds

      const payload = {
        title: data.title,
        artist: data.artist || undefined,
        genre: data.genre || undefined,
        mood: data.mood || undefined,
        duration,
        key: data.key || undefined,
        bpm: data.bpm || undefined,
        difficulty: data.difficulty || undefined,
        vocals: data.vocals || undefined,
        spotifyUrl: data.spotifyUrl || undefined,
        youtubeUrl: data.youtubeUrl || undefined,
        notes: data.notes || undefined,
      }

      const url = isEdit ? `/api/repertoire/${initialData.id}` : '/api/repertoire'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při ukládání')
      }

      const song = await response.json()
      toast.success(isEdit ? 'Píseň aktualizována' : 'Píseň přidána')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/dashboard/repertoire/${song.id}`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při ukládání')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Základní informace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label required>Název písně</Label>
              <Input
                {...register('title')}
                placeholder="Bohemian Rhapsody"
                error={errors.title?.message}
              />
            </div>
            <div>
              <Label>Interpret</Label>
              <Input
                {...register('artist')}
                placeholder="Queen"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Žánr</Label>
              <Select
                options={genres}
                placeholder="Vyberte žánr"
                {...register('genre')}
              />
            </div>
            <div>
              <Label>Nálada</Label>
              <Select
                options={moods}
                placeholder="Vyberte náladu"
                {...register('mood')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technické údaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Délka (min)</Label>
              <Input
                type="number"
                min={0}
                {...register('durationMinutes', { valueAsNumber: true })}
                placeholder="3"
              />
            </div>
            <div>
              <Label>Délka (sek)</Label>
              <Input
                type="number"
                min={0}
                max={59}
                {...register('durationSeconds', { valueAsNumber: true })}
                placeholder="45"
              />
            </div>
            <div>
              <Label>Tónina</Label>
              <Input
                {...register('key')}
                placeholder="C dur"
              />
            </div>
            <div>
              <Label>BPM</Label>
              <Input
                type="number"
                {...register('bpm', { valueAsNumber: true })}
                placeholder="120"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Obtížnost</Label>
              <Select
                options={difficulties}
                placeholder="Vyberte obtížnost"
                {...register('difficulty')}
              />
            </div>
            <div>
              <Label>Vokály</Label>
              <Select
                options={vocalTypes}
                placeholder="Vyberte typ"
                {...register('vocals')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle>Odkazy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Spotify URL</Label>
            <Input
              {...register('spotifyUrl')}
              placeholder="https://open.spotify.com/track/..."
            />
          </div>
          <div>
            <Label>YouTube URL</Label>
            <Input
              {...register('youtubeUrl')}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Poznámky</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('notes')}
            placeholder="Poznámky k písni (aranže, speciální požadavky)..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Zrušit
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Uložit změny' : 'Přidat píseň'}
        </Button>
      </div>
    </form>
  )
}
