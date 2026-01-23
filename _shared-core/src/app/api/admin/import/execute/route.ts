/**
 * API Route: /api/admin/import/execute
 *
 * POST - Execute import and save data to database
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  type ImportEntityType,
  mapCompanyToCustomer,
  mapPersonToCustomer,
  mapToInvoice,
  mapToOrder,
  mapToPerformance,
  mapToGame,
} from '@/lib/import'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Increase timeout for large imports
export const maxDuration = 60 // 60 seconds

interface ExecuteRequest {
  entityType: ImportEntityType
  data: Record<string, any>[]
  columnMapping: Record<string, string>
  options: {
    skipExisting: boolean
    updateExisting: boolean
    dryRun: boolean
  }
}

interface ImportResult {
  success: boolean
  created: number
  updated: number
  skipped: number
  errors: { row: number; error: string }[]
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
 * Import customers (companies or persons) into Prisma
 */
async function importCustomers(
  data: any[],
  options: ExecuteRequest['options']
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  for (let i = 0; i < data.length; i++) {
    const customer = data[i]
    if (!customer) {
      result.skipped++
      continue
    }

    try {
      // Check if customer already exists by email in Prisma
      const existing = await prisma.customer.findUnique({
        where: { email: customer.email },
      })

      // Prepare customer data for Prisma
      const customerData = {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone || null,
        organization: customer.organization || null,
        organizationType: customer.organizationType || null,
        address: customer.address || Prisma.JsonNull,
        billingInfo: customer.billingInfo || Prisma.JsonNull,
        tags: customer.tags || [],
        notes: customer.notes || null,
      }

      if (existing) {
        if (options.updateExisting) {
          if (!options.dryRun) {
            await prisma.customer.update({
              where: { id: existing.id },
              data: customerData,
            })
          }
          result.updated++
        } else if (options.skipExisting) {
          result.skipped++
        } else {
          result.errors.push({ row: i, error: `Email ${customer.email} již existuje` })
        }
      } else {
        if (!options.dryRun) {
          await prisma.customer.create({ data: customerData })
        }
        result.created++
      }
    } catch (error) {
      result.errors.push({
        row: i,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      })
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * Import invoices
 */
async function importInvoices(
  data: any[],
  options: ExecuteRequest['options']
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  // Get all customers for reference resolution
  const customers = await prisma.customer.findMany({
    select: { id: true, email: true, organization: true, billingInfo: true },
  })

  for (let i = 0; i < data.length; i++) {
    const invoice = data[i]
    if (!invoice) {
      result.skipped++
      continue
    }

    try {
      // Check if invoice already exists
      const existing = await prisma.invoice.findUnique({
        where: { invoiceNumber: invoice.invoiceNumber },
      })

      if (existing) {
        if (options.skipExisting) {
          result.skipped++
          continue
        } else if (!options.updateExisting) {
          result.errors.push({
            row: i,
            error: `Faktura ${invoice.invoiceNumber} již existuje`,
          })
          continue
        }
      }

      // Resolve customer reference
      let customerId: string | null = null
      if (invoice.customerRef) {
        const customer = customers.find((c) => {
          if (c.organization?.toLowerCase() === invoice.customerRef?.toLowerCase()) return true
          if (c.email?.toLowerCase() === invoice.customerRef?.toLowerCase()) return true
          const billingInfo = c.billingInfo as any
          if (billingInfo?.ico === invoice.customerRef) return true
          return false
        })
        customerId = customer?.id || null
      }

      if (!customerId) {
        result.errors.push({
          row: i,
          error: `Zákazník "${invoice.customerRef}" nenalezen`,
        })
        continue
      }

      if (!options.dryRun) {
        const invoiceData = {
          invoiceNumber: invoice.invoiceNumber,
          customerId,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          items: invoice.items || [],
          subtotal: invoice.subtotal || 0,
          totalAmount: invoice.totalAmount || 0,
          paymentMethod: invoice.paymentMethod || undefined,
          notes: invoice.notes || undefined,
        }

        if (existing && options.updateExisting) {
          await prisma.invoice.update({
            where: { invoiceNumber: invoice.invoiceNumber },
            data: invoiceData,
          })
          result.updated++
        } else {
          await prisma.invoice.create({ data: invoiceData })
          result.created++
        }
      } else {
        result.created++
      }
    } catch (error) {
      result.errors.push({
        row: i,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      })
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * Import orders
 */
async function importOrders(
  data: any[],
  options: ExecuteRequest['options']
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  // Get all customers for reference resolution
  const customers = await prisma.customer.findMany({
    select: { id: true, email: true, organization: true, billingInfo: true },
  })

  for (let i = 0; i < data.length; i++) {
    const order = data[i]
    if (!order) {
      result.skipped++
      continue
    }

    try {
      // Check if order already exists
      const existing = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
      })

      if (existing) {
        if (options.skipExisting) {
          result.skipped++
          continue
        } else if (!options.updateExisting) {
          result.errors.push({
            row: i,
            error: `Objednávka ${order.orderNumber} již existuje`,
          })
          continue
        }
      }

      // Resolve customer reference
      let customerId: string | null = null
      if (order.customerRef) {
        const customer = customers.find((c) => {
          if (c.organization?.toLowerCase() === order.customerRef?.toLowerCase()) return true
          if (c.email?.toLowerCase() === order.customerRef?.toLowerCase()) return true
          const billingInfo = c.billingInfo as any
          if (billingInfo?.ico === order.customerRef) return true
          return false
        })
        customerId = customer?.id || null
      }

      if (!customerId) {
        result.errors.push({
          row: i,
          error: `Zákazník "${order.customerRef}" nenalezen`,
        })
        continue
      }

      if (!options.dryRun) {
        const orderData = {
          orderNumber: order.orderNumber,
          customerId,
          source: order.source,
          status: order.status,
          eventName: order.eventName || undefined,
          dates: order.dates || [],
          venue: order.venue || {},
          arrivalTime: order.arrivalTime || undefined,
          preparationTime: order.preparationTime || undefined,
          contacts: order.contacts || Prisma.JsonNull,
          internalNotes: order.internalNotes || [],
        }

        if (existing && options.updateExisting) {
          await prisma.order.update({
            where: { orderNumber: order.orderNumber },
            data: orderData,
          })
          result.updated++
        } else {
          await prisma.order.create({ data: orderData })
          result.created++
        }
      } else {
        result.created++
      }
    } catch (error) {
      result.errors.push({
        row: i,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      })
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * Import performances
 */
async function importPerformances(
  data: any[],
  options: ExecuteRequest['options']
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  for (let i = 0; i < data.length; i++) {
    const performance = data[i]
    if (!performance) {
      result.skipped++
      continue
    }

    try {
      // Check if performance already exists by slug
      const existing = await prisma.performance.findUnique({
        where: { slug: performance.slug },
      })

      if (existing) {
        if (options.updateExisting) {
          if (!options.dryRun) {
            await prisma.performance.update({
              where: { slug: performance.slug },
              data: {
                title: performance.title,
                category: performance.category,
                status: performance.status,
                featured: performance.featured,
                order: performance.order,
                subtitle: performance.subtitle || undefined,
                excerpt: performance.excerpt || undefined,
                description: performance.description || Prisma.JsonNull,
                duration: performance.duration,
                technicalRequirements: performance.technicalRequirements || Prisma.JsonNull,
                premiere: performance.premiere || undefined,
              },
            })
          }
          result.updated++
        } else if (options.skipExisting) {
          result.skipped++
        } else {
          result.errors.push({
            row: i,
            error: `Představení se slug "${performance.slug}" již existuje`,
          })
        }
      } else {
        if (!options.dryRun) {
          // Generate unique slug if needed
          let slug = performance.slug
          let counter = 1
          while (await prisma.performance.findUnique({ where: { slug } })) {
            slug = `${performance.slug}-${counter}`
            counter++
          }

          await prisma.performance.create({
            data: {
              title: performance.title,
              slug,
              category: performance.category,
              status: performance.status,
              featured: performance.featured,
              order: performance.order,
              subtitle: performance.subtitle || undefined,
              excerpt: performance.excerpt || undefined,
              description: performance.description || Prisma.JsonNull,
              duration: performance.duration,
              technicalRequirements: performance.technicalRequirements || Prisma.JsonNull,
              premiere: performance.premiere || undefined,
              // Required fields with defaults
              featuredImageUrl: '/images/placeholder-performance.jpg',
              featuredImageAlt: performance.title,
            },
          })
        }
        result.created++
      }
    } catch (error) {
      result.errors.push({
        row: i,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      })
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * Import games
 */
async function importGames(
  data: any[],
  options: ExecuteRequest['options']
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  for (let i = 0; i < data.length; i++) {
    const game = data[i]
    if (!game) {
      result.skipped++
      continue
    }

    try {
      // Check if game already exists by slug
      const existing = await prisma.game.findUnique({
        where: { slug: game.slug },
      })

      if (existing) {
        if (options.updateExisting) {
          if (!options.dryRun) {
            await prisma.game.update({
              where: { slug: game.slug },
              data: {
                title: game.title,
                category: game.category,
                status: game.status,
                featured: game.featured,
                order: game.order,
                subtitle: game.subtitle || undefined,
                excerpt: game.excerpt || undefined,
                description: game.description || Prisma.JsonNull,
                duration: game.duration,
                technicalRequirements: game.technicalRequirements || Prisma.JsonNull,
              },
            })
          }
          result.updated++
        } else if (options.skipExisting) {
          result.skipped++
        } else {
          result.errors.push({
            row: i,
            error: `Hra se slug "${game.slug}" již existuje`,
          })
        }
      } else {
        if (!options.dryRun) {
          // Generate unique slug if needed
          let slug = game.slug
          let counter = 1
          while (await prisma.game.findUnique({ where: { slug } })) {
            slug = `${game.slug}-${counter}`
            counter++
          }

          await prisma.game.create({
            data: {
              title: game.title,
              slug,
              category: game.category,
              status: game.status,
              featured: game.featured,
              order: game.order,
              subtitle: game.subtitle || undefined,
              excerpt: game.excerpt || undefined,
              description: game.description || Prisma.JsonNull,
              duration: game.duration,
              technicalRequirements: game.technicalRequirements || Prisma.JsonNull,
              // Required fields with defaults
              featuredImageUrl: '/images/placeholder-game.jpg',
              featuredImageAlt: game.title,
            },
          })
        }
        result.created++
      }
    } catch (error) {
      result.errors.push({
        row: i,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      })
    }
  }

  result.success = result.errors.length === 0
  return result
}

/**
 * POST /api/admin/import/execute
 * Execute import and save data to database
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json()
    const { entityType, data, columnMapping, options } = body

    if (!entityType || !data || !columnMapping) {
      return NextResponse.json(
        { success: false, error: 'Chybí povinné parametry' },
        { status: 400 }
      )
    }

    // Default options
    const importOptions = {
      skipExisting: options?.skipExisting ?? true,
      updateExisting: options?.updateExisting ?? false,
      dryRun: options?.dryRun ?? false,
    }

    // Map raw data to entity format
    const mappedData = data
      .map((row, index) => mapDataToEntity(entityType, row, columnMapping, index))
      .filter((d) => d !== null)

    let result: ImportResult

    // Execute import based on entity type
    switch (entityType) {
      case 'customer_company':
      case 'customer_person':
        result = await importCustomers(mappedData, importOptions)
        break
      case 'invoice':
        result = await importInvoices(mappedData, importOptions)
        break
      case 'order':
        result = await importOrders(mappedData, importOptions)
        break
      case 'performance':
        result = await importPerformances(mappedData, importOptions)
        break
      case 'game':
        result = await importGames(mappedData, importOptions)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Neplatný typ importu' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      data: {
        ...result,
        dryRun: importOptions.dryRun,
        message: importOptions.dryRun
          ? `Simulace dokončena: ${result.created} by bylo vytvořeno, ${result.updated} by bylo aktualizováno, ${result.skipped} by bylo přeskočeno`
          : `Import dokončen: ${result.created} vytvořeno, ${result.updated} aktualizováno, ${result.skipped} přeskočeno`,
      },
    })
  } catch (error) {
    console.error('Error executing import:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Chyba při provádění importu',
      },
      { status: 500 }
    )
  }
}
