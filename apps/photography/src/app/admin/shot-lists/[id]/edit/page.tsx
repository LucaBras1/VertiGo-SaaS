'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button, Card, CardHeader, CardTitle, Input } from '@vertigo/ui'

interface Package {
  id: string
  title: string
  eventType: string
  client: {
    name: string
  }
}

interface ShotList {
  id: string
  packageId: string | null
  name: string
  eventType: string
  estimatedTime: string | null
  equipmentList: string[]
  lightingPlan: string | null
}

export default function EditShotListPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [packages, setPackages] = useState<Package[]>([])
  const [formData, setFormData] = useState({
    packageId: '',
    name: '',
    eventType: 'wedding',
    estimatedTime: '',
    equipmentList: '',
    lightingPlan: ''
  })

  useEffect(() => {
    fetchPackages()
    fetchShotList()
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

  const fetchShotList = async () => {
    try {
      const res = await fetch(`/api/shot-lists/${params.id}`)
      if (!res.ok) throw new Error('Shot list not found')
      const shotList: ShotList = await res.json()

      setFormData({
        packageId: shotList.packageId || '',
        name: shotList.name || '',
        eventType: shotList.eventType || 'wedding',
        estimatedTime: shotList.estimatedTime || '',
        equipmentList: shotList.equipmentList?.join(', ') || '',
        lightingPlan: shotList.lightingPlan || ''
      })
    } catch (error) {
      toast.error('Shot list not found')
      router.push('/admin/shot-lists')
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        packageId: formData.packageId || null,
        name: formData.name,
        eventType: formData.eventType,
        estimatedTime: formData.estimatedTime || null,
        equipmentList: formData.equipmentList ? formData.equipmentList.split(',').map(s => s.trim()) : [],
        lightingPlan: formData.lightingPlan || null
      }

      const res = await fetch(`/api/shot-lists/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error('Failed to update shot list')

      toast.success('Shot list updated successfully!')
      router.push(`/admin/shot-lists/${params.id}`)
    } catch (error) {
      toast.error('Failed to update shot list')
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
        <Link href={`/admin/shot-lists/${params.id}`} className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shot List
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Edit Shot List</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Update shot list details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Package (optional)</label>
              <select
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No package selected</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} - {pkg.client.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Shot List Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Smith Wedding Shot List"
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="wedding">Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="portrait">Portrait</option>
                <option value="family">Family</option>
                <option value="corporate">Corporate</option>
                <option value="product">Product</option>
                <option value="newborn">Newborn</option>
                <option value="maternity">Maternity</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Estimated Time"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              placeholder="e.g., 8 hours"
            />

            <Input
              label="Equipment List"
              value={formData.equipmentList}
              onChange={(e) => setFormData({ ...formData, equipmentList: e.target.value })}
              placeholder="Canon R5, 24-70mm, flash"
              hint="Comma-separated list of equipment"
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Lighting Plan</label>
              <textarea
                value={formData.lightingPlan}
                onChange={(e) => setFormData({ ...formData, lightingPlan: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={4}
                placeholder="Describe the lighting setup for this shoot..."
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" loading={isLoading}>
            Update Shot List
          </Button>
          <Link href={`/admin/shot-lists/${params.id}`}>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
