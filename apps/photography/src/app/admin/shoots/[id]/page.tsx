'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin,
  User, Camera, Sun, ListChecks, Images, Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge, Button, Card, CardHeader, CardTitle, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

interface Shoot {
  id: string
  date: string
  startTime: string
  endTime: string
  venueName: string | null
  venueAddress: string | null
  venueType: string | null
  lightingNotes: string | null
  notes: string | null
  createdAt: string
  package: {
    id: string
    title: string
    eventType: string | null
    client: {
      id: string
      name: string
      email: string
      phone: string | null
    }
  }
  shotList: {
    id: string
    name: string
    status: string
    totalShots: number
  } | null
  galleries: Array<{
    id: string
    name: string
    status: string
    totalPhotos: number
  }>
}

export default function ShootDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [shoot, setShoot] = useState<Shoot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchShoot()
  }, [params.id])

  const fetchShoot = async () => {
    try {
      const res = await fetch(`/api/shoots/${params.id}`)
      if (!res.ok) throw new Error('Shoot not found')
      const data = await res.json()
      setShoot(data)
    } catch (error) {
      console.error('Failed to fetch shoot:', error)
      toast.error('Shoot not found')
      router.push('/admin/shoots')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/shoots/${params.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete shoot')
      toast.success('Shoot deleted')
      router.push('/admin/shoots')
    } catch (error) {
      toast.error('Failed to delete shoot')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isUpcoming = shoot ? new Date(shoot.date) >= new Date() : false

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!shoot) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/admin/shoots" className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shoots
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {shoot.package.eventType} Shoot
            </h1>
            <Badge variant={isUpcoming ? 'info' : 'secondary'}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </Badge>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{shoot.package.client.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/shoots/${params.id}/edit`}>
            <Button variant="secondary">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {!shoot.shotList && (
            <Link href={`/admin/shot-lists/new?shootId=${shoot.id}&packageId=${shoot.package.id}`}>
              <Button size="sm">
                <ListChecks className="w-4 h-4 mr-1" />
                Create Shot List
              </Button>
            </Link>
          )}
          <Link href={`/admin/galleries/new?shootId=${shoot.id}`}>
            <Button size="sm" variant="secondary">
              <Images className="w-4 h-4 mr-1" />
              Create Gallery
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Date</p>
                <p className="font-medium">{formatDate(shoot.date)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Start Time</p>
                <p className="font-medium">{shoot.startTime}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">End Time</p>
                <p className="font-medium">{shoot.endTime}</p>
              </div>
            </div>
          </Card>

          {/* Venue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Venue
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Venue Name</p>
                <p className="font-medium">{shoot.venueName || 'Not specified'}</p>
              </div>
              {shoot.venueAddress && (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Address</p>
                  <p className="font-medium">{shoot.venueAddress}</p>
                </div>
              )}
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Type</p>
                  <Badge variant="default">{shoot.venueType || 'Mixed'}</Badge>
                </div>
              </div>
              {shoot.lightingNotes && (
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Lighting Notes</p>
                  <p className="text-neutral-700 dark:text-neutral-300">{shoot.lightingNotes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Shot List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  Shot List
                </CardTitle>
                {!shoot.shotList && (
                  <Link href={`/admin/shot-lists/new?shootId=${shoot.id}`}>
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4 mr-1" />
                      Create
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            {shoot.shotList ? (
              <Link href={`/admin/shot-lists/${shoot.shotList.id}`}
                className="block p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{shoot.shotList.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{shoot.shotList.totalShots} shots</p>
                  </div>
                  <Badge variant={shoot.shotList.status === 'COMPLETED' ? 'success' : 'info'}>
                    {shoot.shotList.status}
                  </Badge>
                </div>
              </Link>
            ) : (
              <p className="text-neutral-400 dark:text-neutral-500">No shot list created yet</p>
            )}
          </Card>

          {/* Galleries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Images className="w-4 h-4" />
                  Galleries ({shoot.galleries.length})
                </CardTitle>
                <Link href={`/admin/galleries/new?shootId=${shoot.id}`}>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            {shoot.galleries.length === 0 ? (
              <p className="text-neutral-400 dark:text-neutral-500">No galleries yet</p>
            ) : (
              <div className="space-y-2">
                {shoot.galleries.map(gallery => (
                  <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                    <div>
                      <p className="font-medium">{gallery.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{gallery.totalPhotos} photos</p>
                    </div>
                    <Badge variant={gallery.status === 'DELIVERED' ? 'success' : gallery.status === 'READY' ? 'info' : 'warning'}>
                      {gallery.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Notes */}
          {shoot.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{shoot.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Package
              </CardTitle>
            </CardHeader>
            <Link href={`/admin/packages/${shoot.package.id}`}
              className="block p-3 rounded-lg border hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              <p className="font-medium">{shoot.package.title}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{shoot.package.eventType}</p>
            </Link>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Client
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <Link href={`/admin/clients/${shoot.package.client.id}`}
                className="font-medium text-amber-600 hover:text-amber-700">
                {shoot.package.client.name}
              </Link>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{shoot.package.client.email}</p>
              {shoot.package.client.phone && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{shoot.package.client.phone}</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onOpenChange={(open: boolean) => { if (!open) setShowDeleteModal(false) }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Shoot</ModalTitle>
          </ModalHeader>
          <ModalBody>
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this shoot? This will also delete associated galleries.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
              Delete Shoot
            </Button>
          </div>
        </div>
      </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}
