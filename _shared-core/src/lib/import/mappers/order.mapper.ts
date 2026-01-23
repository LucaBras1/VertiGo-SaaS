/**
 * Order Mapper
 *
 * Maps CSV data (akce.csv) to Order Prisma model
 */

import {
  parseDate,
  parseTime,
  parseMinutes,
  parseGPS,
  cleanString,
} from '../transformers'

export interface OrderImportData {
  eventDate?: string
  city?: string
  eventName?: string
  customerRef?: string
  street?: string
  invoiceNumber?: string
  language?: string
  gps?: string
  notes?: string
  sound?: string
  arrivalTime?: string
  departureTime?: string
  preparationTime?: string
  contractDate?: string
  web?: string
  contactPerson?: string
  country?: string
  region?: string
  transportMethod?: string
}

export interface MappedOrder {
  orderNumber: string
  customerRef: string // Will be resolved to customerId later
  invoiceRef: string | null // Will be resolved to invoiceId later
  source: string
  status: 'completed'
  eventName: string | null
  dates: string[]
  venue: {
    name: string | null
    street: string | null
    city: string | null
    postalCode: string | null
    country: string
    region: string | null
    gpsCoordinates: { lat: number; lng: number } | null
  }
  arrivalTime: string | null
  preparationTime: number | null
  contacts: {
    onSite: {
      name: string | null
      phone: string | null
    } | null
  } | null
  internalNotes: {
    note: string
    author: string
    createdAt: string
  }[]
  metadata: {
    sound: string | null
    transportMethod: string | null
    language: string | null
    web: string | null
    contractDate: string | null
  }
}

/**
 * Default column mapping for order CSV (akce.csv)
 */
export const orderColumnMapping: Record<string, string> = {
  'Datum zahájení': 'eventDate',
  'Město': 'city',
  'Název': 'eventName',
  'Odběratel': 'customerRef',
  'Ulice': 'street',
  'Číslo faktury': 'invoiceNumber',
  'Jazyk': 'language',
  'GPS': 'gps',
  'Poznámka': 'notes',
  'Ozvučení': 'sound',
  'Čas příjezdu (na akci)': 'arrivalTime',
  'Čas odjezdu (na akci)': 'departureTime',
  'Příprava': 'preparationTime',
  'Smlouva': 'contractDate',
  'Web': 'web',
  'Kontaktní osoby': 'contactPerson',
  'Země': 'country',
  'Kraj': 'region',
  'Způsob dopravy': 'transportMethod',
}

/**
 * Map CSV row to OrderImportData
 */
export function mapCSVToImportData(
  row: Record<string, any>,
  columnMapping: Record<string, string>
): OrderImportData {
  const data: OrderImportData = {}

  for (const [csvColumn, field] of Object.entries(columnMapping)) {
    if (row[csvColumn] !== undefined) {
      ;(data as any)[field] = row[csvColumn]
    }
  }

  return data
}

/**
 * Generate order number from date
 */
function generateOrderNumber(date: Date, index: number): string {
  const year = date.getFullYear()
  const paddedIndex = String(index + 1).padStart(4, '0')
  return `IMP-${year}-${paddedIndex}`
}

/**
 * Map order data to Order model
 */
