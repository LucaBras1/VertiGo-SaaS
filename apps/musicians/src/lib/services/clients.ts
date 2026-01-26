import { prisma } from '@/lib/db'

export interface CreateClientInput {
  tenantId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  address?: {
    street?: string
    city?: string
    zip?: string
    country?: string
  }
  tags?: string[]
  notes?: string
}

export interface UpdateClientInput extends Partial<Omit<CreateClientInput, 'tenantId'>> {}

export async function getClients(tenantId: string, options?: {
  search?: string
  limit?: number
  offset?: number
}) {
  const where: any = { tenantId }

  if (options?.search) {
    where.OR = [
      { firstName: { contains: options.search, mode: 'insensitive' } },
      { lastName: { contains: options.search, mode: 'insensitive' } },
      { email: { contains: options.search, mode: 'insensitive' } },
      { company: { contains: options.search, mode: 'insensitive' } },
    ]
  }

  const [clients, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    }),
    prisma.customer.count({ where }),
  ])

  return { clients, total }
}

export async function getClientById(id: string, tenantId: string) {
  return prisma.customer.findFirst({
    where: { id, tenantId },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createClient(input: CreateClientInput) {
  return prisma.customer.create({
    data: {
      ...input,
      address: input.address ? JSON.parse(JSON.stringify(input.address)) : undefined,
    },
  })
}

export async function updateClient(id: string, tenantId: string, input: UpdateClientInput) {
  // Verify ownership
  const existing = await prisma.customer.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Client not found')
  }

  return prisma.customer.update({
    where: { id },
    data: {
      ...input,
      address: input.address ? JSON.parse(JSON.stringify(input.address)) : undefined,
    },
  })
}

export async function deleteClient(id: string, tenantId: string) {
  // Verify ownership
  const existing = await prisma.customer.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Client not found')
  }

  // Check if client has invoices
  const invoiceCount = await prisma.invoice.count({
    where: { customerId: id },
  })

  if (invoiceCount > 0) {
    throw new Error('Cannot delete client with existing invoices')
  }

  return prisma.customer.delete({
    where: { id },
  })
}

export async function getClientStats(tenantId: string) {
  const [total, withInvoices] = await Promise.all([
    prisma.customer.count({ where: { tenantId } }),
    prisma.customer.count({
      where: {
        tenantId,
        invoices: { some: {} },
      },
    }),
  ])

  // Calculate total revenue per client
  const revenueData = await prisma.invoice.groupBy({
    by: ['customerId'],
    where: {
      tenantId,
      status: 'paid',
    },
    _sum: { totalAmount: true },
  })

  const lifetimeValue = revenueData.reduce((sum, item) => sum + (item._sum.totalAmount || 0), 0)

  return {
    total,
    active: withInvoices,
    repeat: revenueData.filter(r => (r._sum.totalAmount || 0) > 0).length,
    lifetimeValue,
  }
}
