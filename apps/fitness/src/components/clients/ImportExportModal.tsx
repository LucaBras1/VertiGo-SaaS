'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogHeader, DialogTitle } from '@vertigo/ui'
import {
  X,
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileDown,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ImportResult {
  success: boolean
  message: string
  result?: {
    created: number
    updated: number
    skipped: number
    errors: Array<{
      row: number
      email: string
      message: string
    }>
  }
  parseWarnings?: Array<{
    row: number
    message: string
  }>
  parseErrors?: Array<{
    row: number
    field: string
    message: string
  }>
}

export function ImportExportModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportExportModalProps) {
  const [mode, setMode] = useState<'import' | 'export'>('import')
  const [file, setFile] = useState<File | null>(null)
  const [updateExisting, setUpdateExisting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // Export filters
  const [exportStatus, setExportStatus] = useState('')
  const [exportFitnessLevel, setExportFitnessLevel] = useState('')

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        if (!selectedFile.name.endsWith('.csv')) {
          toast.error('Prosím vyberte CSV soubor')
          return
        }
        setFile(selectedFile)
        setImportResult(null)
      }
    },
    []
  )

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv')) {
        toast.error('Prosím vyberte CSV soubor')
        return
      }
      setFile(droppedFile)
      setImportResult(null)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleImport = async () => {
    if (!file) {
      toast.error('Vyberte soubor pro import')
      return
    }

    setLoading(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('updateExisting', updateExisting.toString())

      const response = await fetch('/api/clients/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setImportResult({
          success: false,
          message: data.error || 'Chyba při importu',
          parseErrors: data.errors,
          parseWarnings: data.warnings,
        })
        toast.error('Import se nezdařil')
      } else {
        setImportResult(data)
        if (data.result?.created > 0 || data.result?.updated > 0) {
          toast.success(data.message)
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Chyba při importu')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (exportStatus) params.set('status', exportStatus)
      if (exportFitnessLevel) params.set('fitnessLevel', exportFitnessLevel)

      const response = await fetch(`/api/clients/export?${params}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `klienti-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Export dokončen')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Chyba při exportu')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    window.open('/api/clients/import/template', '_blank')
  }

  const handleClose = () => {
    setFile(null)
    setImportResult(null)
    setUpdateExisting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="max-w-lg">
                <DialogHeader onClose={handleClose}>
                  <DialogTitle>
                    Import / Export klientů
                  </DialogTitle>
                </DialogHeader>

                {/* Mode Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => {
                      setMode('import')
                      setImportResult(null)
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      mode === 'import'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </button>
                  <button
                    onClick={() => {
                      setMode('export')
                      setImportResult(null)
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      mode === 'export'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                {mode === 'import' ? (
                  <div className="space-y-4">
                    {/* Template Download */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800">
                          Stáhněte si šablonu CSV souboru s příklady pro správné formátování.
                        </p>
                        <button
                          onClick={downloadTemplate}
                          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <FileDown className="h-4 w-4" />
                          Stáhnout šablonu
                        </button>
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        file
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {file ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-700">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">{file.name}</span>
                          <button
                            onClick={() => {
                              setFile(null)
                              setImportResult(null)
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">
                            Přetáhněte CSV soubor nebo klikněte pro výběr
                          </p>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                          />
                          <label
                            htmlFor="csv-upload"
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            Vybrat soubor
                          </label>
                        </>
                      )}
                    </div>

                    {/* Update Existing Option */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="updateExisting"
                        checked={updateExisting}
                        onChange={(e) => setUpdateExisting(e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label htmlFor="updateExisting" className="text-sm text-gray-700">
                        Aktualizovat existující klienty (podle emailu)
                      </label>
                    </div>

                    {/* Import Result */}
                    {importResult && (
                      <div
                        className={`rounded-lg p-4 ${
                          importResult.success
                            ? 'bg-emerald-50 border border-emerald-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {importResult.success ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`font-medium ${
                                importResult.success ? 'text-emerald-800' : 'text-red-800'
                              }`}
                            >
                              {importResult.message}
                            </p>

                            {importResult.result && (
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Vytvořeno: {importResult.result.created}</p>
                                <p>Aktualizováno: {importResult.result.updated}</p>
                                <p>Přeskočeno: {importResult.result.skipped}</p>
                              </div>
                            )}

                            {/* Parse Errors */}
                            {importResult.parseErrors && importResult.parseErrors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-red-700">Chyby:</p>
                                <ul className="mt-1 text-sm text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                                  {importResult.parseErrors.slice(0, 10).map((err, i) => (
                                    <li key={i}>
                                      Řádek {err.row}: {err.field} - {err.message}
                                    </li>
                                  ))}
                                  {importResult.parseErrors.length > 10 && (
                                    <li>...a další {importResult.parseErrors.length - 10} chyb</li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Import Errors */}
                            {importResult.result?.errors && importResult.result.errors.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-red-700">Chyby při importu:</p>
                                <ul className="mt-1 text-sm text-red-600 list-disc list-inside max-h-32 overflow-y-auto">
                                  {importResult.result.errors.slice(0, 5).map((err, i) => (
                                    <li key={i}>
                                      Řádek {err.row} ({err.email}): {err.message}
                                    </li>
                                  ))}
                                  {importResult.result.errors.length > 5 && (
                                    <li>...a další {importResult.result.errors.length - 5} chyb</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Import Button */}
                    <button
                      onClick={handleImport}
                      disabled={!file || loading}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Importovat klienty
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Exportujte seznam klientů do CSV souboru. Můžete použít filtry pro výběr konkrétních klientů.
                    </p>

                    {/* Export Filters */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={exportStatus}
                          onChange={(e) => setExportStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Všechny</option>
                          <option value="active">Aktivní</option>
                          <option value="inactive">Neaktivní</option>
                          <option value="paused">Pozastavení</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fitness úroveň
                        </label>
                        <select
                          value={exportFitnessLevel}
                          onChange={(e) => setExportFitnessLevel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="">Všechny</option>
                          <option value="beginner">Začátečník</option>
                          <option value="intermediate">Pokročilý</option>
                          <option value="advanced">Expert</option>
                        </select>
                      </div>
                    </div>

                    {/* Export Button */}
                    <button
                      onClick={handleExport}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Download className="h-4 w-4" />
                      Exportovat do CSV
                    </button>
                  </div>
                )}
    </Dialog>
  )
}
