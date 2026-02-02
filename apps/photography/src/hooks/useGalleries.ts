import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

// Types
export interface GalleryPhoto {
  id: string
  filename: string
  url: string
  thumbnailUrl: string | null
  publicId: string | null
  width: number | null
  height: number | null
  size: number | null
  mimeType: string | null
  qualityScore: number | null
  category: string | null
  isHighlight: boolean
  selected: boolean
  rejected: boolean
  rejectionReason: string | null
  createdAt: string
}

export interface Gallery {
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
  updatedAt: string
  shoot?: {
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
  photos?: GalleryPhoto[]
}

export interface GalleryFilters {
  search?: string
  status?: 'PROCESSING' | 'READY' | 'DELIVERED'
  sortBy?: 'createdAt' | 'name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateGalleryInput {
  shootId: string
  name: string
  password?: string
  expiresAt?: string
  downloadEnabled?: boolean
}

export interface UpdateGalleryInput {
  name?: string
  status?: 'PROCESSING' | 'READY' | 'DELIVERED'
  password?: string
  expiresAt?: string
  downloadEnabled?: boolean
}

export interface UploadPhotosResult {
  success: boolean
  count: number
  photos: GalleryPhoto[]
}

// API functions
async function fetchGalleries(filters: GalleryFilters = {}): Promise<Gallery[]> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
  if (filters.page) params.set('page', filters.page.toString())
  if (filters.limit) params.set('limit', filters.limit.toString())

  const response = await fetch(`/api/galleries?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch galleries')
  }
  return response.json()
}

async function fetchGallery(id: string): Promise<Gallery> {
  const response = await fetch(`/api/galleries/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch gallery')
  }
  return response.json()
}

async function createGallery(data: CreateGalleryInput): Promise<Gallery> {
  const response = await fetch('/api/galleries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create gallery')
  }
  return response.json()
}

async function updateGallery({ id, ...data }: UpdateGalleryInput & { id: string }): Promise<Gallery> {
  const response = await fetch(`/api/galleries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update gallery')
  }
  return response.json()
}

async function deleteGallery(id: string): Promise<void> {
  const response = await fetch(`/api/galleries/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete gallery')
  }
}

async function fetchGalleryPhotos(galleryId: string): Promise<GalleryPhoto[]> {
  const response = await fetch(`/api/galleries/${galleryId}/photos`)
  if (!response.ok) {
    throw new Error('Failed to fetch photos')
  }
  return response.json()
}

async function uploadPhotos(galleryId: string, files: File[]): Promise<UploadPhotosResult> {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))

  const response = await fetch(`/api/galleries/${galleryId}/photos`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload photos')
  }
  return response.json()
}

async function deletePhoto(galleryId: string, photoId: string): Promise<void> {
  const response = await fetch(`/api/galleries/${galleryId}/photos?photoId=${photoId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete photo')
  }
}

async function updatePhotoSelection(
  galleryId: string,
  photoId: string,
  selected: boolean
): Promise<GalleryPhoto> {
  const response = await fetch(`/api/galleries/${galleryId}/photos/${photoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update photo')
  }
  return response.json()
}

// Hooks
export function useGalleries(filters: GalleryFilters = {}) {
  return useQuery({
    queryKey: ['galleries', filters],
    queryFn: () => fetchGalleries(filters),
  })
}

export function useGallery(id: string | undefined) {
  return useQuery({
    queryKey: ['gallery', id],
    queryFn: () => fetchGallery(id!),
    enabled: !!id,
  })
}

export function useGalleryPhotos(galleryId: string | undefined) {
  return useQuery({
    queryKey: ['gallery', galleryId, 'photos'],
    queryFn: () => fetchGalleryPhotos(galleryId!),
    enabled: !!galleryId,
  })
}

export function useCreateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
      toast.success('Gallery created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGallery,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', data.id] })
      toast.success('Gallery updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
      toast.success('Gallery deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUploadPhotos(galleryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: File[]) => uploadPhotos(galleryId, files),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId] })
      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId, 'photos'] })
      toast.success(`${result.count} photo${result.count !== 1 ? 's' : ''} uploaded`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeletePhoto(galleryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (photoId: string) => deletePhoto(galleryId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId] })
      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId, 'photos'] })
      toast.success('Photo deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePhotoSelection(galleryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ photoId, selected }: { photoId: string; selected: boolean }) =>
      updatePhotoSelection(galleryId, photoId, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId] })
      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId, 'photos'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Gallery status labels
export const GALLERY_STATUS_LABELS: Record<string, string> = {
  PROCESSING: 'Processing',
  READY: 'Ready',
  DELIVERED: 'Delivered',
}

export const GALLERY_STATUS_COLORS: Record<string, string> = {
  PROCESSING: 'yellow',
  READY: 'green',
  DELIVERED: 'blue',
}
