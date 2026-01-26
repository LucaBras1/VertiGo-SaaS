// Calendar Sync Library for FitAdmin
// Exports all calendar-related functions

// Google Calendar
export { isGoogleCalendarConfigured, getAuthUrl, disconnectGoogle } from './google/auth'
export { listCalendars, createEvent, updateEvent, deleteEvent, getEvent } from './google/events'
export type { GoogleCalendarEvent, CalendarListEntry, SyncResult } from './google/types'

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
