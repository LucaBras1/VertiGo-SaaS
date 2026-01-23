/**
 * Customers Page
 * List and manage customers
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Mail, Phone, Building2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()

      if (data.success) {
        setCustomers(data.data)
      } else {
        toast.error('Nepodařilo se načíst zákazníky')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Nastala chyba při načítání zákazníků')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.organization && customer.organization.toLowerCase().includes(query))
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítám zákazníky...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zákazníci</h1>
          <p className="text-gray-600 mt-2">Správa kontaktů a organizací</p>
        </div>
        <Link href="/admin/customers/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nový zákazník
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat zákazníka..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Celkem zákazníků</div>
          <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">S organizací</div>
          <div className="text-3xl font-bold text-gray-900">
            {customers.filter((c) => c.organization).length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">S objednávkami</div>
          <div className="text-3xl font-bold text-gray-900">
            {customers.filter((c) => c._count.orders > 0).length}
          </div>
        </Card>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? 'Žádní zákazníci nenalezeni' : 'Zatím žádní zákazníci'}
              </p>
              {!searchQuery && (
                <Link href="/admin/customers/new">
                  <Button className="mt-4">
                    <Plus className="w-5 h-5 mr-2" />
                    Přidat prvního zákazníka
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          filteredCustomers.map((customer) => (
            <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
              <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      {customer.organization && (
                        <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm font-medium rounded-full">
                          {customer.organization}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.industryType && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{customer.industryType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {customer._count.orders > 0 && (
                        <div className="mb-1">
                          <span className="font-semibold text-cyan-600">
                            {customer._count.orders}
                          </span>{' '}
                          objednávek
                        </div>
                      )}
                      {customer._count.invoices > 0 && (
                        <div>
                          <span className="font-semibold text-emerald-600">
                            {customer._count.invoices}
                          </span>{' '}
                          faktur
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
