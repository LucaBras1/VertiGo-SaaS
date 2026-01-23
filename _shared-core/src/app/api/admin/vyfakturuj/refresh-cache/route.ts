/**
 * Vyfakturuj Cache Refresh Route
 *
 * POST /api/admin/vyfakturuj/refresh-cache - Refresh cached settings from Vyfakturuj
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VyfakturujClient } from '@/lib/vyfakturuj/client'
import * as crypto from 'crypto'

const ENCRYPTION_KEY = process.env.VYFAKTURUJ_ENCRYPTION_KEY || 'default-key-change-in-production-32'

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

// POST /api/admin/vyfakturuj/refresh-cache
export async function POST() {
  try {
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings?.isConfigured || !settings.apiEmail || !settings.apiKeyHash) {
      return NextResponse.json(
        { error: 'Vyfakturuj není nakonfigurován' },
        { status: 400 }
      )
    }

    const apiKey = decrypt(settings.apiKeyHash)
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Nepodařilo se dešifrovat API klíč' },
        { status: 500 }
      )
    }

    const client = new VyfakturujClient(settings.apiEmail, apiKey)

    // Fetch all settings from Vyfakturuj
    const [paymentMethods, numberSeries, tags] = await Promise.all([
      client.getPaymentMethods(),
      client.getNumberSeries(),
      client.getTags(),
    ])

    // Update cache
    await prisma.vyfakturujSettings.update({
      where: { id: 'singleton' },
      data: {
        cachedPaymentMethods: paymentMethods as unknown as Parameters<typeof prisma.vyfakturujSettings.update>[0]['data']['cachedPaymentMethods'],
        cachedNumberSeries: numberSeries as unknown as Parameters<typeof prisma.vyfakturujSettings.update>[0]['data']['cachedNumberSeries'],
        cachedTags: tags as unknown as Parameters<typeof prisma.vyfakturujSettings.update>[0]['data']['cachedTags'],
        cacheUpdatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Cache byla úspěšně aktualizována',
      data: {
        paymentMethodsCount: paymentMethods.length,
        numberSeriesCount: numberSeries.length,
        tagsCount: tags.length,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error refreshing Vyfakturuj cache:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Nepodařilo se aktualizovat cache',
      },
      { status: 500 }
    )
  }
}
