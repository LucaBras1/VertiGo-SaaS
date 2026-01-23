/**
 * Vyfakturuj Webhook Handler
 *
 * POST /api/webhooks/vyfakturuj
 *
 * Přijímá notifikace o:
 * - Úhradě faktury (invoice.paid)
 * - Změně stavu faktury (invoice.updated)
 * - Vytvoření faktury (invoice.created)
 * - Stornování faktury (invoice.cancelled)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { INVOICE_FLAGS } from '@/types/vyfakturuj'

// ============================================================================
// TYPES
// ============================================================================

interface VyfakturujWebhookPayload {
  event: string
  timestamp?: string
  invoice?: {
    id: number
    number: string
    type: number
    flags: number
    total: string
    date_paid?: string
    VS?: number
    url_public_webpage?: string
    url_download_pdf?: string
  }
  contact?: {
    id: number
    name: string
    IC?: string
    mail_to?: string
  }
}

type WebhookLogStatus = 'success' | 'error' | 'ignored'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verify webhook signature using HMAC SHA256
 */
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    // Use timing-safe comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Map Vyfakturuj flags to local invoice status
 */
function mapFlagsToStatus(flags: number): 'draft' | 'sent' | 'paid' | 'cancelled' {
  if (flags & INVOICE_FLAGS.STORNOVANO) return 'cancelled'
  if (flags & INVOICE_FLAGS.UHRAZENO) return 'paid'
  if (flags & INVOICE_FLAGS.ODESLANO_EMAILEM) return 'sent'
  return 'draft'
}

/**
 * Log webhook event to database
 */
async function logWebhookEvent(
  event: string,
  payload: unknown,
  status: WebhookLogStatus,
  error?: string,
  invoiceId?: string,
  customerId?: string
): Promise<void> {
  try {
    await prisma.webhookLog.create({
      data: {
        source: 'vyfakturuj',
        event,
        payload: payload as Parameters<typeof prisma.webhookLog.create>[0]['data']['payload'],
        status,
        error,
        invoiceId,
        customerId,
      },
    })
  } catch (logError) {
    console.error('Failed to log webhook event:', logError)
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(
  invoiceData: NonNullable<VyfakturujWebhookPayload['invoice']>
): Promise<{ success: boolean; message: string; invoiceId?: string }> {
  // Find local invoice by vyfakturujId
  const invoice = await prisma.invoice.findFirst({
    where: { vyfakturujId: invoiceData.id },
  })

  if (!invoice) {
    return {
      success: false,
      message: `Invoice not found for Vyfakturuj ID: ${invoiceData.id}`,
    }
  }

  // Parse paid date
  let paidDate: Date | null = null
  if (invoiceData.date_paid && invoiceData.date_paid !== '0000-00-00') {
    paidDate = new Date(invoiceData.date_paid)
  } else {
    paidDate = new Date()
  }

  // Parse paid amount (convert from string to cents)
  const paidAmount = Math.round(parseFloat(invoiceData.total) * 100)

  // Update local invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'paid',
      paidDate,
      paidAmount,
      vyfakturujFlags: invoiceData.flags,
      vyfakturujSyncedAt: new Date(),
    },
  })

  console.log(`[Webhook] Invoice ${invoice.invoiceNumber} marked as paid`)

  return {
    success: true,
    message: `Invoice ${invoice.invoiceNumber} marked as paid`,
    invoiceId: invoice.id,
  }
}

/**
 * Handle invoice.updated event
 */
async function handleInvoiceUpdated(
  invoiceData: NonNullable<VyfakturujWebhookPayload['invoice']>
): Promise<{ success: boolean; message: string; invoiceId?: string }> {
  const invoice = await prisma.invoice.findFirst({
    where: { vyfakturujId: invoiceData.id },
  })

  if (!invoice) {
    return {
      success: false,
      message: `Invoice not found for Vyfakturuj ID: ${invoiceData.id}`,
    }
  }

  // Determine new status from flags
  const newStatus = mapFlagsToStatus(invoiceData.flags)

  // Parse paid date if invoice is paid
  let paidDate: Date | null = invoice.paidDate
  let paidAmount = invoice.paidAmount || 0

  if (newStatus === 'paid' && invoiceData.date_paid && invoiceData.date_paid !== '0000-00-00') {
    paidDate = new Date(invoiceData.date_paid)
    paidAmount = Math.round(parseFloat(invoiceData.total) * 100)
  }

  // Update local invoice
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: newStatus,
      paidDate: newStatus === 'paid' ? paidDate : invoice.paidDate,
      paidAmount: newStatus === 'paid' ? paidAmount : invoice.paidAmount,
      vyfakturujFlags: invoiceData.flags,
      vyfakturujSyncedAt: new Date(),
      publicUrl: invoiceData.url_public_webpage || invoice.publicUrl,
    },
  })

  console.log(`[Webhook] Invoice ${invoice.invoiceNumber} updated to status: ${newStatus}`)

  return {
    success: true,
    message: `Invoice ${invoice.invoiceNumber} updated to status: ${newStatus}`,
    invoiceId: invoice.id,
  }
}

