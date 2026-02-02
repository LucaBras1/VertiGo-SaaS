import { prisma } from '@/lib/prisma'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from './google/events'
import { refreshAccessToken } from './google/auth'

interface SyncableGig {
  id: string
  title: string
  status: string
  eventDate: Date
  eventDuration?: number
  venue?: { name?: string; address?: string; city?: string }
  clientName?: string
  description?: string
}

/**
 * Sync a gig to all connected calendars for a tenant
 */
export async function syncGigToCalendars(
  tenantId: string,
  gig: SyncableGig
): Promise<void> {
  // Get all active calendar integrations for this tenant
  const integrations = await prisma.calendarIntegration.findMany({
    where: {
      tenantId,
      syncEnabled: true,
      provider: 'google', // Only Google for now
    },
  })

  for (const integration of integrations) {
    try {
      await syncGigToGoogleCalendar(integration, gig)
    } catch (error) {
      console.error(`Failed to sync gig ${gig.id} to calendar ${integration.id}:`, error)

      // Store error for later review
      await prisma.calendarIntegration.update({
        where: { id: integration.id },
        data: {
          syncErrors: {
            lastError: error instanceof Error ? error.message : 'Unknown error',
            lastErrorAt: new Date().toISOString(),
            gigId: gig.id,
          },
        },
      })
    }
  }
}

/**
 * Sync a single gig to Google Calendar
 */
async function syncGigToGoogleCalendar(
  integration: {
    id: string
    accessToken: string | null
    refreshToken: string | null
    tokenExpiry: Date | null
    calendarId: string | null
  },
  gig: SyncableGig
): Promise<void> {
  if (!integration.accessToken || !integration.refreshToken || !integration.calendarId) {
    throw new Error('Calendar integration not fully configured')
  }

  // Check if token needs refresh
  let accessToken = integration.accessToken
  if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
    const refreshed = await refreshAccessToken(integration.refreshToken)
    accessToken = refreshed.accessToken!

    // Update stored token
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: {
        accessToken,
        tokenExpiry: refreshed.expiryDate,
      },
    })
  }

  // Check if we already have a synced event
  const existingSync = await prisma.calendarEventSync.findUnique({
    where: {
      integrationId_entityType_entityId: {
        integrationId: integration.id,
        entityType: 'gig',
        entityId: gig.id,
      },
    },
  })

  const gigEvent = {
    id: gig.id,
    title: gig.title,
    eventDate: gig.eventDate,
    eventDuration: gig.eventDuration,
    venue: gig.venue,
    clientName: gig.clientName,
    description: gig.description,
    status: gig.status,
  }

  if (gig.status === 'CANCELLED') {
    // Delete event if gig is cancelled
    if (existingSync) {
      await deleteCalendarEvent(
        accessToken,
        integration.refreshToken,
        integration.calendarId,
        existingSync.externalEventId
      )

      await prisma.calendarEventSync.delete({
        where: { id: existingSync.id },
      })
    }
  } else if (existingSync) {
    // Update existing event
    await updateCalendarEvent(
      accessToken,
      integration.refreshToken,
      integration.calendarId,
      existingSync.externalEventId,
      gigEvent
    )

    // Update sync hash
    await prisma.calendarEventSync.update({
      where: { id: existingSync.id },
      data: {
        syncHash: generateSyncHash(gig),
        updatedAt: new Date(),
      },
    })
  } else {
    // Create new event
    const eventId = await createCalendarEvent(
      accessToken,
      integration.refreshToken,
      integration.calendarId,
      gigEvent
    )

    // Store sync record
    await prisma.calendarEventSync.create({
      data: {
        integrationId: integration.id,
        entityType: 'gig',
        entityId: gig.id,
        externalEventId: eventId,
        syncHash: generateSyncHash(gig),
      },
    })
  }

  // Update last sync timestamp
  await prisma.calendarIntegration.update({
    where: { id: integration.id },
    data: {
      lastSyncAt: new Date(),
      syncErrors: undefined, // Clear any previous errors
    },
  })
}

/**
 * Delete all synced events when disconnecting
 */
export async function deleteAllSyncedEvents(integrationId: string): Promise<void> {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { id: integrationId },
  })

  if (!integration || !integration.accessToken || !integration.refreshToken || !integration.calendarId) {
    // Just delete sync records if we can't access the calendar
    await prisma.calendarEventSync.deleteMany({
      where: { integrationId },
    })
    return
  }

  // Get all synced events
  const syncedEvents = await prisma.calendarEventSync.findMany({
    where: { integrationId },
  })

  // Delete each event from Google Calendar
  for (const syncedEvent of syncedEvents) {
    try {
      await deleteCalendarEvent(
        integration.accessToken,
        integration.refreshToken,
        integration.calendarId,
        syncedEvent.externalEventId
      )
    } catch (error) {
      console.error(`Failed to delete event ${syncedEvent.externalEventId}:`, error)
    }
  }

  // Delete all sync records
  await prisma.calendarEventSync.deleteMany({
    where: { integrationId },
  })
}

/**
 * Generate a hash of gig data for change detection
 */
function generateSyncHash(gig: SyncableGig): string {
  const data = JSON.stringify({
    title: gig.title,
    status: gig.status,
    eventDate: gig.eventDate,
    eventDuration: gig.eventDuration,
    venue: gig.venue,
    clientName: gig.clientName,
  })

  // Simple hash
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}
