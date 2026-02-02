/**
 * Smart Reminders Service
 * Automatic email reminders for gigs, invoices, and quotes
 */

import { prisma } from '@/lib/db'
import { ReminderType, GigStatus } from '@/generated/prisma'

// ========================================
// TYPES
// ========================================

export interface ReminderSettings {
  enabled: boolean
  gigReminders: {
    enabled: boolean
    daysBefore: number[]  // e.g., [7, 1, 0]
    sendToClient: boolean
    sendToSelf: boolean
  }
  invoiceReminders: {
    enabled: boolean
    daysBeforeDue: number
    daysAfterDue: number[]  // e.g., [1, 7, 14]
  }
  quoteReminders: {
    enabled: boolean
    daysAfterSent: number[]  // e.g., [3, 7]
  }
  timezone: string
}

// Deep partial type for updates
export interface ReminderSettingsUpdate {
  enabled?: boolean
  gigReminders?: {
    enabled?: boolean
    daysBefore?: number[]
    sendToClient?: boolean
    sendToSelf?: boolean
  }
  invoiceReminders?: {
    enabled?: boolean
    daysBeforeDue?: number
    daysAfterDue?: number[]
  }
  quoteReminders?: {
    enabled?: boolean
    daysAfterSent?: number[]
  }
  timezone?: string
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  gigReminders: {
    enabled: true,
    daysBefore: [7, 1, 0],
    sendToClient: true,
    sendToSelf: true,
  },
  invoiceReminders: {
    enabled: true,
    daysBeforeDue: 3,
    daysAfterDue: [1, 7, 14],
  },
  quoteReminders: {
    enabled: false,
    daysAfterSent: [3, 7],
  },
  timezone: 'Europe/Prague',
}

// ========================================
// SETTINGS MANAGEMENT
// ========================================

export async function getReminderSettings(tenantId: string): Promise<ReminderSettings> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  })

  const settings = (tenant?.settings as any)?.reminders
  return settings ? { ...DEFAULT_REMINDER_SETTINGS, ...settings } : DEFAULT_REMINDER_SETTINGS
}

export async function updateReminderSettings(
  tenantId: string,
  updates: ReminderSettingsUpdate
): Promise<ReminderSettings> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true }
  })

  const currentSettings = (tenant?.settings as any) || {}
  const currentReminders = currentSettings.reminders || DEFAULT_REMINDER_SETTINGS

  const newReminders = {
    ...currentReminders,
    ...updates,
    gigReminders: { ...currentReminders.gigReminders, ...updates.gigReminders },
    invoiceReminders: { ...currentReminders.invoiceReminders, ...updates.invoiceReminders },
    quoteReminders: { ...currentReminders.quoteReminders, ...updates.quoteReminders },
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: {
        ...currentSettings,
        reminders: newReminders,
      }
    }
  })

  return newReminders
}

// ========================================
// SENT REMINDERS TRACKING
// ========================================

export async function getSentReminders(tenantId: string, options?: {
  entityId?: string
  type?: ReminderType
  dismissed?: boolean
  limit?: number
}) {
  const where: any = { tenantId }

  if (options?.entityId) where.entityId = options.entityId
  if (options?.type) where.type = options.type
  if (options?.dismissed !== undefined) where.dismissed = options.dismissed

  return prisma.sentReminder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
  })
}

export async function wasReminderSent(
  tenantId: string,
  entityId: string,
  type: ReminderType,
  daysOffset: number
): Promise<boolean> {
  const existing = await prisma.sentReminder.findUnique({
    where: {
      tenantId_entityId_type_daysOffset: {
        tenantId,
        entityId,
        type,
        daysOffset,
      }
    }
  })

  return !!existing
}

export async function recordSentReminder(input: {
  tenantId: string
  type: ReminderType
  entityId: string
  entityType: 'gig' | 'invoice'
  daysOffset: number
  sentTo: string[]
  success?: boolean
  errorMessage?: string
}) {
  return prisma.sentReminder.create({
    data: {
      tenantId: input.tenantId,
      type: input.type,
      entityId: input.entityId,
      entityType: input.entityType,
      daysOffset: input.daysOffset,
      sentTo: input.sentTo,
      success: input.success ?? true,
      errorMessage: input.errorMessage,
    }
  })
}

export async function dismissReminder(id: string, tenantId: string) {
  const reminder = await prisma.sentReminder.findFirst({
    where: { id, tenantId }
  })

  if (!reminder) {
    throw new Error('Reminder not found')
  }

  return prisma.sentReminder.update({
    where: { id },
    data: {
      dismissed: true,
      dismissedAt: new Date(),
    }
  })
}

export async function snoozeReminder(id: string, tenantId: string, snoozeDays: number) {
  const reminder = await prisma.sentReminder.findFirst({
    where: { id, tenantId }
  })

  if (!reminder) {
    throw new Error('Reminder not found')
  }

  const snoozedUntil = new Date()
  snoozedUntil.setDate(snoozedUntil.getDate() + snoozeDays)

  return prisma.sentReminder.update({
    where: { id },
    data: { snoozedUntil }
  })
}

