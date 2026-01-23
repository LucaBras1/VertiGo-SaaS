/**
 * Invoice Mapper
 *
 * Maps CSV data to Invoice Prisma model
 */

import {
  parseDate,
  parseMinutes,
  cleanString,
  mapPaymentMethod,
} from '../transformers'

export interface InvoiceImportData {
  invoiceNumber?: string
  customerRef?: string
  issueDate?: string
  dueDate?: string
  paymentMethod?: string
  variableSymbol?: string
  supplier?: string
  dueDays?: string
}

export interface MappedInvoice {
  invoiceNumber: string
  customerRef: string // Will be resolved to customerId later
  issueDate: Date
  dueDate: Date | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paymentMethod: string | null
  vyfakturujVS: number | null
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  totalAmount: number
  notes: string | null
  source: string
}

/**
 * Default column mapping for invoice CSV
 */
export const invoiceColumnMapping: Record<string, string> = {
  'číslo': 'invoiceNumber',
  'Odběratel': 'customerRef',
  'Datum vytvoření': 'issueDate',
  'Datum splatnosti': 'dueDate',
  'Způsob platby': 'paymentMethod',
  'Var. symbol': 'variableSymbol',
  'Dodávající': 'supplier',
  'Splatnost': 'dueDays',
}

/**
 * Map CSV row to InvoiceImportData
 */
export function mapCSVToImportData(
  row: Record<string, any>,
  columnMapping: Record<string, string>
): InvoiceImportData {
  const data: InvoiceImportData = {}

  for (const [csvColumn, field] of Object.entries(columnMapping)) {
    if (row[csvColumn] !== undefined) {
      ;(data as any)[field] = row[csvColumn]
    }
  }

  return data
}

/**
 * Map invoice data to Invoice model
 */
export function mapToInvoice(data: InvoiceImportData, index: number): MappedInvoice | null {
  // Invoice number is required
  const invoiceNumber = cleanString(data.invoiceNumber)
  if (!invoiceNumber) return null

  // Customer reference is required
  const customerRef = cleanString(data.customerRef)
  if (!customerRef) return null

  // Parse dates
  const issueDate = parseDate(data.issueDate)
  if (!issueDate) return null

  let dueDate = parseDate(data.dueDate)

  // Calculate due date from dueDays if not provided
  if (!dueDate && data.dueDays) {
    const dueDays = parseMinutes(data.dueDays) // Reuse parseMinutes for numbers
    if (dueDays && issueDate) {
      dueDate = new Date(issueDate)
      dueDate.setDate(dueDate.getDate() + dueDays)
    }
  }

  // Default due date to 14 days if not provided
  if (!dueDate) {
    dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 14)
  }

  // Parse variable symbol
  const variableSymbol = data.variableSymbol
    ? parseInt(data.variableSymbol.replace(/\D/g, ''))
    : null

  // Determine status based on invoice number prefix and dates
  let status: MappedInvoice['status'] = 'paid' // Assume old invoices are paid

  // Check invoice number format for hints
  // P-př.xx/xxxx = Převodem, P-hot.xx/xxxx = Hotově, P-bez.xx/xxxx = Bez faktury
  const invoiceLower = invoiceNumber.toLowerCase()
  if (invoiceLower.includes('hot') || invoiceLower.includes('bez')) {
    status = 'paid'
  }

  // If due date is in the past, assume paid for historical data
  if (dueDate && dueDate < new Date()) {
    status = 'paid'
  }

  // Map payment method
  const paymentMethod = mapPaymentMethod(data.paymentMethod)

  return {
    invoiceNumber,
    customerRef,
    issueDate,
    dueDate,
    status,
    paymentMethod,
    vyfakturujVS: isNaN(variableSymbol as number) ? null : variableSymbol,
    items: [
      {
        description: 'Import z legacy systému',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    totalAmount: 0,
    notes: data.supplier ? `Dodávající: ${data.supplier}` : null,
    source: 'csv_import',
  }
}

/**
 * Suggested column mapping based on CSV headers
 */
export function suggestColumnMapping(headers: string[]): Record<string, string> {
  const suggested: Record<string, string> = {}

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim()

    // Try exact match first
    if (invoiceColumnMapping[header]) {
      suggested[header] = invoiceColumnMapping[header]
      continue
    }

    // Try fuzzy matching
    for (const [csvCol, field] of Object.entries(invoiceColumnMapping)) {
      if (csvCol.toLowerCase() === normalizedHeader) {
        suggested[header] = field
        break
      }
    }

    // Additional heuristics
    if (!suggested[header]) {
      if (normalizedHeader.includes('číslo') || normalizedHeader.includes('faktur')) {
        suggested[header] = 'invoiceNumber'
      } else if (normalizedHeader.includes('odběratel') || normalizedHeader.includes('zákazník')) {
        suggested[header] = 'customerRef'
      } else if (normalizedHeader.includes('vytvoř') || normalizedHeader.includes('vystav')) {
        suggested[header] = 'issueDate'
      } else if (normalizedHeader.includes('splatn')) {
        if (normalizedHeader.includes('datum')) {
          suggested[header] = 'dueDate'
        } else {
          suggested[header] = 'dueDays'
        }
      } else if (normalizedHeader.includes('způsob') || normalizedHeader.includes('platb')) {
        suggested[header] = 'paymentMethod'
      } else if (normalizedHeader.includes('var') || normalizedHeader.includes('symbol')) {
        suggested[header] = 'variableSymbol'
      }
    }
  }

  return suggested
}

/**
 * Available target fields for mapping
 */
export const invoiceTargetFields = [
  { value: 'invoiceNumber', label: 'Číslo faktury', required: true },
  { value: 'customerRef', label: 'Odběratel', required: true },
  { value: 'issueDate', label: 'Datum vytvoření', required: true },
  { value: 'dueDate', label: 'Datum splatnosti', required: false },
  { value: 'dueDays', label: 'Splatnost (dní)', required: false },
  { value: 'paymentMethod', label: 'Způsob platby', required: false },
  { value: 'variableSymbol', label: 'Variabilní symbol', required: false },
  { value: 'supplier', label: 'Dodávající', required: false },
  { value: '_skip', label: '-- Přeskočit --', required: false },
]
