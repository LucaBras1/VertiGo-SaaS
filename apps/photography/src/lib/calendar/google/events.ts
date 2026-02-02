/**
 * Google Calendar Events - ShootFlow
 * CRUD operations for calendar events
 */

import { google, calendar_v3 } from 'googleapis'
import { getAuthenticatedClient } from './auth'

// Types
export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: Date
  end: Date
  colorId?: string
  reminders?: {
    useDefault?: boolean
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>
  }
}

export interface ShootEventData {
  shootId: string
  packageTitle: string
  clientName: string
  eventType?: string
  location?: string
  date: Date
  startTime: string
  endTime: string
  notes?: string
}

/**
 * Get Google Calendar API client
 */
function getCalendarClient(accessToken: string, refreshToken: string) {
  const auth = getAuthenticatedClient(accessToken, refreshToken)
  return google.calendar({ version: 'v3', auth })
}

/**
 * List user's calendars
 */
export async function listCalendars(
  accessToken: string,
  refreshToken: string
): Promise<Array<{ id: string; summary: string; primary: boolean }>> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const response = await calendar.calendarList.list()

  return (response.data.items || []).map((cal) => ({
    id: cal.id || '',
    summary: cal.summary || 'Unnamed Calendar',
    primary: cal.primary || false,
  }))
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<string> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const eventResource: calendar_v3.Schema$Event = {
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
    colorId: event.colorId,
    reminders: event.reminders || {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 }, // 1 hour before
        { method: 'popup', minutes: 1440 }, // 1 day before
      ],
    },
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: eventResource,
  })

  if (!response.data.id) {
    throw new Error('Failed to create calendar event')
  }

  return response.data.id
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  eventId: string,
  event: Partial<CalendarEvent>
): Promise<void> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  const eventResource: calendar_v3.Schema$Event = {}

  if (event.summary) eventResource.summary = event.summary
  if (event.description !== undefined) eventResource.description = event.description
  if (event.location !== undefined) eventResource.location = event.location
  if (event.start) {
    eventResource.start = {
      dateTime: event.start.toISOString(),
      timeZone: 'Europe/Prague',
    }
  }
  if (event.end) {
    eventResource.end = {
      dateTime: event.end.toISOString(),
      timeZone: 'Europe/Prague',
    }
  }
  if (event.colorId) eventResource.colorId = event.colorId

  await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: eventResource,
  })
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  await calendar.events.delete({
    calendarId,
    eventId,
  })
}

/**
 * Get a calendar event
 */
export async function getCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<calendar_v3.Schema$Event | null> {
  const calendar = getCalendarClient(accessToken, refreshToken)

  try {
    const response = await calendar.events.get({
      calendarId,
      eventId,
    })
    return response.data
  } catch (error) {
    // Event might have been deleted
    return null
  }
}

/**
 * Create calendar event from shoot data
 */
export function createShootCalendarEvent(shoot: ShootEventData): CalendarEvent {
  // Parse start and end times
  const [startHour, startMinute] = shoot.startTime.split(':').map(Number)
  const [endHour, endMinute] = shoot.endTime.split(':').map(Number)

  const startDate = new Date(shoot.date)
  startDate.setHours(startHour, startMinute, 0, 0)

  const endDate = new Date(shoot.date)
  endDate.setHours(endHour, endMinute, 0, 0)

  // Build description
  const descriptionParts = [
    `Client: ${shoot.clientName}`,
    `Package: ${shoot.packageTitle}`,
  ]

  if (shoot.eventType) {
    descriptionParts.push(`Type: ${shoot.eventType}`)
  }

  if (shoot.notes) {
    descriptionParts.push('', 'Notes:', shoot.notes)
  }

  descriptionParts.push('', `ShootFlow ID: ${shoot.shootId}`)

  // Color based on event type
  const colorId = getEventColorId(shoot.eventType)

  return {
    summary: `📷 ${shoot.packageTitle} - ${shoot.clientName}`,
    description: descriptionParts.join('\n'),
    location: shoot.location,
    start: startDate,
    end: endDate,
    colorId,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 }, // 1 hour before
        { method: 'popup', minutes: 1440 }, // 1 day before
        { method: 'email', minutes: 2880 }, // 2 days before
      ],
    },
  }
}

/**
 * Get Google Calendar color ID based on event type
 */
function getEventColorId(eventType?: string): string {
  // Google Calendar color IDs:
  // 1 = Lavender, 2 = Sage, 3 = Grape, 4 = Flamingo
  // 5 = Banana, 6 = Tangerine, 7 = Peacock, 8 = Graphite
  // 9 = Blueberry, 10 = Basil, 11 = Tomato

  const colorMap: Record<string, string> = {
    wedding: '3', // Grape - romantic purple
    portrait: '7', // Peacock - professional blue
    corporate: '8', // Graphite - business gray
    family: '2', // Sage - warm green
    product: '6', // Tangerine - creative orange
    newborn: '4', // Flamingo - soft pink
    maternity: '1', // Lavender - gentle purple
    event: '9', // Blueberry - event blue
  }

  return colorMap[eventType?.toLowerCase() || ''] || '7' // Default to Peacock
}
