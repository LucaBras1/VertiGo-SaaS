/**
 * Customer Mapper
 *
 * Maps CSV data to Customer Prisma model
 */

import {
  normalizeEmail,
  normalizePhone,
  normalizeICO,
  normalizeDIC,
  normalizePSC,
  splitName,
  cleanString,
  mapOrganizationType,
  generatePlaceholderEmail,
} from '../transformers'

export interface CustomerImportData {
  // From CSV
  organization?: string
  contactPerson?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  phone2?: string
  ico?: string
  dic?: string
  street?: string
  city?: string
  postalCode?: string
  country?: string
  region?: string
  organizationType?: string
  notes?: string
  group?: string
  web?: string
}

export interface MappedCustomer {
  email: string
  firstName: string
  lastName: string
  phone: string | null
  organization: string | null
  organizationType: string | null
  address: {
    street: string | null
    city: string | null
    postalCode: string | null
    country: string
  } | null
  billingInfo: {
    companyName: string | null
    ico: string | null
    dic: string | null
  } | null
  tags: string[]
  notes: string | null
  source: string
  needsEmailFix: boolean
}

/**
 * Default column mapping for company CSV
 */
export const companyColumnMapping: Record<string, string> = {
  'Jméno': 'organization',
  'IČ': 'ico',
  'DIČ': 'dic',
  'Mobilní telefon': 'phone',
  'Telefon do práce': 'phone2',
  'Osoba': 'contactPerson',
  'Země': 'country',
  'Kraj': 'region',
  'Město': 'city',
  'PSČ': 'postalCode',
  'Ulice': 'street',
  'Skupina': 'organizationType',
  'Poznámka': 'notes',
  'Web': 'web',
}

/**
 * Default column mapping for person CSV
 */
export const personColumnMapping: Record<string, string> = {
  'Celé jméno': 'fullName',
  'Příjmení': 'lastName',
  'Jméno': 'firstName',
  'E-mail': 'email',
  'Mobil': 'phone',
  'Telefon': 'phone2',
  'IČ': 'ico',
  'DIČ': 'dic',
  'Skupina': 'group',
  'Web': 'web',
}

/**
 * Map CSV row to CustomerImportData
 */
export function mapCSVToImportData(
  row: Record<string, any>,
  columnMapping: Record<string, string>
): CustomerImportData {
  const data: CustomerImportData = {}

  for (const [csvColumn, field] of Object.entries(columnMapping)) {
    if (row[csvColumn] !== undefined) {
      ;(data as any)[field] = row[csvColumn]
    }
  }

  return data
}

/**
 * Map company data to Customer model
 */
export function mapCompanyToCustomer(
  data: CustomerImportData,
  index: number
): MappedCustomer {
  // Split contact person name
  const { firstName, lastName } = splitName(data.contactPerson || '')

  // Normalize values
  const ico = normalizeICO(data.ico)
  const dic = normalizeDIC(data.dic)
  const phone = normalizePhone(data.phone) || normalizePhone(data.phone2)
  const email = normalizeEmail(data.email)

  // Generate placeholder email if missing
  const needsEmailFix = !email
  const finalEmail = email || generatePlaceholderEmail(ico, data.organization, index)

  // Map organization type
  const orgType = mapOrganizationType(data.organizationType || data.group)

  // Build tags from group
  const tags: string[] = []
  if (data.group) {
    // Split by semicolon if multiple groups
    const groups = data.group.split(';').map(g => g.trim()).filter(Boolean)
    tags.push(...groups)
  }
  if (needsEmailFix) {
    tags.push('NEEDS_EMAIL')
  }
  tags.push('IMPORTED')

  return {
    email: finalEmail,
    firstName: firstName || 'Kontakt',
    lastName: lastName || (data.organization ? data.organization.slice(0, 50) : 'Neuvedeno'),
    phone,
    organization: cleanString(data.organization),
    organizationType: orgType,
    address: (data.city || data.street || data.postalCode) ? {
      street: cleanString(data.street),
      city: cleanString(data.city),
      postalCode: normalizePSC(data.postalCode),
      country: data.country || 'Česká republika',
    } : null,
    billingInfo: (ico || dic || data.organization) ? {
      companyName: cleanString(data.organization),
      ico,
      dic,
    } : null,
    tags,
    notes: cleanString(data.notes),
    source: 'csv_import',
    needsEmailFix,
  }
}

