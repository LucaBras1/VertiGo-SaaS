/**
 * API Route: /api/admin/import/validate
 *
 * POST - Validate mapped data before import
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  validateData,
  findDuplicates,
  generateValidationSummary,
  customerValidationRules,
  customerCompanyValidationRules,
  invoiceValidationRules,
  orderValidationRules,
  performanceValidationRules,
  gameValidationRules,
  type ImportEntityType,
  type ValidationRule,
  mapCompanyToCustomer,
  mapPersonToCustomer,
  mapToInvoice,
  mapToOrder,
  mapToPerformance,
  mapToGame,
} from '@/lib/import'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ValidateRequest {
  entityType: ImportEntityType
  data: Record<string, any>[]
  columnMapping: Record<string, string>
}

/**
 * Get validation rules for entity type
 */
function getValidationRules(entityType: ImportEntityType): ValidationRule[] {
  switch (entityType) {
    case 'customer_company':
      return customerCompanyValidationRules
    case 'customer_person':
      return customerValidationRules
    case 'invoice':
      return invoiceValidationRules
    case 'order':
      return orderValidationRules
    case 'performance':
      return performanceValidationRules
    case 'game':
      return gameValidationRules
    default:
      return []
  }
}

/**
 * Map raw data to target entity format
 */
function mapDataToEntity(
  entityType: ImportEntityType,
  row: Record<string, any>,
  columnMapping: Record<string, string>,
  index: number
): Record<string, any> | null {
  // First, map CSV columns to target fields
  const mappedRow: Record<string, any> = {}
  for (const [csvCol, targetField] of Object.entries(columnMapping)) {
    if (targetField && targetField !== '_skip' && row[csvCol] !== undefined) {
      mappedRow[targetField] = row[csvCol]
    }
  }

  // Then apply entity-specific mapping
  switch (entityType) {
    case 'customer_company':
      return mapCompanyToCustomer(mappedRow, index)
    case 'customer_person':
      return mapPersonToCustomer(mappedRow, index)
    case 'invoice':
      return mapToInvoice(mappedRow, index)
    case 'order':
      return mapToOrder(mappedRow, index)
    case 'performance':
      return mapToPerformance(mappedRow, index)
    case 'game':
      return mapToGame(mappedRow, index)
    default:
      return mappedRow
  }
}

/**
 * Check for existing records in database
 */
async function checkExistingRecords(
  entityType: ImportEntityType,
  mappedData: (Record<string, any> | null)[]
): Promise<{
  existingCount: number
  existingDetails: { field: string; value: string; rowIndex: number }[]
}> {
  const existingDetails: { field: string; value: string; rowIndex: number }[] = []

  switch (entityType) {
    case 'customer_company':
    case 'customer_person': {
      // Check by email
      const emails = mappedData
        .map((d, i) => ({ email: d?.email, index: i }))
        .filter((e) => e.email)

      if (emails.length > 0) {
        const existingCustomers = await prisma.customer.findMany({
          where: { email: { in: emails.map((e) => e.email) } },
          select: { email: true },
        })
        const existingEmails = new Set(existingCustomers.map((c) => c.email))

        for (const { email, index } of emails) {
          if (existingEmails.has(email)) {
            existingDetails.push({ field: 'email', value: email, rowIndex: index })
          }
        }
      }

      // Check by IČO for companies
      if (entityType === 'customer_company') {
        const icos = mappedData
          .map((d, i) => ({ ico: d?.billingInfo?.ico, index: i }))
          .filter((e) => e.ico)

        if (icos.length > 0) {
          const existingCustomers = await prisma.customer.findMany({
            select: { billingInfo: true },
          })

          for (const { ico, index } of icos) {
            const exists = existingCustomers.some((c) => {
              const info = c.billingInfo as any
              return info?.ico === ico
            })
            if (exists) {
              existingDetails.push({ field: 'ico', value: ico, rowIndex: index })
            }
          }
        }
      }
      break
    }

    case 'invoice': {
      const invoiceNumbers = mappedData
        .map((d, i) => ({ number: d?.invoiceNumber, index: i }))
        .filter((e) => e.number)

      if (invoiceNumbers.length > 0) {
        const existingInvoices = await prisma.invoice.findMany({
          where: { invoiceNumber: { in: invoiceNumbers.map((e) => e.number) } },
          select: { invoiceNumber: true },
        })
        const existingNumbers = new Set(existingInvoices.map((i) => i.invoiceNumber))

        for (const { number, index } of invoiceNumbers) {
          if (existingNumbers.has(number)) {
            existingDetails.push({ field: 'invoiceNumber', value: number, rowIndex: index })
          }
        }
      }
      break
    }

    case 'order': {
      const orderNumbers = mappedData
        .map((d, i) => ({ number: d?.orderNumber, index: i }))
        .filter((e) => e.number)

      if (orderNumbers.length > 0) {
        const existingOrders = await prisma.order.findMany({
          where: { orderNumber: { in: orderNumbers.map((e) => e.number) } },
          select: { orderNumber: true },
        })
        const existingNumbers = new Set(existingOrders.map((o) => o.orderNumber))

        for (const { number, index } of orderNumbers) {
          if (existingNumbers.has(number)) {
            existingDetails.push({ field: 'orderNumber', value: number, rowIndex: index })
          }
        }
      }
      break
    }

    case 'performance': {
      const slugs = mappedData
        .map((d, i) => ({ slug: d?.slug, index: i }))
        .filter((e) => e.slug)

      if (slugs.length > 0) {
        const existingPerformances = await prisma.performance.findMany({
          where: { slug: { in: slugs.map((e) => e.slug) } },
          select: { slug: true },
        })
        const existingSlugs = new Set(existingPerformances.map((p) => p.slug))

        for (const { slug, index } of slugs) {
          if (existingSlugs.has(slug)) {
            existingDetails.push({ field: 'slug', value: slug, rowIndex: index })
          }
        }
      }
      break
    }

    case 'game': {
      const slugs = mappedData
        .map((d, i) => ({ slug: d?.slug, index: i }))
        .filter((e) => e.slug)

      if (slugs.length > 0) {
        const existingGames = await prisma.game.findMany({
          where: { slug: { in: slugs.map((e) => e.slug) } },
          select: { slug: true },
        })
        const existingSlugs = new Set(existingGames.map((g) => g.slug))

        for (const { slug, index } of slugs) {
          if (existingSlugs.has(slug)) {
            existingDetails.push({ field: 'slug', value: slug, rowIndex: index })
          }
        }
      }
      break
    }
  }

  return {
    existingCount: existingDetails.length,
    existingDetails,
  }
}

