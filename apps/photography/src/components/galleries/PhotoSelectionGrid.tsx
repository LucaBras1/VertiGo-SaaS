'use client'

import { useState, useEffect, useCallback } from 'react'
import { clsx } from 'clsx'
import { Images } from 'lucide-react'
import { usePhotoSelection, Photo } from '@/hooks/usePhotoSelection'
import { PhotoCard } from './PhotoCard'
import { PhotoSelectionToolbar } from './PhotoSelectionToolbar'
import { PhotoLightbox } from './PhotoLightbox'

interface PhotoSelectionGridProps {
  galleryId: string
  initialPhotos: Photo[]
  onPhotosUpdated?: () => void
}

export function PhotoSelectionGrid({
  galleryId,
  initialPhotos,
  onPhotosUpdated
}: PhotoSelectionGridProps) {
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null)

  const {
    photos,
    filteredPhotos,
    selectedIds,
    filterMode,
    setFilterMode,
    gridSize,
    setGridSize,
    isUpdating,
    stats,
    togglePhotoCheck,
    selectAll,
    clearSelection,
    markAsSelected,
    markAsRejected,
    toggleHighlight,
    resetStatus,
    bulkMarkSelected,
    bulkMarkRejected,
    bulkToggleHighlights,
    bulkReset
  } = usePhotoSelection({
    galleryId,
    initialPhotos,
    onPhotosUpdated
  })

  const lightboxPhoto = lightboxPhotoId
    ? photos.find(p => p.id === lightboxPhotoId) || null
    : null

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Don't trigger if lightbox is open (it has its own handlers)
      if (lightboxPhotoId) return

      if (e.key === 'Escape') {
        clearSelection()
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'a') {
          e.preventDefault()
          selectAll()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightboxPhotoId, clearSelection, selectAll])

  const handleOpenLightbox = useCallback((photoId: string) => {
    setLightboxPhotoId(photoId)
  }, [])

  const handleCloseLightbox = useCallback(() => {
    setLightboxPhotoId(null)
  }, [])

  const handleLightboxNavigate = useCallback((photoId: string) => {
    setLightboxPhotoId(photoId)
  }, [])

  const handleLightboxMarkSelected = useCallback((photoId: string) => {
    markAsSelected([photoId])
  }, [markAsSelected])

  const handleLightboxMarkRejected = useCallback((photoId: string) => {
    markAsRejected([photoId])
  }, [markAsRejected])

  const handleLightboxReset = useCallback((photoId: string) => {
    resetStatus([photoId])
  }, [resetStatus])

  const getGridCols = () => {
    switch (gridSize) {
      case 'small':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
      case 'medium':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      case 'large':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    }
  }

  if (initialPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No photos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhotoSelectionToolbar
        stats={stats}
        filterMode={filterMode}
        gridSize={gridSize}
        isUpdating={isUpdating}
        onFilterChange={setFilterMode}
        onGridSizeChange={setGridSize}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBulkSelect={bulkMarkSelected}
        onBulkReject={bulkMarkRejected}
        onBulkHighlight={() => bulkToggleHighlights(true)}
        onBulkReset={bulkReset}
      />

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <Images className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No photos match the current filter
          </p>
        </div>
      ) : (
        <div className={clsx('grid gap-4', getGridCols())}>
          {filteredPhotos.map(photo => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isChecked={selectedIds.has(photo.id)}
              gridSize={gridSize}
              onToggleCheck={(shiftKey) => togglePhotoCheck(photo.id, shiftKey)}
              onMarkSelected={() => markAsSelected([photo.id])}
              onMarkRejected={() => markAsRejected([photo.id])}
              onToggleHighlight={() => toggleHighlight(photo.id)}
              onOpenLightbox={() => handleOpenLightbox(photo.id)}
            />
          ))}
        </div>
      )}

      <PhotoLightbox
        photo={lightboxPhoto}
        photos={filteredPhotos}
        isOpen={!!lightboxPhotoId}
        onClose={handleCloseLightbox}
        onNavigate={handleLightboxNavigate}
        onMarkSelected={handleLightboxMarkSelected}
        onMarkRejected={handleLightboxMarkRejected}
        onToggleHighlight={toggleHighlight}
        onReset={handleLightboxReset}
      />
    </div>
  )
}
