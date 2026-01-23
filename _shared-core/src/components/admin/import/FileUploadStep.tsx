'use client'

/**
 * File Upload Step Component
 *
 * First step of the import wizard - file selection and initial parsing
 */

import { useState, useRef, useCallback } from 'react'
import { Upload, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import type { ImportEntityType } from '@/lib/import'

interface FileUploadStepProps {
  entityType: ImportEntityType
  onFileUploaded: (data: {
    fileName: string
    fileSize: number
    rowCount: number
    headers: string[]
    preview: Record<string, any>[]
    allData: Record<string, any>[]
    suggestedMapping: Record<string, string>
    config: {
      label: string
      description: string
      requiredFields: string[]
      targetFields: { value: string; label: string; required: boolean }[]
    }
  }) => void
}

export function FileUploadStep({ entityType, onFileUploaded }: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setError('Prosím nahrajte CSV soubor')
        return
      }

      setIsUploading(true)
      setError(null)
      setUploadedFile({ name: file.name, size: file.size })

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('entityType', entityType)

        const response = await fetch('/api/admin/import', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Chyba při zpracování souboru')
        }

        onFileUploaded(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neznámá chyba')
        setUploadedFile(null)
      } finally {
        setIsUploading(false)
      }
    },
    [entityType, onFileUploaded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Zpracovávám soubor...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-gray-900 font-medium">{uploadedFile.name}</p>
            <p className="text-gray-500 text-sm">{formatFileSize(uploadedFile.size)}</p>
            <p className="text-gray-500 text-sm mt-2">Kliknutím vyberte jiný soubor</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Přetáhněte CSV soubor sem nebo{' '}
              <span className="text-blue-600 hover:text-blue-700">vyberte soubor</span>
            </p>
            <p className="text-gray-400 text-sm">Podporován formát: CSV (max 10 MB)</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Chyba při nahrávání</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Tipy pro import:</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>CSV soubor může používat středník (;) nebo čárku (,) jako oddělovač</li>
          <li>První řádek by měl obsahovat názvy sloupců</li>
          <li>Soubor by měl být v kódování UTF-8</li>
          <li>Prázdné řádky budou automaticky přeskočeny</li>
        </ul>
      </div>
    </div>
  )
}
