/**
 * Google Calendar OAuth Authentication
 *
 * Handles Google OAuth flow, token management, and authenticated client creation.
 */

import { google, calendar_v3 } from 'googleapis'
import { prisma } from '../../prisma'
import { GoogleOAuthTokens } from './types'
import type { CalendarIntegration } from '@/generated/prisma'

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
 */
export async function getAuthenticatedClient(
  tenantId: string,
  userId: string
): Promise<typeof oauth2Client | null> {
  try {
    const integration = await prisma.calendarIntegration.findUnique({
      where: {
        tenantId_userId_provider: {
          tenantId,
          userId,
          provider: 'google',
        },
      },
    })

    if (!integration || !integration.accessToken) {
      return null
    }

    // Check if token is expired and refresh if needed
    if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
      if (!integration.refreshToken) {
        console.warn('[GoogleAuth] Token expired and no refresh token available')
        return null
      }

      try {
        const newTokens = await refreshAccessToken(integration.refreshToken)

        // Update tokens in database
        await prisma.calendarIntegration.update({
          where: { id: integration.id },
          data: {
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || integration.refreshToken,
            tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
            updatedAt: new Date(),
          },
        })

        oauth2Client.setCredentials({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || integration.refreshToken,
        })
      } catch (error) {
        console.error('[GoogleAuth] Failed to refresh token:', error)
        return null
      }
    } else {
      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken || undefined,
      })
    }

    return oauth2Client
  } catch (error) {
    console.error('[GoogleAuth] Failed to get authenticated client:', error)
    return null
  }
}

/**
 * Save OAuth tokens for a user
 */
export async function saveTokens(
  tenantId: string,
  userId: string,
  tokens: GoogleOAuthTokens,
  calendarEmail?: string
): Promise<void> {
  try {
    await prisma.calendarIntegration.upsert({
      where: {
        tenantId_userId_provider: {
          tenantId,
          userId,
          provider: 'google',
        },
      },
      create: {
        tenantId,
        userId,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarEmail,
        syncEnabled: true,
        syncDirection: 'both',
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        calendarEmail: calendarEmail || undefined,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[GoogleAuth] Failed to save tokens:', error)
    throw error
  }
}

/**
 * Disconnect Google Calendar integration
 */
export async function disconnectGoogle(
  tenantId: string,
  userId: string
): Promise<void> {
  try {
    // Find the integration first
    const integration = await prisma.calendarIntegration.findUnique({
      where: {
        tenantId_userId_provider: {
          tenantId,
          userId,
          provider: 'google',
        },
      },
    })

    if (!integration) {
      return
    }

    // Delete related event syncs first (cascade should handle this, but being explicit)
    await prisma.calendarEventSync.deleteMany({
      where: { integrationId: integration.id },
    })

    // Delete the integration
    await prisma.calendarIntegration.delete({
      where: { id: integration.id },
    })

    // Optionally revoke the token with Google
    if (integration.accessToken) {
      try {
        await oauth2Client.revokeToken(integration.accessToken)
      } catch {
        // Ignore revocation errors - token might already be invalid
      }
    }
  } catch (error) {
    console.error('[GoogleAuth] Failed to disconnect Google Calendar:', error)
    throw error
  }
}

/**
 * Get Google Calendar API client from an existing integration record
 * Used by sync-service when we already have the integration data
 */
export async function getCalendarClient(
  integration: CalendarIntegration
): Promise<calendar_v3.Calendar | null> {
  try {
    if (!integration.accessToken) {
      return null
    }

    // Check if token is expired and refresh if needed
    if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
      if (!integration.refreshToken) {
        console.warn('[GoogleAuth] Token expired and no refresh token available')
        return null
      }

      try {
        const newTokens = await refreshAccessToken(integration.refreshToken)

        // Update tokens in database
        await prisma.calendarIntegration.update({
          where: { id: integration.id },
          data: {
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || integration.refreshToken,
            tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : null,
            updatedAt: new Date(),
          },
        })

        oauth2Client.setCredentials({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || integration.refreshToken,
        })
      } catch (error) {
        console.error('[GoogleAuth] Failed to refresh token:', error)
        return null
      }
    } else {
      oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken || undefined,
      })
    }

    return google.calendar({ version: 'v3', auth: oauth2Client })
  } catch (error) {
    console.error('[GoogleAuth] Failed to get calendar client:', error)
    return null
  }
}

/**
 * Get user's calendar email from their Google account
 */
export async function getCalendarEmail(
  tokens: GoogleOAuthTokens
): Promise<string | null> {
  try {
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    })

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    return userInfo.data.email || null
  } catch (error) {
    console.error('[GoogleAuth] Failed to get calendar email:', error)
    return null
  }
}
