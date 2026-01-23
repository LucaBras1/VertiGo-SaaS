/**
 * Public API Route: /api/public/orders
 * Handles public order submissions from the website
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publicOrderSchema, VENUE_TYPES } from '@/lib/validations/public-order'
import { sendEmail } from '@/lib/email'
import { generateOrderConfirmationEmail, generateAdminOrderNotificationEmail } from '@/lib/email/templates/order-confirmation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true
  }

  record.count++
  return false
}

/**
 * POST /api/public/orders
 * Create a new order from public website form
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Příliš mnoho požadavků. Zkuste to prosím za chvíli.',
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Check honeypot
    if (body.website && body.website.length > 0) {
      // Silently accept but don't process (bot detected)
      return NextResponse.json({
        success: true,
        orderNumber: 'PROCESSED',
        message: 'Poptávka byla úspěšně odeslána.',
      })
    }

    // Validate input
    const validationResult = publicOrderSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ')
      return NextResponse.json(
        {
          success: false,
          error: errors,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { email: data.email.toLowerCase() },
    })

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          organization: data.organization || null,
          organizationType: data.venueType,
          billingInfo: data.ico ? {
            ico: data.ico,
            companyName: data.organization,
          } : undefined,
          source: 'website',
          gdprConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
          },
        },
      })
    } else {
      // Update existing customer with new info if provided
      const updateData: any = {}
      if (data.phone && !customer.phone) updateData.phone = data.phone
      if (data.organization && !customer.organization) updateData.organization = data.organization
      if (data.ico) {
        updateData.billingInfo = {
          ...(customer.billingInfo as object || {}),
          ico: data.ico,
          companyName: data.organization || customer.organization,
        }
      }

      if (Object.keys(updateData).length > 0) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: updateData,
        })
      }
    }

    // Generate order number (format: YYYY-NNN)
    const year = new Date().getFullYear()
    const orderCount = await prisma.order.count({
      where: {
        orderNumber: {
          startsWith: `${year}-`,
        },
      },
    })
    const orderNumber = `${year}-${String(orderCount + 1).padStart(3, '0')}`

    // Build dates array
    const dates = [data.preferredDate]
    if (data.alternativeDate) {
      dates.push(data.alternativeDate)
    }

    // Build venue object
    const venue = {
      name: data.organization || `${data.firstName} ${data.lastName}`,
      city: data.venueCity,
      type: data.venueType,
      typeLabel: VENUE_TYPES[data.venueType],
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        source: 'website',
        status: 'new',
        eventName: data.performanceTitle || null,
        dates,
        venue,
        contactMessage: data.message || null,
        technicalRequirements: data.audienceCount ? {
          audienceCount: data.audienceCount,
        } : undefined,
        contacts: {
          primary: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
          },
        },
        items: data.performanceId ? {
          create: [{
            performanceId: data.performanceId,
            date: data.preferredDate,
            price: 0,
          }],
        } : undefined,
      },
      include: {
        customer: true,
        items: {
          include: {
            performance: true,
          },
        },
      },
    })

    // Get settings for email configuration
    const settings = await prisma.settings.findFirst()

    // Send confirmation email to customer
    try {
      const { html: customerHtml, text: customerText } = generateOrderConfirmationEmail({
        orderNumber,
        customerName: `${data.firstName} ${data.lastName}`,
        performanceTitle: data.performanceTitle,
        preferredDate: data.preferredDate,
        alternativeDate: data.alternativeDate,
        venueCity: data.venueCity,
        venueType: VENUE_TYPES[data.venueType],
        companyName: settings?.offerEmailCompanyName || 'Divadlo Studna',
        companyEmail: settings?.offerEmailCompanyEmail || settings?.contactEmail || '',
        companyWeb: settings?.offerEmailCompanyWeb || '',
      })

      await sendEmail({
        to: data.email,
        subject: `Potvrzení poptávky #${orderNumber}`,
        html: customerHtml,
        text: customerText,
      })
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError)
      // Don't fail the order creation if email fails
    }

    // Send notification to admin
    try {
      const adminEmail = settings?.emailTo || settings?.contactEmail
      if (adminEmail) {
        const { html: adminHtml, text: adminText } = generateAdminOrderNotificationEmail({
          orderNumber,
          orderId: order.id,
          customerName: `${data.firstName} ${data.lastName}`,
          customerEmail: data.email,
          customerPhone: data.phone,
          organization: data.organization,
          performanceTitle: data.performanceTitle,
          preferredDate: data.preferredDate,
          alternativeDate: data.alternativeDate,
          venueCity: data.venueCity,
          venueType: VENUE_TYPES[data.venueType],
          audienceCount: data.audienceCount,
          message: data.message,
        })

        await sendEmail({
          to: adminEmail,
          subject: `🎭 Nová poptávka z webu #${orderNumber}`,
          html: adminHtml,
          text: adminText,
        })
      }
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Poptávka byla úspěšně odeslána. Brzy se vám ozveme!',
    })
  } catch (error) {
    console.error('Error creating public order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Něco se pokazilo. Zkuste to prosím znovu nebo nás kontaktujte telefonicky.',
      },
      { status: 500 }
    )
  }
}
