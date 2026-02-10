/**
 * Admin Extras Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Gift, Plus } from 'lucide-react'
import { Badge, Button, Card } from '@vertigo/ui'

export default function AdminExtrasPage() {
  const [extras, setExtras] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchExtras()
  }, [])

  async function fetchExtras() {
    try {
      const response = await fetch('/api/extras')
      const data = await response.json()
      setExtras(data)
    } catch (error) {
      console.error('Error fetching extras:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, any> = {
      costume: 'default',
      decoration: 'default',
      food: 'success',
      photo: 'info',
      other: 'default',
    }
    return <Badge variant={variants[category] || 'default'}>{category}</Badge>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Extra doplňky</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa doplňkových služeb</p>
        </div>
        <Button>
          <Plus className="w-5 h-5 mr-2" />
          Nový doplněk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {extras.map((extra) => (
          <Card key={extra.id}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-partypal-pink-100 to-sky-100 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-partypal-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                      {extra.name}
                    </h3>
                    {getCategoryBadge(extra.category)}
                  </div>
                </div>
              </div>

              {extra.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {extra.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <span className="text-2xl font-bold text-partypal-pink-600">
                  {extra.price.toLocaleString('cs-CZ')} Kč
                </span>
                <Button variant="outline" size="sm">
                  Upravit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {extras.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Žádné doplňky
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Začněte přidáním prvního doplňku
            </p>
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Přidat doplněk
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
