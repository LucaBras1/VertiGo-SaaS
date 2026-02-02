import { prisma } from '@/lib/db'
import { GigStatus, Vertical } from '@/generated/prisma'
import { syncGigToCalendars } from '@/lib/calendar/sync-service'

export interface CreateGigInput {
  tenantId: string
  title: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  eventType?: string
  eventDate?: Date
  eventDuration?: number
  venue?: {
    name: string
    address?: string
    city?: string
    type?: 'indoor' | 'outdoor'
  }
  audienceSize?: number
  bandMembers?: number
  genres?: string[]
  setDuration?: number
  numberOfSets?: number
  basePrice?: number
  travelCosts?: number
  description?: string
  internalNotes?: string
}

export interface UpdateGigInput extends Partial<CreateGigInput> {
  status?: GigStatus
  deposit?: number
  depositPaid?: boolean
  totalPrice?: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  while (await prisma.gig.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export async function getGigs(tenantId: string, options?: {
  status?: GigStatus
  search?: string
  limit?: number
  offset?: number
}) {
  const where: any = {
    tenantId,
    vertical: 'MUSICIANS' as Vertical,
  }

  if (options?.status) {
    where.status = options.status
  }

  if (options?.search) {
    where.OR = [
      { title: { contains: options.search, mode: 'insensitive' } },
      { clientName: { contains: options.search, mode: 'insensitive' } },
    ]
  }

  const [gigs, total] = await Promise.all([
    prisma.gig.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        setlists: true,
        invoices: true,
      },
    }),
    prisma.gig.count({ where }),
  ])

  return { gigs, total }
}

export async function getGigById(id: string, tenantId: string) {
  return prisma.gig.findFirst({
    where: { id, tenantId },
    include: {
      setlists: true,
      extras: true,
      invoices: true,
    },
  })
}

export async function createGig(input: CreateGigInput) {
  const slug = await generateUniqueSlug(input.title)

  const gig = await prisma.gig.create({
    data: {
      ...input,
      slug,
      vertical: 'MUSICIANS' as Vertical,
      venue: input.venue ? JSON.parse(JSON.stringify(input.venue)) : undefined,
      status: 'INQUIRY' as GigStatus,
    },
  })

  // Sync to connected calendars (async, don't block)
  if (gig.eventDate) {
    syncGigToCalendars(input.tenantId, {
      id: gig.id,
      title: gig.title,
      status: gig.status,
      eventDate: gig.eventDate,
      eventDuration: gig.eventDuration || undefined,
      venue: gig.venue as any,
      clientName: gig.clientName || undefined,
      description: gig.internalNotes || undefined,
    }).catch(err => console.error('Calendar sync error:', err))
  }

  return gig
}

export async function updateGig(id: string, tenantId: string, input: UpdateGigInput) {
  // Verify ownership
  const existing = await prisma.gig.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Gig not found')
  }

  // Calculate total price if base price or travel costs changed
  let totalPrice = input.totalPrice
  if (input.basePrice !== undefined || input.travelCosts !== undefined) {
    const basePrice = input.basePrice ?? existing.basePrice ?? 0
    const travelCosts = input.travelCosts ?? existing.travelCosts ?? 0
    totalPrice = basePrice + travelCosts
  }

  const gig = await prisma.gig.update({
    where: { id },
    data: {
      ...input,
      totalPrice,
      venue: input.venue ? JSON.parse(JSON.stringify(input.venue)) : undefined,
    },
  })

  // Sync to connected calendars (async, don't block)
  const eventDate = gig.eventDate || existing.eventDate
  if (eventDate) {
    syncGigToCalendars(tenantId, {
      id: gig.id,
      title: gig.title,
      status: gig.status,
      eventDate,
      eventDuration: gig.eventDuration || undefined,
      venue: gig.venue as any,
      clientName: gig.clientName || undefined,
      description: gig.internalNotes || undefined,
    }).catch(err => console.error('Calendar sync error:', err))
  }

  return gig
}

export async function deleteGig(id: string, tenantId: string) {
  // Verify ownership
  const existing = await prisma.gig.findFirst({
    where: { id, tenantId },
  })

  if (!existing) {
    throw new Error('Gig not found')
  }

  return prisma.gig.delete({
    where: { id },
  })
}

export async function getGigStats(tenantId: string) {
  const [total, confirmed, pending, revenue] = await Promise.all([
    prisma.gig.count({ where: { tenantId } }),
    prisma.gig.count({ where: { tenantId, status: 'CONFIRMED' } }),
    prisma.gig.count({ where: { tenantId, status: { in: ['INQUIRY', 'QUOTE_SENT'] } } }),
    prisma.gig.aggregate({
      where: { tenantId, status: 'COMPLETED' },
      _sum: { totalPrice: true },
    }),
  ])

  return {
    total,
    confirmed,
    pending,
    revenue: revenue._sum.totalPrice || 0,
  }
}