export function mapToOrder(data: OrderImportData, index: number): MappedOrder | null {
  // Customer reference is required
  const customerRef = cleanString(data.customerRef)
  if (!customerRef) return null

  // Parse event date
  const eventDate = parseDate(data.eventDate)
  if (!eventDate) return null

  // Generate order number
  const orderNumber = generateOrderNumber(eventDate, index)

  // Parse GPS coordinates
  const gpsCoordinates = parseGPS(data.gps)

  // Parse times
  const arrivalTime = parseTime(data.arrivalTime)
  const preparationTime = parseMinutes(data.preparationTime)

  // Build internal notes
  const internalNotes: MappedOrder['internalNotes'] = []
  if (data.notes) {
    internalNotes.push({
      note: data.notes,
      author: 'Import',
      createdAt: new Date().toISOString(),
    })
  }

  // Parse contract date for metadata
  const contractDate = parseDate(data.contractDate)

  return {
    orderNumber,
    customerRef,
    invoiceRef: cleanString(data.invoiceNumber),
    source: 'csv_import',
    status: 'completed', // Historical data is completed
    eventName: cleanString(data.eventName),
    dates: [eventDate.toISOString()],
    venue: {
      name: cleanString(data.eventName) || cleanString(data.city),
      street: cleanString(data.street),
      city: cleanString(data.city),
      postalCode: null,
      country: data.country || 'Česká republika',
      region: cleanString(data.region),
      gpsCoordinates,
    },
    arrivalTime,
    preparationTime,
    contacts: data.contactPerson ? {
      onSite: {
        name: cleanString(data.contactPerson),
        phone: null,
      },
    } : null,
    internalNotes,
    metadata: {
      sound: cleanString(data.sound),
      transportMethod: cleanString(data.transportMethod),
      language: cleanString(data.language),
      web: cleanString(data.web),
      contractDate: contractDate?.toISOString() || null,
    },
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
    if (orderColumnMapping[header]) {
      suggested[header] = orderColumnMapping[header]
      continue
    }

    // Try fuzzy matching
    for (const [csvCol, field] of Object.entries(orderColumnMapping)) {
      if (csvCol.toLowerCase() === normalizedHeader) {
        suggested[header] = field
        break
      }
    }

    // Additional heuristics
    if (!suggested[header]) {
      if (normalizedHeader.includes('datum') && !normalizedHeader.includes('smlouv')) {
        suggested[header] = 'eventDate'
      } else if (normalizedHeader.includes('město') || normalizedHeader.includes('city')) {
        suggested[header] = 'city'
      } else if (normalizedHeader.includes('název') || normalizedHeader.includes('akce')) {
        suggested[header] = 'eventName'
      } else if (normalizedHeader.includes('odběratel') || normalizedHeader.includes('zákazník')) {
        suggested[header] = 'customerRef'
      } else if (normalizedHeader.includes('faktur')) {
        suggested[header] = 'invoiceNumber'
      } else if (normalizedHeader.includes('gps') || normalizedHeader.includes('souřadnic')) {
        suggested[header] = 'gps'
      } else if (normalizedHeader.includes('poznám')) {
        suggested[header] = 'notes'
      } else if (normalizedHeader.includes('příjezd')) {
        suggested[header] = 'arrivalTime'
      } else if (normalizedHeader.includes('příprav')) {
        suggested[header] = 'preparationTime'
      } else if (normalizedHeader.includes('kontakt')) {
        suggested[header] = 'contactPerson'
      }
    }
  }

  return suggested
}

/**
 * Available target fields for mapping
 */
export const orderTargetFields = [
  { value: 'eventDate', label: 'Datum akce', required: true },
  { value: 'customerRef', label: 'Odběratel', required: true },
  { value: 'eventName', label: 'Název akce', required: false },
  { value: 'city', label: 'Město', required: false },
  { value: 'street', label: 'Ulice', required: false },
  { value: 'region', label: 'Kraj', required: false },
  { value: 'country', label: 'Země', required: false },
  { value: 'gps', label: 'GPS souřadnice', required: false },
  { value: 'invoiceNumber', label: 'Číslo faktury', required: false },
  { value: 'arrivalTime', label: 'Čas příjezdu', required: false },
  { value: 'departureTime', label: 'Čas odjezdu', required: false },
  { value: 'preparationTime', label: 'Příprava', required: false },
  { value: 'contactPerson', label: 'Kontaktní osoba', required: false },
  { value: 'notes', label: 'Poznámka', required: false },
  { value: 'sound', label: 'Ozvučení', required: false },
  { value: 'transportMethod', label: 'Způsob dopravy', required: false },
  { value: 'language', label: 'Jazyk', required: false },
  { value: 'web', label: 'Web', required: false },
  { value: 'contractDate', label: 'Datum smlouvy', required: false },
  { value: '_skip', label: '-- Přeskočit --', required: false },
]
