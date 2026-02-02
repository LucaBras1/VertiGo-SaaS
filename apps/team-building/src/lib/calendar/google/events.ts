/**
 * Google Calendar Events
 * CRUD operations for Google Calendar events
 */

import { google, calendar_v3 } from 'googleapis'
import { getAuthenticatedClient, refreshAccessToken } from './auth'

interface CalendarEvent {
  summary: string
  description: string
  start: Date
  end: Date
  location?: string
}

interface EventResult {
  eventId: string | null
  newAccessToken?: string
}

/**
 * Create or update a calendar event
 */
export async function createOrUpdateEvent(
  accessToken: string,
  refreshToken: string | null | undefined,
  calendarId: string,
  event: CalendarEvent,
  existingEventId?: string
): Promise<EventResult> {
  let auth = getAuthenticatedClient(accessToken, refreshToken)
  let newAccessToken: string | undefined

  const calendar = google.calendar({ version: 'v3', auth })

  const eventBody: calendar_v3.Schema$Event = {
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
    reminders: {
      useDefault: true,
    },
  }

  try {
    let response

    if (existingEventId) {
      // Update existing event
      response = await calendar.events.update({
        calendarId,
        eventId: existingEventId,
        requestBody: eventBody,
      })
    } else {
      // Create new event
      response = await calendar.events.insert({
        calendarId,
        requestBody: eventBody,
      })
    }

    return {
      eventId: response.data.id || null,
      newAccessToken,
    }
  } catch (error: any) {
    // Handle token expiry
    if (error.code === 401 && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      auth = getAuthenticatedClient(refreshed.accessToken, refreshToken)
      newAccessToken = refreshed.accessToken

      const calendar = google.calendar({ version: 'v3', auth })

      let response
      if (existingEventId) {
        response = await calendar.events.update({
          calendarId,
          eventId: existingEventId,
          requestBody: eventBody,
        })
      } else {
        response = await calendar.events.insert({
          calendarId,
          requestBody: eventBody,
        })
      }

      return {
        eventId: response.data.id || null,
        newAccessToken,
      }
    }

    throw error
  }
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(
  accessToken: string,
  refreshToken: string | null | undefined,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const auth = getAuthenticatedClient(accessToken, refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    })
    return true
  } catch (error: any) {
    // Handle token expiry
    if (error.code === 401 && refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      const newAuth = getAuthenticatedClient(refreshed.accessToken, refreshToken)
      const newCalendar = google.calendar({ version: 'v3', auth: newAuth })

      await newCalendar.events.delete({
        calendarId,
        eventId,
      })
      return true
    }

    // Event might already be deleted
    if (error.code === 404 || error.code === 410) {
      return true
    }

    throw error
  }
}

/**
 * List user's calendars
 */
export async function listCalendars(
  accessToken: string,
  refreshToken?: string | null
): Promise<Array<{ id: string; summary: string; primary: boolean }>> {
  const auth = getAuthenticatedClient(accessToken, refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const response = await calendar.calendarList.list()

  return (response.data.items || []).map((cal) => ({
    id: cal.id || '',
    summary: cal.summary || '',
    primary: cal.primary || false,
  }))
}
