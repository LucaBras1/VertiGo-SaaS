// Google Calendar OAuth 2.0 Authentication

import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'
import type { GoogleCalendarConfig } from './types'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
]

// Simple encryption/decryption for tokens (use proper encryption in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-dev-key-32-characters!!'

function encrypt(text: string): string {
  // Simple XOR encryption for development - use proper encryption in production
  const key = ENCRYPTION_KEY
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return Buffer.from(result).toString('base64')
}

function decrypt(encoded: string): string {
  const key = ENCRYPTION_KEY
  const text = Buffer.from(encoded, 'base64').toString()
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

export async function getGoogleCalendarSettings(): Promise<GoogleCalendarConfig | null> {
  const settings = await prisma.googleCalendarSettings.findFirst()

  if (!settings?.clientId || !settings?.clientSecretEnc) {
    return null
  }

  return {
    clientId: settings.clientId,
    clientSecret: decrypt(settings.clientSecretEnc),
    refreshToken: settings.refreshToken ? decrypt(settings.refreshToken) : undefined,
    accessToken: settings.accessToken ? decrypt(settings.accessToken) : undefined,
    tokenExpiry: settings.tokenExpiry || undefined,
    calendarId: settings.calendarId || undefined,
  }
}

export async function saveGoogleCalendarCredentials(
  clientId: string,
  clientSecret: string
): Promise<void> {
  await prisma.googleCalendarSettings.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      clientId,
      clientSecretEnc: encrypt(clientSecret),
      isConfigured: false,
    },
    update: {
      clientId,
      clientSecretEnc: encrypt(clientSecret),
    },
  })
}

export async function saveGoogleCalendarTokens(
  accessToken: string,
  refreshToken: string,
  expiryDate: number,
  email: string
): Promise<void> {
  await prisma.googleCalendarSettings.update({
    where: { id: 'singleton' },
    data: {
      accessToken: encrypt(accessToken),
      refreshToken: encrypt(refreshToken),
      tokenExpiry: new Date(expiryDate),
      connectedEmail: email,
      connectedAt: new Date(),
      isConfigured: true,
    },
  })
}

export async function saveCalendarId(calendarId: string): Promise<void> {
  await prisma.googleCalendarSettings.update({
    where: { id: 'singleton' },
    data: { calendarId },
  })
}

export async function disconnectGoogleCalendar(): Promise<void> {
  await prisma.googleCalendarSettings.update({
    where: { id: 'singleton' },
    data: {
      refreshToken: null,
      accessToken: null,
      tokenExpiry: null,
      connectedEmail: null,
      connectedAt: null,
      calendarId: null,
      isConfigured: false,
    },
  })
}

export function createOAuth2Client(config: GoogleCalendarConfig) {
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/admin/google-calendar/callback`

  const oauth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    redirectUri
  )

  if (config.refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: config.refreshToken,
      access_token: config.accessToken,
      expiry_date: config.tokenExpiry?.getTime(),
    })
  }

  return oauth2Client
}

export function getAuthUrl(config: GoogleCalendarConfig): string {
  const oauth2Client = createOAuth2Client(config)

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force to get refresh token
  })
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string
  refreshToken: string
  expiryDate: number
  email: string
}> {
  const config = await getGoogleCalendarSettings()
  if (!config) {
    throw new Error('Google Calendar not configured')
  }

  const oauth2Client = createOAuth2Client(config)
  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to get tokens')
  }

  oauth2Client.setCredentials(tokens)

  // Get user email
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
  const userInfo = await oauth2.userinfo.get()
  const email = userInfo.data.email || 'unknown'

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date || Date.now() + 3600 * 1000,
    email,
  }
}

export async function getAuthenticatedClient() {
  const config = await getGoogleCalendarSettings()
  if (!config || !config.refreshToken) {
    throw new Error('Google Calendar not authenticated')
  }

  const oauth2Client = createOAuth2Client(config)

  // Check if token needs refresh
  if (config.tokenExpiry && config.tokenExpiry.getTime() < Date.now()) {
    const { credentials } = await oauth2Client.refreshAccessToken()

    // Save new tokens
    if (credentials.access_token) {
      await prisma.googleCalendarSettings.update({
        where: { id: 'singleton' },
        data: {
          accessToken: encrypt(credentials.access_token),
          tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        },
      })
    }
  }

  return oauth2Client
}

export async function listCalendars(): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const response = await calendar.calendarList.list()
  const items = response.data.items || []

  return items.map((item) => ({
    id: item.id || '',
    summary: item.summary || '',
    primary: item.primary || false,
  }))
}

export async function isGoogleCalendarConfigured(): Promise<boolean> {
  const settings = await prisma.googleCalendarSettings.findFirst()
  return settings?.isConfigured || false
}
