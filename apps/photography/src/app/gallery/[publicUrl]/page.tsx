'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
  Camera, Lock, Download, X, ChevronLeft, ChevronRight,
  Calendar, MapPin, User, AlertCircle
} from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  isHighlight: boolean
  category: string | null
}

interface PublicGallery {
  id: string
  name: string
  status: string
  downloadEnabled: boolean
  photographerName: string
  clientName: string
  eventType: string | null
  eventDate: string | null
  venueName: string | null
  totalPhotos: number
  photos: Photo[]
}

interface PasswordRequired {
  requiresPassword: true
  galleryName: string
  photographerName: string
}

type GalleryResponse = PublicGallery | PasswordRequired

function isPasswordRequired(data: GalleryResponse): data is PasswordRequired {
  return 'requiresPassword' in data && data.requiresPassword === true
}

export default function PublicGalleryPage() {
  const params = useParams()
  const [gallery, setGallery] = useState<PublicGallery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [passwordInfo, setPasswordInfo] = useState<{ galleryName: string; photographerName: string } | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchGallery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.publicUrl])

  const fetchGallery = async (pwd?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const url = pwd
        ? `/api/public/galleries/${params.publicUrl}?password=${encodeURIComponent(pwd)}`
        : `/api/public/galleries/${params.publicUrl}`

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'EXPIRED') {
          setError('This gallery has expired and is no longer available.')
        } else if (data.code === 'INVALID_PASSWORD') {
          setPasswordError('Invalid password. Please try again.')
          setRequiresPassword(true)
        } else {
          setError(data.error || 'Gallery not found')
        }
        return
      }

      if (isPasswordRequired(data)) {
        setRequiresPassword(true)
        setPasswordInfo({
          galleryName: data.galleryName,
          photographerName: data.photographerName
        })
      } else {
        setGallery(data)
        setRequiresPassword(false)
      }
    } catch (err) {
      setError('Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsVerifying(true)
    setPasswordError(null)

    await fetchGallery(password)
    setIsVerifying(false)
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }

  const nextPhoto = () => {
    if (lightboxIndex !== null && gallery) {
      setLightboxIndex((lightboxIndex + 1) % gallery.photos.length)
    }
  }

  const prevPhoto = () => {
    if (lightboxIndex !== null && gallery) {
      setLightboxIndex(lightboxIndex === 0 ? gallery.photos.length - 1 : lightboxIndex - 1)
    }
  }

  const downloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-${photo.id}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextPhoto()
      if (e.key === 'ArrowLeft') prevPhoto()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading gallery...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Gallery Unavailable</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Password required state
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {passwordInfo?.galleryName || 'Private Gallery'}
            </h1>
            <p className="text-gray-400 mt-2">
              by {passwordInfo?.photographerName || 'Photographer'}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Enter password to view gallery
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'View Gallery'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // No gallery loaded
  if (!gallery) return null

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{gallery.name}</h1>
                <p className="text-sm text-gray-400">{gallery.photographerName}</p>
              </div>
            </div>

            <div className="text-right text-sm text-gray-400">
              <p>{gallery.totalPhotos} photos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {gallery.clientName}
          </div>
          {gallery.eventType && (
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              {gallery.eventType}
            </div>
          )}
          {gallery.eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(gallery.eventDate).toLocaleDateString()}
            </div>
          )}
          {gallery.venueName && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {gallery.venueName}
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {gallery.photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightbox(index)}
              className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg bg-gray-800"
            >
              <Image
                src={photo.thumbnailUrl || photo.url}
                alt=""
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
              {photo.isHighlight && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded">
                  Highlight
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && gallery.photos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-50"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          <button
            onClick={prevPhoto}
            className="absolute left-4 p-2 text-white/70 hover:text-white z-50"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 p-2 text-white/70 hover:text-white z-50"
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          {/* Image */}
          <div className="relative max-w-[90vw] max-h-[85vh]">
            <Image
              src={gallery.photos[lightboxIndex].url}
              alt=""
              width={gallery.photos[lightboxIndex].width || 1920}
              height={gallery.photos[lightboxIndex].height || 1080}
              className="max-w-full max-h-[85vh] object-contain"
              priority
            />
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/50 rounded-full">
            <span className="text-white text-sm">
              {lightboxIndex + 1} / {gallery.photos.length}
            </span>
            {gallery.downloadEnabled && (
              <button
                onClick={() => downloadPhoto(gallery.photos[lightboxIndex!])}
                className="p-2 text-white/70 hover:text-white"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        <p>Powered by ShootFlow</p>
      </footer>
    </div>
  )
}
