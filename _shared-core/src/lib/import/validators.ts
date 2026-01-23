/**
 * Data Validators Module
 *
 * Validation rules and functions for import data
 */

import {
  normalizeEmail,
  normalizePhone,
  normalizeICO,
  normalizeDIC,
  parseDate,
} from './transformers'

export interface ValidationRule {
  field: string
  label: string
  required?: boolean
  type?: 'string' | 'number' | 'date' | 'email' | 'phone' | 'ico' | 'dic'
  pattern?: RegExp
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  custom?: (value: any, row: Record<string, any>) => string | null
}

export interface ValidationError {
  row: number
  field: string
  value: any
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  validRows: number[]
  invalidRows: number[]
  stats: {
    total: number
    valid: number
    invalid: number
    warnings: number
  }
}

/**
 * Validate a single value against a rule
 */
function validateValue(
  value: any,
  rule: ValidationRule,
  row: Record<string, any>
): string | null {
  const strValue = value?.toString().trim() || ''

  // Required check
  if (rule.required && strValue === '') {
    return `${rule.label} je povinné pole`
  }

  // Skip further validation if empty and not required
  if (strValue === '') return null

  // Type-specific validation
  switch (rule.type) {
    case 'email':
      if (!normalizeEmail(strValue)) {
        return `${rule.label} není platná emailová adresa`
      }
      break

    case 'phone':
      if (!normalizePhone(strValue)) {
        return `${rule.label} není platné telefonní číslo`
      }
      break

    case 'ico':
      if (!normalizeICO(strValue)) {
        return `${rule.label} není platné IČO (8 číslic)`
      }
      break

    case 'dic':
      if (!normalizeDIC(strValue)) {
        return `${rule.label} není platné DIČ`
      }
      break

    case 'date':
      if (!parseDate(strValue)) {
        return `${rule.label} není platné datum (použijte formát DD.MM.RRRR)`
      }
      break

    case 'number':
      const num = parseFloat(strValue.replace(/\s/g, '').replace(',', '.'))
      if (isNaN(num)) {
        return `${rule.label} musí být číslo`
      }
      if (rule.min !== undefined && num < rule.min) {
        return `${rule.label} musí být minimálně ${rule.min}`
      }
      if (rule.max !== undefined && num > rule.max) {
        return `${rule.label} musí být maximálně ${rule.max}`
      }
      break

    case 'string':
    default:
      if (rule.minLength && strValue.length < rule.minLength) {
        return `${rule.label} musí mít minimálně ${rule.minLength} znaků`
      }
      if (rule.maxLength && strValue.length > rule.maxLength) {
        return `${rule.label} může mít maximálně ${rule.maxLength} znaků`
      }
      break
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(strValue)) {
    return `${rule.label} má neplatný formát`
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value, row)
    if (customError) return customError
  }

  return null
}

/**
 * Validate entire dataset against rules
 */
export function validateData(
  data: Record<string, any>[],
  rules: ValidationRule[],
  columnMapping: Record<string, string>
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const validRows: number[] = []
  const invalidRows: number[] = []

  data.forEach((row, index) => {
    let rowValid = true

    for (const rule of rules) {
      // Get the CSV column name that maps to this field
      const csvColumn = Object.entries(columnMapping).find(
        ([, field]) => field === rule.field
      )?.[0]

      if (!csvColumn && rule.required) {
        errors.push({
          row: index + 1,
          field: rule.field,
          value: null,
          message: `Sloupec pro "${rule.label}" není namapován`,
          severity: 'error',
        })
        rowValid = false
        continue
      }

      const value = csvColumn ? row[csvColumn] : null
      const error = validateValue(value, rule, row)

      if (error) {
        if (rule.required) {
          errors.push({
            row: index + 1,
            field: rule.field,
            value,
            message: error,
            severity: 'error',
          })
          rowValid = false
        } else {
          warnings.push({
            row: index + 1,
            field: rule.field,
            value,
            message: error,
            severity: 'warning',
          })
        }
      }
    }

    if (rowValid) {
      validRows.push(index)
    } else {
      invalidRows.push(index)
    }
  })

  return {
    valid: invalidRows.length === 0,
    errors,
    warnings,
    validRows,
    invalidRows,
    stats: {
      total: data.length,
      valid: validRows.length,
      invalid: invalidRows.length,
      warnings: warnings.length,
    },
  }
}

// ============================================
// Entity-specific validation rules
// ============================================

