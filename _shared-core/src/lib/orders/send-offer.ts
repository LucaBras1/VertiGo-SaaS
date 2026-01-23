/**
 * Shared Order Offer Service
 *
 * Handles sending offer emails to customers with confirmation links.
 * Used by both automatic sending (on order creation) and manual resend.
 * Supports configurable email templates from database settings.
 */

import { prisma } from '@/lib/prisma'
import { sendEmail, getBaseUrl } from '@/lib/email'
import {
  generateOfferEmailHtml,
  generateOfferEmailText,
  getOfferEmailSubject,
  EmailTemplateSettings,
} from '@/lib/email/templates/offer-email'
import { randomUUID } from 'crypto'

// Default token expiration in days (can be overridden in settings)
const DEFAULT_TOKEN_EXPIRY_DAYS = 7

export interface SendOfferResult {
  success: boolean
  error?: string
  confirmationUrl?: string
  expiresAt?: string
}

/**
 * Send order offer email to customer
 *
 * This function:
 * 1. Loads order with items
 * 2. Validates customer has email
 * 3. Generates confirmation token (valid for 7 days)
 * 4. Updates order with token and sets status to 'quote_sent'
 * 5. Sends email with confirmation link
 * 6. Logs communication
 * 7. Reverts changes if email fails
 *
 * @param orderId - The order ID to send offer for
 * @param previousStatus - Optional previous status to revert to on email failure (default: 'new')
 * @returns SendOfferResult with success status and confirmation URL or error
 */
export async function sendOrderOffer(
  orderId: string,
  previousStatus: string = 'new'
): Promise<SendOfferResult> {
  try {
    // Load email template settings from database
    const settings = await prisma.settings.findFirst({
      select: {
        offerEmailSubject: true,
        offerEmailGreeting: true,
        offerEmailIntro: true,
        offerEmailFooterNote: true,
        offerEmailCompanyName: true,
        offerEmailCompanyEmail: true,
        offerEmailCompanyWeb: true,
        offerEmailLinkExpiry: true,
      },
    })

    // Prepare email template settings
    const emailSettings: EmailTemplateSettings = {
      subject: settings?.offerEmailSubject,
      greeting: settings?.offerEmailGreeting,
      intro: settings?.offerEmailIntro,
      footerNote: settings?.offerEmailFooterNote,
      companyName: settings?.offerEmailCompanyName,
      companyEmail: settings?.offerEmailCompanyEmail,
      companyWeb: settings?.offerEmailCompanyWeb,
    }

    // Token expiry from settings or default
    const tokenExpiryDays = settings?.offerEmailLinkExpiry || DEFAULT_TOKEN_EXPIRY_DAYS

    // Get order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            performance: true,
            game: true,
            service: true,
          },
        },
      },
    })

    if (!order) {
      return {
        success: false,
        error: 'Objednavka nenalezena',
      }
    }

    // Check if order has a customer
    if (!order.customerId) {
      return {
        success: false,
        error: 'Objednavka nema prirazeneho zakaznika',
      }
    }

    // Get customer from Prisma
    const customer = await prisma.customer.findUnique({
      where: { id: order.customerId },
    })

    if (!customer) {
      return {
        success: false,
        error: 'Zakaznik nenalezen',
      }
    }

    if (!customer.email) {
      return {
        success: false,
        error: 'Zakaznik nema email',
      }
    }

    // Generate confirmation token
    const confirmationToken = randomUUID()
    const confirmationTokenExp = new Date()
    confirmationTokenExp.setDate(confirmationTokenExp.getDate() + tokenExpiryDays)

    // Update order with token and set status to quote_sent
    await prisma.order.update({
      where: { id: orderId },
      data: {
        confirmationToken,
        confirmationTokenExp,
        status: 'quote_sent',
        // Clear previous confirmation data if resending
        confirmedAt: null,
        confirmedByName: null,
        confirmedByEmail: null,
        customerComments: null,
      },
    })

    // Build confirmation URL
    const baseUrl = getBaseUrl()
    const confirmationUrl = `${baseUrl}/potvrzeni/${confirmationToken}`

    // Prepare email data
    const pricing = (order.pricing as any) || {}
    const venue = (order.venue as any) || {}
    const dates = (order.dates as string[]) || []

    // Map order items to email format
    const emailItems = order.items.map((item) => {
      const name =
        item.performance?.title || item.game?.title || item.service?.title || 'Polozka'
      return {
        name,
        date: item.date || undefined,
        startTime: item.startTime || undefined,
        endTime: item.endTime || undefined,
        price: item.price || 0,
      }
    })

    const emailData = {
      orderNumber: order.orderNumber,
      eventName: order.eventName || '',
      dates,
      venue: {
        name: venue.name || '',
        street: venue.street,
        city: venue.city,
        postalCode: venue.postalCode,
      },
      items: emailItems,
      pricing: {
        subtotal: pricing.subtotal,
        travelCosts: pricing.travelCosts,
        discount: pricing.discount,
        totalPrice: pricing.totalPrice || 0,
        vatIncluded: pricing.vatIncluded,
      },
      customer: {
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        organization: customer.organization || undefined,
        email: customer.email,
      },
      confirmationUrl,
      expirationDate: confirmationTokenExp,
    }

    // Generate email content with configurable settings
    const emailHtml = generateOfferEmailHtml(emailData, emailSettings)
    const emailText = generateOfferEmailText(emailData, emailSettings)
    const subject = getOfferEmailSubject(order.eventName || '', emailSettings)

    // Send email
    const emailSent = await sendEmail({
      to: customer.email,
      subject,
      html: emailHtml,
      text: emailText,
    })

    if (!emailSent) {
      // Revert status change if email failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          confirmationToken: null,
          confirmationTokenExp: null,
          status: previousStatus,
        },
      })

      return {
        success: false,
        error: 'Nepodarilo se odeslat email',
      }
    }

    // Log communication
    await prisma.communication.create({
      data: {
        type: 'email',
        direction: 'outgoing',
        subject,
        content: `Nabidka odeslana na ${customer.email}. Odkaz: ${confirmationUrl}, platny do: ${confirmationTokenExp.toISOString()}`,
        customerId: order.customerId,
        orderId: order.id,
      },
    })

    return {
      success: true,
      confirmationUrl,
      expiresAt: confirmationTokenExp.toISOString(),
    }
  } catch (error) {
    console.error('Error sending offer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chyba pri odesilani nabidky',
    }
  }
}

/**
 * Check if customer has valid email for sending offer
 *
 * @param customerId - Customer ID to check
 * @returns Object with hasEmail boolean and optional error message
 */
export async function validateCustomerForOffer(
  customerId: string
): Promise<{ hasEmail: boolean; error?: string }> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true },
    })

    if (!customer) {
      return { hasEmail: false, error: 'Zakaznik nenalezen' }
    }

    if (!customer.email) {
      return { hasEmail: false, error: 'Zakaznik nema email - nelze odeslat nabidku' }
    }

    return { hasEmail: true }
  } catch (error) {
    return {
      hasEmail: false,
      error: error instanceof Error ? error.message : 'Chyba pri overovani zakaznika',
    }
  }
}
