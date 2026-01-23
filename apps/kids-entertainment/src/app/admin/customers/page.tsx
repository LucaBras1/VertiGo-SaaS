/**
 * Admin Customers Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Mail, Phone, Calendar } from 'lucide-react'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Zákazníci</h1>
        <p className="text-gray-600 mt-1">Správa zákaznické databáze</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Card key={customer.id} variant="outlined">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Mail className="w-4 h-4 mr-1.5" />
                    {customer.email}
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Phone className="w-4 h-4 mr-1.5" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Oslavy:</span>
                  <Badge variant="pink" size="sm">
                    {customer._count?.parties || 0}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Objednávky:</span>
                  <Badge variant="info" size="sm">
                    {customer._count?.orders || 0}
                  </Badge>
                </div>
                {customer.lifetimeValue > 0 && (
                  <div className="flex justify-between font-semibold text-partypal-pink-600 mt-3">
                    <span>LTV:</span>
                    <span>{customer.lifetimeValue.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                )}
              </div>

              {customer.lastPartyDate && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  Poslední oslava:{' '}
                  {new Date(customer.lastPartyDate).toLocaleDateString('cs-CZ')}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            Žádní zákazníci v databázi
          </div>
        </Card>
      )}
    </div>
  )
}
