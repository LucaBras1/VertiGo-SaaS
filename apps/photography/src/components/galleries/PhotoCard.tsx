'use client'

import { memo } from 'react'
import { clsx } from 'clsx'
import { Check, X, Star, ZoomIn, Images } from 'lucide-react'
import type { Photo } from '@/hooks/usePhotoSelection'
import { Badge } from '@vertigo/ui'

interface PhotoCardProps {
  photo: Photo
  isChecked: boolean
  gridSize: 'small' | 'medium' | 'large'
  onToggleCheck: (shiftKey: boolean) => void
  onMarkSelected: () => void
  onMarkRejected: () => void
  onToggleHighlight: () => void
  onOpenLightbox: () => void
}

function PhotoCardComponent({
  photo,
  isChecked,
  gridSize,
  onToggleCheck,
  onMarkSelected,
  onMarkRejected,
  onToggleHighlight,
  onOpenLightbox
}: PhotoCardProps) {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleCheck(e.shiftKey)
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getBorderColor = () => {
    if (photo.rejected) return 'border-l-4 border-l-red-500'
    if (photo.selected) return 'border-l-4 border-l-green-500'
    return ''
  }

  return (
    <div
      className={clsx(
        'relative rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm transition-all',
        'hover:shadow-md',
        getBorderColor(),
        isChecked && 'ring-2 ring-amber-500 ring-offset-2'
      )}
    >
      {/* Image Container */}
      <div
        className={clsx(
          'relative bg-gray-100 group cursor-pointer',
          gridSize === 'small' && 'aspect-square',
          gridSize === 'medium' && 'aspect-[4/3]',
          gridSize === 'large' && 'aspect-[3/2]'
        )}
        onClick={onOpenLightbox}
      >
        {photo.thumbnailUrl || photo.url ? (
          <img
            src={photo.thumbnailUrl || photo.url}
            alt={photo.filename}
            className={clsx(
              'w-full h-full object-cover',
              photo.rejected && 'grayscale opacity-60'
            )}
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Images className="w-8 h-8 text-gray-400" />
          </div>
        )}

        {/* Checkbox */}
        <div
          className="absolute top-2 left-2 z-10"
          onClick={handleCheckboxClick}
        >
          <div
            className={clsx(
              'w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors',
              isChecked
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-white/80 border-gray-300 hover:border-amber-500'
            )}
          >
            {isChecked && <Check className="w-4 h-4" />}
          </div>
        </div>

        {/* Highlight Badge */}
        {photo.isHighlight && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" size="sm">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Highlight
            </Badge>
          </div>
        )}

        {/* Rejected Badge */}
        {photo.rejected && (
          <div className="absolute top-2 right-2">
            <Badge variant="danger" size="sm">
              <X className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => handleActionClick(e, onMarkSelected)}
            className={clsx(
              'p-2 rounded-full transition-colors',
              photo.selected && !photo.rejected
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-green-100'
            )}
            title="Mark as Selected"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onMarkRejected)}
            className={clsx(
              'p-2 rounded-full transition-colors',
              photo.rejected
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 hover:bg-red-100'
            )}
            title="Mark as Rejected"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onToggleHighlight)}
            className={clsx(
              'p-2 rounded-full transition-colors',
              photo.isHighlight
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-700 hover:bg-amber-100'
            )}
            title={photo.isHighlight ? 'Remove Highlight' : 'Mark as Highlight'}
          >
            <Star className={clsx('w-5 h-5', photo.isHighlight && 'fill-current')} />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onOpenLightbox)}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-colors"
            title="View Full Size"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-600 truncate flex-1" title={photo.filename}>
          {photo.filename}
        </span>
        <div className="flex items-center gap-1">
          {photo.qualityScore !== null && (
            <span
              className={clsx(
                'text-xs text-white px-1.5 py-0.5 rounded',
                getQualityColor(photo.qualityScore)
              )}
              title={`Quality Score: ${Math.round(photo.qualityScore)}%`}
            >
              {Math.round(photo.qualityScore)}%
            </span>
          )}
          {photo.isHighlight && (
            <Star className="w-4 h-4 text-amber-500 fill-current" />
          )}
        </div>
      </div>
    </div>
  )
}

export const PhotoCard = memo(PhotoCardComponent)
