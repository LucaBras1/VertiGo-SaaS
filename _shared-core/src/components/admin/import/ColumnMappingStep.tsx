'use client'

/**
 * Column Mapping Step Component
 *
 * Second step of the import wizard - map CSV columns to target fields
 */

import { useState, useMemo } from 'react'
import { ArrowRight, Check, AlertTriangle, HelpCircle } from 'lucide-react'

interface ColumnMappingStepProps {
  headers: string[]
  preview: Record<string, any>[]
  suggestedMapping: Record<string, string>
  targetFields: { value: string; label: string; required: boolean }[]
  requiredFields: string[]
  onMappingComplete: (mapping: Record<string, string>) => void
}

export function ColumnMappingStep({
  headers,
  preview,
  suggestedMapping,
  targetFields,
  requiredFields,
  onMappingComplete,
}: ColumnMappingStepProps) {
  const [mapping, setMapping] = useState<Record<string, string>>(suggestedMapping)

  // Check if all required fields are mapped
  const mappedFields = useMemo(() => {
    const mapped = new Set<string>()
    Object.values(mapping).forEach((field) => {
      if (field && field !== '_skip') {
        mapped.add(field)
      }
    })
    return mapped
  }, [mapping])

  const missingRequiredFields = useMemo(() => {
    return requiredFields.filter((field) => !mappedFields.has(field))
  }, [requiredFields, mappedFields])

  const isValid = missingRequiredFields.length === 0

  const handleMappingChange = (csvColumn: string, targetField: string) => {
    setMapping((prev) => ({
      ...prev,
      [csvColumn]: targetField,
    }))
  }

  const getSampleValues = (column: string) => {
    return preview
      .slice(0, 3)
      .map((row) => row[column])
      .filter((v) => v !== undefined && v !== null && v !== '')
      .join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Validation status */}
      {missingRequiredFields.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium">Chybějící povinná pole</p>
            <p className="text-amber-600 text-sm mt-1">
              Prosím namapujte následující povinná pole:{' '}
              {missingRequiredFields.map((f) => {
                const field = targetFields.find((tf) => tf.value === f)
                return field?.label || f
              }).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Mapping table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Sloupec v CSV
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500 w-12">
                <ArrowRight className="h-4 w-4 mx-auto" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Cílové pole
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Ukázka dat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {headers.map((header) => {
              const currentMapping = mapping[header] || ''
              const isRequired = requiredFields.includes(currentMapping)
              const isMapped = currentMapping && currentMapping !== '_skip'

              return (
                <tr key={header} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-900">{header}</span>
                      {isMapped && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={currentMapping}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                      className={`
                        w-full px-3 py-2 border rounded-lg text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${isRequired && isMapped ? 'border-green-300 bg-green-50' : 'border-gray-300'}
                      `}
                    >
                      <option value="">-- Vyberte pole --</option>
                      {targetFields.map((field) => {
                        // Check if field is already mapped by another column
                        const isUsed =
                          field.value !== '_skip' &&
                          Object.entries(mapping).some(
                            ([col, val]) => col !== header && val === field.value
                          )

                        return (
                          <option
                            key={field.value}
                            value={field.value}
                            disabled={isUsed}
                          >
                            {field.label}
                            {field.required ? ' *' : ''}
                            {isUsed ? ' (již použito)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500 truncate block max-w-xs">
                      {getSampleValues(header) || '-'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-red-500">*</span>
          <span>Povinné pole</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>Namapováno</span>
        </div>
      </div>

      {/* Continue button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={() => onMappingComplete(mapping)}
          disabled={!isValid}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Pokračovat k validaci
        </button>
      </div>
    </div>
  )
}
