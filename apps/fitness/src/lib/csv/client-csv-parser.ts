import Papa from 'papaparse'
import { z } from 'zod'

/**
 * CSV field mapping for client import/export
 */
export const CSV_COLUMNS = {
  name: 'Jméno',
  email: 'Email',
  phone: 'Telefon',
  dateOfBirth: 'Datum narození',
  gender: 'Pohlaví',
  goals: 'Cíle',
  currentWeight: 'Aktuální váha (kg)',
  targetWeight: 'Cílová váha (kg)',
  height: 'Výška (cm)',
  fitnessLevel: 'Fitness úroveň',
  membershipType: 'Typ členství',
  creditsRemaining: 'Zbývající kredity',
  status: 'Status',
  notes: 'Poznámky',
  tags: 'Tagy',
} as const

export type CSVColumnKey = keyof typeof CSV_COLUMNS

/**
 * Validation schema for CSV client data
 */
const csvClientSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatný email'),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional().nullable(),
  goals: z.string().optional().nullable(), // Comma-separated
  currentWeight: z.union([z.number(), z.string()]).optional().nullable(),
  targetWeight: z.union([z.number(), z.string()]).optional().nullable(),
  height: z.union([z.number(), z.string()]).optional().nullable(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
  membershipType: z.string().optional().nullable(),
  creditsRemaining: z.union([z.number(), z.string()]).optional().nullable(),
  status: z.enum(['active', 'inactive', 'paused']).optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable(), // Comma-separated
})

export type CSVClientData = z.infer<typeof csvClientSchema>

export interface ParseResult {
  success: boolean
  data: CSVClientData[]
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  warnings: Array<{
    row: number
    message: string
  }>
}

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: Array<{
    row: number
    email: string
    message: string
  }>
}

/**
 * Map Czech column names to internal field names
 */
function mapColumnName(czechName: string): CSVColumnKey | null {
  const normalizedName = czechName.trim().toLowerCase()
  for (const [key, value] of Object.entries(CSV_COLUMNS)) {
    if (value.toLowerCase() === normalizedName) {
      return key as CSVColumnKey
    }
  }
  // Also try direct match for English column names
  if (normalizedName in CSV_COLUMNS) {
    return normalizedName as CSVColumnKey
  }
  return null
}

/**
 * Parse gender value (accepts various formats)
 */
function parseGender(value: string | null | undefined): 'male' | 'female' | 'other' | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (['muž', 'm', 'male', 'man'].includes(normalized)) return 'male'
  if (['žena', 'ž', 'f', 'female', 'woman'].includes(normalized)) return 'female'
  if (normalized) return 'other'
  return null
}

/**
 * Parse fitness level value
 */
function parseFitnessLevel(value: string | null | undefined): 'beginner' | 'intermediate' | 'advanced' | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (['začátečník', 'beginner', 'zacatecnik'].includes(normalized)) return 'beginner'
  if (['pokročilý', 'intermediate', 'pokrocily', 'střední', 'stredni'].includes(normalized)) return 'intermediate'
  if (['expert', 'advanced', 'profesionál', 'profesional'].includes(normalized)) return 'advanced'
  return null
}

/**
 * Parse status value
 */
function parseStatus(value: string | null | undefined): 'active' | 'inactive' | 'paused' | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (['aktivní', 'active', 'aktivni'].includes(normalized)) return 'active'
  if (['neaktivní', 'inactive', 'neaktivni'].includes(normalized)) return 'inactive'
  if (['pozastavený', 'paused', 'pozastaveny'].includes(normalized)) return 'paused'
  return null
}

/**
 * Parse date value (accepts various formats)
 */
function parseDate(value: string | null | undefined): string | null {
  if (!value) return null

  // Try ISO format first
  const isoDate = new Date(value)
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toISOString().split('T')[0]
  }

  // Try DD.MM.YYYY format (Czech)
  const czechMatch = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (czechMatch) {
    const [, day, month, year] = czechMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  }

  // Try DD/MM/YYYY format
  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, day, month, year] = slashMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  }

  return null
}

/**
 * Parse number value
 */
function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const num = typeof value === 'number' ? value : parseFloat(value.toString().replace(',', '.'))
  return isNaN(num) ? null : num
}

/**
 * Parse comma-separated values into array
 */
