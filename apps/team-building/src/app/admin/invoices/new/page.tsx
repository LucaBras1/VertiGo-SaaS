/**
 * New Invoice Page
 * Create a new invoice
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  firstName: string
  lastName: string
  organization: string | null
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'draft',
    dueDate: '',
    vatRate: 21,
    items: [] as InvoiceItem[],
    textBeforeItems: '',
    textAfterItems: '',
    notes: '',
  })

  useEffect(() => {
    fetchCustomers()
    // Set default due date to 14 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)
    setFormData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0],
    }))
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      if (data.success) setCustomers(data.data)
    } catch (error) {
      toast.error('Nepodařilo se načíst zákazníky')
    }
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const vatAmount = Math.round(subtotal * (formData.vatRate / 100))
    const totalAmount = subtotal + vatAmount
    return { subtotal, vatAmount, totalAmount }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      toast.error('Vyberte zákazníka')
      return
    }

    if (formData.items.length === 0) {
      toast.error('Přidejte alespoň jednu položku')
      return
    }

    setIsLoading(true)

    try {
      const { subtotal, vatAmount, totalAmount } = calculateTotals()

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subtotal,
          vatAmount,
          totalAmount,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Faktura byla vytvořena')
        router.push('/admin/invoices')
      } else {
        toast.error(data.error || 'Nepodařilo se vytvořit fakturu')
      }
    } catch (error) {
      toast.error('Chyba při vytváření faktury')
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, [field]: value }
        // Recalculate total price
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice
        }
        return updated
      }),
    }))
  }

  const { subtotal, vatAmount, totalAmount } = calculateTotals()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nová faktura</h1>
          <p className="text-gray-600">Vytvořte novou fakturu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Základní informace</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zákazník *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Vyberte zákazníka</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.organization || `${customer.firstName} ${customer.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Splatnost *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sazba DPH (%)
              </label>
              <select
                value={formData.vatRate}
                onChange={(e) => setFormData(prev => ({ ...prev, vatRate: parseInt(e.target.value) }))}
                className="input-field"
              >
                <option value={0}>0% (osvobozeno)</option>
                <option value={12}>12%</option>
                <option value={21}>21%</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Text před položkami
            </label>
            <textarea
              value={formData.textBeforeItems}
              onChange={(e) => setFormData(prev => ({ ...prev, textBeforeItems: e.target.value }))}
              className="input-field"
              rows={2}
              placeholder="Úvodní text faktury..."
            />
          </div>
        </div>

        {/* Items */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Položky faktury</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Přidat položku
            </Button>
          </div>

          {formData.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Zatím nemáte žádné položky. Klikněte na "Přidat položku".
            </p>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Popis
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="input-field"
                      placeholder="Název služby/produktu"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Množství
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="input-field"
                      min="1"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cena/ks (Kč)
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                      className="input-field"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Celkem
                    </label>
                    <input
                      type="text"
                      value={`${item.totalPrice.toLocaleString('cs-CZ')} Kč`}
                      className="input-field bg-gray-100"
                      disabled
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mezisoučet:</span>
                      <span className="font-semibold">{subtotal.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">DPH ({formData.vatRate}%):</span>
                      <span className="font-semibold">{vatAmount.toLocaleString('cs-CZ')} Kč</span>
                    </div>
                    <div className="flex justify-between text-lg border-t pt-2">
                      <span className="font-bold">Celkem:</span>
                      <span className="font-bold text-brand-primary">
                        {totalAmount.toLocaleString('cs-CZ')} Kč
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer text and notes */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Doplňující informace</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Text za položkami
              </label>
              <textarea
                value={formData.textAfterItems}
                onChange={(e) => setFormData(prev => ({ ...prev, textAfterItems: e.target.value }))}
                className="input-field"
                rows={2}
                placeholder="Závěrečný text faktury..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interní poznámky
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field"
                rows={2}
                placeholder="Interní poznámky (nebudou na faktuře)..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/invoices">
            <Button variant="outline">Zrušit</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Vytvořit fakturu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
