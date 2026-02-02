/**
 * Order Detail Page
 * View and edit order details
 */

'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  Building2,
  Users,
  FileText,
  Plus,
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
  customObjectives: string | null
  internalNotes: string | null
  createdAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    organization: string | null
  } | null
  items: {
    id: string
    date: string
    price: number
    program: { id: string; title: string } | null
    activity: { id: string; title: string } | null
    extra: { id: string; title: string } | null
  }[]
  invoices: {
    id: string
    invoiceNumber: string
    status: string
    totalAmount: number
  }[]
}

const statusOptions = [
  { value: 'new', label: 'Nová' },
  { value: 'confirmed', label: 'Potvrzená' },
  { value: 'in_progress', label: 'Probíhá' },
  { value: 'completed', label: 'Dokončená' },
  { value: 'cancelled', label: 'Zrušená' },
]

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editData, setEditData] = useState({
    status: '',
    sessionName: '',
    teamSize: '',
    customObjectives: '',
    internalNotes: '',
  })

  const fetchOrder = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
        setEditData({
          status: data.data.status,
          sessionName: data.data.sessionName || '',
          teamSize: data.data.teamSize?.toString() || '',
          customObjectives: data.data.customObjectives || '',
          internalNotes: data.data.internalNotes || '',
        })
      } else {
        toast.error('Objednávka nebyla nalezena')
        router.push('/admin/orders')
      }
    } catch (error) {
      toast.error('Chyba při načítání objednávky')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          teamSize: editData.teamSize ? parseInt(editData.teamSize) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Objednávka byla uložena')
        fetchOrder()
      } else {
        toast.error(data.error || 'Nepodařilo se uložit objednávku')
      }
    } catch (error) {
      toast.error('Chyba při ukládání')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Objednávka byla smazána')
        router.push('/admin/orders')
      } else {
        toast.error(data.error || 'Nepodařilo se smazat objednávku')
      }
    } catch (error) {
      toast.error('Chyba při mazání')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const totalPrice = order.items.reduce((sum, item) => sum + item.price, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-600">
              Vytvořeno {new Date(order.createdAt).toLocaleDateString('cs-CZ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {order.invoices.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Smazat
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Uložit změny
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Základní informace</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stav objednávky
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Velikost týmu
                </label>
                <input
                  type="number"
                  value={editData.teamSize}
                  onChange={(e) => setEditData(prev => ({ ...prev, teamSize: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Název workshopu
                </label>
                <input
                  type="text"
                  value={editData.sessionName}
                  onChange={(e) => setEditData(prev => ({ ...prev, sessionName: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cíle a poznámky od klienta
              </label>
              <textarea
                value={editData.customObjectives}
                onChange={(e) => setEditData(prev => ({ ...prev, customObjectives: e.target.value }))}
                className="input-field"
                rows={3}
              />
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Položky objednávky</h2>

            {order.items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Tato objednávka nemá žádné položky.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Položka
                      </th>
                      <th className="text-left py-2 text-sm font-semibold text-gray-700">
                        Datum
                      </th>
                      <th className="text-right py-2 text-sm font-semibold text-gray-700">
                        Cena
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3">
                          {item.program?.title || item.activity?.title || item.extra?.title || 'Neznámá položka'}
                        </td>
                        <td className="py-3 text-gray-600">
                          {item.date ? new Date(item.date).toLocaleDateString('cs-CZ') : '-'}
                        </td>
                        <td className="py-3 text-right font-semibold">
                          {item.price.toLocaleString('cs-CZ')} Kč
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={2} className="py-3 font-bold">
                        Celkem
                      </td>
                      <td className="py-3 text-right font-bold text-brand-primary">
                        {totalPrice.toLocaleString('cs-CZ')} Kč
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Interní poznámky</h2>
            <textarea
              value={editData.internalNotes}
              onChange={(e) => setEditData(prev => ({ ...prev, internalNotes: e.target.value }))}
              className="input-field"
              rows={4}
              placeholder="Interní poznámky (neviditelné pro zákazníka)..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Zákazník</h2>
            {order.customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">
                    {order.customer.organization || `${order.customer.firstName} ${order.customer.lastName}`}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {order.customer.email}
                </div>
                <Link href={`/admin/customers/${order.customer.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Zobrazit zákazníka
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">Zákazník není přiřazen</p>
            )}
          </div>

          {/* Invoices */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Faktury</h2>
              <Link href={`/admin/invoices/new?orderId=${order.id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {order.invoices.length === 0 ? (
              <p className="text-gray-500 text-sm">Zatím žádné faktury</p>
            ) : (
              <div className="space-y-2">
                {order.invoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/admin/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <div>
                      <div className="font-semibold text-sm">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{invoice.status}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      {(invoice.totalAmount / 100).toLocaleString('cs-CZ')} Kč
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Smazat objednávku"
        message="Opravdu chcete smazat tuto objednávku? Tato akce je nevratná."
        confirmText="Smazat"
        variant="danger"
      />
    </div>
  )
}
