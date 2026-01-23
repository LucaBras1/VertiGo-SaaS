'use client'

/**
 * Customer Detail Page
 * Displays full customer information with orders and invoices history
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Tag,
  Shield,
  Calendar,
  Trash2,
  Edit,
  ShoppingCart,
  Receipt,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react'
import type { Customer, OrderPopulated, InvoicePopulated } from '@/types/admin'
import { useToast } from '@/hooks/useToast'

const statusLabels: Record<string, string> = {
  new: 'Nova',
  reviewing: 'V posouzeni',
  awaiting_info: 'Ceka na info',
  quote_sent: 'Nabidka odeslana',
  confirmed: 'Potvrzena',
  approved: 'Schvalena',
  completed: 'Dokoncena',
  cancelled: 'Zrusena',
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  awaiting_info: 'bg-purple-100 text-purple-800',
  quote_sent: 'bg-indigo-100 text-indigo-800',
  confirmed: 'bg-green-100 text-green-800',
  approved: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const invoiceStatusLabels: Record<string, string> = {
  draft: 'Koncept',
  sent: 'Odeslana',
  paid: 'Zaplacena',
  overdue: 'Po splatnosti',
  cancelled: 'Stornovana',
}

const invoiceStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

const orgTypeLabels: Record<string, string> = {
  elementary_school: 'Zakladni skola',
  kindergarten: 'Materska skola',
  high_school: 'Stredni skola',
  cultural_center: 'Kulturni centrum',
  municipality: 'Mestsky urad',
  private_company: 'Soukroma firma',
  nonprofit: 'Neziskova organizace',
  other: 'Jine',
}

interface CustomerStats {
  totalOrders: number
  totalSpent: number
  customerSince: string
  lastOrderDate: string | null
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<OrderPopulated[]>([])
  const [invoices, setInvoices] = useState<InvoicePopulated[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
    customerSince: '',
    lastOrderDate: null,
  })

  // Fetch customer data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer
        const customerRes = await fetch(`/api/admin/customers/${customerId}`)
        if (!customerRes.ok) {
          throw new Error('Customer not found')
        }
        const customerData = await customerRes.json()
        setCustomer(customerData.data)

        // Fetch orders for this customer
        const ordersRes = await fetch(`/api/admin/orders?customerId=${customerId}&populate=true&pageSize=100`)
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          const customerOrders = ordersData.orders || []
          setOrders(customerOrders)

          // Calculate stats
          const totalSpent = customerOrders.reduce((sum: number, order: OrderPopulated) => {
            return sum + (order.pricing?.totalPrice || 0)
          }, 0)

          const lastOrder = customerOrders.length > 0
            ? customerOrders.sort((a: OrderPopulated, b: OrderPopulated) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0]
            : null

          setStats(prev => ({
            ...prev,
            totalOrders: customerOrders.length,
            totalSpent,
            lastOrderDate: lastOrder?.createdAt || null,
          }))
        }

        // Fetch invoices for this customer
        const invoicesRes = await fetch(`/api/admin/invoices?customerId=${customerId}&populate=true&pageSize=100`)
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json()
          setInvoices(invoicesData.invoices || [])
        }

        // Set customer since date
        if (customerData.data?.createdAt) {
          setStats(prev => ({
            ...prev,
            customerSince: customerData.data.createdAt,
          }))
        }
      } catch (error) {
        console.error('Error fetching customer:', error)
        toast('Chyba pri nacitani zakaznika', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (customerId) {
      fetchData()
    }
  }, [customerId, toast])

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tohoto zakaznika? Tato akce je nevratna.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast('Zakaznik byl smazan', 'success')
        router.push('/admin/customers')
      } else {
        const data = await response.json()
        toast(data.error || 'Chyba pri mazani zakaznika', 'error')
      }
    } catch (error) {
      toast('Chyba pri mazani zakaznika', 'error')
    }
  }

  // Calculate customer duration
  const getCustomerDuration = () => {
    if (!stats.customerSince) return '-'
    const start = new Date(stats.customerSince)
    const now = new Date()
    const years = Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const months = Math.floor((now.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000))

    if (years >= 1) {
      return `${years} ${years === 1 ? 'rok' : years < 5 ? 'roky' : 'let'}`
    }
    return `${months} ${months === 1 ? 'mesic' : months < 5 ? 'mesice' : 'mesicu'}`
  }

  if (loading) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Nacitani zakaznika...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="px-4 py-8 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-500">Zakaznik nenalezen</p>
          <Link
            href="/admin/customers"
            className="mt-4 inline-block text-blue-600 hover:text-blue-900"
          >
            Zpet na seznam
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/customers"
          className="text-sm text-blue-600 hover:text-blue-900 mb-2 inline-block"
        >
          &larr; Zpet na zakazniky
        </Link>
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            {customer.organization && (
              <p className="mt-1 text-lg text-gray-600">{customer.organization}</p>
            )}
            {customer.organizationType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                {orgTypeLabels[customer.organizationType] || customer.organizationType}
              </span>
            )}
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link
              href={`/admin/customers/${customerId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              Upravit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Smazat
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Contact */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Kontakt</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{customer.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="text-gray-900">{customer.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Adresa</h2>
          </div>
          <div className="space-y-1">
            {customer.address?.street && <p className="text-gray-900">{customer.address.street}</p>}
            {(customer.address?.postalCode || customer.address?.city) && (
              <p className="text-gray-900">
                {customer.address.postalCode} {customer.address.city}
              </p>
            )}
            {!customer.address?.street && !customer.address?.city && (
              <p className="text-gray-500">Adresa neuvedena</p>
            )}
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Fakturace</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">ICO</p>
              <p className="text-gray-900 font-mono">{customer.billingInfo?.ico || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">DIC</p>
              <p className="text-gray-900 font-mono">{customer.billingInfo?.dic || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tags & GDPR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Tags */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Stitky</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {customer.tags && customer.tags.length > 0 ? (
              customer.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-gray-500">Zadne stitky</p>
            )}
          </div>
        </div>

        {/* GDPR */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">GDPR</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Marketing</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.gdprConsent?.marketing
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {customer.gdprConsent?.marketing ? 'Souhlas' : 'Nesouhlas'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Zpracovani dat</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.gdprConsent?.dataProcessing
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {customer.gdprConsent?.dataProcessing ? 'Souhlas' : 'Nesouhlas'}
              </span>
            </div>
            {customer.gdprConsent?.consentDate && (
              <p className="text-sm text-gray-500">
                Datum souhlasu: {new Date(customer.gdprConsent.consentDate).toLocaleDateString('cs-CZ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Poznamky</h2>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Statistiky</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
            <p className="text-sm text-gray-600 mt-1">Objednavek</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {stats.totalSpent.toLocaleString('cs-CZ')} Kc
            </p>
            <p className="text-sm text-gray-600 mt-1">Celkem utraceno</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{getCustomerDuration()}</p>
            <p className="text-sm text-gray-600 mt-1">Zakaznikem</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">
              {stats.lastOrderDate
                ? new Date(stats.lastOrderDate).toLocaleDateString('cs-CZ')
                : '-'
              }
            </p>
            <p className="text-sm text-gray-600 mt-1">Posledni objednavka</p>
          </div>
        </div>
      </div>

      {/* Orders History */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Historie objednavek</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {orders.length}
            </span>
          </div>
          <Link
            href={`/admin/orders?customerId=${customerId}`}
            className="text-sm text-blue-600 hover:text-blue-900 flex items-center gap-1"
          >
            Zobrazit vse <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Zadne objednavky
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cislo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nazev akce</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cena</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.eventName || 'Bez nazvu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.dates && order.dates.length > 0
                        ? new Date(order.dates[0]).toLocaleDateString('cs-CZ')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {order.pricing?.totalPrice
                        ? `${order.pricing.totalPrice.toLocaleString('cs-CZ')} Kc`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Historie faktur</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {invoices.length}
            </span>
          </div>
          <Link
            href={`/admin/invoices?customerId=${customerId}`}
            className="text-sm text-blue-600 hover:text-blue-900 flex items-center gap-1"
          >
            Zobrazit vse <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Zadne faktury
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cislo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vystaveno</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Splatnost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Castka</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.slice(0, 5).map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.issueDate
                        ? new Date(invoice.issueDate).toLocaleDateString('cs-CZ')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString('cs-CZ')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoiceStatusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                        {invoiceStatusLabels[invoice.status] || invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {invoice.totalAmount
                        ? `${invoice.totalAmount.toLocaleString('cs-CZ')} Kc`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Created/Updated info */}
      <div className="mt-8 text-sm text-gray-500 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Vytvoreno: {customer.createdAt ? new Date(customer.createdAt).toLocaleString('cs-CZ') : '-'}
        </div>
        {customer._updatedAt && (
          <div>
            Aktualizovano: {new Date(customer._updatedAt).toLocaleString('cs-CZ')}
          </div>
        )}
      </div>
    </div>
  )
}
