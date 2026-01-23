// API Route: /api/admin/customers
// CRUD operations for customers using Prisma

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Build Prisma where clause for customer filtering
 * Note: SQLite doesn't support case-insensitive mode, so we use contains only
 */
function buildWhereClause(options: {
  search?: string
  tags?: string[]
  orgTypes?: string[]
  city?: string
}): Prisma.CustomerWhereInput {
  const { search, orgTypes } = options
  const where: Prisma.CustomerWhereInput = {}
  const AND: Prisma.CustomerWhereInput[] = []

  // Search across multiple fields (case-sensitive for SQLite)
  if (search) {
    const searchLower = search.toLowerCase()
    AND.push({
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: searchLower } },
        { organization: { contains: search } },
        { phone: { contains: search } },
      ],
    })
  }

  // Filter by organization types
  if (orgTypes && orgTypes.length > 0) {
    AND.push({
      organizationType: { in: orgTypes },
    })
  }

  // Note: City and tags filtering is done in JS after fetching
  // because SQLite has limited JSON query support

  if (AND.length > 0) {
    where.AND = AND
  }

  return where
}

/**
 * GET /api/admin/customers
 * Get all customers with optional filtering and pagination
 * Query params: page, pageSize, search, tags, orgType, city
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')

    // Filter params
    const search = searchParams.get('search') || undefined
    const tagsParam = searchParams.getAll('tags')
    const tags = tagsParam.length > 0 ? tagsParam : undefined
    const orgTypes = searchParams.getAll('orgType')
    const city = searchParams.get('city') || undefined

    // Boolean filters
    const hasEmail = searchParams.get('hasEmail')
    const hasPhone = searchParams.get('hasPhone')
    const hasOrganization = searchParams.get('hasOrganization')
    const hasIco = searchParams.get('hasIco')
    const gdprMarketing = searchParams.get('gdprMarketing')

    // Date range filters
    const createdFrom = searchParams.get('createdFrom')
    const createdTo = searchParams.get('createdTo')

    // Build where clause (only for SQL-supported filters)
    // Note: We don't include search in SQL because we need to search in JSON fields (IČO)
    const where = buildWhereClause({
      search: undefined, // Search will be done in JS to include IČO
      tags,
      orgTypes: orgTypes.length > 0 ? orgTypes : undefined,
      city,
    })

    // Fetch customers with optimized selects (only needed fields for list view)
    let allCustomers = await prisma.customer.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        organization: true,
        organizationType: true,
        address: true,
        billingInfo: true,
        gdprConsent: true,
        tags: true,
        createdAt: true,
        vyfakturujContactId: true,
        _count: {
          select: { orders: true, invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Apply JS-based filters for JSON fields (SQLite limitation)
    if (city) {
      allCustomers = allCustomers.filter((c) => {
        const address = c.address as { city?: string } | null
        return address?.city === city
      })
    }

    // JS-based search to include all fields + IČO (billingInfo.ico)
    if (search) {
      const searchLower = search.toLowerCase()
      allCustomers = allCustomers.filter((c) => {
        const billing = c.billingInfo as { ico?: string } | null
        return (
          c.firstName?.toLowerCase().includes(searchLower) ||
          c.lastName?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.organization?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(search) ||
          billing?.ico?.toLowerCase().includes(searchLower)
        )
      })
    }

    if (tags && tags.length > 0) {
      allCustomers = allCustomers.filter((c) => {
        const customerTags = c.tags as string[] | null
        if (!customerTags || !Array.isArray(customerTags)) return false
        return tags.every((tag) => customerTags.includes(tag))
      })
    }

    // hasEmail filter
    if (hasEmail === 'true') {
      allCustomers = allCustomers.filter((c) => c.email && c.email.trim() !== '')
    } else if (hasEmail === 'false') {
      allCustomers = allCustomers.filter((c) => !c.email || c.email.trim() === '')
    }

    // hasPhone filter
    if (hasPhone === 'true') {
      allCustomers = allCustomers.filter((c) => c.phone && c.phone.trim() !== '')
    } else if (hasPhone === 'false') {
      allCustomers = allCustomers.filter((c) => !c.phone || c.phone.trim() === '')
    }

    // hasOrganization filter
    if (hasOrganization === 'true') {
      allCustomers = allCustomers.filter(
        (c) => c.organization && c.organization.trim() !== ''
      )
    } else if (hasOrganization === 'false') {
      allCustomers = allCustomers.filter(
        (c) => !c.organization || c.organization.trim() === ''
      )
    }

    // hasIco filter (IČO je v billingInfo.ico)
    if (hasIco === 'true') {
      allCustomers = allCustomers.filter((c) => {
        const billing = c.billingInfo as { ico?: string } | null
        return billing?.ico && billing.ico.trim() !== ''
      })
    } else if (hasIco === 'false') {
      allCustomers = allCustomers.filter((c) => {
        const billing = c.billingInfo as { ico?: string } | null
        return !billing?.ico || billing.ico.trim() === ''
      })
    }

    // gdprMarketing filter
    if (gdprMarketing === 'true') {
      allCustomers = allCustomers.filter((c) => {
        const gdpr = c.gdprConsent as { marketing?: boolean } | null
        return gdpr?.marketing === true
      })
    } else if (gdprMarketing === 'false') {
      allCustomers = allCustomers.filter((c) => {
        const gdpr = c.gdprConsent as { marketing?: boolean } | null
        return gdpr?.marketing !== true
      })
    }

    // createdFrom/createdTo filter
    if (createdFrom) {
      const fromDate = new Date(createdFrom)
      allCustomers = allCustomers.filter((c) => new Date(c.createdAt) >= fromDate)
    }
    if (createdTo) {
      const toDate = new Date(createdTo)
      allCustomers = allCustomers.filter((c) => new Date(c.createdAt) <= toDate)
    }

    // Apply pagination after JS filtering
    const totalItems = allCustomers.length
    const offset = (page - 1) * pageSize
    const customers = allCustomers.slice(offset, offset + pageSize)
    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      success: true,
      customers,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch customers',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/customers
 * Get filter options (unique cities, tags)
 */
export async function OPTIONS(request: NextRequest) {
  try {
    // Get all customers to extract unique values from JSON fields
    const customers = await prisma.customer.findMany({
      select: {
        address: true,
        tags: true,
      },
    })

    // Extract unique cities from address JSON
    const citiesSet = new Set<string>()
    customers.forEach((customer) => {
      const address = customer.address as { city?: string } | null
      if (address?.city) {
        citiesSet.add(address.city)
      }
    })

    // Extract unique tags from tags JSON array
    const tagsSet = new Set<string>()
    customers.forEach((customer) => {
      const tags = customer.tags as string[] | null
      if (tags && Array.isArray(tags)) {
        tags.forEach((tag) => tagsSet.add(tag))
      }
    })

    return NextResponse.json({
      success: true,
      cities: Array.from(citiesSet).filter(Boolean).sort(),
      tags: Array.from(tagsSet).filter(Boolean).sort(),
    })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch filter options',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/customers
 * Create new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      )
    }

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        {
          success: false,
          error: 'First name and last name are required',
        },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existing = await prisma.customer.findUnique({
      where: { email: body.email },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Customer with this email already exists',
        },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || null,
        organization: body.organization || null,
        organizationType: body.organizationType || null,
        address: body.address || null,
        billingInfo: body.billingInfo || null,
        tags: body.tags || [],
        notes: body.notes || null,
        gdprConsent: body.gdprConsent || null,
        source: body.source || 'manual',
      },
    })

    return NextResponse.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create customer',
      },
      { status: 500 }
    )
  }
}
