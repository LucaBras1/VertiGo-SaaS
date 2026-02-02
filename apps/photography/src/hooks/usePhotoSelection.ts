'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

export interface Photo {
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
}

export interface PhotoUpdate {
  id: string
  selected?: boolean
  rejected?: boolean
  isHighlight?: boolean
  rejectionReason?: string | null
}

export type FilterMode = 'all' | 'selected' | 'rejected' | 'highlights'
export type GridSize = 'small' | 'medium' | 'large'

interface UsePhotoSelectionProps {
  galleryId: string
  initialPhotos: Photo[]
  onPhotosUpdated?: () => void
}

export function usePhotoSelection({ galleryId, initialPhotos, onPhotosUpdated }: UsePhotoSelectionProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [gridSize, setGridSize] = useState<GridSize>('medium')
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastClickedId, setLastClickedId] = useState<string | null>(null)

  const pendingUpdates = useRef<Map<string, PhotoUpdate>>(new Map())
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Update photos when initialPhotos changes
  useEffect(() => {
    setPhotos(initialPhotos)
  }, [initialPhotos])

  // Filter photos based on current filter mode
  const filteredPhotos = photos.filter(photo => {
    switch (filterMode) {
      case 'selected':
        return photo.selected && !photo.rejected
      case 'rejected':
        return photo.rejected
      case 'highlights':
        return photo.isHighlight
      default:
        return true
    }
  })

  // Flush pending updates to API
  const flushUpdates = useCallback(async () => {
    if (pendingUpdates.current.size === 0) return

    const updates = Array.from(pendingUpdates.current.values())
    pendingUpdates.current.clear()

    setIsUpdating(true)
    try {
      const res = await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      if (!res.ok) {
        throw new Error('Failed to update photos')
      }

      onPhotosUpdated?.()
    } catch (error) {
      console.error('Failed to update photos:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsUpdating(false)
    }
  }, [galleryId, onPhotosUpdated])

  // Queue an update with debouncing
  const queueUpdate = useCallback((update: PhotoUpdate) => {
    // Merge with existing pending update for this photo
    const existing = pendingUpdates.current.get(update.id) || { id: update.id }
    pendingUpdates.current.set(update.id, { ...existing, ...update })

    // Reset debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    debounceTimer.current = setTimeout(flushUpdates, 500)
  }, [flushUpdates])

  // Apply optimistic update to local state
  const applyOptimisticUpdate = useCallback((photoId: string, updates: Partial<Photo>) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, ...updates } : p
    ))
  }, [])

  // Toggle selection checkbox for a single photo
  const togglePhotoCheck = useCallback((photoId: string, shiftKey: boolean = false) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)

      if (shiftKey && lastClickedId) {
        // Range selection with shift+click
        const currentIndex = filteredPhotos.findIndex(p => p.id === photoId)
        const lastIndex = filteredPhotos.findIndex(p => p.id === lastClickedId)

        if (currentIndex !== -1 && lastIndex !== -1) {
          const start = Math.min(currentIndex, lastIndex)
          const end = Math.max(currentIndex, lastIndex)

          for (let i = start; i <= end; i++) {
            newSet.add(filteredPhotos[i].id)
          }
        }
      } else {
        if (newSet.has(photoId)) {
          newSet.delete(photoId)
        } else {
          newSet.add(photoId)
        }
      }

      return newSet
    })
    setLastClickedId(photoId)
  }, [lastClickedId, filteredPhotos])

  // Select all visible photos
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredPhotos.map(p => p.id)))
  }, [filteredPhotos])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Mark photos as selected (not rejected)
  const markAsSelected = useCallback((photoIds: string[]) => {
    photoIds.forEach(id => {
      applyOptimisticUpdate(id, { selected: true, rejected: false, rejectionReason: null })
      queueUpdate({ id, selected: true, rejected: false, rejectionReason: null })
    })
  }, [applyOptimisticUpdate, queueUpdate])

  // Mark photos as rejected
  const markAsRejected = useCallback((photoIds: string[], reason?: string) => {
    photoIds.forEach(id => {
      applyOptimisticUpdate(id, { selected: false, rejected: true, rejectionReason: reason || null })
      queueUpdate({ id, selected: false, rejected: true, rejectionReason: reason || null })
    })
  }, [applyOptimisticUpdate, queueUpdate])

  // Toggle highlight status
  const toggleHighlight = useCallback((photoId: string) => {
    const photo = photos.find(p => p.id === photoId)
    if (!photo) return

    const newValue = !photo.isHighlight
    applyOptimisticUpdate(photoId, { isHighlight: newValue })
    queueUpdate({ id: photoId, isHighlight: newValue })
  }, [photos, applyOptimisticUpdate, queueUpdate])

  // Set highlight for multiple photos
  const setHighlights = useCallback((photoIds: string[], value: boolean) => {
    photoIds.forEach(id => {
      applyOptimisticUpdate(id, { isHighlight: value })
      queueUpdate({ id, isHighlight: value })
    })
  }, [applyOptimisticUpdate, queueUpdate])

  // Reset photo status (selected: true, rejected: false, isHighlight: false)
  const resetStatus = useCallback((photoIds: string[]) => {
    photoIds.forEach(id => {
      applyOptimisticUpdate(id, { selected: true, rejected: false, isHighlight: false, rejectionReason: null })
      queueUpdate({ id, selected: true, rejected: false, isHighlight: false, rejectionReason: null })
    })
  }, [applyOptimisticUpdate, queueUpdate])

  // Bulk actions on selected photos
  const bulkMarkSelected = useCallback(() => {
    markAsSelected(Array.from(selectedIds))
    clearSelection()
    toast.success(`${selectedIds.size} photos marked as selected`)
  }, [selectedIds, markAsSelected, clearSelection])

  const bulkMarkRejected = useCallback((reason?: string) => {
    markAsRejected(Array.from(selectedIds), reason)
    clearSelection()
    toast.success(`${selectedIds.size} photos marked as rejected`)
  }, [selectedIds, markAsRejected, clearSelection])

  const bulkToggleHighlights = useCallback((value: boolean) => {
    setHighlights(Array.from(selectedIds), value)
    clearSelection()
    toast.success(`${selectedIds.size} photos ${value ? 'marked as highlights' : 'unmarked as highlights'}`)
  }, [selectedIds, setHighlights, clearSelection])

  const bulkReset = useCallback(() => {
    resetStatus(Array.from(selectedIds))
    clearSelection()
    toast.success(`${selectedIds.size} photos reset`)
  }, [selectedIds, resetStatus, clearSelection])

  // Stats
  const stats = {
    total: photos.length,
    selected: photos.filter(p => p.selected && !p.rejected).length,
    rejected: photos.filter(p => p.rejected).length,
    highlights: photos.filter(p => p.isHighlight).length,
    checked: selectedIds.size
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
        flushUpdates()
      }
    }
  }, [flushUpdates])

  return {
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
    setHighlights,
    resetStatus,
    bulkMarkSelected,
    bulkMarkRejected,
    bulkToggleHighlights,
    bulkReset
  }
}
