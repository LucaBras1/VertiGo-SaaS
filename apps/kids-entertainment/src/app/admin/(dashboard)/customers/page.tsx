/**
 * Admin Customers Page
 * View and manage customer database
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Mail,
  Phone,
  Calendar,
  Search,
  Users,
  Baby,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
} from 'lucide-react'

interface Child {
  name: string
  age?: number
  birthday?: string
  interests?: string
  allergies?: string[]
}

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  organization?: string
  organizationType?: string
  children?: Child[]
  preferredThemes?: string[]
  totalPartiesBooked: number
  lastPartyDate?: string
  lifetimeValue: number
  createdAt: string
  _count?: {
    orders: number
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)

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

  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.organization?.toLowerCase().includes(query)
    )
  })

  const toggleExpanded = (id: string) => {
    setExpandedCustomer(expandedCustomer === id ? null : id)
  }

  const getTierBadge = (lifetimeValue: number) => {
    if (lifetimeValue >= 5000000) {
      return <Badge variant="pink" size="sm"><Star className="h-3 w-3 mr-1" />VIP</Badge>
    }
    if (lifetimeValue >= 2000000) {
      return <Badge variant="success" size="sm">Premium</Badge>
    }
    return null
  }

  // Calculate stats
  const totalCustomers = customers.length
  const totalLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0)
  const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0
  const repeatCustomers = customers.filter((c) => c.totalPartiesBooked > 1).length

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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Zákazníci</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa zákaznické databáze</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="outlined" className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-partypal-pink-500 mr-3" />
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkem</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalCustomers}</p>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkové tržby</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {(totalLTV / 100).toLocaleString('cs-CZ')} Kč
              </p>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="p-4">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Opakovaní</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{repeatCustomers}</p>
            </div>
          </div>
        </Card>
        <Card variant="outlined" className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Průměrné LTV</p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {(avgLTV / 100).toLocaleString('cs-CZ')} Kč
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        <Input
          placeholder="Hledat podle jména, emailu, telefonu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.map((customer) => {
          const isExpanded = expandedCustomer === customer.id
          const children = customer.children as Child[] | undefined

          return (
            <Card key={customer.id} variant="outlined" className="overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => toggleExpanded(customer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      {getTierBadge(customer.lifetimeValue)}
                      {customer.organization && (
                        <Badge variant="info" size="sm">{customer.organization}</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                      <a
                        href={`mailto:${customer.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center hover:text-partypal-pink-600"
                      >
                        <Mail className="w-4 h-4 mr-1.5" />
                        {customer.email}
                      </a>
                      {customer.phone && (
                        <a
                          href={`tel:${customer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center hover:text-partypal-pink-600"
                        >
                          <Phone className="w-4 h-4 mr-1.5" />
                          {customer.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-partypal-pink-600">
                        {(customer.lifetimeValue / 100).toLocaleString('cs-CZ')} Kč
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {customer.totalPartiesBooked} oslav
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t bg-neutral-50 dark:bg-neutral-950 p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Children */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center">
                        <Baby className="h-4 w-4 mr-2 text-partypal-pink-500" />
                        Děti
                      </h4>
                      {children && children.length > 0 ? (
                        <div className="space-y-3">
                          {children.map((child, index) => (
                            <div key={index} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border">
                              <p className="font-medium">
                                {child.name}
                                {child.age && <span className="text-neutral-500 dark:text-neutral-400"> ({child.age} let)</span>}
                              </p>
                              {child.interests && (
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                  Zájmy: {child.interests}
                                </p>
                              )}
                              {child.allergies && child.allergies.length > 0 && (
                                <div className="flex items-center mt-2 text-sm text-amber-700">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Alergie: {child.allergies.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Žádné děti v záznamu</p>
                      )}
                    </div>

                    {/* History & Preferences */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-partypal-pink-500" />
                        Historie a preference
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Počet oslav:</span>
                          <span className="font-medium">{customer.totalPartiesBooked}</span>
                        </div>
                        {customer.lastPartyDate && (
                          <div className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">Poslední oslava:</span>
                            <span className="font-medium">
                              {new Date(customer.lastPartyDate).toLocaleDateString('cs-CZ')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-neutral-600 dark:text-neutral-400">Zákazníkem od:</span>
                          <span className="font-medium">
                            {new Date(customer.createdAt).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                      </div>

                      {customer.preferredThemes && customer.preferredThemes.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Oblíbená témata:</p>
                          <div className="flex flex-wrap gap-1">
                            {customer.preferredThemes.map((theme, i) => (
                              <Badge key={i} variant="default" size="sm">{theme}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-1" />
                      Napsat email
                    </Button>
                    <Button size="sm">
                      Vytvořit rezervaci
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-neutral-500 dark:text-neutral-400">
            <Users className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
            <p className="text-lg font-medium">Žádní zákazníci</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'Zkuste upravit vyhledávací dotaz'
                : 'Zákazníci se vytvoří automaticky při rezervaci'}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
