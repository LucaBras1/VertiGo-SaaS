'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Images, Share2,
  Sparkles, CheckCircle, Clock, Truck, Upload
} from 'lucide-react'
import { AIGalleryCurationModal } from '@/components/modals/AIGalleryCurationModal'
import { PhotoSelectionGrid } from '@/components/galleries/PhotoSelectionGrid'
import toast from 'react-hot-toast'
import { Badge, Button, Card, CardHeader, CardTitle, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

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
      eventType: string | null
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
    rejected: boolean
    rejectionReason: string | null
  }>
}

const statusConfig = {
  PROCESSING: { label: 'Processing', color: 'warning' as const, icon: Clock },
  READY: { label: 'Ready', color: 'success' as const, icon: CheckCircle },
  DELIVERED: { label: 'Delivered', color: 'info' as const, icon: Truck }
}

export default function GalleryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCurationModal, setShowCurationModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
      router.push('/admin/galleries')
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

  const handleCurationComplete = async (result: { selected: { imageId: string; score: number; category: string; isHighlight: boolean }[] }) => {
    try {
      // Update gallery photos with curation results
      const res = await fetch(`/api/galleries/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiCurated: true,
          curationResult: result
        })
      })
      if (!res.ok) throw new Error('Failed to apply curation')
      toast.success('AI curation applied successfully!')
      fetchGallery()
    } catch (error) {
      toast.error('Failed to apply curation')
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
      router.push('/admin/galleries')
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
          <Link href="/admin/galleries" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Galleries
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{gallery.name}</h1>
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
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{gallery.shoot.package.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/galleries/${params.id}/upload`}>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photos
            </Button>
          </Link>
          <Link href={`/admin/galleries/${params.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="secondary" onClick={() => setShowShareModal(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Status:</span>
            <select
              value={gallery.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdatingStatus}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="PROCESSING">Processing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {!gallery.aiCurated && gallery.photos.length > 0 && (
              <Button onClick={() => setShowCurationModal(true)}>
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
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{gallery.photos.length}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Photos</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {gallery.photos.filter(p => p.selected && !p.rejected).length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Selected</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {gallery.photos.filter(p => p.isHighlight).length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Highlights</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400">
                {gallery.photos.filter(p => p.rejected).length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Rejected</p>
            </Card>
          </div>

          {/* Photo Selection Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Images className="w-4 h-4" />
                Photos
              </CardTitle>
            </CardHeader>
            <PhotoSelectionGrid
              galleryId={gallery.id}
              initialPhotos={gallery.photos}
              onPhotosUpdated={fetchGallery}
            />
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
              <Link href={`/admin/shoots/${gallery.shoot.id}`}
                className="block text-amber-600 hover:text-amber-700 font-medium">
                {new Date(gallery.shoot.date).toLocaleDateString()}
              </Link>
              {gallery.shoot.venueName && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{gallery.shoot.venueName}</p>
              )}
              <Link href={`/admin/packages/${gallery.shoot.package.id}`}
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100">
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
              <Link href={`/admin/clients/${gallery.shoot.package.client.id}`}
                className="font-medium text-amber-600 hover:text-amber-700">
                {gallery.shoot.package.client.name}
              </Link>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{gallery.shoot.package.client.email}</p>
            </div>
          </Card>

          {/* Access Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Access Settings</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Password Protected</span>
                <Badge variant={gallery.password ? 'success' : 'secondary'}>
                  {gallery.password ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Downloads</span>
                <Badge variant={gallery.downloadEnabled ? 'success' : 'secondary'}>
                  {gallery.downloadEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              {gallery.expiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Expires</span>
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
      <Modal open={showShareModal} onOpenChange={(open: boolean) => { if (!open) setShowShareModal(false) }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Share Gallery</ModalTitle>
          </ModalHeader>
          <ModalBody>
        <div className="space-y-4">
          {gallery.publicUrl ? (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Gallery Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gallery.publicUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded-lg bg-neutral-50 dark:bg-neutral-800 text-sm"
                  />
                  <Button onClick={copyShareLink}>Copy</Button>
                </div>
              </div>
              {gallery.password && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Password</label>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">The gallery is password protected</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-400">No public link generated yet. Update gallery settings to generate a share link.</p>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onOpenChange={(open: boolean) => { if (!open) setShowDeleteModal(false) }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Gallery</ModalTitle>
          </ModalHeader>
          <ModalBody>
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete "{gallery.name}"? This will also delete all photos.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
              Delete Gallery
            </Button>
          </div>
        </div>
      </ModalBody>
        </ModalContent>
      </Modal>

      {/* AI Curation Modal */}
      <AIGalleryCurationModal
        isOpen={showCurationModal}
        onClose={() => setShowCurationModal(false)}
        onComplete={handleCurationComplete}
        galleryId={gallery.id}
        images={gallery.photos.map(p => ({
          id: p.id,
          url: p.url,
          filename: p.filename
        }))}
        eventType={gallery.shoot?.package?.eventType || 'wedding'}
      />
    </div>
  )
}
