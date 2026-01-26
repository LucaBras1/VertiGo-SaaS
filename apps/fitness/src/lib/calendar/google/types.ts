/**
 * Google Calendar Types for FitAdmin
 */

export interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
  colorId?: string
  extendedProperties?: {
    private?: Record<string, string>
    shared?: Record<string, string>
  }
}

export interface GoogleOAuthTokens {
  access_token: string
  refresh_token?: string
  expiry_date?: number
  token_type: string
  scope?: string
}

export interface CalendarListEntry {
  id: string
  summary: string
  description?: string
  primary?: boolean
  backgroundColor?: string
  foregroundColor?: string
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner'
}

export interface SyncResult {
  success: boolean
  externalEventId?: string
  error?: string
}
