/**
 * Client Service Layer
 * Business logic for client management in ShootFlow
 */

import { prisma } from '@/lib/prisma'

// =============================================================================
// TYPES
// =============================================================================

export interface CreateClientInput {
  tenantId: string
  name: string
  email: string
  phone?: string
  address?: string
  type?: 'individual' | 'couple' | 'business'
  tags?: string[]
  notes?: string
}

export interface UpdateClientInput {
  name?: string
  email?: string
  phone?: string
  address?: string
  type?: 'individual' | 'couple' | 'business'
  tags?: string[]
  notes?: string
}

export interface GetClientsOptions {
  search?: string
  type?: 'individual' | 'couple' | 'business'
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ClientStats {
  total: number
  byType: {
    individual: number
    couple: number
    business: number
  }
  active: number
  newThisMonth: number
  lifetimeValue: number
  topClients: Array<{
    id: string
    name: string
    email: string
    revenue: number
    packageCount: number
  }>
}

// =============================================================================
// SERVICE FUNCTIONS
// =============================================================================

/**
 * Get paginated and filtered list of clients
 */
export async function getClients(
  tenantId: string,
  options: GetClientsOptions = {}
) {
  const {
    search,
    type,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options

  // Build where clause
  const where: {
    tenantId: string
    type?: string
    OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' }; phone?: { contains: string; mode: 'insensitive' } }>
  } = { tenantId }

  if (type) {
    where.type = type
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Build orderBy
  const orderBy: Record<string, 'asc' | 'desc'> = { [sortBy]: sortOrder }

  // Execute queries in parallel
  const [clients, totalCount] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        packages: {
          select: {
            id: true,
            title: true,
            status: true,
            totalPrice: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            packages: true,
            invoices: true,
          },
        },
      },
    }),
    prisma.client.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return {
    data: clients,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasMore: page < totalPages,
    },
  } as PaginatedResponse<typeof clients[0]>
}

/**
 * Get a single client by ID
 */
export async function getClientById(id: string, tenantId: string) {
  return prisma.client.findFirst({
    where: { id, tenantId },
    include: {
      packages: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { shoots: true },
          },
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

/**
 * Create a new client
 */
export async function createClient(input: CreateClientInput) {
  // Check for existing client with same email
  const existing = await prisma.client.findFirst({
    where: {
      tenantId: input.tenantId,
      email: input.email,
    },
  })

  if (existing) {
    throw new Error('Client with this email already exists')
  }

  return prisma.client.create({
    data: {
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      type: input.type || 'individual',
      tags: input.tags || [],
      notes: input.notes,
    },
  })
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: string,
  tenantId: string,
  input: UpdateClientInput
) {
  // Verify ownership
  const existing = await prisma.client.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Client not found')
  }

  // Check email uniqueness if email is being changed
  if (input.email && input.email !== existing.email) {
    const emailExists = await prisma.client.findFirst({
      where: {
        tenantId,
        email: input.email,
        id: { not: id },
      },
    })

    if (emailExists) {
      throw new Error('Client with this email already exists')
    }
  }

  return prisma.client.update({
    where: { id },
    data: input,
  })
}

/**
 * Delete a client
 * Validates that client has no packages or invoices
 */
export async function deleteClient(id: string, tenantId: string) {
  // Verify ownership
  const existing = await prisma.client.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Client not found')
  }

  // Check for related records
  const [packageCount, invoiceCount] = await Promise.all([
    prisma.package.count({ where: { clientId: id } }),
    prisma.invoice.count({ where: { clientId: id } }),
  ])

  if (packageCount > 0) {
    throw new Error('Cannot delete client with existing packages')
  }

  if (invoiceCount > 0) {
    throw new Error('Cannot delete client with existing invoices')
  }

  return prisma.client.delete({
    where: { id },
  })
}

/**
 * Bulk delete clients
 * Returns success/failure for each client
 */
export async function bulkDeleteClients(ids: string[], tenantId: string) {
  // Find clients that can't be deleted (have packages or invoices)
  const clientsWithRelations = await prisma.client.findMany({
    where: {
      id: { in: ids },
      tenantId,
      OR: [
        { packages: { some: {} } },
        { invoices: { some: {} } },
      ],
    },
    select: { id: true, name: true },
  })

  const blockedIds = new Set(clientsWithRelations.map((c) => c.id))
  const deletableIds = ids.filter((id) => !blockedIds.has(id))

  // Delete clients that can be deleted
  const result = await prisma.client.deleteMany({
    where: {
      id: { in: deletableIds },
      tenantId,
    },
  })

  return {
    success: true,
    deleted: result.count,
    failed: clientsWithRelations.map((c) => ({
      id: c.id,
      name: c.name,
      reason: 'Client has existing packages or invoices',
    })),
  }
}

/**
 * Get client statistics for dashboard
 */
export async function getClientStats(tenantId: string): Promise<ClientStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Execute all queries in parallel
  const [
    total,
    individualCount,
    coupleCount,
    businessCount,
    activeCount,
    newThisMonth,
    revenueData,
    topClientsData,
  ] = await Promise.all([
    // Total clients
    prisma.client.count({ where: { tenantId } }),

    // By type
    prisma.client.count({ where: { tenantId, type: 'individual' } }),
    prisma.client.count({ where: { tenantId, type: 'couple' } }),
    prisma.client.count({ where: { tenantId, type: 'business' } }),

    // Active (with packages)
    prisma.client.count({
      where: {
        tenantId,
        packages: { some: {} },
      },
    }),

    // New this month
    prisma.client.count({
      where: {
        tenantId,
        createdAt: { gte: startOfMonth },
      },
    }),

    // Total revenue from paid invoices
    prisma.invoice.aggregate({
      where: {
        tenantId,
        status: 'PAID',
      },
      _sum: { total: true },
    }),

    // Top clients by revenue
    prisma.client.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        invoices: {
          where: { status: 'PAID' },
          select: { total: true },
        },
        _count: {
          select: { packages: true },
        },
      },
      take: 100, // Get more to filter/sort
    }),
  ])

  // Calculate top clients with revenue
  const topClients = topClientsData
    .map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      revenue: client.invoices.reduce((sum, inv) => sum + inv.total, 0),
      packageCount: client._count.packages,
    }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    total,
    byType: {
      individual: individualCount,
      couple: coupleCount,
      business: businessCount,
    },
    active: activeCount,
    newThisMonth,
    lifetimeValue: revenueData._sum.total || 0,
    topClients,
  }
}
