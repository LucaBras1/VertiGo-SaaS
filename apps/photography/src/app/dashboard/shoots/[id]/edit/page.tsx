'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Package {
  id: string
  title: string
  client: {
    name: string
  }
  eventType: string
}

interface Shoot {
  id: string
  packageId: string
  date: string
  startTime: string | null
  endTime: string | null
  venueName: string | null
  venueAddress: string | null
  venueType: string | null
  lightingNotes: string | null
  notes: string | null
}

export default function EditShootPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
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
    fetchShoot()
  }, [params.id])

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data)
    } catch (error) {
      console.error('Failed to fetch packages:', error)
    }
  }

  const fetchShoot = async () => {
    try {
      const res = await fetch(`/api/shoots/${params.id}`)
      if (!res.ok) throw new Error('Shoot not found')
      const shoot: Shoot = await res.json()

      setFormData({
        packageId: shoot.packageId || '',
        date: shoot.date ? new Date(shoot.date).toISOString().split('T')[0] : '',
        startTime: shoot.startTime || '09:00',
        endTime: shoot.endTime || '17:00',
        venueName: shoot.venueName || '',
        venueAddress: shoot.venueAddress || '',
        venueType: shoot.venueType || 'mixed',
        lightingNotes: shoot.lightingNotes || '',
        notes: shoot.notes || ''
      })
    } catch (error) {
      toast.error('Shoot not found')
      router.push('/dashboard/shoots')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        packageId: formData.packageId,
        date: formData.date,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        venueName: formData.venueName || null,
        venueAddress: formData.venueAddress || null,
        venueType: formData.venueType || null,
        lightingNotes: formData.lightingNotes || null,
        notes: formData.notes || null
      }

      const res = await fetch(`/api/shoots/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to update shoot')

      toast.success('Shoot updated successfully!')
      router.push(`/dashboard/shoots/${params.id}`)
    } catch (error) {
      toast.error('Failed to update shoot')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href={`/dashboard/shoots/${params.id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shoot
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Shoot</h1>
        <p className="text-gray-600 mt-1">Update shoot details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Package Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Package</CardTitle>
          </CardHeader>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Package</label>
            <select
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
              <select
                value={formData.venueType}
                onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={4}
            placeholder="Parking information, special requirements, contact on site..."
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isLoading}>
            Update Shoot
          </Button>
          <Link href={`/dashboard/shoots/${params.id}`}>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
