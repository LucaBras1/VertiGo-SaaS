/**
 * Performance Mapper
 *
 * Maps CSV data (představení.csv) to Performance Prisma model
 */

import {
  parseDate,
  parseMinutes,
  parsePrice,
  cleanString,
  slugify,
  toTiptapJSON,
} from '../transformers'

export interface PerformanceImportData {
  title?: string
  description?: string
  preparation?: string
  currency?: string
  lighting?: string
  premiere?: string
  notes?: string
  electricity?: string
  price?: string
  duration?: string
}

export interface MappedPerformance {
  title: string
  slug: string
  category: 'theatre' | 'stilts' | 'music' | 'special'
  status: 'active' | 'archived' | 'draft'
  featured: boolean
  order: number
  subtitle: string | null
  excerpt: string | null
  description: object | null
  duration: number
  technicalRequirements: {
    space: string | null
    electricity: string | null
    lighting: string | null
    preparation: number | null
    other: string | null
  } | null
  premiere: Date | null
  referencePrice: number | null
  source: string
}

/**
 * Default column mapping for performance CSV
 */
export const performanceColumnMapping: Record<string, string> = {
  'Název': 'title',
  'Popis': 'description',
  'Příprava': 'preparation',
  'Měna': 'currency',
  'Osvětlení': 'lighting',
  'Premiéra': 'premiere',
  'Poznámka': 'notes',
  'Elektřina': 'electricity',
  'Cena': 'price',
  'Délka představení': 'duration',
}

/**
 * Map CSV row to PerformanceImportData
 */
export function mapCSVToImportData(
  row: Record<string, any>,
  columnMapping: Record<string, string>
): PerformanceImportData {
  const data: PerformanceImportData = {}

  for (const [csvColumn, field] of Object.entries(columnMapping)) {
    if (row[csvColumn] !== undefined) {
      ;(data as any)[field] = row[csvColumn]
    }
  }

  return data
}

/**
 * Map performance data to Performance model
 */
export function mapToPerformance(
  data: PerformanceImportData,
  index: number
): MappedPerformance | null {
  // Title is required
  const title = cleanString(data.title)
  if (!title) return null

  // Generate slug
  const slug = slugify(title)

  // Parse values
  const duration = parseMinutes(data.duration) || 60
  const preparation = parseMinutes(data.preparation)
  const premiere = parseDate(data.premiere)
  const price = parsePrice(data.price)

  // Create description from text
  const description = toTiptapJSON(data.description)

  // Extract excerpt from description (first 200 chars)
  const excerpt = data.description
    ? data.description.slice(0, 200).trim() + (data.description.length > 200 ? '...' : '')
    : null

  // Build technical requirements
  const technicalRequirements = {
    space: null,
    electricity: cleanString(data.electricity),
    lighting: cleanString(data.lighting),
    preparation,
    other: cleanString(data.notes),
  }

  return {
    title,
    slug,
    category: 'theatre', // Default category
    status: 'active',
    featured: false,
    order: index,
    subtitle: null,
    excerpt,
    description,
    duration,
    technicalRequirements,
    premiere,
    referencePrice: price,
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
    if (performanceColumnMapping[header]) {
      suggested[header] = performanceColumnMapping[header]
      continue
    }

    // Try fuzzy matching
    for (const [csvCol, field] of Object.entries(performanceColumnMapping)) {
      if (csvCol.toLowerCase() === normalizedHeader) {
        suggested[header] = field
        break
      }
    }

    // Additional heuristics
    if (!suggested[header]) {
      if (normalizedHeader.includes('název') || normalizedHeader.includes('jméno')) {
        suggested[header] = 'title'
      } else if (normalizedHeader.includes('popis') || normalizedHeader.includes('obsah')) {
        suggested[header] = 'description'
      } else if (normalizedHeader.includes('délka') || normalizedHeader.includes('trvání')) {
        suggested[header] = 'duration'
      } else if (normalizedHeader.includes('cena') || normalizedHeader.includes('price')) {
        suggested[header] = 'price'
      } else if (normalizedHeader.includes('premiér')) {
        suggested[header] = 'premiere'
      } else if (normalizedHeader.includes('elektř') || normalizedHeader.includes('proud')) {
        suggested[header] = 'electricity'
      } else if (normalizedHeader.includes('osvětl') || normalizedHeader.includes('světl')) {
        suggested[header] = 'lighting'
      } else if (normalizedHeader.includes('příprav')) {
        suggested[header] = 'preparation'
      } else if (normalizedHeader.includes('poznám')) {
        suggested[header] = 'notes'
      }
    }
  }

  return suggested
}

/**
 * Available target fields for mapping
 */
export const performanceTargetFields = [
  { value: 'title', label: 'Název', required: true },
  { value: 'description', label: 'Popis', required: false },
  { value: 'duration', label: 'Délka představení', required: false },
  { value: 'price', label: 'Cena', required: false },
  { value: 'premiere', label: 'Premiéra', required: false },
  { value: 'preparation', label: 'Příprava', required: false },
  { value: 'electricity', label: 'Elektřina', required: false },
  { value: 'lighting', label: 'Osvětlení', required: false },
  { value: 'notes', label: 'Poznámka', required: false },
  { value: 'currency', label: 'Měna', required: false },
  { value: '_skip', label: '-- Přeskočit --', required: false },
]
