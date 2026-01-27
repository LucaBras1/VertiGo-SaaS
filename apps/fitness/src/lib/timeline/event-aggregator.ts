/**
 * Event Aggregator for Client Timeline
 *
 * Aggregates events from multiple sources into a unified timeline.
 */

import { prisma } from '@/lib/prisma'

export type TimelineEventType =
  | 'session_completed'
  | 'session_scheduled'
  | 'session_cancelled'
  | 'measurement_recorded'
  | 'badge_earned'
  | 'invoice_paid'
  | 'invoice_created'
  | 'package_purchased'
  | 'milestone'
  | 'note'
  | 'client_created'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'referral_made'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  date: Date
  title: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  isMilestone: boolean
  source: 'manual' | 'auto'
}

interface AggregateOptions {
  clientId: string
  tenantId: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
  types?: TimelineEventType[]
  milestonesOnly?: boolean
}

/**
 * Aggregate all events for a client timeline
 */
export async function aggregateClientTimeline(
  options: AggregateOptions
): Promise<{ events: TimelineEvent[]; total: number }> {
  const {
    clientId,
    tenantId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
    types,
    milestonesOnly,
  } = options

  // Start with manual events from ClientEvent table
  const manualEventsPromise = prisma.clientEvent.findMany({
    where: {
      clientId,
      tenantId,
      ...(startDate && { eventDate: { gte: startDate } }),
      ...(endDate && { eventDate: { lte: endDate } }),
      ...(types && { eventType: { in: types } }),
      ...(milestonesOnly && { isMilestone: true }),
    },
    orderBy: { eventDate: 'desc' },
  })

  // Get completed sessions
  const sessionsPromise = prisma.session.findMany({
    where: {
      clientId,
      tenantId,
      status: { in: ['completed', 'cancelled'] },
      ...(startDate && { scheduledAt: { gte: startDate } }),
      ...(endDate && { scheduledAt: { lte: endDate } }),
    },
    orderBy: { scheduledAt: 'desc' },
    take: limit * 2, // Fetch more to ensure we have enough after filtering
  })

  // Get measurements
  const measurementsPromise = prisma.clientMeasurement.findMany({
    where: {
      clientId,
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } }),
    },
    orderBy: { date: 'desc' },
    take: limit,
  })

  // Get badges
  const badgesPromise = prisma.clientBadge.findMany({
    where: {
      clientId,
      ...(startDate && { earnedAt: { gte: startDate } }),
      ...(endDate && { earnedAt: { lte: endDate } }),
    },
    include: { badge: true },
    orderBy: { earnedAt: 'desc' },
    take: limit,
  })

  // Get paid invoices
  const invoicesPromise = prisma.invoice.findMany({
    where: {
      clientId,
      tenantId,
      status: { in: ['paid', 'sent'] },
      ...(startDate && { issueDate: { gte: startDate } }),
      ...(endDate && { issueDate: { lte: endDate } }),
    },
    orderBy: { issueDate: 'desc' },
    take: limit,
  })

  // Execute all queries in parallel
  const [manualEvents, sessions, measurements, badges, invoices] = await Promise.all([
    manualEventsPromise,
    sessionsPromise,
    measurementsPromise,
    badgesPromise,
    invoicesPromise,
  ])

  // Transform all events to unified format
  const allEvents: TimelineEvent[] = []

  // Manual events
  for (const event of manualEvents) {
    allEvents.push({
      id: event.id,
      type: event.eventType as TimelineEventType,
      date: event.eventDate,
      title: event.title,
      description: event.description,
      metadata: event.metadata as Record<string, unknown> | null,
      isMilestone: event.isMilestone,
      source: 'manual',
    })
  }

  // Sessions
  for (const session of sessions) {
    const isCompleted = session.status === 'completed'
    const isCancelled = session.status === 'cancelled'

    if (types && !types.includes(isCompleted ? 'session_completed' : 'session_cancelled')) {
      continue
    }

    allEvents.push({
      id: `session-${session.id}`,
      type: isCompleted ? 'session_completed' : 'session_cancelled',
      date: session.scheduledAt,
      title: isCompleted ? 'Trénink dokončen' : 'Trénink zrušen',
      description: session.trainerNotes || session.clientFeedback,
      metadata: {
        duration: session.duration,
        muscleGroups: session.muscleGroups,
        caloriesBurned: session.caloriesBurned,
        intensity: session.intensity,
        rating: session.clientRating,
      },
      isMilestone: false,
      source: 'auto',
    })
  }

  // Measurements
  for (const measurement of measurements) {
    if (types && !types.includes('measurement_recorded')) {
      continue
    }

    allEvents.push({
      id: `measurement-${measurement.id}`,
      type: 'measurement_recorded',
      date: measurement.date,
      title: 'Měření zaznamenáno',
      description: measurement.notes,
      metadata: {
        weight: measurement.weight,
        bodyFat: measurement.bodyFat,
        measurements: measurement.measurements,
      },
      isMilestone: false,
      source: 'auto',
    })
  }

  // Badges
  for (const clientBadge of badges) {
    if (types && !types.includes('badge_earned')) {
      continue
    }

    allEvents.push({
      id: `badge-${clientBadge.id}`,
      type: 'badge_earned',
      date: clientBadge.earnedAt,
      title: `Odznak získán: ${clientBadge.badge.name}`,
      description: clientBadge.badge.description,
      metadata: {
        badgeId: clientBadge.badgeId,
        icon: clientBadge.badge.icon,
        color: clientBadge.badge.color,
        category: clientBadge.badge.category,
      },
      isMilestone: true,
      source: 'auto',
    })
  }

  // Invoices
  for (const invoice of invoices) {
    const isPaid = invoice.status === 'paid'

    if (types && !types.includes(isPaid ? 'invoice_paid' : 'invoice_created')) {
      continue
    }

    allEvents.push({
      id: `invoice-${invoice.id}`,
      type: isPaid ? 'invoice_paid' : 'invoice_created',
      date: isPaid && invoice.paidDate ? invoice.paidDate : invoice.issueDate,
      title: isPaid ? `Faktura ${invoice.invoiceNumber} zaplacena` : `Faktura ${invoice.invoiceNumber} vytvořena`,
      description: isPaid ? `Částka: ${invoice.total} CZK` : null,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        status: invoice.status,
      },
      isMilestone: false,
      source: 'auto',
    })
  }

  // Filter milestones only if requested
  let filteredEvents = milestonesOnly
    ? allEvents.filter((e) => e.isMilestone)
    : allEvents

  // Sort by date descending
  filteredEvents.sort((a, b) => b.date.getTime() - a.date.getTime())

  const total = filteredEvents.length

  // Apply pagination
  const paginatedEvents = filteredEvents.slice(offset, offset + limit)

  return {
    events: paginatedEvents,
    total,
  }
}

