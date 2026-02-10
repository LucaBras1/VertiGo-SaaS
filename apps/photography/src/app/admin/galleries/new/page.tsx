'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button, Card, CardHeader, CardTitle, Input } from '@vertigo/ui'

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

export default function NewGalleryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [shoots, setShoots] = useState<Shoot[]>([])
  const [formData, setFormData] = useState({
    shootId: '',
    name: '',
    password: '',
    downloadEnabled: true,
    expiresInDays: ''
  })

  useEffect(() => {
    fetchShoots()
  }, [])

  const fetchShoots = async () => {
    try {
      const res = await fetch('/api/shoots')
      const data = await res.json()
      setShoots(data)
    } catch (error) {
      console.error('Failed to fetch shoots:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresInDays
          ? new Date(Date.now() + parseInt(formData.expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
          : null
      }

      const res = await fetch('/api/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to create gallery')

      const data = await res.json()
      toast.success('Gallery created successfully!')
      router.push(`/admin/galleries/${data.id}`)
    } catch (error) {
      toast.error('Failed to create gallery')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedShoot = shoots.find(s => s.id === formData.shootId)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/admin/galleries" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Galleries
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Create New Gallery</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Set up a photo gallery for your client</p>
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
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Shoot</label>
              <select
                value={formData.shootId}
                onChange={(e) => setFormData({ ...formData, shootId: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm">
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
              hint="Clients will need this password to access the gallery"
            />

            <Input
              type="number"
              label="Expires In (days)"
              value={formData.expiresInDays}
              onChange={(e) => setFormData({ ...formData, expiresInDays: e.target.value })}
              placeholder="e.g., 30"
              hint="Leave empty for no expiration"
            />

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.downloadEnabled}
                onChange={(e) => setFormData({ ...formData, downloadEnabled: e.target.checked })}
                className="mr-2 rounded border-neutral-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Allow clients to download photos</span>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" loading={isLoading}>
            Create Gallery
          </Button>
          <Link href="/admin/galleries">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
