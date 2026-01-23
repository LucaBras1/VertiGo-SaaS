'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Images, Download, Share2,
  Eye, Lock, Sparkles, CheckCircle, Clock, Truck
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface Gallery {
  id: string
  name: string
  status: 'PROCESSING' | 'READY' | 'DELIVERED'
  totalPhotos: number
  selectedPhotos: number
  aiCurated: boolean
  publicUrl: string | null
  password: string | null
  expiresAt: string | null
  downloadEnabled: boolean
  createdAt: string
  shoot: {
    id: string
    date: string
    venueName: string | null
    package: {
      id: string
      title: string
      client: {
        id: string
        name: string
        email: string
      }
    }
  }
  photos: Array<{
    id: string
    filename: string
    url: string
    thumbnailUrl: string | null
    qualityScore: number | null
    category: string | null
    isHighlight: boolean
    selected: boolean
  }>
}

const statusConfig = {
  PROCESSING: { label: 'Processing', color: 'yellow' as const, icon: Clock },
  READY: { label: 'Ready', color: 'green' as const, icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'blue' as const, icon: Truck }
}

export default function GalleryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCurating, setIsCurating] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchGallery()
  }, [params.id])

  const fetchGallery = async () => {
    try {
      const res = await fetch(`/api/galleries/${params.id}`)
      if (!res.ok) throw new Error('Gallery not found')
      const data = await res.json()
      setGallery(data)
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
      toast.error('Gallery not found')
      router.push('/dashboard/galleries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!gallery) return
    setIsUpdatingStatus(true)
    try {
      const res = await fetch(`/api/galleries/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setGallery({ ...gallery, status: newStatus as Gallery['status'] })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAICurate = async () => {
    setIsCurating(true)
    try {
      const res = await fetch('/api/ai/gallery/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId: params.id })
      })
      if (!res.ok) throw new Error('Failed to curate')
      toast.success('AI curation started')
      fetchGallery()
    } catch (error) {
      toast.error('Failed to start AI curation')
    } finally {
      setIsCurating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/galleries/${params.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete gallery')
      toast.success('Gallery deleted')
      router.push('/dashboard/galleries')
    } catch (error) {
      toast.error('Failed to delete gallery')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const copyShareLink = () => {
    if (gallery?.publicUrl) {
      navigator.clipboard.writeText(gallery.publicUrl)
      toast.success('Link copied to clipboard')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!gallery) return null

  const StatusIcon = statusConfig[gallery.status].icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/galleries" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Galleries
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{gallery.name}</h1>
            <Badge variant={statusConfig[gallery.status].color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[gallery.status].label}
            </Badge>
            {gallery.aiCurated && (
              <Badge variant="info">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Curated
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">{gallery.shoot.package.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setShowShareModal(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={gallery.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PROCESSING">Processing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {!gallery.aiCurated && (
              <Button onClick={handleAICurate} isLoading={isCurating}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Curate
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{gallery.totalPhotos}</p>
              <p className="text-sm text-gray-600">Total Photos</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{gallery.selectedPhotos}</p>
              <p className="text-sm text-gray-600">Selected</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {gallery.photos.filter(p => p.isHighlight).length}
              </p>
              <p className="text-sm text-gray-600">Highlights</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-400">
                {gallery.totalPhotos - gallery.selectedPhotos}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </Card>
          </div>

          {/* Photo Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="w-4 h-4" />
                Photos
              </CardTitle>
            </CardHeader>
            {gallery.photos.length === 0 ? (
              <div className="text-center py-12">
                <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No photos uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {gallery.photos.slice(0, 12).map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                    {photo.thumbnailUrl ? (
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Images className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {photo.isHighlight && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="yellow" size="sm">Highlight</Badge>
                      </div>
                    )}
                    {photo.qualityScore && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {Math.round(photo.qualityScore)}%
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {gallery.photos.length > 12 && (
              <div className="text-center pt-4">
                <Button variant="ghost">
                  View All {gallery.photos.length} Photos
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shoot Info */}
          <Card>
            <CardHeader>
              <CardTitle>Shoot Details</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <Link href={`/dashboard/shoots/${gallery.shoot.id}`}
                className="block text-amber-600 hover:text-amber-700 font-medium">
                {new Date(gallery.shoot.date).toLocaleDateString()}
              </Link>
              {gallery.shoot.venueName && (
                <p className="text-sm text-gray-600">{gallery.shoot.venueName}</p>
              )}
              <Link href={`/dashboard/packages/${gallery.shoot.package.id}`}
                className="text-sm text-gray-600 hover:text-gray-900">
                {gallery.shoot.package.title}
              </Link>
            </div>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <Link href={`/dashboard/clients/${gallery.shoot.package.client.id}`}
                className="font-medium text-amber-600 hover:text-amber-700">
                {gallery.shoot.package.client.name}
              </Link>
              <p className="text-sm text-gray-600">{gallery.shoot.package.client.email}</p>
            </div>
          </Card>

          {/* Access Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Access Settings</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password Protected</span>
                <Badge variant={gallery.password ? 'green' : 'gray'}>
                  {gallery.password ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Downloads</span>
                <Badge variant={gallery.downloadEnabled ? 'green' : 'gray'}>
                  {gallery.downloadEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {gallery.expiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expires</span>
                  <span className="text-sm font-medium">
                    {new Date(gallery.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Gallery">
        <div className="space-y-4">
          {gallery.publicUrl ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gallery.publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
                  />
                  <Button onClick={copyShareLink}>Copy</Button>
                </div>
              </div>
              {gallery.password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <p className="text-sm text-gray-600">The gallery is password protected</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600">No public link generated yet. Update gallery settings to generate a share link.</p>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Gallery">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{gallery.name}"? This will also delete all photos.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete Gallery
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
