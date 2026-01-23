/**
 * Data Transformers Module
 *
 * Functions for transforming and normalizing data from CSV imports
 * to match the Prisma schema requirements.
 */

/**
 * Parse Czech date format (DD.MM.RRRR or DD.M.RRRR)
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value || value.trim() === '') return null

  const trimmed = value.trim()

  // Try various Czech date formats
  const patterns = [
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY or D.M.YYYY
    /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/, // DD.MM.YY
    /^(\d{1,2})\. (\d{1,2})\. (\d{4})$/, // DD. MM. YYYY (with spaces)
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD (ISO)
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match) {
      let [, day, month, year] = match

      // Handle YYYY-MM-DD format (swap day and year)
      if (pattern === patterns[3]) {
        ;[year, month, day] = [day, month, year]
      }

      // Convert 2-digit year to 4-digit
      let yearNum = parseInt(year)
      if (yearNum < 100) {
        yearNum += yearNum > 50 ? 1900 : 2000
      }

      const date = new Date(yearNum, parseInt(month) - 1, parseInt(day))

      // Validate date
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  return null
}

/**
 * Normalize phone number to +420 format
 */
export function normalizePhone(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '')

  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '')

  // Add Czech country code if missing
  if (cleaned.length === 9) {
    cleaned = '+420' + cleaned
  } else if (cleaned.startsWith('420')) {
    cleaned = '+' + cleaned
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+420' + cleaned
  }

  // Validate length (should be +420 + 9 digits = 13 chars)
  if (cleaned.length >= 12 && cleaned.length <= 15) {
    // Format as +420 XXX XXX XXX
    const digits = cleaned.replace(/\D/g, '')
    if (digits.length >= 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
    }
  }

  return cleaned || null
}

/**
 * Normalize IČO (8 digits, pad with zeros if needed)
 */
export function normalizeICO(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  // Remove spaces and non-digit characters
  const cleaned = value.replace(/\D/g, '')

  if (cleaned.length === 0) return null

  // Pad to 8 digits
  const padded = cleaned.padStart(8, '0')

  // Validate - should be exactly 8 digits
  if (padded.length === 8 && /^\d{8}$/.test(padded)) {
    return padded
  }

  return null
}

/**
 * Normalize DIČ (CZ + 8-10 digits)
 */
export function normalizeDIC(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  const trimmed = value.trim().toUpperCase()

  // Remove CZ prefix if present, then re-add
  let cleaned = trimmed.replace(/^CZ/i, '').replace(/\D/g, '')

  if (cleaned.length === 0) return null

  // DIČ can be 8-10 digits
  if (cleaned.length >= 8 && cleaned.length <= 10) {
    return 'CZ' + cleaned
  }

  return null
}

/**
 * Parse price from various Czech formats
 * "5 000,00 CZK" → 5000
 * "2500.000 Kč" → 2500
 */
export function parsePrice(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null

  // Remove currency and whitespace
  let cleaned = value
    .replace(/CZK|Kč|,-/gi, '')
    .replace(/\s/g, '')
    .trim()

  // Handle Czech decimal format (comma as decimal separator)
  if (cleaned.includes(',')) {
    // Check if it's "5000,00" format (decimal) or "5,000" format (thousands)
    const parts = cleaned.split(',')
    if (parts[1] && parts[1].length <= 2) {
      // Decimal format
      cleaned = parts[0] + '.' + parts[1]
    } else {
      // Thousands separator
      cleaned = cleaned.replace(/,/g, '')
    }
  }

  // Remove dots used as thousands separators (but keep as decimal)
  const dotCount = (cleaned.match(/\./g) || []).length
  if (dotCount > 1) {
    // Multiple dots = thousands separators
    cleaned = cleaned.replace(/\./g, '')
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.round(num) // Round to whole number
}

/**
 * Parse duration in minutes
 * "60 min" → 60
 * "2h" → 120
 * "1:30" → 90
 */
export function parseMinutes(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null

  const trimmed = value.trim().toLowerCase()

  // "60 min" or "60min"
  const minMatch = trimmed.match(/^(\d+)\s*min/)
  if (minMatch) {
    return parseInt(minMatch[1])
  }

  // "2h" or "2 h" or "2 hodiny"
  const hourMatch = trimmed.match(/^(\d+)\s*h/)
  if (hourMatch) {
    return parseInt(hourMatch[1]) * 60
  }

  // "1:30" format
  const timeMatch = trimmed.match(/^(\d+):(\d+)$/)
  if (timeMatch) {
    return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2])
  }

  // Just a number
  const num = parseInt(trimmed)
  return isNaN(num) ? null : num
}

/**
 * Parse GPS coordinates
 * "50.212462,15.853255" → {lat: 50.212462, lng: 15.853255}
 */
export function parseGPS(
  value: string | null | undefined
): { lat: number; lng: number } | null {
  if (!value || value.trim() === '') return null

  const parts = value.split(',').map((p) => parseFloat(p.trim()))

  if (
    parts.length === 2 &&
    !isNaN(parts[0]) &&
    !isNaN(parts[1]) &&
    parts[0] >= -90 &&
    parts[0] <= 90 &&
    parts[1] >= -180 &&
    parts[1] <= 180
  ) {
    return { lat: parts[0], lng: parts[1] }
  }

  return null
}