function parseCommaSeparated(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map(v => v.trim()).filter(Boolean)
}

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): ParseResult {
  const errors: ParseResult['errors'] = []
  const warnings: ParseResult['warnings'] = []
  const data: CSVClientData[] = []

  // Parse CSV with Papa Parse
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      const mapped = mapColumnName(header)
      if (!mapped) {
        warnings.push({
          row: 0,
          message: `Neznámý sloupec: "${header}" - bude ignorován`,
        })
        return `_unknown_${header}`
      }
      return mapped
    },
  })

  // Process each row
  ;(parsed.data as Record<string, string>[]).forEach((row, index) => {
    const rowNumber = index + 2 // +2 because of header row and 0-indexing

    try {
      // Transform row data
      const transformedRow: Record<string, unknown> = {
        name: row.name?.trim(),
        email: row.email?.trim()?.toLowerCase(),
        phone: row.phone?.trim() || null,
        dateOfBirth: parseDate(row.dateOfBirth),
        gender: parseGender(row.gender),
        goals: row.goals?.trim() || null,
        currentWeight: parseNumber(row.currentWeight),
        targetWeight: parseNumber(row.targetWeight),
        height: parseNumber(row.height),
        fitnessLevel: parseFitnessLevel(row.fitnessLevel),
        membershipType: row.membershipType?.trim() || null,
        creditsRemaining: parseNumber(row.creditsRemaining) ?? 0,
        status: parseStatus(row.status) || 'active',
        notes: row.notes?.trim() || null,
        tags: row.tags?.trim() || null,
      }

      // Validate
      const result = csvClientSchema.safeParse(transformedRow)

      if (result.success) {
        data.push(result.data)
      } else {
        result.error.errors.forEach((err) => {
          errors.push({
            row: rowNumber,
            field: err.path.join('.'),
            message: err.message,
          })
        })
      }
    } catch (err) {
      errors.push({
        row: rowNumber,
        field: 'general',
        message: err instanceof Error ? err.message : 'Neznámá chyba',
      })
    }
  })

  return {
    success: errors.length === 0,
    data,
    errors,
    warnings,
  }
}

/**
 * Convert client data to CSV format
 */
export function clientsToCSV(clients: Array<{
  name: string
  email: string
  phone?: string | null
  dateOfBirth?: Date | string | null
  gender?: string | null
  goals?: string[]
  currentWeight?: number | null
  targetWeight?: number | null
  height?: number | null
  fitnessLevel?: string | null
  membershipType?: string | null
  creditsRemaining?: number
  status?: string
  notes?: string | null
  tags?: string[]
}>): string {
  const headers = Object.values(CSV_COLUMNS)

  const rows = clients.map((client) => [
    client.name,
    client.email,
    client.phone || '',
    client.dateOfBirth
      ? new Date(client.dateOfBirth).toLocaleDateString('cs-CZ')
      : '',
    client.gender === 'male' ? 'Muž' : client.gender === 'female' ? 'Žena' : client.gender || '',
    client.goals?.join(', ') || '',
    client.currentWeight?.toString() || '',
    client.targetWeight?.toString() || '',
    client.height?.toString() || '',
    client.fitnessLevel === 'beginner'
      ? 'Začátečník'
      : client.fitnessLevel === 'intermediate'
      ? 'Pokročilý'
      : client.fitnessLevel === 'advanced'
      ? 'Expert'
      : '',
    client.membershipType || '',
    client.creditsRemaining?.toString() || '0',
    client.status === 'active'
      ? 'Aktivní'
      : client.status === 'inactive'
      ? 'Neaktivní'
      : client.status === 'paused'
      ? 'Pozastavený'
      : 'Aktivní',
    client.notes || '',
    client.tags?.join(', ') || '',
  ])

  return Papa.unparse({
    fields: headers,
    data: rows,
  })
}

/**
 * Generate CSV template with example data
 */
export function generateTemplate(): string {
  const headers = Object.values(CSV_COLUMNS)

  const exampleData = [
    [
      'Jan Novák',
      'jan.novak@email.cz',
      '+420 123 456 789',
      '15.03.1990',
      'Muž',
      'weight_loss, muscle_gain',
      '85',
      '78',
      '180',
      'Pokročilý',
      'Měsíční',
      '10',
      'Aktivní',
      'Preferuje ranní tréninky',
      'VIP, Osobní trénink',
    ],
    [
      'Marie Svobodová',
      'marie.svobodova@email.cz',
      '+420 987 654 321',
      '22.07.1985',
      'Žena',
      'endurance, flexibility',
      '62',
      '58',
      '165',
      'Začátečník',
      'Roční',
      '20',
      'Aktivní',
      '',
      'Skupinové lekce',
    ],
  ]

  return Papa.unparse({
    fields: headers,
    data: exampleData,
  })
}

/**
 * Transform parsed CSV data to Prisma create input
 */
export function transformToCreateInput(data: CSVClientData, tenantId: string) {
  return {
    tenantId,
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone || undefined,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    gender: data.gender || undefined,
    goals: parseCommaSeparated(data.goals),
    currentWeight: parseNumber(data.currentWeight) || undefined,
    targetWeight: parseNumber(data.targetWeight) || undefined,
    height: parseNumber(data.height) || undefined,
    fitnessLevel: data.fitnessLevel || undefined,
    membershipType: data.membershipType || undefined,
    creditsRemaining: parseNumber(data.creditsRemaining) ?? 0,
    status: data.status || 'active',
    notes: data.notes || undefined,
    tags: parseCommaSeparated(data.tags),
  }
}
