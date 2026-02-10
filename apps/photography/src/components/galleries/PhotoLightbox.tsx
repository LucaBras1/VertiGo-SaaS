'use client'

import { useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import {
  X, ChevronLeft, ChevronRight, Check, Star, RotateCcw, Download
} from 'lucide-react'
import type { Photo } from '@/hooks/usePhotoSelection'
import { Badge } from '@vertigo/ui'

interface PhotoLightboxProps {
  photo: Photo | null
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (photoId: string) => void
  onMarkSelected: (photoId: string) => void
  onMarkRejected: (photoId: string) => void
  onToggleHighlight: (photoId: string) => void
  onReset: (photoId: string) => void
}

export function PhotoLightbox({
  photo,
  photos,
  isOpen,
  onClose,
  onNavigate,
  onMarkSelected,
  onMarkRejected,
  onToggleHighlight,
  onReset
}: PhotoLightboxProps) {
  const currentIndex = photo ? photos.findIndex(p => p.id === photo.id) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(photos[currentIndex - 1].id)
    }
  }, [hasPrev, currentIndex, photos, onNavigate])

  const goToNext = useCallback(() => {
    if (hasNext) {
      onNavigate(photos[currentIndex + 1].id)
    }
  }, [hasNext, currentIndex, photos, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrev()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 's':
        case 'S':
          if (photo) onMarkSelected(photo.id)
          break
        case 'r':
        case 'R':
          if (photo) onMarkRejected(photo.id)
          break
        case 'h':
        case 'H':
          if (photo) onToggleHighlight(photo.id)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, photo, goToPrev, goToNext, onClose, onMarkSelected, onMarkRejected, onToggleHighlight])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !photo) return null

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{photo.filename}</span>
          <span className="text-gray-400 text-sm">
            {currentIndex + 1} / {photos.length}
          </span>
          {photo.qualityScore !== null && (
            <span
              className={clsx(
                'text-xs text-white px-2 py-0.5 rounded',
                getQualityColor(photo.qualityScore)
              )}
            >
              {Math.round(photo.qualityScore)}%
            </span>
          )}
          {photo.isHighlight && (
            <Badge variant="warning" size="sm">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Highlight
            </Badge>
          )}
          {photo.rejected && (
            <Badge variant="danger" size="sm">
              <X className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          )}
          {photo.selected && !photo.rejected && (
            <Badge variant="success" size="sm">
              <Check className="w-3 h-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative min-h-0">
        {/* Navigation: Previous */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
            className="absolute left-4 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Image */}
        <div
          className="max-w-full max-h-full p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.url}
            alt={photo.filename}
            className={clsx(
              'max-w-full max-h-[calc(100vh-180px)] object-contain',
              photo.rejected && 'grayscale opacity-70'
            )}
          />
        </div>

        {/* Navigation: Next */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="flex items-center justify-center gap-4 px-4 py-3 bg-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onMarkSelected(photo.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            photo.selected && !photo.rejected
              ? 'bg-green-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <Check className="w-5 h-5" />
          <span>Select</span>
          <kbd className="text-xs opacity-60 ml-1">(S)</kbd>
        </button>

        <button
          onClick={() => onMarkRejected(photo.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            photo.rejected
              ? 'bg-red-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <X className="w-5 h-5" />
          <span>Reject</span>
          <kbd className="text-xs opacity-60 ml-1">(R)</kbd>
        </button>

        <button
          onClick={() => onToggleHighlight(photo.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
            photo.isHighlight
              ? 'bg-amber-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <Star className={clsx('w-5 h-5', photo.isHighlight && 'fill-current')} />
          <span>Highlight</span>
          <kbd className="text-xs opacity-60 ml-1">(H)</kbd>
        </button>

        <button
          onClick={() => onReset(photo.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>

        <a
          href={photo.url}
          download={photo.filename}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Download</span>
        </a>
      </div>
    </div>
  )
}
