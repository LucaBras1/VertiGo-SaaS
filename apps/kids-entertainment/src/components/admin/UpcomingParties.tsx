/**
 * Upcoming Parties Component
 * Displays list of upcoming party bookings
 */

'use client'

import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

interface Party {
  id: string
  childName: string | null
  date: Date
  guestCount: number | null
  venue: unknown
  status: string
  package?: {
    title: string
  } | null
}

export default function UpcomingParties({ parties }: { parties: Party[] }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      confirmed: 'success',
      inquiry: 'warning',
      completed: 'success',
    }
    const labels: Record<string, string> = {
      confirmed: 'Potvrzeno',
      inquiry: 'Poptávka',
      completed: 'Dokončeno',
    }
    return (
      <Badge variant={variants[status] || 'default'} size="sm">
        {labels[status] || status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nadcházející oslavy</CardTitle>
      </CardHeader>
      <CardContent>
        {parties.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Žádné nadcházející oslavy
          </p>
        ) : (
          <div className="space-y-4">
            {parties.map((party) => (
              <Link
                key={party.id}
                href={`/admin/parties/${party.id}`}
                className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {party.childName || 'Oslava'}
                    </h4>
                    {party.package && (
                      <p className="text-sm text-gray-600">
                        {party.package.title}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(party.status)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {formatDate(party.date)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1.5" />
                    {party.guestCount ?? 0} hostů
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {(() => {
                      const venue = party.venue as { type?: string; name?: string } | null
                      return venue?.name || venue?.type || 'Neuvedeno'
                    })()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
