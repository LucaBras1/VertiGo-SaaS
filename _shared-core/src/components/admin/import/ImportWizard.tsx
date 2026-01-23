'use client'

/**
 * Import Wizard Component
 *
 * Main wizard component that orchestrates the import flow
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileUploadStep } from './FileUploadStep'
import { ColumnMappingStep } from './ColumnMappingStep'
import { ValidationStep } from './ValidationStep'
import { ImportExecuteStep } from './ImportExecuteStep'
import type { ImportEntityType } from '@/lib/import'
import { Check, Upload, ArrowRight, TableProperties, CheckCircle2, Rocket } from 'lucide-react'

interface ImportWizardProps {
  entityType: ImportEntityType
  entityLabel: string
  onComplete?: () => void
}

type WizardStep = 'upload' | 'mapping' | 'validation' | 'execute'

interface FileUploadResult {
  fileName: string
  fileSize: number
  rowCount: number
  headers: string[]
  preview: Record<string, any>[]
  allData: Record<string, any>[] // All data for validation and import
  suggestedMapping: Record<string, string>
  config: {
    label: string
    description: string
    requiredFields: string[]
    targetFields: { value: string; label: string; required: boolean }[]
  }
}

interface ValidationResult {
  totalRows: number
  mappedRows: number
  validRows: number
  invalidRows: number
  warningRows: number
  errors: any[]
  warnings: any[]
  duplicates: any[]
  existingRecords: {
    existingCount: number
    existingDetails: any[]
  }
  preview: Record<string, any>[]
  summary: {
    canImport: boolean
    canImportWithSkip: boolean
  }
}

const steps: { key: WizardStep; label: string; icon: typeof Upload }[] = [
  { key: 'upload', label: 'Nahrání souboru', icon: Upload },
  { key: 'mapping', label: 'Mapování sloupců', icon: TableProperties },
  { key: 'validation', label: 'Validace', icon: CheckCircle2 },
  { key: 'execute', label: 'Import', icon: Rocket },
]

export function ImportWizard({ entityType, entityLabel, onComplete }: ImportWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const handleFileUploaded = useCallback((result: FileUploadResult) => {
    setUploadResult(result)
    setColumnMapping(result.suggestedMapping)
    setCurrentStep('mapping')
  }, [])

  const handleMappingComplete = useCallback((mapping: Record<string, string>) => {
    setColumnMapping(mapping)
    setCurrentStep('validation')
  }, [])

  const handleValidationComplete = useCallback((result: ValidationResult) => {
    setValidationResult(result)
    setCurrentStep('execute')
  }, [])

  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete()
    } else {
      // Navigate based on entity type
      const routes: Record<ImportEntityType, string> = {
        customer_company: '/admin/customers',
        customer_person: '/admin/customers',
        invoice: '/admin/invoices',
        order: '/admin/orders',
        performance: '/admin/performances',
        game: '/admin/games',
      }
      router.push(routes[entityType] || '/admin')
    }
  }, [entityType, onComplete, router])

  const goBack = useCallback(() => {
    if (currentStep === 'mapping') {
      setCurrentStep('upload')
    } else if (currentStep === 'validation') {
      setCurrentStep('mapping')
    } else if (currentStep === 'execute') {
      setCurrentStep('validation')
    }
  }, [currentStep])

  return (
    <div className="space-y-8">
      {/* Progress steps */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-300"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
        <ul className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = step.key === currentStep
            const isCompleted = index < currentStepIndex
            const StepIcon = step.icon

            return (
              <li key={step.key} className="flex flex-col items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full
                    transition-colors duration-200
                    ${isCompleted
                      ? 'bg-blue-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* File info banner */}
      {uploadResult && currentStep !== 'upload' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-800">
              <strong>{uploadResult.fileName}</strong>
            </span>
            <span className="text-sm text-blue-600">
              {uploadResult.rowCount} řádků, {uploadResult.headers.length} sloupců
            </span>
          </div>
          <button
            onClick={() => {
              setCurrentStep('upload')
              setUploadResult(null)
              setColumnMapping({})
              setValidationResult(null)
            }}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Změnit soubor
          </button>
        </div>
      )}

      {/* Step content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {currentStep === 'upload' && (
          <FileUploadStep
            entityType={entityType}
            onFileUploaded={handleFileUploaded}
          />
        )}

        {currentStep === 'mapping' && uploadResult && (
          <ColumnMappingStep
            headers={uploadResult.headers}
            preview={uploadResult.preview}
            suggestedMapping={columnMapping}
            targetFields={uploadResult.config.targetFields}
            requiredFields={uploadResult.config.requiredFields}
            onMappingComplete={handleMappingComplete}
          />
        )}

        {currentStep === 'validation' && uploadResult && (
          <ValidationStep
            entityType={entityType}
            data={uploadResult.allData}
            columnMapping={columnMapping}
            onValidationComplete={handleValidationComplete}
            onBack={goBack}
          />
        )}

        {currentStep === 'execute' && uploadResult && validationResult && (
          <ImportExecuteStep
            entityType={entityType}
            data={uploadResult.allData}
            columnMapping={columnMapping}
            validationResult={validationResult}
            onComplete={handleComplete}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  )
}
