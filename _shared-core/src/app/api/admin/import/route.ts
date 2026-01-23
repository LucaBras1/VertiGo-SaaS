/**
 * API Route: /api/admin/import
 *
 * POST - Upload and parse CSV file
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  parseCSV,
  analyzeColumns,
  validateCSVStructure,
  getImportConfig,
  type ImportEntityType,
} from '@/lib/import'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/admin/import
 * Upload and parse CSV file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const entityType = formData.get('entityType') as ImportEntityType | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nebyl nahrán žádný soubor' },
        { status: 400 }
      )
    }

    if (!entityType) {
      return NextResponse.json(
        { success: false, error: 'Nebyl vybrán typ importu' },
        { status: 400 }
      )
    }

    // Get import config for entity type
    const config = getImportConfig(entityType)
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Neplatný typ importu' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()

    // Parse CSV
    const parsed = parseCSV(content, {
      skipEmptyLines: true,
      trimValues: true,
    })

    // Analyze columns
    const columnStats = analyzeColumns(parsed)

    // Validate structure
    const structureValidation = validateCSVStructure(parsed)

    // Suggest column mapping
    const suggestedMapping = config.suggestMapping(parsed.headers)

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileSize: file.size,
        rowCount: parsed.rowCount,
        headers: parsed.headers,
        columnStats,
        structureValidation,
        suggestedMapping,
        preview: parsed.data.slice(0, 10),
        allData: parsed.data, // All data for validation and import
        meta: parsed.meta,
        entityType,
        config: {
          label: config.label,
          description: config.description,
          requiredFields: config.requiredFields,
          targetFields: config.targetFields,
        },
      },
    })
  } catch (error) {
    console.error('Error parsing CSV:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chyba při zpracování souboru',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/import
 * Get available import types
 */
export async function GET() {
  try {
    const { getAllImportConfigs } = await import('@/lib/import')
    const configs = getAllImportConfigs()

    return NextResponse.json({
      success: true,
      data: configs.map((c) => ({
        entityType: c.entityType,
        label: c.label,
        description: c.description,
        icon: c.icon,
        requiredFields: c.requiredFields,
      })),
    })
  } catch (error) {
    console.error('Error getting import configs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chyba při načítání konfigurace',
      },
      { status: 500 }
    )
  }
}
