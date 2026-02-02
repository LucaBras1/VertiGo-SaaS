/**
 * Calendar Sync Service
 *
 * Synchronizes FitAdmin sessions and classes with external calendars.
 * Supports Google Calendar and Apple Calendar (ICS feeds).
 */

import crypto from 'crypto'
import { prisma } from '../prisma'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './google/events'
import { getCalendarClient } from './google/auth'

/**
 * Get a user's calendar integration for a specific provider
 */
async function getCalendarIntegration(
  tenantId: string,
  userId: string,
  provider: 'google' | 'apple'
) {
  return prisma.calendarIntegration.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId,
        userId,
        provider,
      },
    },
  })
}

/**
 * Create or update a calendar event sync record
 */
async function upsertEventSync(
  integrationId: string,
  entityType: 'session' | 'class',
  entityId: string,
  externalEventId: string,
  syncHash: string
) {
  return prisma.calendarEventSync.upsert({
    where: {
      integrationId_entityType_entityId: {
        integrationId,
        entityType,
        entityId,
      },
    },
    create: {
      integrationId,
      entityType,
      entityId,
      externalEventId,
      lastSyncedAt: new Date(),
      syncHash,
    },
    update: {
      externalEventId,
      lastSyncedAt: new Date(),
      syncHash,
    },
  })
}

/**
 * Get existing sync record for an entity
 */
async function getEventSync(
  integrationId: string,
  entityType: 'session' | 'class',
  entityId: string
) {
  return prisma.calendarEventSync.findUnique({
    where: {
      integrationId_entityType_entityId: {
        integrationId,
        entityType,
        entityId,
      },
    },
  })
}

/**
 * Generate a hash of session/class data to detect changes
 */
function generateSyncHash(data: {
  scheduledAt: Date
  duration: number
  title?: string
  notes?: string
}): string {
  const hashInput = JSON.stringify({
    scheduledAt: data.scheduledAt.toISOString(),
    duration: data.duration,
    title: data.title || '',
    notes: data.notes || '',
  })
  return crypto.createHash('md5').update(hashInput).digest('hex')
}

/**
 * Sync a session to Google Calendar
 */
