/**
 * Booking Summary Component
 * Step 5: Review and submit booking
 */

'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, Baby, AlertTriangle, Phone, Package, Loader2, CheckCircle } from 'lucide-react'
import { Badge, Button, Card } from '@vertigo/ui'

interface BookingSummaryProps {
  packageData?: {
    id: string
    title: string
    price?: number
    duration: number
  }
  selectedActivities: {
    id: string
    title: string
    price?: number
    duration: number
  }[]
  partyDetails: {
    date: string
    startTime: string
    venueName: string
    venueAddress: string
    venueCity: string
    venueType: string
    guestCount: number
    specialRequests?: string
  }
  childInfo: {
    childName: string
    childAge: number
    childGender?: string
    allergies?: string
    parentName: string
    parentPhone: string
    parentEmail: string
  }
  onSubmit: () => Promise<void>
  onBack: () => void
}

export function BookingSummary({
  packageData,
  selectedActivities,
  partyDetails,
  childInfo,
  onSubmit,
  onBack,
}: BookingSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getVenueTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Doma'
      case 'venue':
        return 'Pronajatý prostor'
      case 'outdoor':
        return 'Venku'
      default:
        return type
    }
  }

  // Calculate total price
  let totalPrice = 0
  let totalDuration = 0

  if (packageData) {
    totalPrice = packageData.price || 0
    totalDuration = packageData.duration
  } else {
    selectedActivities.forEach((activity) => {
      totalPrice += activity.price || 0
      totalDuration += activity.duration
    })
  }

  // Add price per extra child if package
  if (packageData && partyDetails.guestCount > 10) {
    const extraChildren = partyDetails.guestCount - 10
    totalPrice += extraChildren * 30000 // 300 Kč per extra child
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit()
      setSubmitted(true)
    } catch (err) {
      setError('Nepodařilo se odeslat rezervaci. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Rezervace odeslána!
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Děkujeme za vaši rezervaci! Brzy vás budeme kontaktovat s potvrzením
          a dalšími detaily.
        </p>
        <div className="space-y-4">
          <Card className="p-6 max-w-md mx-auto text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Co se stane dál?</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="bg-partypal-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                Obdržíte potvrzovací email na {childInfo.parentEmail}
              </li>
              <li className="flex items-start">
                <span className="bg-partypal-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                Náš tým váš požadavek zkontroluje a potvrdí dostupnost
              </li>
              <li className="flex items-start">
                <span className="bg-partypal-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                Budeme vás kontaktovat k domluvení detailů a zálohy
              </li>
            </ol>
          </Card>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Zpět na hlavní stránku
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Souhrn rezervace</h2>
        <p className="text-gray-600 mt-2">
          Zkontrolujte prosím všechny údaje před odesláním
        </p>
      </div>

      {/* Party Name */}
      <Card className="p-6 bg-gradient-to-r from-partypal-pink-50 to-partypal-yellow-50">
        <h3 className="text-2xl font-bold text-center text-gray-900">
          {childInfo.childName} slaví {childInfo.childAge}. narozeniny!
        </h3>
      </Card>

      {/* Package/Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Vybraný program
        </h3>
        {packageData ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{packageData.title}</p>
              <p className="text-sm text-gray-500">{packageData.duration} minut</p>
            </div>
            {packageData.price && (
              <p className="text-lg font-bold text-partypal-pink-600">
                {(packageData.price / 100).toLocaleString('cs-CZ')} Kč
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.duration} minut</p>
                </div>
                {activity.price && (
                  <p className="font-medium text-gray-900">
                    {(activity.price / 100).toLocaleString('cs-CZ')} Kč
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Date & Time */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Termín
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <span>{formatDate(partyDetails.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-3" />
            <span>{partyDetails.startTime} ({totalDuration} minut)</span>
          </div>
        </div>
      </Card>

      {/* Venue */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Místo konání
        </h3>
        <div className="space-y-2">
          <p className="font-medium text-gray-900">{partyDetails.venueName}</p>
          <p className="text-gray-600">{partyDetails.venueAddress}, {partyDetails.venueCity}</p>
          <Badge variant="info">{getVenueTypeLabel(partyDetails.venueType)}</Badge>
        </div>
      </Card>

      {/* Guests & Child */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Hosté
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <Baby className="h-5 w-5 text-gray-400 mr-3" />
            <span>{childInfo.childName}, {childInfo.childAge} let</span>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <span>{partyDetails.guestCount} dětí celkem</span>
          </div>
        </div>
        {childInfo.allergies && (
          <div className="mt-4 flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Alergie:</p>
              <p className="text-sm text-amber-700">{childInfo.allergies}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Contact */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Phone className="h-5 w-5 mr-2 text-partypal-pink-500" />
          Kontakt
        </h3>
        <div className="space-y-2 text-gray-600">
          <p><strong>Jméno:</strong> {childInfo.parentName}</p>
          <p><strong>Telefon:</strong> {childInfo.parentPhone}</p>
          <p><strong>Email:</strong> {childInfo.parentEmail}</p>
        </div>
      </Card>

      {/* Special Requests */}
      {partyDetails.specialRequests && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Speciální požadavky
          </h3>
          <p className="text-gray-600">{partyDetails.specialRequests}</p>
        </Card>
      )}

      {/* Price Summary */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cenový souhrn
        </h3>
        <div className="space-y-2">
          {packageData ? (
            <>
              <div className="flex justify-between text-gray-600">
                <span>{packageData.title}</span>
                <span>{((packageData.price || 0) / 100).toLocaleString('cs-CZ')} Kč</span>
              </div>
              {partyDetails.guestCount > 10 && (
                <div className="flex justify-between text-gray-600">
                  <span>Příplatek za {partyDetails.guestCount - 10} dětí navíc</span>
                  <span>{((partyDetails.guestCount - 10) * 300).toLocaleString('cs-CZ')} Kč</span>
                </div>
              )}
            </>
          ) : (
            selectedActivities.map((activity) => (
              <div key={activity.id} className="flex justify-between text-gray-600">
                <span>{activity.title}</span>
                <span>{((activity.price || 0) / 100).toLocaleString('cs-CZ')} Kč</span>
              </div>
            ))
          )}
          <hr className="my-3" />
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Celkem</span>
            <span className="text-partypal-pink-600">
              {(totalPrice / 100).toLocaleString('cs-CZ')} Kč
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Záloha 30% bude vyžadována při potvrzení rezervace
          </p>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-red-300 bg-red-50">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Zpět
        </Button>
        <Button
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Odesílám...
            </>
          ) : (
            'Odeslat rezervaci'
          )}
        </Button>
      </div>
    </div>
  )
}
