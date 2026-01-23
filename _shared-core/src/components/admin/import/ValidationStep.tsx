'use client'

/**
 * Validation Step Component
 *
 * Third step of the import wizard - validate data before import
 */

import { useState, useEffect } from 'react'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { ImportEntityType } from '@/lib/import'

interface ValidationStepProps {
  entityType: ImportEntityType
  data: Record<string, any>[]
  columnMapping: Record<string, string>
  onValidationComplete: (result: ValidationResult) => void
  onBack: () => void
}

interface ValidationResult {
  totalRows: number
  mappedRows: number
  skippedRows: number
  validRows: number
  invalidRows: number
  warningRows: number
  errors: { row: number; field: string; message: string; value?: any }[]
  warnings: { row: number; field: string; message: string; value?: any }[]
  duplicates: { field: string; values: string[] }[]
  existingRecords: {
    existingCount: number
    existingDetails: { field: string; value: string; rowIndex: number }[]
  }
  preview: Record<string, any>[]
  summary: {
    canImport: boolean
    canImportWithSkip: boolean
    validCount: number
    invalidCount: number
    warningCount: number
  }
}

export function ValidationStep({
  entityType,
  data,
  columnMapping,
  onValidationComplete,
  onBack,
}: ValidationStepProps) {
  const [isValidating, setIsValidating] = useState(true)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: false,
    duplicates: false,
    existing: false,
    preview: false,
  })

  useEffect(() => {
    const validate = async () => {
      setIsValidating(true)
      setError(null)

      try {
        const response = await fetch('/api/admin/import/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entityType, data, columnMapping }),
        })

        const json = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Chyba při validaci')
        }

        setResult(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neznámá chyba')
      } finally {
        setIsValidating(false)
      }
    }

    validate()
  }, [entityType, data, columnMapping])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Validuji data...</p>
        <p className="text-gray-400 text-sm mt-1">Kontroluji {data.length} záznamů</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Chyba při validaci</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Zpět na mapování
          </button>
        </div>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Celkem řádků</p>
          <p className="text-2xl font-semibold text-gray-900">{result.totalRows}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Validních</p>
          <p className="text-2xl font-semibold text-green-700">{result.validRows}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-600">S varováním</p>
          <p className="text-2xl font-semibold text-amber-700">{result.warningRows}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">S chybou</p>
          <p className="text-2xl font-semibold text-red-700">{result.invalidRows}</p>
        </div>
      </div>

      {/* Status message */}
      {result.summary.canImport ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-800">
            Data jsou připravena k importu. Můžete pokračovat.
          </p>
        </div>
      ) : result.summary.canImportWithSkip ? (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-800">
            Některé záznamy již existují v databázi. Můžete je přeskočit nebo aktualizovat.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-800">
            Některé záznamy obsahují chyby. Opravte je a zkuste znovu.
          </p>
        </div>
      )}

      {/* Errors section */}
      {result.errors.length > 0 && (
        <div className="border border-red-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('errors')}
            className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-800">
                Chyby ({result.errors.length})
              </span>
            </div>
            {expandedSections.errors ? (
              <ChevronUp className="h-5 w-5 text-red-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-red-500" />
            )}
          </button>
          {expandedSections.errors && (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-red-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-red-700">Řádek</th>
                    <th className="px-4 py-2 text-left text-red-700">Pole</th>
                    <th className="px-4 py-2 text-left text-red-700">Chyba</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {result.errors.slice(0, 50).map((err, i) => (
                    <tr key={i} className="hover:bg-red-50">
                      <td className="px-4 py-2 text-red-600">{err.row + 1}</td>
                      <td className="px-4 py-2 text-red-600 font-mono">{err.field}</td>
                      <td className="px-4 py-2 text-red-700">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.errors.length > 50 && (
                <p className="px-4 py-2 text-sm text-red-600 bg-red-50">
                  ...a dalších {result.errors.length - 50} chyb
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Warnings section */}
      {result.warnings.length > 0 && (
        <div className="border border-amber-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('warnings')}
            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-amber-800">
                Varování ({result.warnings.length})
              </span>
            </div>
            {expandedSections.warnings ? (
              <ChevronUp className="h-5 w-5 text-amber-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-amber-500" />
            )}
          </button>
          {expandedSections.warnings && (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-amber-700">Řádek</th>
                    <th className="px-4 py-2 text-left text-amber-700">Pole</th>
                    <th className="px-4 py-2 text-left text-amber-700">Varování</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {result.warnings.slice(0, 50).map((warn, i) => (
                    <tr key={i} className="hover:bg-amber-50">
                      <td className="px-4 py-2 text-amber-600">{warn.row + 1}</td>
                      <td className="px-4 py-2 text-amber-600 font-mono">{warn.field}</td>
                      <td className="px-4 py-2 text-amber-700">{warn.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Existing records section */}
      {result.existingRecords.existingCount > 0 && (
        <div className="border border-blue-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('existing')}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-800">
                Existující záznamy ({result.existingRecords.existingCount})
              </span>
            </div>
            {expandedSections.existing ? (
              <ChevronUp className="h-5 w-5 text-blue-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-blue-500" />
            )}
          </button>
          {expandedSections.existing && (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-blue-700">Řádek</th>
                    <th className="px-4 py-2 text-left text-blue-700">Pole</th>
                    <th className="px-4 py-2 text-left text-blue-700">Hodnota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {result.existingRecords.existingDetails.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50">
                      <td className="px-4 py-2 text-blue-600">{item.rowIndex + 1}</td>
                      <td className="px-4 py-2 text-blue-600 font-mono">{item.field}</td>
                      <td className="px-4 py-2 text-blue-700">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Preview section */}
      {result.preview.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('preview')}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-800">
              Náhled transformovaných dat ({result.preview.length} záznamů)
            </span>
            {expandedSections.preview ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {expandedSections.preview && (
            <div className="max-h-96 overflow-auto">
              <pre className="p-4 text-xs bg-gray-50">
                {JSON.stringify(result.preview, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Zpět na mapování
        </button>
        <button
          onClick={() => onValidationComplete(result)}
          disabled={!result.summary.canImport && !result.summary.canImportWithSkip}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${result.summary.canImport || result.summary.canImportWithSkip
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Pokračovat k importu
        </button>
      </div>
    </div>
  )
}
