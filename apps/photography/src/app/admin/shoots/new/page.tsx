'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button, Card, CardHeader, CardTitle, Input } from '@vertigo/ui'

interface Package {
  id: string
  title: string
  client: {
    name: string
  }
  eventType: string
}

export default function NewShootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [formData, setFormData] = useState({
    packageId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    venueName: '',
    venueAddress: '',
    venueType: 'mixed',
    lightingNotes: '',
    notes: ''
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/shoots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to create shoot')

      const data = await res.json()
      toast.success('Shoot scheduled successfully!')
      router.push(`/admin/shoots/${data.id}`)
    } catch (error) {
      toast.error('Failed to schedule shoot')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/admin/shoots" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shoots
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Schedule New Shoot</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Plan a new photography session</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Package Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Package</CardTitle>
          </CardHeader>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Select Package</label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Select a package</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} - {pkg.client.name} ({pkg.eventType})
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Shoot Date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              type="time"
              label="Start Time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />

            <Input
              type="time"
              label="End Time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Venue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Venue Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Venue Name"
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              placeholder="e.g., Grand Ballroom, Central Park"
            />

            <Input
              label="Venue Address"
              value={formData.venueAddress}
              onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
              placeholder="Full address"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Venue Type</label>
              <select
                value={formData.venueType}
                onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="mixed">Mixed (Indoor & Outdoor)</option>
              </select>
            </div>

            <Input
              label="Lighting Notes"
              value={formData.lightingNotes}
              onChange={(e) => setFormData({ ...formData, lightingNotes: e.target.value })}
              placeholder="Natural light available, large windows, etc."
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
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={4}
            placeholder="Parking information, special requirements, contact on site..."
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" loading={isLoading}>
            Schedule Shoot
          </Button>
          <Link href="/admin/shoots">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