export const customerValidationRules: ValidationRule[] = [
  {
    field: 'firstName',
    label: 'Jméno',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
  },
  {
    field: 'lastName',
    label: 'Příjmení',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
  },
  {
    field: 'email',
    label: 'Email',
    required: false, // We'll generate placeholder if missing
    type: 'email',
  },
  {
    field: 'phone',
    label: 'Telefon',
    required: false,
    type: 'phone',
  },
  {
    field: 'ico',
    label: 'IČO',
    required: false,
    type: 'ico',
  },
  {
    field: 'dic',
    label: 'DIČ',
    required: false,
    type: 'dic',
  },
  {
    field: 'organization',
    label: 'Organizace',
    required: false,
    type: 'string',
    maxLength: 200,
  },
]

export const customerCompanyValidationRules: ValidationRule[] = [
  {
    field: 'organization',
    label: 'Název firmy',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
  },
  {
    field: 'ico',
    label: 'IČO',
    required: false,
    type: 'ico',
  },
  {
    field: 'dic',
    label: 'DIČ',
    required: false,
    type: 'dic',
  },
  {
    field: 'contactPerson',
    label: 'Kontaktní osoba',
    required: false,
    type: 'string',
  },
  {
    field: 'phone',
    label: 'Telefon',
    required: false,
    type: 'phone',
  },
  {
    field: 'city',
    label: 'Město',
    required: false,
    type: 'string',
  },
]

export const invoiceValidationRules: ValidationRule[] = [
  {
    field: 'invoiceNumber',
    label: 'Číslo faktury',
    required: true,
    type: 'string',
    minLength: 1,
  },
  {
    field: 'customerRef',
    label: 'Odběratel',
    required: true,
    type: 'string',
  },
  {
    field: 'issueDate',
    label: 'Datum vytvoření',
    required: true,
    type: 'date',
  },
  {
    field: 'dueDate',
    label: 'Datum splatnosti',
    required: false,
    type: 'date',
  },
  {
    field: 'paymentMethod',
    label: 'Způsob platby',
    required: false,
    type: 'string',
  },
]

export const orderValidationRules: ValidationRule[] = [
  {
    field: 'eventDate',
    label: 'Datum akce',
    required: true,
    type: 'date',
  },
  {
    field: 'customerRef',
    label: 'Odběratel',
    required: true,
    type: 'string',
  },
  {
    field: 'eventName',
    label: 'Název akce',
    required: false,
    type: 'string',
  },
  {
    field: 'city',
    label: 'Město',
    required: false,
    type: 'string',
  },
]

export const performanceValidationRules: ValidationRule[] = [
  {
    field: 'title',
    label: 'Název',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
  },
  {
    field: 'duration',
    label: 'Délka představení',
    required: false,
    type: 'number',
    min: 1,
    max: 600,
  },
  {
    field: 'premiere',
    label: 'Premiéra',
    required: false,
    type: 'date',
  },
]

export const gameValidationRules: ValidationRule[] = [
  {
    field: 'title',
    label: 'Název',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
  },
  {
    field: 'duration',
    label: 'Délka',
    required: false,
    type: 'number',
    min: 1,
    max: 600,
  },
]

// ============================================
// Helper functions
// ============================================

/**
 * Get validation rules for entity type
 */
export function getValidationRules(
  entityType: 'customer' | 'customer_company' | 'invoice' | 'order' | 'performance' | 'game'
): ValidationRule[] {
  switch (entityType) {
    case 'customer':
      return customerValidationRules
    case 'customer_company':
      return customerCompanyValidationRules
    case 'invoice':
      return invoiceValidationRules
    case 'order':
      return orderValidationRules
    case 'performance':
      return performanceValidationRules
    case 'game':
      return gameValidationRules
    default:
      return []
  }
}

/**
 * Check for duplicate values in a column
 */
export function findDuplicates(
  data: Record<string, any>[],
  column: string
): { value: string; rows: number[] }[] {
  const valueMap = new Map<string, number[]>()

  data.forEach((row, index) => {
    const value = row[column]?.toString().trim().toLowerCase()
    if (value) {
      const existing = valueMap.get(value) || []
      existing.push(index + 1)
      valueMap.set(value, existing)
    }
  })

  return Array.from(valueMap.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([value, rows]) => ({ value, rows }))
}

/**
 * Generate validation summary
 */
export function generateValidationSummary(result: ValidationResult): string {
  const lines: string[] = []

  lines.push(`Celkem řádků: ${result.stats.total}`)
  lines.push(`Validních: ${result.stats.valid} (${Math.round((result.stats.valid / result.stats.total) * 100)}%)`)

  if (result.stats.invalid > 0) {
    lines.push(`Nevalidních: ${result.stats.invalid}`)
  }

  if (result.stats.warnings > 0) {
    lines.push(`Varování: ${result.stats.warnings}`)
  }

  return lines.join('\n')
}
