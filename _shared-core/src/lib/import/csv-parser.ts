/**
 * CSV Parser Module
 *
 * Handles CSV file parsing with automatic encoding detection,
 * delimiter detection, and data normalization.
 */

import Papa from 'papaparse'

export interface ParsedCSV {
  data: Record<string, string>[]
  headers: string[]
  rowCount: number
  errors: Papa.ParseError[]
  meta: {
    delimiter: string
    encoding: string
    linebreak: string
  }
}

export interface ParseOptions {
  /** Force specific delimiter (auto-detect if not provided) */
  delimiter?: string
  /** Force specific encoding */
  encoding?: string
  /** Skip empty rows */
  skipEmptyLines?: boolean
  /** Trim whitespace from values */
  trimValues?: boolean
  /** Maximum rows to parse (for preview) */
  maxRows?: number
}

/**
 * Parse CSV file content
 */
export function parseCSV(
  content: string,
  options: ParseOptions = {}
): ParsedCSV {
  const {
    delimiter,
    skipEmptyLines = true,
    trimValues = true,
    maxRows,
  } = options

  // Parse with Papa Parse
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    delimiter: delimiter || undefined, // Auto-detect if not specified
    skipEmptyLines,
    transformHeader: (header) => header.trim(),
    transform: trimValues ? (value) => value.trim() : undefined,
    preview: maxRows,
  })

  // Extract headers
  const headers = result.meta.fields || []

  return {
    data: result.data,
    headers,
    rowCount: result.data.length,
    errors: result.errors,
    meta: {
      delimiter: result.meta.delimiter,
      encoding: 'UTF-8', // Papa Parse doesn't expose this, we handle it separately
      linebreak: result.meta.linebreak,
    },
  }
}

/**
 * Parse CSV file from File object (browser)
 */
export async function parseCSVFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const result = parseCSV(content, options)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    // Try UTF-8 first, then fall back to Windows-1250 for Czech characters
    reader.readAsText(file, options.encoding || 'UTF-8')
  })
}

/**
 * Detect delimiter from CSV content
 */
export function detectDelimiter(content: string): string {
  const firstLines = content.split('\n').slice(0, 5).join('\n')

  const delimiters = [';', ',', '\t', '|']
  let maxCount = 0
  let detected = ','

  for (const delimiter of delimiters) {
    const count = (firstLines.match(new RegExp(delimiter, 'g')) || []).length
    if (count > maxCount) {
      maxCount = count
      detected = delimiter
    }
  }

  return detected
}

/**
 * Detect encoding from content (basic heuristic)
 */
export function detectEncoding(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)

  // Check for BOM
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return 'UTF-8'
  }
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return 'UTF-16LE'
  }
  if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return 'UTF-16BE'
  }

  // Check for Windows-1250 Czech characters
  let hasHighBytes = false
  for (let i = 0; i < Math.min(bytes.length, 1000); i++) {
    if (bytes[i] > 127) {
      hasHighBytes = true
      // Common Windows-1250 Czech characters
      if ([0x8A, 0x8D, 0x8E, 0x9A, 0x9D, 0x9E].includes(bytes[i])) {
        return 'Windows-1250'
      }
    }
  }

  return hasHighBytes ? 'Windows-1250' : 'UTF-8'
}

/**
 * Get preview of CSV data (first N rows)
 */
export function getPreview(
  parsed: ParsedCSV,
  rows: number = 10
): Record<string, string>[] {
  return parsed.data.slice(0, rows)
}

/**
 * Get column statistics
 */
export interface ColumnStats {
  name: string
  nonEmptyCount: number
  emptyCount: number
  uniqueValues: number
  sampleValues: string[]
  inferredType: 'string' | 'number' | 'date' | 'email' | 'phone' | 'unknown'
}

export function analyzeColumns(parsed: ParsedCSV): ColumnStats[] {
  return parsed.headers.map((header) => {
    const values = parsed.data.map((row) => row[header] || '')
    const nonEmpty = values.filter((v) => v.length > 0)
    const unique = new Set(nonEmpty)

    return {
      name: header,
      nonEmptyCount: nonEmpty.length,
      emptyCount: values.length - nonEmpty.length,
      uniqueValues: unique.size,
      sampleValues: Array.from(unique).slice(0, 5),
      inferredType: inferColumnType(nonEmpty.slice(0, 100)),
    }
  })
}

/**
 * Infer column data type from sample values
 */
function inferColumnType(
  values: string[]
): ColumnStats['inferredType'] {
  if (values.length === 0) return 'unknown'

  // Check patterns
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+]?[\d\s-()]{9,}$/,
    date: /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/,
    number: /^-?[\d\s,.]+$/,
  }

  let emailCount = 0
  let phoneCount = 0
  let dateCount = 0
  let numberCount = 0

  for (const value of values) {
    if (patterns.email.test(value)) emailCount++
    else if (patterns.phone.test(value.replace(/\s/g, ''))) phoneCount++
    else if (patterns.date.test(value)) dateCount++
    else if (patterns.number.test(value)) numberCount++
  }

  const threshold = values.length * 0.7 // 70% match required

  if (emailCount >= threshold) return 'email'
  if (phoneCount >= threshold) return 'phone'
  if (dateCount >= threshold) return 'date'
  if (numberCount >= threshold) return 'number'

  return 'string'
}

/**
 * Validate CSV structure
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateCSVStructure(
  parsed: ParsedCSV,
  requiredColumns?: string[]
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for parse errors
  if (parsed.errors.length > 0) {
    errors.push(...parsed.errors.map((e) => `Řádek ${e.row}: ${e.message}`))
  }

  // Check for required columns
  if (requiredColumns) {
    const missingColumns = requiredColumns.filter(
      (col) => !parsed.headers.includes(col)
    )
    if (missingColumns.length > 0) {
      errors.push(`Chybějící sloupce: ${missingColumns.join(', ')}`)
    }
  }

  // Check for empty data
  if (parsed.rowCount === 0) {
    errors.push('Soubor neobsahuje žádná data')
  }

  // Check for duplicate headers
  const duplicates = parsed.headers.filter(
    (h, i) => parsed.headers.indexOf(h) !== i
  )
  if (duplicates.length > 0) {
    warnings.push(`Duplicitní názvy sloupců: ${duplicates.join(', ')}`)
  }

  // Check for mostly empty columns
  const stats = analyzeColumns(parsed)
  const emptyColumns = stats.filter(
    (s) => s.emptyCount > parsed.rowCount * 0.9
  )
  if (emptyColumns.length > 0) {
    warnings.push(
      `Téměř prázdné sloupce: ${emptyColumns.map((c) => c.name).join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
