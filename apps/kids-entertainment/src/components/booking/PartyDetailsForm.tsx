/**
 * Party Details Form Component
 * Step 2: Date, time, venue, and guest count
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { Button, Card, Input } from '@vertigo/ui'

const partyDetailsSchema = z.object({
  date: z.string().min(1, 'Vyberte datum oslavy'),
  startTime: z.string().min(1, 'Vyberte čas začátku'),
  venueName: z.string().min(2, 'Zadejte název místa'),
  venueAddress: z.string().min(5, 'Zadejte adresu'),
  venueCity: z.string().min(2, 'Zadejte město'),
  venueType: z.enum(['home', 'venue', 'outdoor']),
  guestCount: z.number().min(1, 'Zadejte počet hostů').max(50, 'Maximum je 50 hostů'),
  specialRequests: z.string().optional(),
})

export type PartyDetailsData = z.infer<typeof partyDetailsSchema>

interface PartyDetailsFormProps {
  defaultValues?: Partial<PartyDetailsData>
  onSubmit: (data: PartyDetailsData) => void
  onBack: () => void
}

export function PartyDetailsForm({
  defaultValues,
  onSubmit,
  onBack,
}: PartyDetailsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartyDetailsData>({
    resolver: zodResolver(partyDetailsSchema),
    defaultValues: {
      venueType: 'home',
      guestCount: 10,
      ...defaultValues,
    },
  })

  const venueType = watch('venueType')

  // Calculate minimum date (14 days from now)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 14)
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Datum a čas
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum oslavy *
            </label>
            <Input
              type="date"
              min={minDateString}
              {...register('date')}
              error={errors.date?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Čas začátku *
            </label>
            <Input
              type="time"
              {...register('startTime')}
              error={errors.startTime?.message}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Místo konání
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typ místa *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="home"
                {...register('venueType')}
                className="mr-2 text-partypal-pink-500 focus:ring-partypal-pink-500"
              />
              <span>Doma</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="venue"
                {...register('venueType')}
                className="mr-2 text-partypal-pink-500 focus:ring-partypal-pink-500"
              />
              <span>Pronajatý prostor</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="outdoor"
                {...register('venueType')}
                className="mr-2 text-partypal-pink-500 focus:ring-partypal-pink-500"
              />
              <span>Venku</span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Název místa *
            </label>
            <Input
              placeholder={venueType === 'home' ? 'Např. Náš dům' : 'Např. Kavárna U Veselého slona'}
              {...register('venueName')}
              error={errors.venueName?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresa *
            </label>
            <Input
              placeholder="Ulice a číslo popisné"
              {...register('venueAddress')}
              error={errors.venueAddress?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Město *
            </label>
            <Input
              placeholder="Praha"
              {...register('venueCity')}
              error={errors.venueCity?.message}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Hosté
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Počet dětí (hostů) *
            </label>
            <Input
              type="number"
              min={1}
              max={50}
              {...register('guestCount', { valueAsNumber: true })}
              error={errors.guestCount?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              Včetně narozeninového dítěte
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Speciální požadavky
        </h3>
        <textarea
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-partypal-pink-500 focus:ring-partypal-pink-500"
          rows={3}
          placeholder="Máte nějaké speciální požadavky nebo poznámky? (volitelné)"
          {...register('specialRequests')}
        />
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Zpět
        </Button>
        <Button type="submit" size="lg">
          Pokračovat
        </Button>
      </div>
    </form>
  )
}
