/**
 * Google Calendar OAuth Authentication
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */

import { google } from 'googleapis'
import { GoogleOAuthTokens } from './types'

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Google Calendar scopes
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]

/**
 * Check if Google Calendar is configured
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI
  )
}

/**
 * Generate OAuth URL for user authorization
 */
export function getAuthUrl(state: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent', // Force consent to get refresh token
  })
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string): Promise<GoogleOAuthTokens> {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens as GoogleOAuthTokens
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokens> {
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials as GoogleOAuthTokens
}

/**
 * Get authenticated OAuth client for a user
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */
export async function getAuthenticatedClient(
  tenantId: string,
  userId: string
): Promise<typeof oauth2Client | null> {
  // Stubbed - CalendarIntegration model not yet available
  console.warn('[GoogleAuth] Calendar integration not yet implemented')
  return null
}

/**
 * Save OAuth tokens for a user
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */
export async function saveTokens(
  tenantId: string,
  userId: string,
  tokens: GoogleOAuthTokens,
  calendarEmail?: string
): Promise<void> {
  // Stubbed - CalendarIntegration model not yet available
  console.warn('[GoogleAuth] Calendar integration not yet implemented')
}

/**
 * Disconnect Google Calendar integration
 *
 * TODO: Enable when CalendarIntegration model is added to schema
 */
export async function disconnectGoogle(
  tenantId: string,
  userId: string
): Promise<void> {
  // Stubbed - CalendarIntegration model not yet available
  console.warn('[GoogleAuth] Calendar integration not yet implemented')
}
