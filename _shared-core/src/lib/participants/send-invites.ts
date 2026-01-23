/**
 * Send Invites Utility
 *
 * Sends calendar invites and emails to order participants
 */

import { prisma } from '@/lib/prisma'
import {
  createCalendarEvent,
  isGoogleCalendarConfigured,
  type OrderForCalendar,
  type ParticipantForCalendar,
  type SettingsForCalendar,
} from '@/lib/google-calendar'
import { sendParticipantInviteEmail } from '@/lib/email/templates/participant-invite'

interface SendInvitesOptions {
  orderId: string
  participantIds?: string[]
  sendCalendar?: boolean
  sendEmail?: boolean
}

interface SendInvitesResult {
  success: boolean
  calendarEvents: Array<{ participantId: string; eventId: string }>
  emailsSent: number
  errors: string[]
  calendarConfigured: boolean
  participantCount: number
}

/**
 * Send calendar invites and emails to order participants
 */
export async function sendParticipantInvites(
  options: SendInvitesOptions
): Promise<SendInvitesResult> {
  const { orderId, participantIds, sendCalendar = true, sendEmail = true } = options

  // Get order with all related data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          performance: { select: { id: true, title: true, slug: true } },
          game: { select: { id: true, title: true, slug: true } },
          service: { select: { id: true, title: true, slug: true } },
        },
      },
      participants: {
        where: participantIds ? { id: { in: participantIds } } : { inviteStatus: 'pending' },
        include: {
          teamMember: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
              phone: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    return {
      success: false,
      calendarEvents: [],
      emailsSent: 0,
      errors: ['Objednavka nenalezena'],
      calendarConfigured: false,
      participantCount: 0,
    }
  }

  if (order.participants.length === 0) {
    return {
      success: true,
      calendarEvents: [],
      emailsSent: 0,
      errors: [],
      calendarConfigured: await isGoogleCalendarConfigured(),
      participantCount: 0,
    }
  }

  // Get settings
  const settings = await prisma.settings.findFirst()

  const settingsForCalendar: SettingsForCalendar = {
    companyIco: settings?.companyIco,
    offerEmailCompanyName: settings?.offerEmailCompanyName,
    offerEmailCompanyEmail: settings?.offerEmailCompanyEmail,
    offerEmailCompanyWeb: settings?.offerEmailCompanyWeb,
    contactPhone: settings?.contactPhone,
  }

  // Transform order for calendar
  const orderForCalendar: OrderForCalendar = {
    id: order.id,
    orderNumber: order.orderNumber,
    eventName: order.eventName,
    dates: order.dates as string[],
    arrivalTime: order.arrivalTime,
    preparationTime: order.preparationTime,
    eventDuration: order.eventDuration,
    venue: order.venue as OrderForCalendar['venue'],
    items: order.items.map((item) => ({
      id: item.id,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      price: item.price,
      notes: item.notes,
      performance: item.performance,
      game: item.game,
      service: item.service,
    })),
    technicalRequirements: order.technicalRequirements as OrderForCalendar['technicalRequirements'],
    pricing: order.pricing as OrderForCalendar['pricing'],
    paymentMethod: order.paymentMethod,
    invoiceEmail: order.invoiceEmail,
    logistics: order.logistics as OrderForCalendar['logistics'],
    contacts: order.contacts as OrderForCalendar['contacts'],
    documents: order.documents as OrderForCalendar['documents'],
    internalNotes: order.internalNotes as OrderForCalendar['internalNotes'],
    customer: order.customer
      ? {
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email,
          phone: order.customer.phone,
          organization: order.customer.organization,
          billingInfo: order.customer.billingInfo as any,
        }
      : null,
  }

  const results = {
    calendarEvents: [] as Array<{ participantId: string; eventId: string }>,
    emailsSent: 0,
    errors: [] as string[],
  }

  // Check if Google Calendar is configured
  const calendarConfigured = await isGoogleCalendarConfigured()

  // Process each participant
  for (const participant of order.participants) {
    const participantForCalendar: ParticipantForCalendar = {
      id: participant.id,
      type: participant.type as 'employee' | 'customer' | 'external',
      name: participant.name,
      email: participant.email,
      phone: participant.phone,
      includePricing: participant.includePricing,
      teamMember: participant.teamMember,
    }

    // Send calendar invite
    if (sendCalendar && calendarConfigured) {
      try {
        const eventId = await createCalendarEvent({
          order: orderForCalendar,
          participant: participantForCalendar,
          settings: settingsForCalendar,
        })

        results.calendarEvents.push({
          participantId: participant.id,
          eventId,
        })

        // Update participant with calendar event ID
        await prisma.eventParticipant.update({
          where: { id: participant.id },
          data: {
            calendarEventId: eventId,
            calendarInviteSentAt: new Date(),
            inviteStatus: 'sent',
          },
        })
      } catch (error: any) {
        results.errors.push(`Calendar ${participant.email}: ${error.message}`)
      }
    }

    // Send email
    if (sendEmail) {
      try {
        await sendParticipantInviteEmail({
          order: orderForCalendar,
          participant: participantForCalendar,
          settings: settingsForCalendar,
        })
        results.emailsSent++

        // Update invite status if calendar wasn't sent
        if (!sendCalendar || !calendarConfigured) {
          await prisma.eventParticipant.update({
            where: { id: participant.id },
            data: {
              inviteStatus: 'sent',
            },
          })
        }

        // Log communication
        await prisma.communication.create({
          data: {
            customerId: order.customerId,
            orderId: order.id,
            type: 'email',
            direction: 'outgoing',
            subject: `Pozvanka: ${order.eventName || order.orderNumber}`,
            content: `Pozvanka odeslana na ${participant.email}`,
            author: 'System',
          },
        })
      } catch (error: any) {
        results.errors.push(`Email ${participant.email}: ${error.message}`)
      }
    }
  }

  return {
    success: results.errors.length === 0 || results.calendarEvents.length > 0 || results.emailsSent > 0,
    calendarEvents: results.calendarEvents,
    emailsSent: results.emailsSent,
    errors: results.errors,
    calendarConfigured,
    participantCount: order.participants.length,
  }
}
