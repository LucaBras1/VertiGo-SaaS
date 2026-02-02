/**
 * CSV Export utilities for bulk operations
 */

export interface CsvColumn<T> {
  header: string
  accessor: keyof T | ((item: T) => string | number | null | undefined)
}

/**
 * Convert array of objects to CSV string
 */
export function toCsv<T>(
  items: T[],
  columns: CsvColumn<T>[]
): string {
  // Header row
  const headers = columns.map((col) => escapeCsvValue(col.header))
  const rows = [headers.join(',')]

  // Data rows
  for (const item of items) {
    const values = columns.map((col) => {
      const value =
        typeof col.accessor === 'function'
          ? col.accessor(item)
          : item[col.accessor]
      return escapeCsvValue(String(value ?? ''))
    })
    rows.push(values.join(','))
  }

  return rows.join('\n')
}

/**
 * Escape value for CSV format
 */
function escapeCsvValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape existing quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/**
 * Trigger download of CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF'
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Entity-specific export configurations

export interface GigExport {
  id: string
  title: string
  status: string
  clientName?: string
  clientEmail?: string
  eventDate?: string
  venueName?: string
  totalPrice?: number
}

export const gigCsvColumns: CsvColumn<GigExport>[] = [
  { header: 'Název', accessor: 'title' },
  { header: 'Status', accessor: 'status' },
  { header: 'Klient', accessor: 'clientName' },
  { header: 'Email', accessor: 'clientEmail' },
  { header: 'Datum', accessor: 'eventDate' },
  { header: 'Místo', accessor: 'venueName' },
  { header: 'Cena', accessor: (g) => g.totalPrice ? g.totalPrice / 100 : '' },
]

export interface SetlistExport {
  id: string
  name: string
  status: string
  songCount: number
  totalDuration: number
  mood?: string
  gigName?: string
}

export const setlistCsvColumns: CsvColumn<SetlistExport>[] = [
  { header: 'Název', accessor: 'name' },
  { header: 'Status', accessor: 'status' },
  { header: 'Počet písní', accessor: 'songCount' },
  { header: 'Délka (min)', accessor: 'totalDuration' },
  { header: 'Nálada', accessor: 'mood' },
  { header: 'Gig', accessor: 'gigName' },
]

export interface ClientExport {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
}

export const clientCsvColumns: CsvColumn<ClientExport>[] = [
  { header: 'Jméno', accessor: 'firstName' },
  { header: 'Příjmení', accessor: 'lastName' },
  { header: 'Email', accessor: 'email' },
  { header: 'Telefon', accessor: 'phone' },
  { header: 'Firma', accessor: 'company' },
]

export interface InvoiceExport {
  id: string
  invoiceNumber: string
  status: string
  customerName: string
  issueDate: string
  dueDate: string
  totalAmount: number
}

export const invoiceCsvColumns: CsvColumn<InvoiceExport>[] = [
  { header: 'Číslo faktury', accessor: 'invoiceNumber' },
  { header: 'Status', accessor: 'status' },
  { header: 'Zákazník', accessor: 'customerName' },
  { header: 'Vystaveno', accessor: 'issueDate' },
  { header: 'Splatnost', accessor: 'dueDate' },
  { header: 'Částka', accessor: (i) => i.totalAmount / 100 },
]

export interface SongExport {
  id: string
  title: string
  artist?: string
  genre?: string
  mood?: string
  duration: number
  key?: string
  bpm?: number
}

export const songCsvColumns: CsvColumn<SongExport>[] = [
  { header: 'Název', accessor: 'title' },
  { header: 'Interpret', accessor: 'artist' },
  { header: 'Žánr', accessor: 'genre' },
  { header: 'Nálada', accessor: 'mood' },
  { header: 'Délka (s)', accessor: 'duration' },
  { header: 'Tónina', accessor: 'key' },
  { header: 'BPM', accessor: 'bpm' },
]