/**
 * Map person data to Customer model
 */
export function mapPersonToCustomer(
  data: CustomerImportData,
  index: number
): MappedCustomer {
  // Normalize values
  const ico = normalizeICO(data.ico)
  const dic = normalizeDIC(data.dic)
  const phone = normalizePhone(data.phone) || normalizePhone(data.phone2)
  const email = normalizeEmail(data.email)

  // Generate placeholder email if missing
  const needsEmailFix = !email
  const finalEmail = email || generatePlaceholderEmail(ico, `${data.firstName}-${data.lastName}`, index)

  // Build tags from group
  const tags: string[] = []
  if (data.group) {
    tags.push(data.group.trim())
  }
  if (needsEmailFix) {
    tags.push('NEEDS_EMAIL')
  }
  tags.push('IMPORTED')

  return {
    email: finalEmail,
    firstName: cleanString(data.firstName) || 'Neuvedeno',
    lastName: cleanString(data.lastName) || 'Neuvedeno',
    phone,
    organization: null,
    organizationType: null,
    address: null,
    billingInfo: (ico || dic) ? {
      companyName: null,
      ico,
      dic,
    } : null,
    tags,
    notes: null,
    source: 'csv_import',
    needsEmailFix,
  }
}

/**
 * Suggested column mapping based on CSV headers
 */
export function suggestColumnMapping(
  headers: string[],
  type: 'company' | 'person'
): Record<string, string> {
  const defaultMapping = type === 'company' ? companyColumnMapping : personColumnMapping
  const suggested: Record<string, string> = {}

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim()

    // Try exact match first
    if (defaultMapping[header]) {
      suggested[header] = defaultMapping[header]
      continue
    }

    // Try fuzzy matching
    for (const [csvCol, field] of Object.entries(defaultMapping)) {
      if (csvCol.toLowerCase() === normalizedHeader) {
        suggested[header] = field
        break
      }
    }

    // Additional heuristics
    if (!suggested[header]) {
      if (normalizedHeader.includes('email') || normalizedHeader.includes('e-mail')) {
        suggested[header] = 'email'
      } else if (normalizedHeader.includes('telefon') || normalizedHeader.includes('mobil')) {
        suggested[header] = 'phone'
      } else if (normalizedHeader.includes('ič') || normalizedHeader === 'ico') {
        suggested[header] = 'ico'
      } else if (normalizedHeader.includes('dič') || normalizedHeader === 'dic') {
        suggested[header] = 'dic'
      } else if (normalizedHeader.includes('město') || normalizedHeader.includes('city')) {
        suggested[header] = 'city'
      } else if (normalizedHeader.includes('ulice') || normalizedHeader.includes('street')) {
        suggested[header] = 'street'
      } else if (normalizedHeader.includes('psč') || normalizedHeader.includes('zip')) {
        suggested[header] = 'postalCode'
      } else if (normalizedHeader.includes('firma') || normalizedHeader.includes('organizace')) {
        suggested[header] = 'organization'
      }
    }
  }

  return suggested
}

/**
 * Available target fields for mapping
 */
export const customerTargetFields = [
  { value: 'firstName', label: 'Jméno', required: true },
  { value: 'lastName', label: 'Příjmení', required: true },
  { value: 'email', label: 'Email', required: false },
  { value: 'phone', label: 'Telefon', required: false },
  { value: 'phone2', label: 'Telefon 2', required: false },
  { value: 'organization', label: 'Organizace', required: false },
  { value: 'contactPerson', label: 'Kontaktní osoba', required: false },
  { value: 'ico', label: 'IČO', required: false },
  { value: 'dic', label: 'DIČ', required: false },
  { value: 'street', label: 'Ulice', required: false },
  { value: 'city', label: 'Město', required: false },
  { value: 'postalCode', label: 'PSČ', required: false },
  { value: 'country', label: 'Země', required: false },
  { value: 'region', label: 'Kraj', required: false },
  { value: 'organizationType', label: 'Typ organizace', required: false },
  { value: 'group', label: 'Skupina/Štítek', required: false },
  { value: 'notes', label: 'Poznámka', required: false },
  { value: 'web', label: 'Web', required: false },
  { value: '_skip', label: '-- Přeskočit --', required: false },
]
