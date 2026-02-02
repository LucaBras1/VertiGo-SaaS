/**
 * Calendar Sync Service
 * Handles synchronization between TeamForge sessions and external calendars
 */

import { prisma } from '@/lib/db'
import { createOrUpdateEvent, deleteEvent } from './google/events'
import crypto from 'crypto'

interface SessionData {
  id: string
  date: Date
  endDate: Date | null
  companyName: string | null
  teamName: string | null
  teamSize: number | null
  venue: {
    name?: string
    address?: string
    city?: string
  }
  program: {
    title: string
    duration: number
  } | null
  objectives: string[] | null
  notes: string | null
}

/**
 * Generate a hash for session data to detect changes
 */
function generateSyncHash(session: SessionData): string {
  const data = JSON.stringify({
    date: session.date,
    endDate: session.endDate,
    companyName: session.companyName,
    teamSize: session.teamSize,
    venue: session.venue,
    program: session.program?.title,
    notes: session.notes,
  })
  return crypto.createHash('md5').update(data).digest('hex')
}

/**
 * Convert session to calendar event format
 */
export function sessionToCalendarEvent(session: SessionData) {
  const venue = session.venue || {}
  const programTitle = session.program?.title || 'Team Building'
  const companyName = session.companyName || session.teamName || 'Klient'

  // Calculate end time
  let endDate = session.endDate
  if (!endDate && session.program?.duration) {
    endDate = new Date(session.date.getTime() + session.program.duration * 60 * 1000)
  } else if (!endDate) {
    endDate = new Date(session.date.getTime() + 3 * 60 * 60 * 1000) // Default 3 hours
  }

  // Build description
  const descriptionParts: string[] = []
  if (session.teamSize) {
    descriptionParts.push(`Velikost týmu: ${session.teamSize} účastníků`)
  }
  if (session.objectives && session.objectives.length > 0) {
    descriptionParts.push(`Cíle: ${session.objectives.join(', ')}`)
  }
  if (session.notes) {
    descriptionParts.push(`\nPoznámky: ${session.notes}`)
  }

  return {
    summary: `TeamForge: ${companyName} - ${programTitle}`,
    description: descriptionParts.join('\n'),
    start: session.date,
    end: endDate,
    location: [venue.name, venue.address, venue.city].filter(Boolean).join(', '),
  }
}

/**
 * Sync a session to all connected calendars
 */
export async function syncSessionToCalendars(sessionId: string): Promise<{ success: boolean; synced: number }> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      program: {
        select: { title: true, duration: true },
      },
    },
  })

  if (!session) {
    return { success: false, synced: 0 }
  }

  const sessionData: SessionData = {
    id: session.id,
    date: session.date,
    endDate: session.endDate,
    companyName: session.companyName,
    teamName: session.teamName,
    teamSize: session.teamSize,
    venue: (session.venue as SessionData['venue']) || {},
    program: session.program,
    objectives: session.objectives as string[] | null,
    notes: session.notes,
  }

  const syncHash = generateSyncHash(sessionData)
  const calendarEvent = sessionToCalendarEvent(sessionData)

  // Get all active Google Calendar integrations
  const integrations = await prisma.calendarIntegration.findMany({
    where: {
      provider: 'google',
      syncEnabled: true,
      accessToken: { not: null },
    },
  })

  let synced = 0

  for (const integration of integrations) {
    try {
      // Check if already synced with same hash
      const existingSync = await prisma.calendarEventSync.findUnique({
        where: {
          integrationId_entityType_entityId: {
            integrationId: integration.id,
            entityType: 'session',
            entityId: sessionId,
          },
        },
      })

      if (existingSync && existingSync.syncHash === syncHash) {
        // No changes, skip
        continue
      }

      // Create or update event
      const result = await createOrUpdateEvent(
        integration.accessToken!,
        integration.refreshToken,
        integration.calendarId || 'primary',
        calendarEvent,
        existingSync?.externalEventId
      )

      if (result.eventId) {
        // Update sync record
        await prisma.calendarEventSync.upsert({
          where: {
            integrationId_entityType_entityId: {
              integrationId: integration.id,
              entityType: 'session',
              entityId: sessionId,
            },
          },
          update: {
            externalEventId: result.eventId,
            lastSyncedAt: new Date(),
            syncHash,
          },
          create: {
            integrationId: integration.id,
            entityType: 'session',
            entityId: sessionId,
            externalEventId: result.eventId,
            lastSyncedAt: new Date(),
            syncHash,
          },
        })

        // Update integration tokens if refreshed
        if (result.newAccessToken) {
          await prisma.calendarIntegration.update({
            where: { id: integration.id },
            data: {
              accessToken: result.newAccessToken,
              lastSyncAt: new Date(),
            },
          })
        }

        synced++
      }
    } catch (error) {
      console.error(`Error syncing session ${sessionId} to integration ${integration.id}:`, error)
    }
  }

  return { success: true, synced }
}

/**
 * Delete a session from all connected calendars
 */
export async function deleteSessionFromCalendars(sessionId: string): Promise<{ success: boolean; deleted: number }> {
  const syncs = await prisma.calendarEventSync.findMany({
    where: {
      entityType: 'session',
      entityId: sessionId,
    },
    include: {
      integration: true,
    },
  })

  let deleted = 0

  for (const sync of syncs) {
    try {
      if (sync.integration.accessToken) {
        await deleteEvent(
          sync.integration.accessToken,
          sync.integration.refreshToken,
          sync.integration.calendarId || 'primary',
          sync.externalEventId
        )
      }

      await prisma.calendarEventSync.delete({
        where: { id: sync.id },
      })

      deleted++
    } catch (error) {
      console.error(`Error deleting event ${sync.externalEventId}:`, error)
    }
  }

  return { success: true, deleted }
}
