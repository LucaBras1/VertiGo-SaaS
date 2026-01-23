/**
 * Export utilities for CSV/Excel export
 */
import Papa from 'papaparse'

export interface ExportColumn<T> {
  key: keyof T | string
  label: string
  format?: (value: any, item: T) => string
}

export interface ExportOptions<T> {
  data: T[]
  columns: ExportColumn<T>[]
  filename: string
}

/**
 * Export data to CSV
 */
export function exportToCSV<T>({ data, columns, filename }: ExportOptions<T>) {
  // Transform data to CSV rows
  const rows = data.map((item) => {
    const row: Record<string, any> = {}
    columns.forEach((col) => {
      const key = col.key as keyof T
      const value = item[key]
      row[col.label] = col.format ? col.format(value, item) : value
    })
    return row
  })

  // Generate CSV
  const csv = Papa.unparse(rows, {
    header: true,
    quotes: true,
  })

  // Download
  downloadFile(csv, filename, 'text/csv;charset=utf-8;')
}

/**
 * Export data to Excel (CSV with UTF-8 BOM for Excel compatibility)
 */
export function exportToExcel<T>({ data, columns, filename }: ExportOptions<T>) {
  // Transform data to CSV rows
  const rows = data.map((item) => {
    const row: Record<string, any> = {}
    columns.forEach((col) => {
      const key = col.key as keyof T
      const value = item[key]
      row[col.label] = col.format ? col.format(value, item) : value
    })
    return row
  })

  // Generate CSV with UTF-8 BOM for Excel
  const csv = Papa.unparse(rows, {
    header: true,
    quotes: true,
  })

  // Add UTF-8 BOM for Excel
  const csvWithBOM = '\uFEFF' + csv

  // Download
  downloadFile(csvWithBOM, filename.replace('.csv', '.xlsx'), 'text/csv;charset=utf-8;')
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('cs-CZ')
}

/**
 * Format datetime for export
 */
export function formatDateTimeForExport(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.toLocaleDateString('cs-CZ')} ${d.toLocaleTimeString('cs-CZ')}`
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(amount: number | null): string {
  if (amount === null || amount === undefined) return ''
  return `${amount.toLocaleString('cs-CZ')} Kč`
}

/**
 * Format boolean for export
 */
export function formatBooleanForExport(value: boolean | null, trueLabel = 'Ano', falseLabel = 'Ne'): string {
  if (value === null || value === undefined) return ''
  return value ? trueLabel : falseLabel
}
