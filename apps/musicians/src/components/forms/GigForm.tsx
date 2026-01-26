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
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const gigSchema = z.object({
  title: z.string().min(1, 'Název je povinný'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Neplatný email').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.date().optional(),
  eventDuration: z.number().optional(),
  venueName: z.string().optional(),
  venueCity: z.string().optional(),
  venueType: z.enum(['indoor', 'outdoor']).optional(),
  audienceSize: z.number().optional(),
  bandMembers: z.number().optional(),
  numberOfSets: z.number().optional(),
  setDuration: z.number().optional(),
  basePrice: z.number().optional(),
  travelCosts: z.number().optional(),
  internalNotes: z.string().optional(),
})

type GigFormData = z.infer<typeof gigSchema>

interface GigFormProps {
  initialData?: Partial<GigFormData> & { id?: string }
  onSuccess?: () => void
}

const eventTypes: SelectOption[] = [
  { value: 'wedding', label: 'Svatba' },
  { value: 'corporate', label: 'Firemní akce' },
  { value: 'party', label: 'Soukromá párty' },
  { value: 'concert', label: 'Koncert' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Jiné' },
]

const venueTypes: SelectOption[] = [
  { value: 'indoor', label: 'Interiér' },
  { value: 'outdoor', label: 'Exteriér' },
]

export function GigForm({ initialData, onSuccess }: GigFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEdit = !!initialData?.id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GigFormData>({
    resolver: zodResolver(gigSchema),
    defaultValues: initialData || {},
  })

  const eventDate = watch('eventDate')

  const onSubmit = async (data: GigFormData) => {
    setIsLoading(true)

    try {
      const payload = {
        title: data.title,
        clientName: data.clientName || undefined,
        clientEmail: data.clientEmail || undefined,
        clientPhone: data.clientPhone || undefined,
        eventType: data.eventType || undefined,
        eventDate: data.eventDate?.toISOString(),
        eventDuration: data.eventDuration || undefined,
        venue: data.venueName ? {
          name: data.venueName,
          city: data.venueCity,
          type: data.venueType,
        } : undefined,
        audienceSize: data.audienceSize || undefined,
        bandMembers: data.bandMembers || undefined,
        numberOfSets: data.numberOfSets || undefined,
        setDuration: data.setDuration || undefined,
        basePrice: data.basePrice ? data.basePrice * 100 : undefined, // Convert to cents
        travelCosts: data.travelCosts ? data.travelCosts * 100 : undefined,
        internalNotes: data.internalNotes || undefined,
      }

      const url = isEdit ? `/api/gigs/${initialData.id}` : '/api/gigs'
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

      const gig = await response.json()
      toast.success(isEdit ? 'Gig aktualizován' : 'Gig vytvořen')

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/dashboard/gigs/${gig.id}`)
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
          <div>
            <Label required>Název akce</Label>
            <Input
              {...register('title')}
              placeholder="např. Svatba Novákovi"
              error={errors.title?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Typ akce</Label>
              <Select
                options={eventTypes}
                placeholder="Vyberte typ"
                {...register('eventType')}
              />
            </div>
            <div>
              <Label>Datum akce</Label>
              <DatePicker
                value={eventDate}
                onChange={(date) => setValue('eventDate', date)}
                placeholder="Vyberte datum"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Délka (minuty)</Label>
              <Input
                type="number"
                {...register('eventDuration', { valueAsNumber: true })}
                placeholder="180"
              />
            </div>
            <div>
              <Label>Počet setů</Label>
              <Input
                type="number"
                {...register('numberOfSets', { valueAsNumber: true })}
                placeholder="3"
              />
            </div>
            <div>
              <Label>Délka setu (min)</Label>
              <Input
                type="number"
                {...register('setDuration', { valueAsNumber: true })}
                placeholder="45"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Kontakt na klienta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Jméno klienta</Label>
            <Input
              {...register('clientName')}
              placeholder="Jan Novák"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                {...register('clientEmail')}
                placeholder="jan@example.com"
                error={errors.clientEmail?.message}
              />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input
                {...register('clientPhone')}
                placeholder="+420 123 456 789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue */}
      <Card>
        <CardHeader>
          <CardTitle>Místo konání</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Název místa</Label>
              <Input
                {...register('venueName')}
                placeholder="Hotel Grand"
              />
            </div>
            <div>
              <Label>Město</Label>
              <Input
                {...register('venueCity')}
                placeholder="Praha"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Typ prostoru</Label>
              <Select
                options={venueTypes}
                placeholder="Vyberte"
                {...register('venueType')}
              />
            </div>
            <div>
              <Label>Počet hostů</Label>
              <Input
                type="number"
                {...register('audienceSize', { valueAsNumber: true })}
                placeholder="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Cena</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Počet členů kapely</Label>
              <Input
                type="number"
                {...register('bandMembers', { valueAsNumber: true })}
                placeholder="4"
              />
            </div>
            <div>
              <Label>Základní cena (Kč)</Label>
              <Input
                type="number"
                {...register('basePrice', { valueAsNumber: true })}
                placeholder="25000"
              />
            </div>
            <div>
              <Label>Cestovné (Kč)</Label>
              <Input
                type="number"
                {...register('travelCosts', { valueAsNumber: true })}
                placeholder="2000"
              />
            </div>
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
            {...register('internalNotes')}
            placeholder="Interní poznámky k akci..."
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
          {isEdit ? 'Uložit změny' : 'Vytvořit gig'}
        </Button>
      </div>
    </form>
  )
}
