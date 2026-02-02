import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  getWidgetByToken,
  createInquiry,
  checkRateLimit,
} from '@/lib/services/booking-widget'

export const dynamic = 'force-dynamic'

// CORS headers for embedding
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const submitSchema = z.object({
  clientName: z.string().min(2, 'Name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().optional(),
  eventType: z.string().min(1, 'Event type is required'),
  eventDate: z.string().datetime({ message: 'Valid date is required' }),
  venue: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  message: z.string().max(2000).optional(),
  // Honeypot field - should be empty
  website: z.string().max(0).optional(),
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Get widget
    const widget = await getWidgetByToken(token)
    if (!widget || !widget.isActive) {
      return NextResponse.json(
        { error: 'Widget not found or inactive' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') || undefined

    // Check rate limit
    const rateLimit = await checkRateLimit(widget.id, ipAddress)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason },
        { status: 429, headers: corsHeaders }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const validated = submitSchema.parse(body)

    // Honeypot check - if website field is filled, it's a bot
    if (validated.website) {
      // Silently accept but don't save (pretend success)
      return NextResponse.json(
        { success: true, message: widget.successMessage || 'Thank you for your inquiry!' },
        { headers: corsHeaders }
      )
    }

    // Validate event type is allowed
    if (!widget.allowedEventTypes.includes(validated.eventType)) {
      return NextResponse.json(
        { error: 'This event type is not accepted' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate minimum notice
    const eventDate = new Date(validated.eventDate)
    const minDate = new Date(Date.now() + widget.minNoticeHours * 60 * 60 * 1000)
    if (eventDate < minDate) {
      return NextResponse.json(
        { error: `Please book at least ${widget.minNoticeHours} hours in advance` },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create inquiry
    const inquiry = await createInquiry({
      widgetId: widget.id,
      tenantId: widget.tenantId,
      clientName: validated.clientName,
      clientEmail: validated.clientEmail,
      clientPhone: validated.clientPhone,
      eventType: validated.eventType,
      eventDate,
      venue: validated.venue,
      message: validated.message,
      ipAddress,
      userAgent,
    })

    // Send notification email to musician (async, don't block)
    sendNotificationEmail(widget, inquiry).catch(console.error)

    // Send confirmation email to client (async, don't block)
    sendConfirmationEmail(widget, inquiry).catch(console.error)

    return NextResponse.json(
      {
        success: true,
        message: widget.successMessage || 'Thank you for your inquiry! We will get back to you soon.',
        inquiryId: inquiry.id,
      },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400, headers: corsHeaders }
      )
    }
    console.error('POST /api/public/widget/[token]/submit error:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Send notification email to musician
async function sendNotificationEmail(
  widget: Awaited<ReturnType<typeof getWidgetByToken>>,
  inquiry: { clientName: string; clientEmail: string; eventType: string; eventDate: Date; message?: string | null }
) {
  if (!widget?.tenant.email) return

  const { sendEmail } = await import('@/lib/email')
  const {
    musiciansTheme,
    generateButton,
    generateInfoBox,
    wrapInBaseTemplate,
  } = await import('@vertigo/email')

  const inquiryDetails = `
    <p style="margin: 5px 0;"><strong>Klient:</strong> ${inquiry.clientName}</p>
    <p style="margin: 5px 0;"><strong>Email:</strong> ${inquiry.clientEmail}</p>
    <p style="margin: 5px 0;"><strong>Typ akce:</strong> ${inquiry.eventType}</p>
    <p style="margin: 5px 0;"><strong>Datum:</strong> ${inquiry.eventDate.toLocaleDateString('cs-CZ')}</p>
    ${inquiry.message ? `<p style="margin: 5px 0;"><strong>Zpráva:</strong> ${inquiry.message}</p>` : ''}
  `

  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/gigs`

  const content = `
    <p style="font-size: 16px;">Nová poptávka přes rezervační widget!</p>
    ${generateInfoBox(inquiryDetails, musiciansTheme.primaryColor)}
    ${generateButton('Zobrazit v dashboardu', dashboardUrl, musiciansTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Odpovězte co nejdříve pro vyšší šanci na uzavření zakázky.</p>
  `

  const html = wrapInBaseTemplate(musiciansTheme, content, { title: 'Nová poptávka' })

  await sendEmail({
    to: widget.tenant.email,
    subject: `Nová poptávka: ${inquiry.eventType} - ${inquiry.clientName}`,
    html,
    text: `Nová poptávka: ${inquiry.clientName} (${inquiry.clientEmail}) - ${inquiry.eventType} dne ${inquiry.eventDate.toLocaleDateString('cs-CZ')}`,
  })
}

// Send confirmation email to client
async function sendConfirmationEmail(
  widget: Awaited<ReturnType<typeof getWidgetByToken>>,
  inquiry: { clientName: string; clientEmail: string; eventType: string; eventDate: Date }
) {
  const { sendEmail } = await import('@/lib/email')
  const {
    musiciansTheme,
    generateInfoBox,
    wrapInBaseTemplate,
  } = await import('@vertigo/email')

  const bandName = widget?.displayName || widget?.tenant.bandName || 'the band'

  const bookingDetails = `
    <p style="margin: 5px 0;"><strong>Typ akce:</strong> ${inquiry.eventType}</p>
    <p style="margin: 5px 0;"><strong>Datum:</strong> ${inquiry.eventDate.toLocaleDateString('cs-CZ')}</p>
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${inquiry.clientName}</strong>!</p>
    <p>Děkujeme za vaši poptávku. ${bandName} se vám ozve co nejdříve.</p>
    ${generateInfoBox(bookingDetails, widget?.primaryColor || musiciansTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Pokud máte jakékoliv dotazy, neváhejte nás kontaktovat.</p>
  `

  const html = wrapInBaseTemplate(musiciansTheme, content, { title: 'Potvrzení poptávky' })

  await sendEmail({
    to: inquiry.clientEmail,
    subject: `Potvrzení poptávky - ${bandName}`,
    html,
    text: `Dobrý den, ${inquiry.clientName}! Děkujeme za vaši poptávku na ${inquiry.eventType} dne ${inquiry.eventDate.toLocaleDateString('cs-CZ')}. ${bandName} se vám ozve co nejdříve.`,
  })
}
