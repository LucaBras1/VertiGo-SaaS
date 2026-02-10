/**
 * Customers Page
 * List and manage customers
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ListPageHeader, SearchFilterBar } from '@vertigo/admin'
import { Button, Card, staggerContainer, staggerItem } from '@vertigo/ui'
import { Plus, Mail, Phone, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      if (data.success) { setCustomers(data.data) }
      else { toast.error('Nepodařilo se načíst zákazníky') }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Nastala chyba při načítání zákazníků')
    } finally { setIsLoading(false) }
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.organization && customer.organization.toLowerCase().includes(query))
  })
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">Načítám zákazníky...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Zákazníci"
        description="Správa kontaktů a organizací"
        actionLabel="Nový zákazník"
        actionHref="/admin/customers/new"
        actionIcon={Plus}
      />

      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Hledat zákazníka..."
      />

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: 'Celkem zákazníků', value: customers.length, color: 'text-brand-600' },
          { label: 'S organizací', value: customers.filter((c) => c.organization).length, color: 'text-violet-600' },
          { label: 'S objednávkami', value: customers.filter((c) => c._count.orders > 0).length, color: 'text-success-600' },
        ].map((s) => (
          <motion.div key={s.label} variants={staggerItem}>
            <Card className="p-5">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            {searchQuery ? 'Žádní zákazníci nenalezeni' : 'Zatím žádní zákazníci'}
          </p>
          {!searchQuery && (
            <Link href="/admin/customers/new">
              <Button className="mt-4">
                <Plus className="w-5 h-5" />
                Přidat prvního zákazníka
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredCustomers.map((customer) => (
            <motion.div key={customer.id} variants={staggerItem}>
              <Link href={`/admin/customers/${customer.id}`}>
                <Card className="p-5 cursor-pointer" variant="interactive">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        {customer.organization && (
                          <span className="px-3 py-1 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 text-sm font-medium rounded-full">
                            {customer.organization}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{customer.email}</span></div>
                        {customer.phone && (<div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{customer.phone}</span></div>)}
                        {customer.industryType && (<div className="flex items-center gap-2"><Building2 className="w-4 h-4" /><span>{customer.industryType}</span></div>)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {customer._count.orders > 0 && (<div className="mb-1"><span className="font-semibold text-brand-600 dark:text-brand-400">{customer._count.orders}</span>{' '}objednávek</div>)}
                        {customer._count.invoices > 0 && (<div><span className="font-semibold text-success-600 dark:text-success-400">{customer._count.invoices}</span>{' '}faktur</div>)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
