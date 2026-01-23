'use client'

/**
 * Import Execute Step Component
 *
 * Final step of the import wizard - execute the import
 */

import { useState } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  RefreshCw,
  Download,
} from 'lucide-react'
import type { ImportEntityType } from '@/lib/import'

interface ImportExecuteStepProps {
  entityType: ImportEntityType
  data: Record<string, any>[]
  columnMapping: Record<string, string>
  validationResult: {
    existingRecords: {
      existingCount: number
    }
  }
  onComplete: () => void
  onBack: () => void
}

interface ImportResult {
  success: boolean
  created: number
  updated: number
  skipped: number
  errors: { row: number; error: string }[]
  dryRun: boolean
  message: string
}

export function ImportExecuteStep({
  entityType,
  data,
  columnMapping,
  validationResult,
  onComplete,
  onBack,
}: ImportExecuteStepProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState({
    skipExisting: true,
    updateExisting: false,
    dryRun: true, // Start with dry run
  })

  const hasExisting = validationResult.existingRecords.existingCount > 0

  const executeImport = async () => {
    setIsImporting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          data,
          columnMapping,
          options,
        }),
      })

      const json = await response.json()

      if (!json.success && !json.data) {
        throw new Error(json.error || 'Chyba při importu')
      }

      setResult(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznámá chyba')
    } finally {
      setIsImporting(false)
    }
  }

  const handleRealImport = () => {
    setOptions((prev) => ({ ...prev, dryRun: false }))
    setResult(null)
  }

  const exportErrors = () => {
    if (!result?.errors.length) return

    const csv = [
      ['Řádek', 'Chyba'].join(';'),
      ...result.errors.map((e) => [e.row + 1, e.error].join(';')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Options */}
      {!result && (
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Nastavení importu</h3>

          {hasExisting && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Bylo nalezeno {validationResult.existingRecords.existingCount} existujících
                záznamů. Jak s nimi naložit?
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="existingAction"
                    checked={options.skipExisting && !options.updateExisting}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        skipExisting: true,
                        updateExisting: false,
                      }))
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Přeskočit existující záznamy (bezpečnější)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="existingAction"
                    checked={options.updateExisting}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        skipExisting: false,
                        updateExisting: true,
                      }))
                    }
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Aktualizovat existující záznamy novými daty
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.dryRun}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, dryRun: e.target.checked }))
                }
                className="h-4 w-4 text-blue-600 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Simulace (dry run)
                </span>
                <p className="text-xs text-gray-500">
                  Zkontroluje, co by se stalo, bez skutečného zápisu do databáze
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Import button */}
      {!result && (
        <div className="flex justify-center">
          <button
            onClick={executeImport}
            disabled={isImporting}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors
              ${isImporting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : options.dryRun
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            `}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {options.dryRun ? 'Simuluji...' : 'Importuji...'}
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                {options.dryRun ? 'Spustit simulaci' : 'Spustit import'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Chyba při importu</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Status */}
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              result.dryRun
                ? 'bg-amber-50 border-amber-200'
                : result.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {result.dryRun ? (
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            ) : result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`font-medium ${
                  result.dryRun
                    ? 'text-amber-800'
                    : result.success
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {result.dryRun ? 'Simulace dokončena' : result.success ? 'Import dokončen' : 'Import dokončen s chybami'}
              </p>
              <p
                className={`text-sm mt-1 ${
                  result.dryRun
                    ? 'text-amber-600'
                    : result.success
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {result.message}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">Vytvořeno</p>
              <p className="text-2xl font-semibold text-green-700">{result.created}</p>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600">Aktualizováno</p>
              <p className="text-2xl font-semibold text-blue-700">{result.updated}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Přeskočeno</p>
              <p className="text-2xl font-semibold text-gray-700">{result.skipped}</p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">Chyb</p>
              <p className="text-2xl font-semibold text-red-700">{result.errors.length}</p>
            </div>
          </div>

          {/* Errors list */}
          {result.errors.length > 0 && (
            <div className="border border-red-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-red-50">
                <span className="font-medium text-red-800">
                  Chyby při importu ({result.errors.length})
                </span>
                <button
                  onClick={exportErrors}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-red-700">Řádek</th>
                      <th className="px-4 py-2 text-left text-red-700">Chyba</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {result.errors.slice(0, 50).map((err, i) => (
                      <tr key={i} className="hover:bg-red-50">
                        <td className="px-4 py-2 text-red-600">{err.row + 1}</td>
                        <td className="px-4 py-2 text-red-700">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions after result */}
          <div className="flex justify-center gap-4 pt-4">
            {result.dryRun ? (
              <button
                onClick={handleRealImport}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="h-5 w-5" />
                Spustit skutečný import
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CheckCircle className="h-5 w-5" />
                Dokončit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back button */}
      {!result && (
        <div className="flex justify-start pt-4 border-t border-gray-200">
          <button
            onClick={onBack}
            disabled={isImporting}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
          >
            Zpět na validaci
          </button>
        </div>
      )}
    </div>
  )
}
