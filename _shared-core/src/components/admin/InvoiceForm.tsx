'use client'

/**
 * Invoice Form Component
 *
 * Form for creating and editing invoices
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Calculator } from 'lucide-react'

interface InvoiceFormProps {
  invoice?: any
}

export function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Loading states
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [customers, setCustomers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // Basic Info
  const [customerId, setCustomerId] = useState(invoice?.customerId || '')
  const [orderId, setOrderId] = useState(invoice?.orderId || '')
  const [issueDate, setIssueDate] = useState(
    invoice?.issueDate ? new Date(invoice.issueDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  )
  const [dueDate, setDueDate] = useState(
    invoice?.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : ''
  )

  // Line Items
  const [items, setItems] = useState<any[]>(
    invoice?.items && typeof invoice.items === 'object' && Array.isArray(invoice.items)
      ? invoice.items
      : []
  )

  // Totals
  const [subtotal, setSubtotal] = useState(invoice?.subtotal || 0)
  const [vatRate, setVatRate] = useState(invoice?.vatRate || 21)
  const [vatAmount, setVatAmount] = useState(invoice?.vatAmount || 0)
  const [totalAmount, setTotalAmount] = useState(invoice?.totalAmount || 0)
  const [paidAmount, setPaidAmount] = useState(invoice?.paidAmount || 0)
  const [paidDate, setPaidDate] = useState(
    invoice?.paidDate ? new Date(invoice.paidDate).toISOString().slice(0, 10) : ''
  )

  // Other fields
  const [notes, setNotes] = useState(invoice?.notes || '')
  const [paymentMethod, setPaymentMethod] = useState(invoice?.paymentMethod || '')

  // Fetch options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [customersRes, ordersRes] = await Promise.all([
          fetch('/api/admin/customers?pageSize=1000'),
          fetch('/api/admin/orders?pageSize=1000'),
        ])

        const [customersData, ordersData] = await Promise.all([
          customersRes.json(),
          ordersRes.json(),
        ])

        setCustomers(customersData.customers || customersData.data || [])
        setOrders(ordersData.orders || ordersData.data || [])
      } catch (err) {
        console.error('Error fetching options:', err)
        setError('Chyba při načítání dat')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [])

  // Auto-calculate totals
  useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const calculatedVatAmount = Math.round(calculatedSubtotal * (vatRate / 100))
    const calculatedTotal = calculatedSubtotal + calculatedVatAmount

    setSubtotal(calculatedSubtotal)
    setVatAmount(calculatedVatAmount)
    setTotalAmount(calculatedTotal)
  }, [items, vatRate])

  const addItem = () => {
    setItems([
      ...items,
      { description: '', quantity: 1, unitPrice: 0, total: 0 },
    ])
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice
      newItems[index].total = quantity * unitPrice
    }

    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!customerId) {
        throw new Error('Vyberte zákazníka')
      }
      if (!dueDate) {
        throw new Error('Zadejte datum splatnosti')
      }
      if (items.length === 0) {
        throw new Error('Přidejte alespoň jednu položku')
      }

      const data = {
        customerId,
        orderId: orderId || null,
        issueDate,
        dueDate,
        items: items.filter(item => item.description),
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        paidAmount,
        paidDate: paidDate || null,
        notes: notes || null,
        paymentMethod: paymentMethod || null,
      }

      const url = invoice ? `/api/admin/invoices/${invoice.id}` : '/api/admin/invoices'
      const method = invoice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chyba při ukládání faktury')
      }

      router.push('/admin/invoices')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání faktury')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Načítání formuláře...</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při ukládání</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Customer & Order */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Základní informace
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Zákazník a související objednávka
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                Zákazník *
              </label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                required
              >
                <option value="">Vyberte zákazníka...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Objednávka (volitelné)
              </label>
              <select
                id="order"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Žádná objednávka</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} - {order.eventName || 'Bez názvu'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
                  Datum vystavení *
                </label>
                <input
                  type="date"
                  id="issueDate"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Datum splatnosti *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Položky faktury
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Služby nebo produkty na faktuře
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Popis
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="Popis položky..."
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Množství
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cena/ks (Kč)
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Celkem (Kč)
                        </label>
                        <input
                          type="number"
                          value={item.total}
                          readOnly
                          className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="ml-3 px-2 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Přidat položku
            </button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Celková částka
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Mezisoučet, DPH a celková částka
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Mezisoučet (bez DPH):</span>
              <span className="text-gray-900">{subtotal.toLocaleString('cs-CZ')} Kč</span>
            </div>

            <div>
              <label htmlFor="vatRate" className="block text-sm font-medium text-gray-700 mb-1">
                Sazba DPH (%)
              </label>
              <input
                type="number"
                id="vatRate"
                value={vatRate}
                onChange={(e) => setVatRate(parseInt(e.target.value) || 0)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                min="0"
                max="100"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">DPH ({vatRate}%):</span>
              <span className="text-gray-900">{vatAmount.toLocaleString('cs-CZ')} Kč</span>
            </div>

            <div className="flex justify-between text-lg border-t pt-3">
              <span className="font-bold text-gray-900">Celkem:</span>
              <span className="font-bold text-gray-900">{totalAmount.toLocaleString('cs-CZ')} Kč</span>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Zaplaceno (Kč)
                  </label>
                  <input
                    type="number"
                    id="paidAmount"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseInt(e.target.value) || 0)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="paidDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Datum platby
                  </label>
                  <input
                    type="date"
                    id="paidDate"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Další informace
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Poznámky a způsob platby
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Způsob platby
              </label>
              <input
                type="text"
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="např. Bankovní převod"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Poznámky
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Interní poznámky..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Ukládám...' : invoice ? 'Uložit změny' : 'Vytvořit fakturu'}
        </button>
      </div>
    </form>
  )
}
