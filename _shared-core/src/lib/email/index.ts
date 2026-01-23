/**
 * Email Utility Module
 *
 * Handles sending emails using nodemailer
 * Reads SMTP configuration from database settings with fallback to environment variables
 */

import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

// Cache for SMTP settings to avoid repeated database queries
let smtpSettingsCache: {
  host: string
  port: number
  secure: boolean
  user: string | null
  password: string | null
  emailFrom: string
} | null = null
let smtpSettingsCacheTime = 0
const CACHE_TTL = 60000 // 1 minute

/**
 * Get SMTP settings from database with fallback to environment variables
 */
async function getSmtpSettings() {
  const now = Date.now()

  // Return cached settings if still valid
  if (smtpSettingsCache && (now - smtpSettingsCacheTime) < CACHE_TTL) {
    return smtpSettingsCache
  }

  try {
    const settings = await prisma.settings.findFirst({
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpSecure: true,
        smtpUser: true,
        smtpPassword: true,
        emailFrom: true,
      },
    })

    smtpSettingsCache = {
      host: settings?.smtpHost || process.env.SMTP_HOST || 'localhost',
      port: settings?.smtpPort || parseInt(process.env.SMTP_PORT || '587'),
      secure: settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true'),
      user: settings?.smtpUser || process.env.SMTP_USER || null,
      password: settings?.smtpPassword || process.env.SMTP_PASSWORD || null,
      emailFrom: settings?.emailFrom || process.env.EMAIL_FROM || '"Divadlo Studna" <noreply@divadlo-studna.cz>',
    }
    smtpSettingsCacheTime = now

    return smtpSettingsCache
  } catch (error) {
    console.error('Failed to load SMTP settings from database, using env fallback:', error)
    return {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || null,
      password: process.env.SMTP_PASSWORD || null,
      emailFrom: process.env.EMAIL_FROM || '"Divadlo Studna" <noreply@divadlo-studna.cz>',
    }
  }
}

/**
 * Create nodemailer transporter with SMTP settings from database
 */
async function createTransporter() {
  const settings = await getSmtpSettings()

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user && settings.password ? {
      user: settings.user,
      pass: settings.password,
    } : undefined,
  })
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const settings = await getSmtpSettings()
    const transporter = await createTransporter()

    await transporter.sendMail({
      from: settings.emailFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    })

    console.log(`✅ Email sent to ${options.to}: ${options.subject}`)
    return true
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message)
    return false
  }
}

/**
 * Get the admin notification email address
 */
export function getAdminEmail(): string {
  return process.env.EMAIL_TO || 'produkce@divadlo-studna.cz'
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3001'
}
