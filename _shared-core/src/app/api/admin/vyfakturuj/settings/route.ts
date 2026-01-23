/**
 * Vyfakturuj Settings API Routes
 *
 * GET /api/admin/vyfakturuj/settings - Get Vyfakturuj settings
 * PUT /api/admin/vyfakturuj/settings - Update Vyfakturuj settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { VyfakturujClient } from '@/lib/vyfakturuj/client'
import * as crypto from 'crypto'

// Simple encryption for API key storage
const ENCRYPTION_KEY = process.env.VYFAKTURUJ_ENCRYPTION_KEY || 'default-key-change-in-production-32'

function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

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

// GET /api/admin/vyfakturuj/settings
export async function GET() {
  try {
    let settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.vyfakturujSettings.create({
        data: {
          id: 'singleton',
          isConfigured: false,
          defaultDaysDue: 14,
          autoSyncCustomers: true,
        },
      })
    }

    // Return settings without the encrypted API key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKeyHash, ...safeSettings } = settings

    return NextResponse.json({
      data: {
        ...safeSettings,
        hasApiKey: !!apiKeyHash,
      },
    })
  } catch (error) {
    console.error('Error fetching Vyfakturuj settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Vyfakturuj settings' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/vyfakturuj/settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    // Prepare update data
    const updateData: Record<string, unknown> = {}

    // API Credentials (only update if provided)
    if (data.apiEmail !== undefined) {
      updateData.apiEmail = data.apiEmail || null
    }

    if (data.apiKey !== undefined && data.apiKey !== '') {
      // Encrypt the API key before storing
      updateData.apiKeyHash = encrypt(data.apiKey)
    }

    // Default Settings
    if (data.defaultPaymentMethodId !== undefined) {
      updateData.defaultPaymentMethodId = data.defaultPaymentMethodId
    }
    if (data.defaultNumberSeriesId !== undefined) {
      updateData.defaultNumberSeriesId = data.defaultNumberSeriesId
    }
    if (data.defaultDaysDue !== undefined) {
      updateData.defaultDaysDue = data.defaultDaysDue
    }

    // Supplier Information
    if (data.supplierName !== undefined) updateData.supplierName = data.supplierName
    if (data.supplierIco !== undefined) updateData.supplierIco = data.supplierIco
    if (data.supplierDic !== undefined) updateData.supplierDic = data.supplierDic
    if (data.supplierStreet !== undefined) updateData.supplierStreet = data.supplierStreet
    if (data.supplierCity !== undefined) updateData.supplierCity = data.supplierCity
    if (data.supplierZip !== undefined) updateData.supplierZip = data.supplierZip
    if (data.supplierCountry !== undefined) updateData.supplierCountry = data.supplierCountry
    if (data.supplierEmail !== undefined) updateData.supplierEmail = data.supplierEmail
    if (data.supplierPhone !== undefined) updateData.supplierPhone = data.supplierPhone
    if (data.supplierWeb !== undefined) updateData.supplierWeb = data.supplierWeb
    if (data.supplierBankAccount !== undefined) updateData.supplierBankAccount = data.supplierBankAccount
    if (data.supplierIban !== undefined) updateData.supplierIban = data.supplierIban
    if (data.supplierBic !== undefined) updateData.supplierBic = data.supplierBic

    // Invoice Text Settings
    if (data.textUnderSupplier !== undefined) updateData.textUnderSupplier = data.textUnderSupplier
    if (data.textInvoiceFooter !== undefined) updateData.textInvoiceFooter = data.textInvoiceFooter

    // Sync Settings
    if (data.autoSyncCustomers !== undefined) updateData.autoSyncCustomers = data.autoSyncCustomers

    // Webhook Settings
    if (data.webhookSecret !== undefined) updateData.webhookSecret = data.webhookSecret

    // Automation Settings
    if (data.autoCreateProforma !== undefined) updateData.autoCreateProforma = data.autoCreateProforma

    // Reminder Settings
    if (data.enableReminders !== undefined) updateData.enableReminders = data.enableReminders
    if (data.reminder1Days !== undefined) updateData.reminder1Days = data.reminder1Days
    if (data.reminder2Days !== undefined) updateData.reminder2Days = data.reminder2Days
    if (data.reminder3Days !== undefined) updateData.reminder3Days = data.reminder3Days

    // Check if configured (has both email and key)
    let existingSettings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    const newEmail = data.apiEmail ?? existingSettings?.apiEmail
    const hasNewKey = data.apiKey !== undefined && data.apiKey !== ''
    const hasExistingKey = !!existingSettings?.apiKeyHash

    updateData.isConfigured = !!(newEmail && (hasNewKey || hasExistingKey))

    // Upsert settings
    const settings = await prisma.vyfakturujSettings.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        ...updateData,
      } as Parameters<typeof prisma.vyfakturujSettings.create>[0]['data'],
      update: updateData,
    })

    // If credentials were updated and are complete, refresh cached settings
    if (settings.isConfigured && settings.apiEmail && settings.apiKeyHash) {
      try {
        const apiKey = decrypt(settings.apiKeyHash)
        if (apiKey) {
          const client = new VyfakturujClient(settings.apiEmail, apiKey)

          // Fetch and cache settings from Vyfakturuj
          const [paymentMethods, numberSeries, tags] = await Promise.all([
            client.getPaymentMethods(),
            client.getNumberSeries(),
            client.getTags(),
          ])

          await prisma.vyfakturujSettings.update({
            where: { id: 'singleton' },
            data: {
              cachedPaymentMethods: paymentMethods as unknown as Parameters<typeof prisma.vyfakturujSettings.update>[0]['data']['cachedPaymentMethods'],
              cachedNumberSeries: numberSeries as unknown as Parameters<typeof prisma.vyfakturujSettings.update>[0]['data']['cachedNumberSeries'],
              cachedTags: tags as unknown as Parameters<typeof prisma.vyfakturujSettings.update>[0]['data']['cachedTags'],
              cacheUpdatedAt: new Date(),
            },
          })
        }
      } catch (cacheError) {
        console.error('Failed to refresh Vyfakturuj cache:', cacheError)
        // Don't fail the request if caching fails
      }
    }

    // Return updated settings without the encrypted key
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKeyHash, ...safeSettings } = settings

    return NextResponse.json({
      data: {
        ...safeSettings,
        hasApiKey: !!apiKeyHash,
      },
    })
  } catch (error) {
    console.error('Error updating Vyfakturuj settings:', error)
    return NextResponse.json(
      { error: 'Failed to update Vyfakturuj settings' },
      { status: 500 }
    )
  }
}