/**
 * Split full name into first and last name
 * "Müller Zlatuše" → {firstName: "Zlatuše", lastName: "Müller"}
 * "Jan Novák" → {firstName: "Jan", lastName: "Novák"}
 */
export function splitName(
  value: string | null | undefined
): { firstName: string; lastName: string } {
  if (!value || value.trim() === '') {
    return { firstName: '', lastName: '' }
  }

  const parts = value.trim().split(/\s+/)

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  if (parts.length === 2) {
    // Heuristic: if first part starts with uppercase and second too,
    // assume "LastName FirstName" format (common in Czech databases)
    const [first, second] = parts

    // Check for common Czech first names
    const commonFirstNames = [
      'Jan', 'Petr', 'Pavel', 'Martin', 'Josef', 'Tomáš', 'Jiří', 'Jaroslav',
      'Eva', 'Jana', 'Marie', 'Anna', 'Alena', 'Kateřina', 'Petra', 'Lucie',
    ]

    if (commonFirstNames.includes(first)) {
      return { firstName: first, lastName: second }
    }

    if (commonFirstNames.includes(second)) {
      return { firstName: second, lastName: first }
    }

    // Default: assume "FirstName LastName"
    return { firstName: first, lastName: second }
  }

  // More than 2 parts: last part is last name, rest is first name
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  }
}

/**
 * Generate URL-safe slug from text
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single
}

/**
 * Convert plain text to Tiptap JSON format
 */
export function toTiptapJSON(text: string | null | undefined): object | null {
  if (!text || text.trim() === '') return null

  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/)

  return {
    type: 'doc',
    content: paragraphs.map((p) => ({
      type: 'paragraph',
      content: p.trim()
        ? [
            {
              type: 'text',
              text: p.trim().replace(/\n/g, ' '),
            },
          ]
        : [],
    })),
  }
}

/**
 * Parse time from various formats
 * "06:00 (12.11.2014)" → "06:00"
 * "14:30" → "14:30"
 */
export function parseTime(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  // Match HH:MM pattern
  const match = value.match(/(\d{1,2}):(\d{2})/)
  if (match) {
    const hours = match[1].padStart(2, '0')
    const minutes = match[2]
    return `${hours}:${minutes}`
  }

  return null
}

/**
 * Parse size in centimeters
 * "4.0 cm" → 4
 */
export function parseSize(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null

  const match = value.match(/[\d.]+/)
  if (match) {
    const num = parseFloat(match[0])
    return isNaN(num) ? null : num
  }

  return null
}

/**
 * Normalize postal code (PSČ)
 * "506 01" → "50601"
 * "110 00" → "11000"
 */
export function normalizePSC(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  const cleaned = value.replace(/\s/g, '')

  if (/^\d{5}$/.test(cleaned)) {
    return cleaned
  }

  return null
}

/**
 * Normalize email address
 */
export function normalizeEmail(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  const email = value.trim().toLowerCase()

  // Basic email validation
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return email
  }

  return null
}

/**
 * Generate placeholder email for customers without email
 */
export function generatePlaceholderEmail(
  ico?: string | null,
  orgName?: string | null,
  index?: number
): string {
  const timestamp = Date.now()

  if (ico) {
    return `import-ico-${ico}@placeholder.divadlostudna.cz`
  }

  if (orgName) {
    const slug = slugify(orgName).slice(0, 30)
    return `import-${slug}-${timestamp}@placeholder.divadlostudna.cz`
  }

  return `import-${timestamp}-${index || 0}@placeholder.divadlostudna.cz`
}

/**
 * Clean and trim string value
 */
export function cleanString(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Map organization type from legacy to new format
 */
export function mapOrganizationType(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  const mapping: Record<string, string> = {
    'Agentury': 'private_company',
    'Divadla,Kulturní zařízení': 'cultural_center',
    'Divadla': 'cultural_center',
    'Kulturní zařízení': 'cultural_center',
    'Školy': 'elementary_school',
    'Základní školy': 'elementary_school',
    'Mateřské školy': 'kindergarten',
    'Střední školy': 'high_school',
    'Neziskové organizace': 'nonprofit',
    'Neziskové organizace (o.s., Mateřská centra, atd.)': 'nonprofit',
    'Mateřská centra': 'kindergarten',
    'Městské úřady': 'municipality',
    'Soukromé firmy': 'private_company',
  }

  // Try exact match first
  for (const [key, type] of Object.entries(mapping)) {
    if (value.toLowerCase().includes(key.toLowerCase())) {
      return type
    }
  }

  return 'other'
}

/**
 * Map payment method from legacy to new format
 */
export function mapPaymentMethod(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null

  const mapping: Record<string, string> = {
    'Banka': 'bank_transfer',
    'Hotově': 'cash',
    'Doproplacená': 'cash',
    'Hotovost': 'cash',
    'Převodem': 'bank_transfer',
    'Kartou': 'card',
  }

  const normalized = value.trim()
  return mapping[normalized] || null
}
