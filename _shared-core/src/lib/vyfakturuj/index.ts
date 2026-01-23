/**
 * Vyfakturuj.cz Integration Module
 *
 * Exports client and helper functions for Vyfakturuj API integration
 */

import { prisma } from '@/lib/prisma'
import { VyfakturujClient, VyfakturujApiError } from './client'
import * as crypto from 'crypto'

export { VyfakturujClient, VyfakturujApiError }
export type { TestResult } from './client'

const ENCRYPTION_KEY = process.env.VYFAKTURUJ_ENCRYPTION_KEY || 'default-key-change-in-production-32'

/**
 * Decrypt stored API key
 */
function decrypt(encryptedText: string): string {
  try {
    const algorithm = 'aes-256-cbc'
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const [ivHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return ''
  }
}

/**
 * Get configured Vyfakturuj client from database settings
 *
 * @throws Error if Vyfakturuj is not configured
 *
 * @example
 * ```typescript
 * const client = await getVyfakturujClient()
 * const invoices = await client.listInvoices()
 * ```
 */
export async function getVyfakturujClient(): Promise<VyfakturujClient> {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
  })

  if (!settings?.isConfigured || !settings.apiEmail || !settings.apiKeyHash) {
    throw new Error('Vyfakturuj není nakonfigurován. Nastavte přihlašovací údaje v administraci.')
  }

  const apiKey = decrypt(settings.apiKeyHash)
  if (!apiKey) {
    throw new Error('Nepodařilo se dešifrovat API klíč. Zkontrolujte konfiguraci.')
  }

  return new VyfakturujClient(settings.apiEmail, apiKey)
}

/**
 * Check if Vyfakturuj is configured
 */
export async function isVyfakturujConfigured(): Promise<boolean> {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
  })

  return !!settings?.isConfigured
}

/**
 * Get Vyfakturuj settings (without sensitive data)
 */
export async function getVyfakturujSettings() {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
  })

  if (!settings) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { apiKeyHash, ...safeSettings } = settings
  return safeSettings
}

/**
 * Get cached payment methods from settings
 */
export async function getCachedPaymentMethods() {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
    select: { cachedPaymentMethods: true },
  })

  return (settings?.cachedPaymentMethods as unknown[]) || []
}

/**
 * Get cached number series from settings
 */
export async function getCachedNumberSeries() {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
    select: { cachedNumberSeries: true },
  })

  return (settings?.cachedNumberSeries as unknown[]) || []
}

/**
 * Get cached tags from settings
 */
export async function getCachedTags() {
  const settings = await prisma.vyfakturujSettings.findFirst({
    where: { id: 'singleton' },
    select: { cachedTags: true },
  })

  return (settings?.cachedTags as unknown[]) || []
}
