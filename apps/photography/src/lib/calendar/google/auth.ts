/**
 * Google Calendar OAuth - ShootFlow
 * OAuth authentication for Google Calendar integration
 */

import { google } from 'googleapis'

// OAuth2 client setup
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/calendar/google/callback`

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

// Scopes required for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]

/**
 * Generate OAuth URL for user authorization
 */
export function getAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to get refresh token
    state,
  })
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string
  refreshToken: string
  tokenExpiry: Date
}> {
  const oauth2Client = getOAuth2Client()

  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to get tokens from Google')
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000),
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string
  tokenExpiry: Date
}> {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token')
  }

  return {
    accessToken: credentials.access_token,
    tokenExpiry: credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600000),
  }
}

/**
 * Get authenticated OAuth2 client with valid tokens
 */
export function getAuthenticatedClient(
  accessToken: string,
  refreshToken: string
) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })
  return oauth2Client
}

/**
 * Revoke Google Calendar access
 */
export async function revokeAccess(accessToken: string): Promise<void> {
  const oauth2Client = getOAuth2Client()
  await oauth2Client.revokeToken(accessToken)
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpired(tokenExpiry: Date, bufferMinutes: number = 5): boolean {
  const now = new Date()
  const buffer = bufferMinutes * 60 * 1000
  return tokenExpiry.getTime() - buffer < now.getTime()
}
