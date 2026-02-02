/**
 * Google Calendar Types
 */

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
  }
}

export interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  primary?: boolean
  accessRole?: 'freeBusyReader' | 'reader' | 'writer' | 'owner'
}

export interface GoogleTokens {
  accessToken: string
  refreshToken: string | null
  expiryDate: Date | null
}