/**
 * POST /api/admin/import/validate
 * Validate mapped data before import
 */
export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json()
    const { entityType, data, columnMapping } = body

    if (!entityType || !data || !columnMapping) {
      return NextResponse.json(
        { success: false, error: 'Chybí povinné parametry' },
        { status: 400 }
      )
    }

    // Map raw data to entity format
    const mappedData = data.map((row, index) =>
      mapDataToEntity(entityType, row, columnMapping, index)
    )

    // Filter out null results (rows that couldn't be mapped)
    const validMappedData = mappedData.filter((d) => d !== null)
    const skippedCount = mappedData.length - validMappedData.length

    // Get validation rules
    const rules = getValidationRules(entityType)

    // Validate data (pass raw data and columnMapping for proper validation)
    const validationResult = validateData(data, rules, columnMapping)

    // Find duplicates in import data
    const duplicateFields = getDuplicateCheckFields(entityType)
    const duplicates: { field: string; values: { value: string; rows: number[] }[] }[] = []
    for (const field of duplicateFields) {
      const fieldDuplicates = findDuplicates(validMappedData, field)
      if (fieldDuplicates.length > 0) {
        duplicates.push({ field, values: fieldDuplicates })
      }
    }

    // Check for existing records in database
    const existingRecords = await checkExistingRecords(entityType, validMappedData)

    // Use validation result stats
    const stats = validationResult.stats

    return NextResponse.json({
      success: true,
      data: {
        totalRows: data.length,
        mappedRows: validMappedData.length,
        skippedRows: skippedCount,
        validRows: stats.valid,
        invalidRows: stats.invalid,
        warningRows: stats.warnings,
        errors: validationResult.errors.slice(0, 100), // Limit errors to prevent huge responses
        warnings: validationResult.warnings.slice(0, 100),
        duplicates,
        existingRecords,
        preview: validMappedData.slice(0, 5), // Preview of mapped data
        summary: {
          validCount: stats.valid,
          invalidCount: stats.invalid,
          warningCount: stats.warnings,
          canImport: stats.invalid === 0 && existingRecords.existingCount === 0,
          canImportWithSkip: stats.invalid === 0,
        },
      },
    })
  } catch (error) {
    console.error('Error validating import data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chyba při validaci dat',
      },
      { status: 500 }
    )
  }
}

/**
 * Get fields to check for duplicates based on entity type
 */
function getDuplicateCheckFields(entityType: ImportEntityType): string[] {
  switch (entityType) {
    case 'customer_company':
      return ['email', 'billingInfo.ico']
    case 'customer_person':
      return ['email']
    case 'invoice':
      return ['invoiceNumber']
    case 'order':
      return ['orderNumber']
    case 'performance':
    case 'game':
      return ['slug']
    default:
      return []
  }
}
