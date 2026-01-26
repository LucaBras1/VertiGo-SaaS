'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Shoot {
  id: string
  date: string
  venueName: string | null
  package: {
    title: string
    client: {
      name: string
    }
  }
}

interface Gallery {
  id: string
  shootId: string
  name: string
  password: string | null
  downloadEnabled: boolean
  expiresAt: string | null
}

export default function EditGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [shoots, setShoots] = useState<Shoot[]>([])
  const [formData, setFormData] = useState({
    shootId: '',
    name: '',
    password: '',
    downloadEnabled: true,
    expiresAt: ''
  })

  useEffect(() => {
    fetchShoots()
    fetchGallery()
  }, [params.id])

  const fetchShoots = async () => {
    try {
      const res = await fetch('/api/shoots')
      const data = await res.json()
      setShoots(data)
    } catch (error) {
      console.error('Failed to fetch shoots:', error)
    }
  }

  const fetchGallery = async () => {
    try {
      const res = await fetch(`/api/galleries/${params.id}`)
      if (!res.ok) throw new Error('Gallery not found')
      const gallery: Gallery = await res.json()

      setFormData({
        shootId: gallery.shootId || '',
        name: gallery.name || '',
        password: gallery.password || '',
        downloadEnabled: gallery.downloadEnabled ?? true,
        expiresAt: gallery.expiresAt ? new Date(gallery.expiresAt).toISOString().split('T')[0] : ''
      })
    } catch (error) {
      toast.error('Gallery not found')
      router.push('/dashboard/galleries')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        shootId: formData.shootId,
        name: formData.name,
        password: formData.password || null,
        downloadEnabled: formData.downloadEnabled,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      }

      const res = await fetch(`/api/galleries/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to update gallery')

      toast.success('Gallery updated successfully!')
      router.push(`/dashboard/galleries/${params.id}`)
    } catch (error) {
      toast.error('Failed to update gallery')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedShoot = shoots.find(s => s.id === formData.shootId)

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
        <Link href={`/dashboard/galleries/${params.id}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Gallery</h1>
        <p className="text-gray-600 mt-1">Update gallery settings</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shoot Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Shoot</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shoot</label>
              <select
                value={formData.shootId}
                onChange={(e) => setFormData({ ...formData, shootId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select a shoot</option>
                {shoots.map(shoot => (
                  <option key={shoot.id} value={shoot.id}>
                    {new Date(shoot.date).toLocaleDateString()} - {shoot.package.title} ({shoot.package.client.name})
                  </option>
                ))}
              </select>
            </div>

            {selectedShoot && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p><strong>Client:</strong> {selectedShoot.package.client.name}</p>
                <p><strong>Package:</strong> {selectedShoot.package.title}</p>
                {selectedShoot.venueName && <p><strong>Venue:</strong> {selectedShoot.venueName}</p>}
              </div>
            )}
          </div>
        </Card>

        {/* Gallery Details */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Gallery Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Smith Wedding - Full Gallery"
              required
            />

            <Input
              type="password"
              label="Gallery Password (optional)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave empty for no password"
              helperText="Clients will need this password to access the gallery"
            />

            <Input
              type="date"
              label="Expiration Date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              helperText="Leave empty for no expiration"
            />

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.downloadEnabled}
                onChange={(e) => setFormData({ ...formData, downloadEnabled: e.target.checked })}
                className="mr-2 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-gray-700">Allow clients to download photos</span>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" isLoading={isLoading}>
            Update Gallery
          </Button>
          <Link href={`/dashboard/galleries/${params.id}`}>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
