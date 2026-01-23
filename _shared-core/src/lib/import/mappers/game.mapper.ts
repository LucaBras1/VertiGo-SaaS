/**
 * Game Mapper
 *
 * Maps CSV data (doprovodny program - hry.csv) to Game Prisma model
 */

import {
  parseDate,
  parseMinutes,
  parsePrice,
  parseSize,
  cleanString,
  slugify,
  toTiptapJSON,
} from '../transformers'

export interface GameImportData {
  title?: string
  description?: string
  price?: string
  premiere?: string
  duration?: string
  currency?: string
  preparation?: string
  notes?: string
  electricity?: string
  lighting?: string
  width?: string
  height?: string
  depth?: string
}

export interface MappedGame {
  title: string
  slug: string
  category: 'skill' | 'team' | 'creative' | 'active'
  status: 'active' | 'archived' | 'draft'
  featured: boolean
  order: number
  subtitle: string | null
  excerpt: string | null
  description: object | null
  duration: number
  technicalRequirements: {
    space: {
      width: number | null
      height: number | null
      depth: number | null
    } | null
    electricity: string | null
    lighting: string | null
    preparation: number | null
    other: string | null
  } | null
  referencePrice: number | null
  source: string
}

/**
 * Default column mapping for game CSV
 */
export const gameColumnMapping: Record<string, string> = {
  'Jméno': 'title',
  'Popis': 'description',
  'Cena': 'price',
  'Premiéra': 'premiere',
  'Délka představení': 'duration',
  'Měna': 'currency',
  'Příprava': 'preparation',
  'Poznámka': 'notes',
  'Elektřina': 'electricity',
  'Osvětlení': 'lighting',
  'Šířka': 'width',
  'Výška': 'height',
  'Hloubka': 'depth',
}

/**
 * Map CSV row to GameImportData
 */
export function mapCSVToImportData(
  row: Record<string, any>,
  columnMapping: Record<string, string>
): GameImportData {
  const data: GameImportData = {}

  for (const [csvColumn, field] of Object.entries(columnMapping)) {
    if (row[csvColumn] !== undefined) {
      ;(data as any)[field] = row[csvColumn]
    }
  }

  return data
}

/**
 * Map game data to Game model
 */
export function mapToGame(data: GameImportData, index: number): MappedGame | null {
  // Title is required
  const title = cleanString(data.title)
  if (!title) return null

  // Generate slug
  const slug = slugify(title)

  // Parse values
  const duration = parseMinutes(data.duration) || 60
  const preparation = parseMinutes(data.preparation)
  const price = parsePrice(data.price)

  // Parse dimensions
  const width = parseSize(data.width)
  const height = parseSize(data.height)
  const depth = parseSize(data.depth)

  // Create description from text
  const description = toTiptapJSON(data.description)

  // Extract excerpt from description (first 200 chars)
  const excerpt = data.description
    ? data.description.slice(0, 200).trim() + (data.description.length > 200 ? '...' : '')
    : null

  // Build technical requirements
  const hasSpace = width !== null || height !== null || depth !== null
  const technicalRequirements = {
    space: hasSpace ? { width, height, depth } : null,
    electricity: cleanString(data.electricity),
    lighting: cleanString(data.lighting),
    preparation,
    other: cleanString(data.notes),
  }

  return {
    title,
    slug,
    category: 'skill', // Default category
    status: 'active',
    featured: false,
    order: index,
    subtitle: null,
    excerpt,
    description,
    duration,
    technicalRequirements,
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
    if (gameColumnMapping[header]) {
      suggested[header] = gameColumnMapping[header]
      continue
    }

    // Try fuzzy matching
    for (const [csvCol, field] of Object.entries(gameColumnMapping)) {
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
      } else if (normalizedHeader.includes('šířk') || normalizedHeader.includes('width')) {
        suggested[header] = 'width'
      } else if (normalizedHeader.includes('výšk') || normalizedHeader.includes('height')) {
        suggested[header] = 'height'
      } else if (normalizedHeader.includes('hloubk') || normalizedHeader.includes('depth')) {
        suggested[header] = 'depth'
      } else if (normalizedHeader.includes('elektř')) {
        suggested[header] = 'electricity'
      } else if (normalizedHeader.includes('osvětl')) {
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
export const gameTargetFields = [
  { value: 'title', label: 'Název', required: true },
  { value: 'description', label: 'Popis', required: false },
  { value: 'duration', label: 'Délka', required: false },
  { value: 'price', label: 'Cena', required: false },
  { value: 'preparation', label: 'Příprava', required: false },
  { value: 'electricity', label: 'Elektřina', required: false },
  { value: 'lighting', label: 'Osvětlení', required: false },
  { value: 'width', label: 'Šířka', required: false },
  { value: 'height', label: 'Výška', required: false },
  { value: 'depth', label: 'Hloubka', required: false },
  { value: 'notes', label: 'Poznámka', required: false },
  { value: 'premiere', label: 'Premiéra', required: false },
  { value: 'currency', label: 'Měna', required: false },
  { value: '_skip', label: '-- Přeskočit --', required: false },
]
