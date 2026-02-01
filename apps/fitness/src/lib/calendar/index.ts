// Calendar Sync Library for FitAdmin
// Exports all calendar-related functions

// Google Calendar
export {
  isGoogleCalendarConfigured,
  getAuthUrl,
  getTokensFromCode,
  saveTokens,
  disconnectGoogle,
  getCalendarClient,
  getCalendarEmail,
  getAuthenticatedClient,
} from './google/auth'
export {
  listCalendars,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from './google/events'
export type { GoogleCalendarEvent, GoogleOAuthTokens, CalendarListEntry, SyncResult } from './google/types'

// Apple Calendar (ICS)
export { generateICS, generateEventHash } from './apple/ics-generator'

// Sync Service
export {
  syncSessionToCalendar,
  removeSessionFromCalendar,
  syncClassToCalendar,
  removeClassFromCalendar,
  generateFeedToken,
  validateFeedToken,
} from './sync-service'