// ========================================
// REMINDER PROCESSING
// ========================================

interface ProcessResult {
  tenantsProcessed: number
  remindersProcessed: number
  remindersSent: number
  errors: string[]
}

export async function processAllReminders(): Promise<ProcessResult> {
  const result: ProcessResult = {
    tenantsProcessed: 0,
    remindersProcessed: 0,
    remindersSent: 0,
    errors: [],
  }

  // Get all active tenants
  const tenants = await prisma.tenant.findMany({
    where: {
      isActive: true,
      vertical: 'MUSICIANS',
    },
    select: { id: true, email: true, bandName: true, settings: true }
  })

  for (const tenant of tenants) {
    try {
      const settings = (tenant.settings as any)?.reminders as ReminderSettings | undefined
      if (!settings?.enabled) continue

      result.tenantsProcessed++

      // Process gig reminders
      if (settings.gigReminders?.enabled) {
        const gigResult = await processGigReminders(tenant.id, settings, tenant.email)
        result.remindersProcessed += gigResult.processed
        result.remindersSent += gigResult.sent
        result.errors.push(...gigResult.errors)
      }

      // Process invoice reminders
      if (settings.invoiceReminders?.enabled) {
        const invoiceResult = await processInvoiceReminders(tenant.id, settings, tenant.email)
        result.remindersProcessed += invoiceResult.processed
        result.remindersSent += invoiceResult.sent
        result.errors.push(...invoiceResult.errors)
      }
    } catch (error) {
      result.errors.push(`Tenant ${tenant.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return result
}

async function processGigReminders(
  tenantId: string,
  settings: ReminderSettings,
  tenantEmail: string
) {
  const result = { processed: 0, sent: 0, errors: [] as string[] }

  const { sendGigReminderEmail } = await import('@/lib/email')

  // Get upcoming confirmed gigs
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDays = Math.max(...settings.gigReminders.daysBefore)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + maxDays + 1)

  const gigs = await prisma.gig.findMany({
    where: {
      tenantId,
      status: 'CONFIRMED' as GigStatus,
      eventDate: {
        gte: today,
        lte: maxDate,
      }
    },
    include: {
      tenant: { select: { bandName: true } }
    }
  })

  for (const gig of gigs) {
    if (!gig.eventDate) continue

    const daysUntil = Math.floor((gig.eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    for (const daysBefore of settings.gigReminders.daysBefore) {
      if (daysUntil !== daysBefore) continue

      result.processed++

      // Check if already sent
      const alreadySent = await wasReminderSent(
        tenantId,
        gig.id,
        'GIG_UPCOMING' as ReminderType,
        -daysBefore
      )

      if (alreadySent) continue

      // Send reminders
      const recipients: string[] = []

      try {
        // Send to client
        if (settings.gigReminders.sendToClient && gig.clientEmail) {
          await sendGigReminderEmail({
            to: gig.clientEmail,
            clientName: gig.clientName || 'klient',
            gigTitle: gig.title,
            gigDate: gig.eventDate.toLocaleDateString('cs-CZ'),
            daysUntil: daysBefore,
            bandName: gig.tenant.bandName || 'kapela',
            venue: (gig.venue as any)?.name,
          })
          recipients.push(gig.clientEmail)
        }

        // Send to self
        if (settings.gigReminders.sendToSelf && tenantEmail) {
          await sendGigReminderEmail({
            to: tenantEmail,
            clientName: gig.clientName || 'klient',
            gigTitle: gig.title,
            gigDate: gig.eventDate.toLocaleDateString('cs-CZ'),
            daysUntil: daysBefore,
            bandName: gig.tenant.bandName || 'kapela',
            venue: (gig.venue as any)?.name,
            isSelfReminder: true,
          })
          recipients.push(tenantEmail)
        }

        if (recipients.length > 0) {
          await recordSentReminder({
            tenantId,
            type: 'GIG_UPCOMING' as ReminderType,
            entityId: gig.id,
            entityType: 'gig',
            daysOffset: -daysBefore,
            sentTo: recipients,
          })
          result.sent++
        }
      } catch (error) {
        result.errors.push(`Gig ${gig.id}: ${error instanceof Error ? error.message : 'Email error'}`)
        await recordSentReminder({
          tenantId,
          type: 'GIG_UPCOMING' as ReminderType,
          entityId: gig.id,
          entityType: 'gig',
          daysOffset: -daysBefore,
          sentTo: recipients,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  return result
}

async function processInvoiceReminders(
  tenantId: string,
  settings: ReminderSettings,
  tenantEmail: string
) {
  const result = { processed: 0, sent: 0, errors: [] as string[] }

  const { sendInvoiceReminderEmail } = await import('@/lib/email')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get unpaid invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: { in: ['sent', 'overdue'] },
    },
    include: {
      customer: true,
      tenant: { select: { bandName: true } }
    }
  })

  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Check for "due soon" reminder
    if (daysUntilDue === settings.invoiceReminders.daysBeforeDue && daysUntilDue > 0) {
      result.processed++

      const alreadySent = await wasReminderSent(
        tenantId,
        invoice.id,
        'INVOICE_DUE' as ReminderType,
        -settings.invoiceReminders.daysBeforeDue
      )

      if (!alreadySent) {
        try {
          await sendInvoiceReminderEmail({
            to: invoice.customer.email,
            clientName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
            invoiceNumber: invoice.invoiceNumber,
            amount: (invoice.totalAmount / 100).toLocaleString('cs-CZ'),
            dueDate: invoice.dueDate.toLocaleDateString('cs-CZ'),
            bandName: invoice.tenant.bandName || 'kapela',
            isOverdue: false,
            daysOverdue: 0,
          })

          await recordSentReminder({
            tenantId,
            type: 'INVOICE_DUE' as ReminderType,
            entityId: invoice.id,
            entityType: 'invoice',
            daysOffset: -settings.invoiceReminders.daysBeforeDue,
            sentTo: [invoice.customer.email],
          })
          result.sent++
        } catch (error) {
          result.errors.push(`Invoice ${invoice.id}: ${error instanceof Error ? error.message : 'Email error'}`)
        }
      }
    }

    // Check for overdue reminders
    if (daysUntilDue < 0) {
      const daysOverdue = Math.abs(daysUntilDue)

      for (const daysAfter of settings.invoiceReminders.daysAfterDue) {
        if (daysOverdue !== daysAfter) continue

        result.processed++

        const alreadySent = await wasReminderSent(
          tenantId,
          invoice.id,
          'INVOICE_OVERDUE' as ReminderType,
          daysAfter
        )

        if (alreadySent) continue

        try {
          await sendInvoiceReminderEmail({
            to: invoice.customer.email,
            clientName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
            invoiceNumber: invoice.invoiceNumber,
            amount: (invoice.totalAmount / 100).toLocaleString('cs-CZ'),
            dueDate: invoice.dueDate.toLocaleDateString('cs-CZ'),
            bandName: invoice.tenant.bandName || 'kapela',
            isOverdue: true,
            daysOverdue,
          })

          await recordSentReminder({
            tenantId,
            type: 'INVOICE_OVERDUE' as ReminderType,
            entityId: invoice.id,
            entityType: 'invoice',
            daysOffset: daysAfter,
            sentTo: [invoice.customer.email],
          })
          result.sent++
        } catch (error) {
          result.errors.push(`Invoice ${invoice.id}: ${error instanceof Error ? error.message : 'Email error'}`)
        }
      }
    }
  }

  return result
}

// ========================================
// UPCOMING REMINDERS (for dashboard)
// ========================================

export interface UpcomingReminder {
  type: 'gig' | 'invoice'
  id: string
  title: string
  date: Date
  daysUntil: number
  priority: 'high' | 'medium' | 'low'
  metadata: Record<string, any>
}

export async function getUpcomingReminders(tenantId: string): Promise<UpcomingReminder[]> {
  const reminders: UpcomingReminder[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get upcoming gigs (next 7 days)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const upcomingGigs = await prisma.gig.findMany({
    where: {
      tenantId,
      status: 'CONFIRMED' as GigStatus,
      eventDate: {
        gte: today,
        lte: nextWeek,
      }
    },
    orderBy: { eventDate: 'asc' }
  })

  for (const gig of upcomingGigs) {
    if (!gig.eventDate) continue

    const daysUntil = Math.floor((gig.eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    reminders.push({
      type: 'gig',
      id: gig.id,
      title: gig.title,
      date: gig.eventDate,
      daysUntil,
      priority: daysUntil === 0 ? 'high' : daysUntil <= 2 ? 'medium' : 'low',
      metadata: {
        clientName: gig.clientName,
        venue: (gig.venue as any)?.name,
      }
    })
  }

  // Get overdue invoices
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: { in: ['sent', 'overdue'] },
      dueDate: { lt: today }
    },
    include: { customer: true },
    orderBy: { dueDate: 'asc' }
  })

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))

    reminders.push({
      type: 'invoice',
      id: invoice.id,
      title: `Faktura ${invoice.invoiceNumber} po splatnosti`,
      date: invoice.dueDate,
      daysUntil: -daysOverdue,
      priority: daysOverdue > 14 ? 'high' : daysOverdue > 7 ? 'medium' : 'low',
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        clientName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
        amount: invoice.totalAmount,
      }
    })
  }

  // Sort by priority and date
  return reminders.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return Math.abs(a.daysUntil) - Math.abs(b.daysUntil)
  })
}
