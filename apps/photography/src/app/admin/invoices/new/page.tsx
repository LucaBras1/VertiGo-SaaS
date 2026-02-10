'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Client {
  id: string
  name: string
  email: string
}

interface Package {
  id: string
  title: string
  totalPrice: number | null
  clientId: string
  client: {
    name: string
  }
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [formData, setFormData] = useState({
    clientId: '',
    packageId: '',
    dueDate: '',
    notes: ''
  })
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 }
  ])

  useEffect(() => {
    fetchClients()
    fetchPackages()
  }, [])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      setClients(data)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, clientId, packageId: '' })
  }

  const handlePackageChange = (packageId: string) => {
    setFormData({ ...formData, packageId })

    if (packageId) {
      const pkg = packages.find(p => p.id === packageId)
      if (pkg && pkg.totalPrice) {
        setLineItems([
          { id: '1', description: pkg.title, quantity: 1, unitPrice: pkg.totalPrice }
        ])
        // Auto-set client
        if (!formData.clientId) {
          setFormData(prev => ({ ...prev, packageId, clientId: pkg.clientId }))
        }
      }
    }
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const tax = 0 // Can be made configurable
  const total = subtotal + tax

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        clientId: formData.clientId,
        packageId: formData.packageId || null,
        dueDate: formData.dueDate || null,
        notes: formData.notes || null,
        items: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        subtotal,
        tax,
        total
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create invoice')

      const data = await res.json()
      toast.success('Invoice created successfully!')
      router.push(`/admin/invoices/${data.id}`)
    } catch (error) {
      toast.error('Failed to create invoice')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const clientPackages = packages.filter(p => !formData.clientId || p.clientId === formData.clientId)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/admin/invoices" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Create New Invoice</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Bill your client for photography services</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Package */}
        <Card>
          <CardHeader>
            <CardTitle>Client & Package</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Client</label>
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Package (optional)</label>
              <select
                value={formData.packageId}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No package</option>
                {clientPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} - {pkg.client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    label={index === 0 ? 'Description' : undefined}
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Service description"
                    required
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    label={index === 0 ? 'Qty' : undefined}
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    label={index === 0 ? 'Price (cents)' : undefined}
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                    min="0"
                    required
                  />
                </div>
                <div className="w-32 text-right pt-7">
                  <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                </div>
                <div className="pt-7">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="ghost" onClick={addLineItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Line Item
            </Button>
          </div>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              type="date"
              label="Due Date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Payment terms, thank you note, etc."
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isLoading}>
            Create Invoice
          </Button>
          <Link href="/admin/invoices">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
