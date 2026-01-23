'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
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

export default function NewPackagePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    eventType: 'wedding',
    eventDate: '',
    shotCount: '',
    deliveryDays: '',
    editingHours: '',
    styleTags: '',
    equipment: '',
    secondShooter: false,
    rawFilesIncluded: false,
    basePrice: '',
    travelCosts: '',
    totalPrice: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        shotCount: formData.shotCount ? parseInt(formData.shotCount) : null,
        deliveryDays: formData.deliveryDays ? parseInt(formData.deliveryDays) : null,
        editingHours: formData.editingHours ? parseFloat(formData.editingHours) : null,
        styleTags: formData.styleTags ? formData.styleTags.split(',').map(s => s.trim()) : [],
        equipment: formData.equipment ? formData.equipment.split(',').map(s => s.trim()) : [],
        basePrice: formData.basePrice ? parseInt(formData.basePrice) : null,
        travelCosts: formData.travelCosts ? parseInt(formData.travelCosts) : null,
        totalPrice: formData.totalPrice ? parseInt(formData.totalPrice) : null,
      }

      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create package')

      const data = await res.json()
      toast.success('Package created successfully!')
      router.push(`/dashboard/packages/${data.id}`)
    } catch (error) {
      toast.error('Failed to create package')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/packages" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Packages
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Package</h1>
        <p className="text-gray-600 mt-1">Set up a new photography package for your client</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name} ({client.email})</option>
                ))}
              </select>
            </div>

            <Input
              label="Package Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Wedding Photography Package"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="wedding">Wedding</option>
                <option value="portrait">Portrait</option>
                <option value="corporate">Corporate</option>
                <option value="family">Family</option>
                <option value="product">Product</option>
                <option value="newborn">Newborn</option>
                <option value="maternity">Maternity</option>
              </select>
            </div>

            <Input
              type="date"
              label="Event Date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            />
          </div>
        </Card>

        {/* Photography Details */}
        <Card>
          <CardHeader>
            <CardTitle>Photography Details</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Shot Count"
              value={formData.shotCount}
              onChange={(e) => setFormData({ ...formData, shotCount: e.target.value })}
              placeholder="Number of final photos"
            />

            <Input
              type="number"
              label="Delivery Days"
              value={formData.deliveryDays}
              onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
              placeholder="Days until delivery"
            />

            <Input
              type="number"
              step="0.5"
              label="Editing Hours"
              value={formData.editingHours}
              onChange={(e) => setFormData({ ...formData, editingHours: e.target.value })}
              placeholder="Estimated edit time"
            />

            <Input
              label="Style Tags"
              value={formData.styleTags}
              onChange={(e) => setFormData({ ...formData, styleTags: e.target.value })}
              placeholder="moody, bright, documentary"
              helperText="Comma-separated"
            />

            <Input
              label="Equipment"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              placeholder="Canon R5, 24-70mm"
              helperText="Comma-separated"
            />

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.secondShooter}
                  onChange={(e) => setFormData({ ...formData, secondShooter: e.target.checked })}
                  className="mr-2 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">Second Shooter</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.rawFilesIncluded}
                  onChange={(e) => setFormData({ ...formData, rawFilesIncluded: e.target.checked })}
                  className="mr-2 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-gray-700">RAW Files Included</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Base Price"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              placeholder="0"
            />

            <Input
              type="number"
              label="Travel Costs"
              value={formData.travelCosts}
              onChange={(e) => setFormData({ ...formData, travelCosts: e.target.value })}
              placeholder="0"
            />

            <Input
              type="number"
              label="Total Price"
              value={formData.totalPrice}
              onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
              placeholder="0"
            />
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={4}
            placeholder="Any additional notes or requirements..."
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isLoading}>
            Create Package
          </Button>
          <Link href="/dashboard/packages">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
