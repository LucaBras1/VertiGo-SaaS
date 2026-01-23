/**
 * Admin Parties Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, MapPin, Users } from 'lucide-react'

export default function AdminPartiesPage() {
  const [parties, setParties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchParties()
  }, [])

  async function fetchParties() {
    try {
      const response = await fetch('/api/parties')
      const data = await response.json()
      setParties(data)
    } catch (error) {
      console.error('Error fetching parties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      confirmed: 'success',
      inquiry: 'warning',
      completed: 'info',
      cancelled: 'danger',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Oslavy</h1>
        <p className="text-gray-600 mt-1">Správa party akcí</p>
      </div>

      <div className="space-y-4">
        {parties.map((party) => (
          <Card key={party.id} variant="outlined">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {party.childName}
                  </h3>
                  {party.theme && (
                    <p className="text-sm text-partypal-pink-600">
                      Téma: {party.theme}
                    </p>
                  )}
                </div>
                {getStatusBadge(party.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(party.date).toLocaleString('cs-CZ')}
                </div>
                {party.guestCount && (
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {party.guestCount} hostů
                  </div>
                )}
                {party.venue && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {party.venue.name || party.venue.type}
                  </div>
                )}
              </div>

              {party.specialRequests && (
                <div className="mt-4 p-3 bg-sky-50 rounded-lg text-sm text-gray-700">
                  <strong>Speciální požadavky:</strong> {party.specialRequests}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {parties.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-gray-500">Žádné oslavy</div>
        </Card>
      )}
    </div>
  )
}
