/**
 * Admin Entertainers Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Sparkles, Mail, Phone, AlertTriangle } from 'lucide-react'

export default function AdminEntertainersPage() {
  const [entertainers, setEntertainers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEntertainers()
  }, [])

  async function fetchEntertainers() {
    try {
      const response = await fetch('/api/entertainers')
      const data = await response.json()
      setEntertainers(data)
    } catch (error) {
      console.error('Error fetching entertainers:', error)
    } finally {
      setIsLoading(false)
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Animátoři</h1>
        <p className="text-gray-600 mt-1">Správa týmu animátorů</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entertainers.map((entertainer) => (
          <Card key={entertainer.id} variant="outlined">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-partypal-pink-400 to-partypal-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    {entertainer.firstName[0]}
                    {entertainer.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {entertainer.firstName} {entertainer.lastName}
                    </h3>
                    {entertainer.stageName && (
                      <p className="text-sm text-partypal-pink-600">
                        "{entertainer.stageName}"
                      </p>
                    )}
                  </div>
                </div>
                {entertainer.isActive ? (
                  <Badge variant="success" size="sm">
                    Aktivní
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Neaktivní
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {entertainer.role}
                </div>
                {entertainer.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {entertainer.email}
                  </div>
                )}
                {entertainer.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {entertainer.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {entertainer.specializations.slice(0, 3).map((spec: string) => (
                    <Badge key={spec} variant="pink" size="sm">
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  {entertainer.firstAidCertified ? (
                    <span className="text-green-600">✓ První pomoc</span>
                  ) : (
                    <span className="text-gray-400 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Bez PP
                    </span>
                  )}
                  {entertainer.backgroundCheckStatus === 'valid' ? (
                    <span className="text-green-600">✓ Prověření</span>
                  ) : (
                    <span className="text-gray-400 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Chybí
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {entertainers.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            Žádní animátoři v databázi
          </div>
        </Card>
      )}
    </div>
  )
}
