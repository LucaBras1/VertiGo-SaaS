'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PhotoUploader } from '@/components/galleries/PhotoUploader'
import toast from 'react-hot-toast'

interface Gallery {
  id: string
  name: string
  totalPhotos: number
  shoot: {
    package: {
      client: {
        name: string
      }
    }
  } | null
}

export default function GalleryUploadPage() {
  const params = useParams()
  const router = useRouter()
  const [gallery, setGallery] = useState<Gallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedCount, setUploadedCount] = useState(0)

  useEffect(() => {
    fetchGallery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleUploadComplete = (photos: unknown[]) => {
    setUploadedCount(prev => prev + photos.length)
    if (gallery) {
      setGallery({
        ...gallery,
        totalPhotos: gallery.totalPhotos + photos.length
      })
    }
    toast.success(`${photos.length} photo${photos.length !== 1 ? 's' : ''} uploaded`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!gallery) return null

  const clientName = gallery.shoot?.package?.client?.name || 'Unknown Client'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/admin/galleries/${params.id}`}
            className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:text-neutral-100 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Upload Photos</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {gallery.name} &bull; {clientName}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{gallery.totalPhotos}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Photos in gallery</p>
          </div>
          {uploadedCount > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">+{uploadedCount}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Uploaded now</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="w-5 h-5" />
            Upload Photos
          </CardTitle>
        </CardHeader>

        <div className="p-6">
          <PhotoUploader
            galleryId={gallery.id}
            onUploadComplete={handleUploadComplete}
            maxFiles={100}
          />
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Upload Tips</h3>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Photos are automatically optimized for web delivery
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Thumbnails are generated automatically
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Supported formats: JPEG, PNG, WebP, HEIC
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            You can upload up to 100 photos at once
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            Use AI Curation from the gallery page to automatically select the best shots
          </li>
        </ul>
      </Card>
    </div>
  )
}
