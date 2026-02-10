/**
 * Orders List Page
 * Admin page for managing orders
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Calendar, Building2, Users } from 'lucide-react'
import { ListPageHeader, SearchFilterBar, ActionButtons, StatusBadge } from '@vertigo/admin'
import { Button, Card, ConfirmDialog, staggerContainer, staggerItem } from '@vertigo/ui'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  status: string
  sessionName: string | null
  teamSize: number | null
  createdAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    organization: string | null
  } | null
  items: any[]
  _count: { invoices: number }
}

const statusMap: Record<string, string> = {
  new: 'pending',
  confirmed: 'confirmed',
  in_progress: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()
      if (data.success) { setOrders(data.data) }
      else { toast.error('Nepodařilo se načíst objednávky') }
    } catch (error) { toast.error('Chyba při načítání objednávek') }
    finally { setIsLoading(false) }
  }, [statusFilter])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const response = await fetch(`/api/orders/${deleteId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) { toast.success('Objednávka byla smazána'); fetchOrders() }
      else { toast.error(data.error || 'Nepodařilo se smazat objednávku') }
    } catch (error) { toast.error('Chyba při mazání objednávky') }
    finally { setDeleteId(null) }
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return order.orderNumber.toLowerCase().includes(searchLower) ||
      order.sessionName?.toLowerCase().includes(searchLower) ||
      order.customer?.firstName.toLowerCase().includes(searchLower) ||
      order.customer?.lastName.toLowerCase().includes(searchLower) ||
      order.customer?.organization?.toLowerCase().includes(searchLower)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>)
  }
  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Objednávky"
        description="Správa objednávek a zakázek"
        actionLabel="Nová objednávka"
        actionHref="/admin/orders/new"
        actionIcon={Plus}
      />

      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Hledat objednávky..."
        filters={[{
          label: 'Status', value: statusFilter,
          options: [
            { label: 'Všechny stavy', value: '' },
            { label: 'Nové', value: 'new' },
            { label: 'Potvrzené', value: 'confirmed' },
            { label: 'Probíhající', value: 'in_progress' },
            { label: 'Dokončené', value: 'completed' },
            { label: 'Zrušené', value: 'cancelled' },
          ], onChange: setStatusFilter,
        }]}
      />

      {filteredOrders.length === 0 ? (
        <Card className="text-center p-12">
          <ShoppingCart className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Žádné objednávky</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Zatím nemáte žádné objednávky.</p>
          <Link href="/admin/orders/new"><Button><Plus className="w-5 h-5" />Vytvořit objednávku</Button></Link>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Objednávka</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Zákazník</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Stav</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Datum</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/30 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-neutral-50">{order.orderNumber}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{order.sessionName || 'Bez názvu'}</p>
                        </div>
                      </div>
                    </td>                    <td className="px-6 py-4">
                      {order.customer ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-sm text-neutral-900 dark:text-neutral-100">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                            {order.customer.organization || `${order.customer.firstName} ${order.customer.lastName}`}
                          </div>
                          {order.teamSize && (<div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-400"><Users className="w-3 h-3" />{order.teamSize} účastníků</div>)}
                        </div>
                      ) : (<span className="text-sm text-neutral-400">&mdash;</span>)}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={statusMap[order.status] || order.status} /></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-300"><Calendar className="w-3.5 h-3.5 text-neutral-400" />{new Date(order.createdAt).toLocaleDateString('cs-CZ')}</div></td>
                    <td className="px-6 py-4 text-right">
                      <ActionButtons
                        viewHref={`/admin/orders/${order.id}`}
                        onDelete={order._count.invoices === 0 ? () => setDeleteId(order.id) : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Smazat objednávku"
        description="Opravdu chcete smazat tuto objednávku? Tato akce je nevratná."
        confirmLabel="Smazat"
        variant="danger"
      />
    </div>
  )
}