export async function syncSessionToCalendar(
  sessionId: string,
  tenantId: string,
  userId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Get calendar integration
    const integration = await getCalendarIntegration(tenantId, userId, 'google')
    if (!integration || !integration.syncEnabled) {
      return { success: false, error: 'No active calendar integration' }
    }

    // Get session details
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { client: true },
    })
    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    // Check if we already synced this session
    const existingSync = await getEventSync(integration.id, 'session', sessionId)
    const syncHash = generateSyncHash({
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      title: `Session with ${session.client.name}`,
      notes: session.trainerNotes || undefined,
    })

    // Skip if no changes
    if (existingSync && existingSync.syncHash === syncHash) {
      return { success: true, eventId: existingSync.externalEventId }
    }

    // Get calendar client
    const calendar = await getCalendarClient(integration)
    if (!calendar) {
      return { success: false, error: 'Failed to get calendar client' }
    }

    const eventData = {
      summary: `Training: ${session.client.name}`,
      description: session.trainerNotes || `Personal training session with ${session.client.name}`,
      start: session.scheduledAt,
      end: new Date(session.scheduledAt.getTime() + session.duration * 60 * 1000),
      attendees: session.client.email ? [{ email: session.client.email }] : undefined,
    }

    let externalEventId: string

    if (existingSync) {
      // Update existing event
      const updated = await updateCalendarEvent(
        calendar,
        integration.calendarId || 'primary',
        existingSync.externalEventId,
        eventData
      )
      externalEventId = updated.id || existingSync.externalEventId
    } else {
      // Create new event
      const created = await createCalendarEvent(
        calendar,
        integration.calendarId || 'primary',
        eventData
      )
      externalEventId = created.id!
    }

    // Update sync record
    await upsertEventSync(integration.id, 'session', sessionId, externalEventId, syncHash)

    // Update integration last sync time
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    })

    return { success: true, eventId: externalEventId }
  } catch (error: any) {
    console.error('[CalendarSync] Failed to sync session:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove a session from Google Calendar
 */
export async function removeSessionFromCalendar(
  sessionId: string,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find sync records for this session
    const syncRecords = await prisma.calendarEventSync.findMany({
      where: {
        entityType: 'session',
        entityId: sessionId,
      },
      include: {
        integration: true,
      },
    })

    for (const sync of syncRecords) {
      if (sync.integration.tenantId !== tenantId) continue

      try {
        const calendar = await getCalendarClient(sync.integration)
        if (calendar) {
          await deleteCalendarEvent(
            calendar,
            sync.integration.calendarId || 'primary',
            sync.externalEventId
          )
        }
      } catch (err) {
        console.error('[CalendarSync] Failed to delete event from calendar:', err)
      }

      // Delete sync record
      await prisma.calendarEventSync.delete({
        where: { id: sync.id },
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('[CalendarSync] Failed to remove session from calendar:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sync a class to Google Calendar
 */
export async function syncClassToCalendar(
  classId: string,
  tenantId: string,
  userId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // Get calendar integration
    const integration = await getCalendarIntegration(tenantId, userId, 'google')
    if (!integration || !integration.syncEnabled) {
      return { success: false, error: 'No active calendar integration' }
    }

    // Get class details
    const fitnessClass = await prisma.class.findUnique({
      where: { id: classId },
    })
    if (!fitnessClass) {
      return { success: false, error: 'Class not found' }
    }

    // Check if we already synced this class
    const existingSync = await getEventSync(integration.id, 'class', classId)
    const syncHash = generateSyncHash({
      scheduledAt: fitnessClass.scheduledAt,
      duration: fitnessClass.duration,
      title: fitnessClass.name,
      notes: fitnessClass.description || undefined,
    })

    // Skip if no changes
    if (existingSync && existingSync.syncHash === syncHash) {
      return { success: true, eventId: existingSync.externalEventId }
    }

    // Get calendar client
    const calendar = await getCalendarClient(integration)
    if (!calendar) {
      return { success: false, error: 'Failed to get calendar client' }
    }

    const eventData = {
      summary: `${fitnessClass.name} (${fitnessClass.type})`,
      description: fitnessClass.description || `${fitnessClass.type} class`,
      start: fitnessClass.scheduledAt,
      end: new Date(fitnessClass.scheduledAt.getTime() + fitnessClass.duration * 60 * 1000),
      location: fitnessClass.location || undefined,
    }

    let externalEventId: string

    if (existingSync) {
      // Update existing event
      const updated = await updateCalendarEvent(
        calendar,
        integration.calendarId || 'primary',
        existingSync.externalEventId,
        eventData
      )
      externalEventId = updated.id || existingSync.externalEventId
    } else {
      // Create new event
      const created = await createCalendarEvent(
        calendar,
        integration.calendarId || 'primary',
        eventData
      )
      externalEventId = created.id!
    }

    // Update sync record
    await upsertEventSync(integration.id, 'class', classId, externalEventId, syncHash)

    // Update integration last sync time
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    })

    return { success: true, eventId: externalEventId }
  } catch (error: any) {
    console.error('[CalendarSync] Failed to sync class:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Remove a class from Google Calendar
 */
export async function removeClassFromCalendar(
  classId: string,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find sync records for this class
    const syncRecords = await prisma.calendarEventSync.findMany({
      where: {
        entityType: 'class',
        entityId: classId,
      },
      include: {
        integration: true,
      },
    })

    for (const sync of syncRecords) {
      if (sync.integration.tenantId !== tenantId) continue

      try {
        const calendar = await getCalendarClient(sync.integration)
        if (calendar) {
          await deleteCalendarEvent(
            calendar,
            sync.integration.calendarId || 'primary',
            sync.externalEventId
          )
        }
      } catch (err) {
        console.error('[CalendarSync] Failed to delete event from calendar:', err)
      }

      // Delete sync record
      await prisma.calendarEventSync.delete({
        where: { id: sync.id },
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('[CalendarSync] Failed to remove class from calendar:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate a secure token for ICS feed
 */
export async function generateFeedToken(
  tenantId: string,
  userId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')

  await prisma.calendarFeedToken.create({
    data: {
      tenantId,
      userId,
      token,
      expiresAt: null, // No expiration for feed tokens
    },
  })

  return token
}

/**
 * Validate a feed token and get user info
 */
export async function validateFeedToken(
  token: string
): Promise<{ tenantId: string; userId: string } | null> {
  const feedToken = await prisma.calendarFeedToken.findUnique({
    where: { token },
  })

  if (!feedToken) {
    return null
  }

  // Check expiration if set
  if (feedToken.expiresAt && feedToken.expiresAt < new Date()) {
    return null
  }

  return {
    tenantId: feedToken.tenantId,
    userId: feedToken.userId,
  }
}

/**
 * Revoke a feed token
 */
export async function revokeFeedToken(token: string): Promise<boolean> {
  try {
    await prisma.calendarFeedToken.delete({
      where: { token },
    })
    return true
  } catch {
    return false
  }
}

/**
 * Get all feed tokens for a user
 */
export async function getUserFeedTokens(
  tenantId: string,
  userId: string
): Promise<Array<{ token: string; createdAt: Date }>> {
  const tokens = await prisma.calendarFeedToken.findMany({
    where: { tenantId, userId },
    select: { token: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return tokens
}
