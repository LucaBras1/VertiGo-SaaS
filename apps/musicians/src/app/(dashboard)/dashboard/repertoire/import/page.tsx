'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ParsedSong {
  title: string
  artist?: string
  genre?: string
  duration?: number
  bpm?: number
  key?: string
  notes?: string
}

interface ImportResult {
  imported: number
  total: number
  errors: Array<{ row: number; message: string }>
}

export default function RepertoireImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<ParsedSong[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Prosím nahrajte CSV soubor')
      return
    }

    setFile(selectedFile)
    setImportResult(null)

    // Read and preview the file
    try {
      const content = await selectedFile.text()
      const lines = content.trim().split('\n')

      if (lines.length < 2) {
        toast.error('CSV soubor musí obsahovat záhlaví a alespoň jeden řádek dat')
        return
      }

      // Simple preview (first 5 rows)
      const headers = lines[0].split(',').map(h => h.trim())
      const preview: ParsedSong[] = []

      for (let i = 1; i < Math.min(6, lines.length); i++) {
        const values = lines[i].split(',').map(v => v.trim())
        preview.push({
          title: values[0] || 'N/A',
          artist: values[1] || undefined,
          genre: values[2] || undefined,
        })
      }

      setPreviewData(preview)
    } catch (error) {
      toast.error('Chyba při čtení souboru')
      console.error(error)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Nejprve vyberte soubor')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/repertoire/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import selhal')
      }

      setImportResult(data)

      if (data.errors.length === 0) {
        toast.success(`Úspěšně importováno ${data.imported} písní`)
        setTimeout(() => {
          router.push('/dashboard/repertoire')
        }, 2000)
      } else {
        toast.error(`Importováno ${data.imported}/${data.total} písní s ${data.errors.length} chybami`)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import selhal')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'title,artist,genre,duration,bpm,key,notes\nBohemian Rhapsody,Queen,Rock,355,72,Bb,Classic rock anthem\nImagine,John Lennon,Pop,183,76,C,Peace song'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'repertoire-template.csv'
    link.click()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/repertoire">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import CSV</h1>
          <p className="text-gray-600 mt-1">Importujte písně z CSV souboru</p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Formát CSV souboru</h3>
            <p className="text-sm text-gray-600">
              CSV soubor musí obsahovat záhlaví v prvním řádku. Podporované sloupce:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>
                <strong>title</strong> (povinný) - název písně
              </li>
              <li>artist - interpret</li>
              <li>genre - žánr</li>
              <li>duration - délka v sekundách nebo formát MM:SS</li>
              <li>bpm - tempo</li>
              <li>key - tónina</li>
              <li>notes - poznámky</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Stáhnout vzorový soubor
            </Button>
          </div>
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <div className="space-y-4">
          <Label htmlFor="csv-file">Vyberte CSV soubor</Label>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-primary-600 mx-auto" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    setPreviewData([])
                    setImportResult(null)
                  }}
                >
                  Změnit soubor
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  Přetáhněte CSV soubor sem nebo klikněte pro výběr
                </p>
                <p className="text-xs text-gray-500">Maximální velikost: 10 MB</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Preview */}
      {previewData.length > 0 && !importResult && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Náhled dat (prvních 5 řádků)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">
                    Název
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">
                    Interpret
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">
                    Žánr
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewData.map((song, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-gray-900">{song.title}</td>
                    <td className="py-2 px-3 text-gray-600">
                      {song.artist || '-'}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {song.genre || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleImport} disabled={isUploading}>
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importuji...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importovat písně
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {importResult.errors.length === 0 ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {importResult.errors.length === 0
                    ? 'Import dokončen úspěšně'
                    : 'Import dokončen s upozorněními'}
                </h3>
                <p className="text-gray-600 mt-1">
                  Importováno {importResult.imported} z {importResult.total} písní
                </p>

                {importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Chyby při importu:
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((error, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-red-600"
                        >
                          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>
                            Řádek {error.row}: {error.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => router.push('/dashboard/repertoire')}>
                Zpět do repertoáru
              </Button>
              <Button
                onClick={() => {
                  setFile(null)
                  setPreviewData([])
                  setImportResult(null)
                }}
              >
                Importovat další soubor
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
