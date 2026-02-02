import { google, calendar_v3 } from 'googleapis'
import { createAuthenticatedClient } from './auth'

interface GigEvent {
  id: string
  title: string
  eventDate: Date
  eventDuration?: number // minutes
  venue?: {
    name?: string
    address?: string
    city?: string
  }
  clientName?: string
  description?: string
  status: string
}

/**
 * Create a Google Calendar event from a Gig
 */
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  gig: GigEvent
): Promise<string> {
  const auth = createAuthenticatedClient(accessToken, refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const startDateTime = new Date(gig.eventDate)
  const endDateTime = new Date(startDateTime)
  endDateTime.setMinutes(endDateTime.getMinutes() + (gig.eventDuration || 120))

  const location = gig.venue
    ? [gig.venue.name, gig.venue.address, gig.venue.city].filter(Boolean).join(', ')
    : undefined

  const event: calendar_v3.Schema$Event = {
    summary: gig.title,
    description: buildEventDescription(gig),
    location,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Europe/Prague',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Europe/Prague',
    },
    colorId: getColorForStatus(gig.status),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 * 24 }, // 1 day before
        { method: 'popup', minutes: 60 * 3 },  // 3 hours before
      ],
    },
    extendedProperties: {
      private: {
        gigId: gig.id,
        source: 'gigbook',
      },
    },
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  })

  return response.data.id!
}

/**
 * Update an existing Google Calendar event
 */
export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  eventId: string,
  gig: GigEvent
): Promise<void> {
  const auth = createAuthenticatedClient(accessToken, refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const startDateTime = new Date(gig.eventDate)
  const endDateTime = new Date(startDateTime)
  endDateTime.setMinutes(endDateTime.getMinutes() + (gig.eventDuration || 120))

  const location = gig.venue
    ? [gig.venue.name, gig.venue.address, gig.venue.city].filter(Boolean).join(', ')
    : undefined

  const event: calendar_v3.Schema$Event = {
    summary: gig.title,
    description: buildEventDescription(gig),
    location,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Europe/Prague',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Europe/Prague',
    },
    colorId: getColorForStatus(gig.status),
  }

  await calendar.events.update({
    calendarId,
    eventId,
    requestBody: event,
  })
}

/**
 * Delete a Google Calendar event
 */
export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const auth = createAuthenticatedClient(accessToken, refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({
    calendarId,
    eventId,
  })
}

/**
 * Build event description from gig data
 */
function buildEventDescription(gig: GigEvent): string {
  const lines: string[] = []

  if (gig.clientName) {
    lines.push(`Klient: ${gig.clientName}`)
  }

  if (gig.status) {
    lines.push(`Status: ${gig.status}`)
  }

  if (gig.description) {
    lines.push('')
    lines.push(gig.description)
  }

  lines.push('')
  lines.push('---')
  lines.push('Spravováno v GigBook')

  return lines.join('\n')
}

/**
 * Get Google Calendar color ID based on gig status
 * Color IDs: https://developers.google.com/calendar/api/v3/reference/colors/get
 */
function getColorForStatus(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return '10' // Green
    case 'COMPLETED':
      return '7'  // Cyan
    case 'INQUIRY':
      return '5'  // Yellow
    case 'QUOTE_SENT':
      return '6'  // Orange
    case 'CANCELLED':
      return '11' // Red
    default:
      return '1'  // Lavender (default)
  }
}
