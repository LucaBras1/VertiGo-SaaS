/**
 * Google Calendar Sync - ShootFlow
 * Sync shoots with Google Calendar
 */

import { prisma } from '@/lib/prisma'
import { refreshAccessToken, isTokenExpired } from './auth'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  createShootCalendarEvent,
  type ShootEventData,
} from './events'

// Types
interface SyncResult {
  success: boolean
  synced: number
  errors: string[]
}

/**
 * Get calendar integration with valid tokens
 */
export async function getValidCalendarIntegration(tenantId: string) {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { tenantId },
  })

  if (!integration) {
    return null
  }

  // Check if token needs refresh
  if (isTokenExpired(integration.tokenExpiry)) {
    try {
      const { accessToken, tokenExpiry } = await refreshAccessToken(integration.refreshToken)

      // Update tokens in database
      const updated = await prisma.calendarIntegration.update({
        where: { tenantId },
        data: {
          accessToken,
          tokenExpiry,
          syncError: null,
        },
      })

      return updated
    } catch (error) {
      // Mark integration as having error
      await prisma.calendarIntegration.update({
        where: { tenantId },
        data: {
          syncError: 'Failed to refresh access token. Please reconnect your calendar.',
        },
      })
      throw new Error('Failed to refresh calendar access token')
    }
  }

  return integration
}

/**
 * Sync a single shoot to Google Calendar
 */
export async function syncShootToCalendar(
  tenantId: string,
  shootId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const integration = await getValidCalendarIntegration(tenantId)
    if (!integration || !integration.syncEnabled || !integration.calendarId) {
      return { success: false, error: 'Calendar not configured' }
    }

    // Get shoot with package and client
    const shoot = await prisma.shoot.findUnique({
      where: { id: shootId },
      include: {
        package: {
          include: {
            client: true,
          },
        },
        calendarEventSync: true,
      },
    })

    if (!shoot || !shoot.package || !shoot.package.client) {
      return { success: false, error: 'Shoot not found' }
    }

    // Build event data
    const eventData: ShootEventData = {
      shootId: shoot.id,
      packageTitle: shoot.package.title,
      clientName: shoot.package.client.name,
      eventType: shoot.package.eventType || undefined,
      location: shoot.venueAddress || shoot.venueName || undefined,
      date: shoot.date,
      startTime: shoot.startTime,
      endTime: shoot.endTime,
      notes: shoot.notes || undefined,
    }

    const calendarEvent = createShootCalendarEvent(eventData)

    // Check if we already have a synced event
    if (shoot.calendarEventSync?.googleEventId) {
      // Update existing event
      await updateCalendarEvent(
        integration.accessToken,
        integration.refreshToken,
        integration.calendarId,
        shoot.calendarEventSync.googleEventId,
        calendarEvent
      )

      await prisma.calendarEventSync.update({
        where: { shootId },
        data: {
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
          syncError: null,
        },
      })

      return { success: true, eventId: shoot.calendarEventSync.googleEventId }
    } else {
      // Create new event
      const eventId = await createCalendarEvent(
        integration.accessToken,
        integration.refreshToken,
        integration.calendarId,
        calendarEvent
      )

      // Create or update sync record
      await prisma.calendarEventSync.upsert({
        where: { shootId },
        create: {
          tenantId,
          shootId,
          googleEventId: eventId,
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
        },
        update: {
          googleEventId: eventId,
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
          syncError: null,
        },
      })

      return { success: true, eventId }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update sync status with error
    await prisma.calendarEventSync.upsert({
      where: { shootId },
      create: {
        tenantId,
        shootId,
        syncStatus: 'error',
        syncError: errorMessage,
      },
      update: {
        syncStatus: 'error',
        syncError: errorMessage,
      },
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Delete a shoot's calendar event
 */
export async function deleteShootFromCalendar(
  tenantId: string,
  shootId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const integration = await getValidCalendarIntegration(tenantId)
    if (!integration || !integration.calendarId) {
      return { success: true } // No calendar configured, nothing to delete
    }

    const syncRecord = await prisma.calendarEventSync.findUnique({
      where: { shootId },
    })

    if (!syncRecord?.googleEventId) {
      return { success: true } // No event to delete
    }

    await deleteCalendarEvent(
      integration.accessToken,
      integration.refreshToken,
      integration.calendarId,
      syncRecord.googleEventId
    )

    await prisma.calendarEventSync.update({
      where: { shootId },
      data: {
        syncStatus: 'deleted',
        googleEventId: null,
      },
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Sync all shoots for a tenant
 */
export async function syncAllShoots(tenantId: string): Promise<SyncResult> {
  const integration = await getValidCalendarIntegration(tenantId)
  if (!integration || !integration.syncEnabled || !integration.calendarId) {
    return { success: false, synced: 0, errors: ['Calendar not configured'] }
  }

  // Get all future shoots
  const shoots = await prisma.shoot.findMany({
    where: {
      tenantId,
      date: { gte: new Date() },
    },
    select: { id: true },
  })

  const errors: string[] = []
  let synced = 0

  for (const shoot of shoots) {
    const result = await syncShootToCalendar(tenantId, shoot.id)
    if (result.success) {
      synced++
    } else if (result.error) {
      errors.push(`Shoot ${shoot.id}: ${result.error}`)
    }
  }

  // Update last sync time
  await prisma.calendarIntegration.update({
    where: { tenantId },
    data: {
      lastSyncAt: new Date(),
      syncError: errors.length > 0 ? `${errors.length} errors during sync` : null,
    },
  })

  return {
    success: errors.length === 0,
    synced,
    errors,
  }
}

/**
 * Get sync status for a tenant
 */
export async function getCalendarSyncStatus(tenantId: string) {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { tenantId },
  })

  if (!integration) {
    return {
      connected: false,
      enabled: false,
      calendarId: null,
      lastSyncAt: null,
      error: null,
    }
  }

  return {
    connected: true,
    enabled: integration.syncEnabled,
    calendarId: integration.calendarId,
    lastSyncAt: integration.lastSyncAt,
    error: integration.syncError,
    tokenValid: !isTokenExpired(integration.tokenExpiry),
  }
}
