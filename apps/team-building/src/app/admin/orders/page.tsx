/**
 * Orders List Page
 * Admin page for managing orders
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  Building2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
  _count: {
    invoices: number
  }
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  new: 'Nová',
  confirmed: 'Potvrzená',
  in_progress: 'Probíhá',
  completed: 'Dokončená',
  cancelled: 'Zrušená',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
      } else {
        toast.error('Nepodařilo se načíst objednávky')
      }
    } catch (error) {
      toast.error('Chyba při načítání objednávek')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/orders/${deleteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Objednávka byla smazána')
        fetchOrders()
      } else {
        toast.error(data.error || 'Nepodařilo se smazat objednávku')
      }
    } catch (error) {
      toast.error('Chyba při mazání objednávky')
    } finally {
      setDeleteId(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.sessionName?.toLowerCase().includes(searchLower) ||
      order.customer?.firstName.toLowerCase().includes(searchLower) ||
      order.customer?.lastName.toLowerCase().includes(searchLower) ||
      order.customer?.organization?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Objednávky</h1>
          <p className="text-gray-600 mt-2">Správa objednávek a zakázek</p>
        </div>
        <Link href="/admin/orders/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nová objednávka
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Hledat objednávky..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Všechny stavy</option>
              <option value="new">Nové</option>
              <option value="confirmed">Potvrzené</option>
              <option value="in_progress">Probíhající</option>
              <option value="completed">Dokončené</option>
              <option value="cancelled">Zrušené</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Žádné objednávky
          </h3>
          <p className="text-gray-600 mb-6">
            Zatím nemáte žádné objednávky. Vytvořte první!
          </p>
          <Link href="/admin/orders/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Vytvořit objednávku
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.sessionName || 'Bez názvu'}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {order.customer && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {order.customer.organization || `${order.customer.firstName} ${order.customer.lastName}`}
                        </span>
                      )}
                      {order.teamSize && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {order.teamSize} účastníků
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </Button>
                  </Link>
                  {order._count.invoices === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(order.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Smazat objednávku"
        message="Opravdu chcete smazat tuto objednávku? Tato akce je nevratná."
        confirmText="Smazat"
        variant="danger"
      />
    </div>
  )
}
