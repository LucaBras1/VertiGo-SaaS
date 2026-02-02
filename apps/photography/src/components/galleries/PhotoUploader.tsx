'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface UploadedPhoto {
  id: string
  filename: string
  url: string
  thumbnailUrl: string | null
  status: 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}

interface PhotoUploaderProps {
  galleryId: string
  onUploadComplete?: (photos: UploadedPhoto[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function PhotoUploader({
  galleryId,
  onUploadComplete,
  maxFiles = 50,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadedPhoto[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const addFiles = useCallback((newFiles: File[]) => {
    const existingCount = files.length
    const availableSlots = maxFiles - existingCount

    if (availableSlots <= 0) return

    const filesToAdd = newFiles.slice(0, availableSlots)

    const newUploadFiles: UploadedPhoto[] = filesToAdd.map(file => ({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      url: URL.createObjectURL(file),
      thumbnailUrl: null,
      status: 'uploading' as const,
      progress: 0
    }))

    setFiles(prev => [...prev, ...newUploadFiles])
  }, [files.length, maxFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => acceptedTypes.includes(file.type)
    )

    addFiles(droppedFiles)
  }, [acceptedTypes, addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => acceptedTypes.includes(file.type)
      )
      addFiles(selectedFiles)
    }
  }, [acceptedTypes, addFiles])


  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'uploading')

    if (pendingFiles.length === 0) return

    setIsUploading(true)

    // Get file objects from the URL blobs
    const fileElements = document.querySelectorAll<HTMLInputElement>('input[type="file"]')
    const inputFiles = fileInputRef.current?.files

    const formData = new FormData()

    // Use fetch to get blob data from object URLs and append to FormData
    for (const file of pendingFiles) {
      if (file.url.startsWith('blob:')) {
        try {
          const response = await fetch(file.url)
          const blob = await response.blob()
          formData.append('files', blob, file.filename)
        } catch (err) {
          setFiles(prev => prev.map(f =>
            f.id === file.id
              ? { ...f, status: 'error' as const, error: 'Failed to read file' }
              : f
          ))
        }
      }
    }

    try {
      const response = await fetch(`/api/galleries/${galleryId}/photos`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }

      const result = await response.json()

      // Update file statuses
      setFiles(prev => prev.map((f, idx) => {
        if (f.status === 'uploading') {
          const uploadedPhoto = result.photos[idx]
          if (uploadedPhoto) {
            return {
              ...f,
              id: uploadedPhoto.id,
              url: uploadedPhoto.url,
              thumbnailUrl: uploadedPhoto.thumbnailUrl,
              status: 'success' as const
            }
          }
        }
        return f
      }))

      if (onUploadComplete) {
        onUploadComplete(result.photos)
      }
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading'
          ? { ...f, status: 'error' as const, error: (error as Error).message }
          : f
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  const successCount = files.filter(f => f.status === 'success').length
  const pendingCount = files.filter(f => f.status === 'uploading').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-amber-500 bg-amber-50'
            : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-amber-500' : 'text-gray-400'}`} />

        <p className="text-lg font-medium text-gray-700">
          {isDragging ? 'Drop photos here' : 'Drag & drop photos'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          or click to select files
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supports: JPEG, PNG, WebP, HEIC &bull; Max {maxFiles} files
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              {pendingCount > 0 && (
                <span className="text-gray-600">{pendingCount} pending</span>
              )}
              {successCount > 0 && (
                <span className="text-green-600">{successCount} uploaded</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-600">{errorCount} failed</span>
              )}
            </div>

            <div className="flex gap-2">
              {successCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>

          {/* File Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map(file => (
              <div
                key={file.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border"
              >
                {/* Preview Image */}
                {file.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-300" />
                  </div>
                )}

                {/* Status Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center ${
                  file.status === 'uploading' ? 'bg-black/30' :
                  file.status === 'success' ? 'bg-green-500/20' :
                  file.status === 'error' ? 'bg-red-500/20' : ''
                }`}>
                  {file.status === 'uploading' && (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Filename */}
                <div className="absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-xs text-white truncate">{file.filename}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {pendingCount > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={uploadFiles}
                disabled={isUploading}
                isLoading={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload {pendingCount} {pendingCount === 1 ? 'Photo' : 'Photos'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
