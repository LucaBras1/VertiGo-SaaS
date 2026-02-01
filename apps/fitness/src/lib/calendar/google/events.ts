/**
 * Google Calendar Event Operations
 */

import { google, calendar_v3 } from 'googleapis'
import { getAuthenticatedClient } from './auth'
import { GoogleCalendarEvent, CalendarListEntry, SyncResult } from './types'

/**
 * Get Google Calendar API client
 */
async function getCalendarClient(
  tenantId: string,
  userId: string
): Promise<calendar_v3.Calendar | null> {
  const auth = await getAuthenticatedClient(tenantId, userId)
  if (!auth) return null

  return google.calendar({ version: 'v3', auth })
}

/**
 * List user's calendars
 */
export async function listCalendars(
  tenantId: string,
  userId: string
): Promise<CalendarListEntry[]> {
  const calendar = await getCalendarClient(tenantId, userId)
  if (!calendar) return []

  try {
    const response = await calendar.calendarList.list()
    return (response.data.items || []).map((item) => ({
      id: item.id || '',
      summary: item.summary || '',
      description: item.description || undefined,
      primary: item.primary || false,
      backgroundColor: item.backgroundColor || undefined,
      foregroundColor: item.foregroundColor || undefined,
      accessRole: (item.accessRole as CalendarListEntry['accessRole']) || 'reader',
    }))
  } catch (error) {
    console.error('[GoogleCalendar] Failed to list calendars:', error)
    return []
  }
}

/**
 * Create a calendar event
 */
export async function createEvent(
  tenantId: string,
  userId: string,
  event: GoogleCalendarEvent,
  calendarId: string = 'primary'
): Promise<SyncResult> {
  const calendar = await getCalendarClient(tenantId, userId)
  if (!calendar) {
    return { success: false, error: 'Calendar not authenticated' }
  }

  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        reminders: event.reminders,
        colorId: event.colorId,
        extendedProperties: event.extendedProperties,
      },
    })

    return {
      success: true,
      externalEventId: response.data.id || undefined,
    }
  } catch (error: any) {
    console.error('[GoogleCalendar] Failed to create event:', error)
    return {
      success: false,
      error: error.message || 'Failed to create event',
    }
  }
}

/**
 * Update a calendar event
 */
export async function updateEvent(
  tenantId: string,
  userId: string,
  eventId: string,
  event: GoogleCalendarEvent,
  calendarId: string = 'primary'
): Promise<SyncResult> {
  const calendar = await getCalendarClient(tenantId, userId)
  if (!calendar) {
    return { success: false, error: 'Calendar not authenticated' }
  }

  try {
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        attendees: event.attendees,
        reminders: event.reminders,
        colorId: event.colorId,
        extendedProperties: event.extendedProperties,
      },
    })

    return {
      success: true,
      externalEventId: response.data.id || undefined,
    }
  } catch (error: any) {
    console.error('[GoogleCalendar] Failed to update event:', error)
    return {
      success: false,
      error: error.message || 'Failed to update event',
    }
  }
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(
  tenantId: string,
  userId: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<SyncResult> {
  const calendar = await getCalendarClient(tenantId, userId)
  if (!calendar) {
    return { success: false, error: 'Calendar not authenticated' }
  }

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    })

    return { success: true }
  } catch (error: any) {
    // 404/410 means already deleted, which is fine
    if (error.code === 404 || error.code === 410) {
      return { success: true }
    }

    console.error('[GoogleCalendar] Failed to delete event:', error)
    return {
      success: false,
      error: error.message || 'Failed to delete event',
    }
  }
}

/**
 * Get a calendar event by ID
 */
export async function getEvent(
  tenantId: string,
  userId: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<GoogleCalendarEvent | null> {
  const calendar = await getCalendarClient(tenantId, userId)
  if (!calendar) return null

  try {
    const response = await calendar.events.get({
      calendarId,
      eventId,
    })

    const event = response.data
    return {
      id: event.id || undefined,
      summary: event.summary || '',
      description: event.description || undefined,
      location: event.location || undefined,
      start: {
        dateTime: event.start?.dateTime || '',
        timeZone: event.start?.timeZone || 'Europe/Prague',
      },
      end: {
        dateTime: event.end?.dateTime || '',
        timeZone: event.end?.timeZone || 'Europe/Prague',
      },
    }
  } catch (error) {
    console.error('[GoogleCalendar] Failed to get event:', error)
    return null
  }
}

// ============================================
// Calendar Client Helper Functions
// Used by sync-service when we already have a calendar instance
// ============================================

interface CalendarEventData {
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
  attendees?: Array<{ email: string }>
}

/**
 * Create a calendar event using an existing calendar client
 */
export async function createCalendarEvent(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  event: CalendarEventData
): Promise<{ id?: string }> {
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: 'Europe/Prague',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: 'Europe/Prague',
      },
      attendees: event.attendees,
    },
  })

  return { id: response.data.id || undefined }
}

/**
 * Update a calendar event using an existing calendar client
 */
export async function updateCalendarEvent(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  eventId: string,
  event: CalendarEventData
): Promise<{ id?: string }> {
  const response = await calendar.events.update({
    calendarId,
    eventId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: 'Europe/Prague',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: 'Europe/Prague',
      },
      attendees: event.attendees,
    },
  })

  return { id: response.data.id || undefined }
}

/**
 * Delete a calendar event using an existing calendar client
 */
export async function deleteCalendarEvent(
  calendar: calendar_v3.Calendar,
  calendarId: string,
  eventId: string
): Promise<void> {
  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    })
  } catch (error: any) {
    // 404/410 means already deleted, which is fine
    if (error.code !== 404 && error.code !== 410) {
      throw error
    }
  }
}