/**
 * Handle invoice.cancelled event
 */
async function handleInvoiceCancelled(
  invoiceData: NonNullable<VyfakturujWebhookPayload['invoice']>
): Promise<{ success: boolean; message: string; invoiceId?: string }> {
  const invoice = await prisma.invoice.findFirst({
    where: { vyfakturujId: invoiceData.id },
  })

  if (!invoice) {
    return {
      success: false,
      message: `Invoice not found for Vyfakturuj ID: ${invoiceData.id}`,
    }
  }

  // Update local invoice to cancelled
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: 'cancelled',
      vyfakturujFlags: invoiceData.flags,
      vyfakturujSyncedAt: new Date(),
    },
  })

  console.log(`[Webhook] Invoice ${invoice.invoiceNumber} cancelled`)

  return {
    success: true,
    message: `Invoice ${invoice.invoiceNumber} cancelled`,
    invoiceId: invoice.id,
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  let payload = ''
  let data: VyfakturujWebhookPayload | null = null

  try {
    // Get headers
    const signature = request.headers.get('X-Vyfakturuj-Signature') ||
                      request.headers.get('x-vyfakturuj-signature')

    // Read raw payload for signature verification
    payload = await request.text()

    // Get webhook secret from settings
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings) {
      console.error('[Webhook] Vyfakturuj settings not found')
      await logWebhookEvent('unknown', { raw: payload }, 'error', 'Settings not found')
      return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    }

    // Verify signature if secret is configured
    if (settings.webhookSecret && signature) {
      if (!verifySignature(payload, signature, settings.webhookSecret)) {
        console.error('[Webhook] Invalid signature')
        await logWebhookEvent('unknown', { raw: payload }, 'error', 'Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } else if (settings.webhookSecret && !signature) {
      // Secret is configured but no signature provided
      console.warn('[Webhook] No signature provided but secret is configured')
    }

    // Parse payload
    try {
      data = JSON.parse(payload) as VyfakturujWebhookPayload
    } catch {
      console.error('[Webhook] Invalid JSON payload')
      await logWebhookEvent('unknown', { raw: payload }, 'error', 'Invalid JSON')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const event = data.event || 'unknown'

    // Handle different event types
    let result: { success: boolean; message: string; invoiceId?: string }

    switch (event) {
      case 'invoice.paid':
        if (!data.invoice) {
          result = { success: false, message: 'Missing invoice data' }
        } else {
          result = await handleInvoicePaid(data.invoice)
        }
        break

      case 'invoice.updated':
        if (!data.invoice) {
          result = { success: false, message: 'Missing invoice data' }
        } else {
          result = await handleInvoiceUpdated(data.invoice)
        }
        break

      case 'invoice.cancelled':
      case 'invoice.storno':
        if (!data.invoice) {
          result = { success: false, message: 'Missing invoice data' }
        } else {
          result = await handleInvoiceCancelled(data.invoice)
        }
        break

      case 'invoice.created':
        // We usually create invoices ourselves, so just log this
        console.log('[Webhook] Invoice created event received:', data.invoice?.id)
        result = { success: true, message: 'Invoice created event acknowledged' }
        break

      case 'test':
      case 'ping':
        // Test/ping event from Vyfakturuj
        console.log('[Webhook] Test/ping event received')
        result = { success: true, message: 'Webhook is working' }
        break

      default:
        console.log('[Webhook] Unknown event type:', event)
        result = { success: true, message: `Unknown event type: ${event}` }
    }

    // Log the webhook event
    await logWebhookEvent(
      event,
      data,
      result.success ? 'success' : 'error',
      result.success ? undefined : result.message,
      result.invoiceId
    )

    return NextResponse.json({
      success: result.success,
      message: result.message,
    })

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)

    // Log the error
    await logWebhookEvent(
      data?.event || 'unknown',
      data || { raw: payload },
      'error',
      error instanceof Error ? error.message : 'Unknown error'
    )

    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Health check endpoint for webhook
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Vyfakturuj webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  })
}
