/**
 * Public API Route: /api/public/organizer-orders
 * Handles complex order submissions from the organizer page
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { organizerOrderSchema, VENUE_TYPES, ITEM_TYPES } from '@/lib/validations/organizer-order'
import { sendEmail } from '@/lib/email'

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
 * POST /api/public/organizer-orders
 * Create a new complex order from organizer form
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
    const validationResult = organizerOrderSchema.safeParse(body)
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
      const updateData: Record<string, unknown> = {}
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
    if (data.alternativeDate1) dates.push(data.alternativeDate1)
    if (data.alternativeDate2) dates.push(data.alternativeDate2)

    // Build venue object
    const venue = {
      name: data.venueName || data.organization || `${data.firstName} ${data.lastName}`,
      street: data.venueStreet || null,
      city: data.venueCity,
      postalCode: data.venuePostalCode || null,
      type: data.venueType,
      typeLabel: VENUE_TYPES[data.venueType],
    }

    // Build technical requirements
    const technicalRequirements: { [key: string]: string | number | boolean } = {}
    if (data.audienceCount) technicalRequirements.audienceCount = data.audienceCount
    if (data.parking) technicalRequirements.parking = true
    if (data.electricityVoltage && data.electricityVoltage !== 'none') {
      technicalRequirements.electricity = true
      technicalRequirements.electricityVoltage = data.electricityVoltage
    }
    if (data.sound) technicalRequirements.sound = true
    if (data.lighting) technicalRequirements.lighting = true
    if (data.accommodation) {
      technicalRequirements.accommodation = true
      if (data.accommodationPersons) {
        technicalRequirements.accommodationPersons = data.accommodationPersons
      }
    }
    if (data.otherRequirements) {
      technicalRequirements.otherRequirements = data.otherRequirements
    }

    // Build event name from items
    const itemTitles = data.items
      .map(item => item.itemTitle)
      .filter(Boolean)
      .join(', ')

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        source: 'website',
        status: 'new',
        eventName: itemTitles || null,
        dates,
        venue,
        contactMessage: data.message || null,
        technicalRequirements: Object.keys(technicalRequirements).length > 0
          ? technicalRequirements
          : undefined,
        contacts: {
          primary: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
            ico: data.ico || undefined,
          },
        },
      },
    })

    // Create order items
    for (const item of data.items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          date: data.preferredDate,
          price: 0,
          notes: item.note || null,
          performanceId: item.type === 'performance' ? item.itemId : null,
          gameId: item.type === 'game' ? item.itemId : null,
          serviceId: item.type === 'service' ? item.itemId : null,
        },
      })
    }

    // Get settings for email configuration
    const settings = await prisma.settings.findFirst()

    // Send confirmation email to customer
    try {
      const itemsList = data.items
        .map(item => `- ${ITEM_TYPES[item.type]}: ${item.itemTitle}${item.note ? ` (${item.note})` : ''}`)
        .join('\n')

      const datesFormatted = dates
        .map(d => new Date(d).toLocaleDateString('cs-CZ'))
        .join(', ')

      const technicalList: string[] = []
      if (data.parking) technicalList.push('Parkování')
      if (data.electricityVoltage && data.electricityVoltage !== 'none') {
        technicalList.push(`Elektřina ${data.electricityVoltage}`)
      }
      if (data.sound) technicalList.push('Ozvučení')
      if (data.lighting) technicalList.push('Osvětlení')
      if (data.accommodation) {
        technicalList.push(`Ubytování pro ${data.accommodationPersons || 2} osoby`)
      }

      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B0000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-number { font-size: 24px; font-weight: bold; color: #8B0000; }
            .section { margin: 20px 0; padding: 15px; background: white; border-radius: 5px; }
            .section h3 { margin-top: 0; color: #8B0000; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Potvrzení poptávky</h1>
            </div>
            <div class="content">
              <p>Dobrý den, ${data.firstName} ${data.lastName},</p>
              <p>děkujeme za vaši poptávku. Číslo vaší poptávky je:</p>
              <p class="order-number">#${orderNumber}</p>

              <div class="section">
                <h3>Objednané položky:</h3>
                <pre>${itemsList}</pre>
              </div>

              <div class="section">
                <h3>Termín a místo:</h3>
                <p><strong>Termíny:</strong> ${datesFormatted}</p>
                <p><strong>Místo:</strong> ${venue.name}, ${venue.city}${venue.street ? `, ${venue.street}` : ''}</p>
                <p><strong>Typ akce:</strong> ${venue.typeLabel}</p>
                ${data.audienceCount ? `<p><strong>Počet diváků:</strong> ${data.audienceCount}</p>` : ''}
              </div>

              ${technicalList.length > 0 ? `
              <div class="section">
                <h3>Technické požadavky:</h3>
                <ul>
                  ${technicalList.map(t => `<li>${t}</li>`).join('')}
                </ul>
                ${data.otherRequirements ? `<p>${data.otherRequirements}</p>` : ''}
              </div>
              ` : ''}

              ${data.message ? `
              <div class="section">
                <h3>Vaše zpráva:</h3>
                <p>${data.message}</p>
              </div>
              ` : ''}

              <p>Do 24 hodin vám zašleme cenovou nabídku na míru.</p>
            </div>
            <div class="footer">
              <p>${settings?.offerEmailCompanyName || 'Divadlo Studna'}</p>
              <p>${settings?.offerEmailCompanyEmail || settings?.contactEmail || ''}</p>
            </div>
          </div>
        </body>
        </html>
      `

      const customerText = `
Potvrzení poptávky #${orderNumber}

Dobrý den, ${data.firstName} ${data.lastName},

děkujeme za vaši poptávku.

OBJEDNANÉ POLOŽKY:
${itemsList}

TERMÍN A MÍSTO:
Termíny: ${datesFormatted}
Místo: ${venue.name}, ${venue.city}${venue.street ? `, ${venue.street}` : ''}
Typ akce: ${venue.typeLabel}
${data.audienceCount ? `Počet diváků: ${data.audienceCount}` : ''}

${technicalList.length > 0 ? `TECHNICKÉ POŽADAVKY:\n${technicalList.join('\n')}${data.otherRequirements ? `\n${data.otherRequirements}` : ''}` : ''}

${data.message ? `VAŠE ZPRÁVA:\n${data.message}` : ''}

Do 24 hodin vám zašleme cenovou nabídku na míru.

${settings?.offerEmailCompanyName || 'Divadlo Studna'}
${settings?.offerEmailCompanyEmail || settings?.contactEmail || ''}
      `.trim()

      await sendEmail({
        to: data.email,
        subject: `Potvrzení poptávky #${orderNumber}`,
        html: customerHtml,
        text: customerText,
      })
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError)
    }

    // Send notification to admin
    try {
      const adminEmail = settings?.emailTo || settings?.contactEmail
      if (adminEmail) {
        const itemsList = data.items
          .map(item => `- ${ITEM_TYPES[item.type]}: ${item.itemTitle}${item.note ? ` (${item.note})` : ''}`)
          .join('\n')

        const datesFormatted = dates
          .map(d => new Date(d).toLocaleDateString('cs-CZ'))
          .join(', ')

        const technicalList: string[] = []
        if (data.parking) technicalList.push('Parkování')
        if (data.electricityVoltage && data.electricityVoltage !== 'none') {
          technicalList.push(`Elektřina ${data.electricityVoltage}`)
        }
        if (data.sound) technicalList.push('Ozvučení')
        if (data.lighting) technicalList.push('Osvětlení')
        if (data.accommodation) {
          technicalList.push(`Ubytování pro ${data.accommodationPersons || 2} osoby`)
        }

        const adminHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #8B0000; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .order-number { font-size: 24px; font-weight: bold; color: #8B0000; }
              .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
              .section h3 { margin-top: 0; color: #8B0000; }
              .btn { display: inline-block; padding: 12px 24px; background: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nová poptávka z webu</h1>
              </div>
              <div class="content">
                <p class="order-number">#${orderNumber}</p>

                <div class="section">
                  <h3>Kontakt:</h3>
                  <p><strong>Jméno:</strong> ${data.firstName} ${data.lastName}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Telefon:</strong> ${data.phone}</p>
                  ${data.organization ? `<p><strong>Organizace:</strong> ${data.organization}</p>` : ''}
                  ${data.ico ? `<p><strong>IČO:</strong> ${data.ico}</p>` : ''}
                </div>

                <div class="section">
                  <h3>Objednané položky (${data.items.length}):</h3>
                  <pre>${itemsList}</pre>
                </div>

                <div class="section">
                  <h3>Termín a místo:</h3>
                  <p><strong>Termíny:</strong> ${datesFormatted}</p>
                  <p><strong>Místo:</strong> ${venue.name}, ${venue.city}${venue.street ? `, ${venue.street}` : ''}${venue.postalCode ? `, ${venue.postalCode}` : ''}</p>
                  <p><strong>Typ akce:</strong> ${venue.typeLabel}</p>
                  ${data.audienceCount ? `<p><strong>Počet diváků:</strong> ${data.audienceCount}</p>` : ''}
                </div>

                ${technicalList.length > 0 || data.otherRequirements ? `
                <div class="section">
                  <h3>Technické požadavky:</h3>
                  ${technicalList.length > 0 ? `<ul>${technicalList.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
                  ${data.otherRequirements ? `<p>${data.otherRequirements}</p>` : ''}
                </div>
                ` : ''}

                ${data.message ? `
                <div class="section">
                  <h3>Zpráva od zákazníka:</h3>
                  <p>${data.message}</p>
                </div>
                ` : ''}

                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/orders/${order.id}" class="btn">
                  Otevřít v administraci
                </a>
              </div>
            </div>
          </body>
          </html>
        `

        const adminText = `
NOVÁ POPTÁVKA Z WEBU #${orderNumber}

KONTAKT:
Jméno: ${data.firstName} ${data.lastName}
Email: ${data.email}
Telefon: ${data.phone}
${data.organization ? `Organizace: ${data.organization}` : ''}
${data.ico ? `IČO: ${data.ico}` : ''}

OBJEDNANÉ POLOŽKY (${data.items.length}):
${itemsList}

TERMÍN A MÍSTO:
Termíny: ${datesFormatted}
Místo: ${venue.name}, ${venue.city}${venue.street ? `, ${venue.street}` : ''}${venue.postalCode ? `, ${venue.postalCode}` : ''}
Typ akce: ${venue.typeLabel}
${data.audienceCount ? `Počet diváků: ${data.audienceCount}` : ''}

${technicalList.length > 0 || data.otherRequirements ? `TECHNICKÉ POŽADAVKY:\n${technicalList.join('\n')}${data.otherRequirements ? `\n${data.otherRequirements}` : ''}` : ''}

${data.message ? `ZPRÁVA OD ZÁKAZNÍKA:\n${data.message}` : ''}

Otevřít v administraci: ${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/orders/${order.id}
        `.trim()

        await sendEmail({
          to: adminEmail,
          subject: `🎭 Nová poptávka z webu #${orderNumber} (${data.items.length} položek)`,
          html: adminHtml,
          text: adminText,
        })
      }
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      message: 'Poptávka byla úspěšně odeslána. Brzy se vám ozveme!',
    })
  } catch (error) {
    console.error('Error creating organizer order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Něco se pokazilo. Zkuste to prosím znovu nebo nás kontaktujte telefonicky.',
      },
      { status: 500 }
    )
  }
}