/**
 * Create a manual timeline event
 */
export async function createTimelineEvent(data: {
  clientId: string
  tenantId: string
  eventType: TimelineEventType
  title: string
  description?: string
  metadata?: Record<string, unknown>
  isMilestone?: boolean
  eventDate?: Date
}): Promise<TimelineEvent> {
  const event = await prisma.clientEvent.create({
    data: {
      clientId: data.clientId,
      tenantId: data.tenantId,
      eventType: data.eventType,
      title: data.title,
      description: data.description,
      metadata: data.metadata as object | undefined,
      isMilestone: data.isMilestone ?? false,
      eventDate: data.eventDate ?? new Date(),
    },
  })

  return {
    id: event.id,
    type: event.eventType as TimelineEventType,
    date: event.eventDate,
    title: event.title,
    description: event.description,
    metadata: event.metadata as Record<string, unknown> | null,
    isMilestone: event.isMilestone,
    source: 'manual',
  }
}

/**
 * Get event type label in Czech
 */
export function getEventTypeLabel(type: TimelineEventType): string {
  const labels: Record<TimelineEventType, string> = {
    session_completed: 'Trénink dokončen',
    session_scheduled: 'Trénink naplánován',
    session_cancelled: 'Trénink zrušen',
    measurement_recorded: 'Měření',
    badge_earned: 'Odznak získán',
    invoice_paid: 'Platba přijata',
    invoice_created: 'Faktura vytvořena',
    package_purchased: 'Balíček zakoupen',
    milestone: 'Milník',
    note: 'Poznámka',
    client_created: 'Klient vytvořen',
    subscription_started: 'Předplatné zahájeno',
    subscription_cancelled: 'Předplatné zrušeno',
    referral_made: 'Doporučení',
  }
  return labels[type] || type
}

/**
 * Get event type icon name
 */
export function getEventTypeIcon(type: TimelineEventType): string {
  const icons: Record<TimelineEventType, string> = {
    session_completed: 'check-circle',
    session_scheduled: 'calendar',
    session_cancelled: 'x-circle',
    measurement_recorded: 'ruler',
    badge_earned: 'award',
    invoice_paid: 'credit-card',
    invoice_created: 'file-text',
    package_purchased: 'package',
    milestone: 'flag',
    note: 'edit',
    client_created: 'user-plus',
    subscription_started: 'refresh-cw',
    subscription_cancelled: 'x-octagon',
    referral_made: 'gift',
  }
  return icons[type] || 'circle'
}

/**
 * Get event type color
 */
export function getEventTypeColor(type: TimelineEventType): string {
  const colors: Record<TimelineEventType, string> = {
    session_completed: 'green',
    session_scheduled: 'blue',
    session_cancelled: 'red',
    measurement_recorded: 'purple',
    badge_earned: 'yellow',
    invoice_paid: 'green',
    invoice_created: 'gray',
    package_purchased: 'blue',
    milestone: 'orange',
    note: 'gray',
    client_created: 'blue',
    subscription_started: 'green',
    subscription_cancelled: 'red',
    referral_made: 'pink',
  }
  return colors[type] || 'gray'
}
