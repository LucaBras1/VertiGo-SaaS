/**
 * Booking Widget Service
 * Manages public booking widgets and inquiries
 */

import { prisma } from '@/lib/db'
import { BookingInquiryStatus, Vertical, GigStatus } from '@/generated/prisma'

// ========================================
// WIDGET MANAGEMENT
// ========================================

export interface CreateWidgetInput {
  tenantId: string
  displayName?: string
  displayBio?: string
  displayPhoto?: string
  primaryColor?: string
  backgroundColor?: string
  allowedEventTypes?: string[]
  minNoticeHours?: number
  maxSubmissionsPerDay?: number
  successMessage?: string
}

export interface UpdateWidgetInput {
  displayName?: string
  displayBio?: string
  displayPhoto?: string
  primaryColor?: string
  backgroundColor?: string
  allowedEventTypes?: string[]
  minNoticeHours?: number
  maxSubmissionsPerDay?: number
  successMessage?: string
  isActive?: boolean
}

export async function getWidget(tenantId: string) {
  return prisma.bookingWidget.findUnique({
    where: { tenantId },
    include: {
      _count: {
        select: { inquiries: true }
      }
    }
  })
}

export async function createWidget(input: CreateWidgetInput) {
  return prisma.bookingWidget.create({
    data: {
      tenantId: input.tenantId,
      displayName: input.displayName,
      displayBio: input.displayBio,
      displayPhoto: input.displayPhoto,
      primaryColor: input.primaryColor || '#2563eb',
      backgroundColor: input.backgroundColor || '#ffffff',
      allowedEventTypes: input.allowedEventTypes || ['wedding', 'corporate', 'party'],
      minNoticeHours: input.minNoticeHours || 48,
      maxSubmissionsPerDay: input.maxSubmissionsPerDay || 50,
      successMessage: input.successMessage,
    }
  })
}

export async function updateWidget(tenantId: string, input: UpdateWidgetInput) {
  return prisma.bookingWidget.update({
    where: { tenantId },
    data: input,
  })
}

export async function regenerateWidgetToken(tenantId: string) {
  // Generate a simple unique token
  const newToken = `wdg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`

  return prisma.bookingWidget.update({
    where: { tenantId },
    data: { token: newToken },
  })
}

export async function getWidgetByToken(token: string) {
  return prisma.bookingWidget.findUnique({
    where: { token },
    include: {
      tenant: {
        select: {
          id: true,
          bandName: true,
          bandBio: true,
          logoUrl: true,
          email: true,
          phone: true,
          website: true,
          socialLinks: true,
        }
      }
    }
  })
}

// ========================================
// INQUIRY MANAGEMENT
// ========================================

export interface CreateInquiryInput {
  widgetId: string
  tenantId: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  eventType: string
  eventDate: Date
  venue?: {
    name?: string
    address?: string
    city?: string
  }
  message?: string
  ipAddress?: string
  userAgent?: string
}

export async function createInquiry(input: CreateInquiryInput) {
  return prisma.bookingInquiry.create({
    data: {
      widgetId: input.widgetId,
      tenantId: input.tenantId,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone,
      eventType: input.eventType,
      eventDate: input.eventDate,
      venue: input.venue ? JSON.parse(JSON.stringify(input.venue)) : undefined,
      message: input.message,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    }
  })
}

export async function getInquiries(tenantId: string, options?: {
  status?: BookingInquiryStatus
  limit?: number
  offset?: number
}) {
  const where: any = { tenantId }

  if (options?.status) {
    where.status = options.status
  }

  const [inquiries, total] = await Promise.all([
    prisma.bookingInquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        gig: {
          select: { id: true, title: true, status: true }
        }
      }
    }),
    prisma.bookingInquiry.count({ where })
  ])

  return { inquiries, total }
}

export async function getInquiryById(id: string, tenantId: string) {
  return prisma.bookingInquiry.findFirst({
    where: { id, tenantId },
    include: {
      gig: true,
      widget: true,
    }
  })
}

export async function updateInquiryStatus(
  id: string,
  tenantId: string,
  status: BookingInquiryStatus
) {
  const inquiry = await prisma.bookingInquiry.findFirst({
    where: { id, tenantId }
  })

  if (!inquiry) {
    throw new Error('Inquiry not found')
  }

  return prisma.bookingInquiry.update({
    where: { id },
    data: { status }
  })
}

export async function convertInquiryToGig(id: string, tenantId: string) {
  const inquiry = await prisma.bookingInquiry.findFirst({
    where: { id, tenantId },
    include: { widget: true }
  })

  if (!inquiry) {
    throw new Error('Inquiry not found')
  }

  if (inquiry.gigId) {
    throw new Error('Inquiry already converted to gig')
  }

  // Generate unique slug for the gig
  const baseSlug = inquiry.clientName.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  let slug = baseSlug
  let counter = 1
  while (await prisma.gig.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Create gig from inquiry
  const gig = await prisma.gig.create({
    data: {
      tenantId,
      vertical: 'MUSICIANS' as Vertical,
      title: `${inquiry.eventType} - ${inquiry.clientName}`,
      slug,
      status: 'INQUIRY' as GigStatus,
      clientName: inquiry.clientName,
      clientEmail: inquiry.clientEmail,
      clientPhone: inquiry.clientPhone,
      eventType: inquiry.eventType,
      eventDate: inquiry.eventDate,
      venue: inquiry.venue as object | undefined,
      internalNotes: inquiry.message,
    }
  })

  // Update inquiry with gig reference
  await prisma.bookingInquiry.update({
    where: { id },
    data: {
      gigId: gig.id,
      status: 'CONVERTED' as BookingInquiryStatus,
    }
  })

  return gig
}

// ========================================
// RATE LIMITING
// ========================================

export async function checkRateLimit(widgetId: string, ipAddress: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const widget = await prisma.bookingWidget.findUnique({
    where: { id: widgetId }
  })

  if (!widget || !widget.isActive) {
    return { allowed: false, reason: 'Widget is not active' }
  }

  // Check daily limit
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySubmissions = await prisma.bookingInquiry.count({
    where: {
      widgetId,
      createdAt: { gte: today }
    }
  })

  if (todaySubmissions >= widget.maxSubmissionsPerDay) {
    return { allowed: false, reason: 'Daily submission limit reached' }
  }

  // Check per-IP limit (5 per hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const ipSubmissions = await prisma.bookingInquiry.count({
    where: {
      widgetId,
      ipAddress,
      createdAt: { gte: oneHourAgo }
    }
  })

  if (ipSubmissions >= 5) {
    return { allowed: false, reason: 'Too many submissions from your IP' }
  }

  return { allowed: true }
}

// ========================================
// STATS
// ========================================

export async function getWidgetStats(tenantId: string) {
  const widget = await prisma.bookingWidget.findUnique({
    where: { tenantId }
  })

  if (!widget) {
    return null
  }

  const [total, newCount, convertedCount, thisMonth] = await Promise.all([
    prisma.bookingInquiry.count({ where: { tenantId } }),
    prisma.bookingInquiry.count({
      where: { tenantId, status: 'NEW' }
    }),
    prisma.bookingInquiry.count({
      where: { tenantId, status: 'CONVERTED' }
    }),
    prisma.bookingInquiry.count({
      where: {
        tenantId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ])

  return {
    total,
    new: newCount,
    converted: convertedCount,
    thisMonth,
    conversionRate: total > 0 ? Math.round((convertedCount / total) * 100) : 0,
  }
}
