import { NextRequest, NextResponse } from 'next/server'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const subjectLabels: Record<string, string> = {
  info: 'Dotaz na představení',
  technical: 'Technické požadavky',
  collaboration: 'Spolupráce',
  other: 'Něco jiného',
  // Legacy values for old messages
  reservation: 'Objednávka představení',
  price: 'Cenová nabídka',
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Sanitize input by trimming and limiting length
 */
function sanitizeInput(input: string, maxLength: number = 1000): string {
  return escapeHtml(input.trim().slice(0, maxLength))
}

export async function POST(request: NextRequest) {
  let savedMessageId: string | null = null

  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimitResult = rateLimiters.contactForm(ip)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Příliš mnoho požadavků. Zkuste to prosím později.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const rawData = await request.json()

    // Sanitize all input data
    const data: ContactFormData = {
      name: sanitizeInput(rawData.name || '', 100),
      email: sanitizeInput(rawData.email || '', 254),
      phone: sanitizeInput(rawData.phone || '', 20),
      subject: sanitizeInput(rawData.subject || '', 50),
      message: sanitizeInput(rawData.message || '', 5000),
    }

    // Validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'Všechna povinná pole musí být vyplněna.' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Neplatná e-mailová adresa.' },
        { status: 400 }
      )
    }

    // Get user agent for logging
    const userAgent = request.headers.get('user-agent') || undefined

    // FIRST: Save message to database (záloha)
    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        status: 'received',
        ipAddress: ip,
        userAgent: userAgent,
      },
    })
    savedMessageId = savedMessage.id
    console.log(`📥 Zpráva uložena do DB: ${savedMessageId}`)

    // THEN: Try to send email
    const nodemailer = await import('nodemailer')

    // Load SMTP settings from database (with fallback to .env)
    const settings = await prisma.settings.findFirst()

    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST || 'localhost'
    const smtpPort = settings?.smtpPort || parseInt(process.env.SMTP_PORT || '587')
    const smtpSecure = settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true')
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER
    const smtpPassword = settings?.smtpPassword || process.env.SMTP_PASSWORD
    const emailFrom = settings?.emailFrom || process.env.EMAIL_FROM || '"Divadlo Studna Web" <noreply@divadlo-studna.cz>'
    const emailTo = settings?.emailTo || process.env.EMAIL_TO || 'produkce@divadlo-studna.cz'

    // Create transporter with SMTP configuration
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser && smtpPassword ? {
        user: smtpUser,
        pass: smtpPassword,
      } : undefined,
    })

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #D32F2F; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #D32F2F; }
          .value { margin-left: 10px; }
          .footer { padding: 10px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nová zpráva z webu Divadlo Studna</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Jméno:</span>
              <span class="value">${data.name}</span>
            </div>
            <div class="field">
              <span class="label">E-mail:</span>
              <span class="value">${data.email}</span>
            </div>
            <div class="field">
              <span class="label">Telefon:</span>
              <span class="value">${data.phone || 'neuvedeno'}</span>
            </div>
            <div class="field">
              <span class="label">Předmět:</span>
              <span class="value">${subjectLabels[data.subject] || data.subject}</span>
            </div>
            <div class="field">
              <span class="label">Zpráva:</span>
              <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${data.message}</div>
            </div>
          </div>
          <div class="footer">
            <p>ID zprávy: ${savedMessageId}</p>
            <p>Zpráva je zálohována v administraci.</p>
          </div>
        </div>
      </body>
      </html>
    `

    let emailSent = false
    let emailError: string | null = null

    try {
      // Send email to admin
      await transporter.sendMail({
        from: emailFrom,
        to: emailTo,
        replyTo: data.email,
        subject: `Nová zpráva z webu: ${subjectLabels[data.subject] || data.subject}`,
        html: emailHtml,
        text: `
Nová zpráva z webu Divadlo Studna

Jméno: ${data.name}
E-mail: ${data.email}
Telefon: ${data.phone || 'neuvedeno'}
Předmět: ${subjectLabels[data.subject] || data.subject}

Zpráva:
${data.message}

---
ID zprávy: ${savedMessageId}
        `.trim(),
      })

      emailSent = true
      console.log('✅ E-mail úspěšně odeslán z kontaktního formuláře')

      // Send copy to the sender if enabled
      const copyEnabled = settings?.contactFormCopyEnabled ?? true
      if (copyEnabled) {
        try {
          const copyReplyTo = settings?.contactFormCopyEmail || settings?.contactEmail || emailTo
          const companyName = settings?.offerEmailCompanyName || 'Divadlo Studna'

          const copyHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #D32F2F; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #D32F2F; }
                .value { margin-left: 10px; }
                .footer { padding: 15px; font-size: 14px; color: #666; text-align: center; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Kopie vaší zprávy</h2>
                </div>
                <div class="content">
                  <p>Dobrý den,</p>
                  <p>děkujeme za vaši zprávu. Toto je kopie, kterou jste nám zaslali. Brzy se vám ozveme.</p>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                  <div class="field">
                    <span class="label">Předmět:</span>
                    <span class="value">${subjectLabels[data.subject] || data.subject}</span>
                  </div>
                  <div class="field">
                    <span class="label">Zpráva:</span>
                    <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${data.message}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>${companyName}</p>
                  <p>Na tento email můžete přímo odpovědět.</p>
                </div>
              </div>
            </body>
            </html>
          `

          await transporter.sendMail({
            from: emailFrom,
            to: data.email,
            replyTo: copyReplyTo,
            subject: `Kopie vaší zprávy: ${subjectLabels[data.subject] || data.subject}`,
            html: copyHtml,
            text: `
Kopie vaší zprávy

Dobrý den,
děkujeme za vaši zprávu. Toto je kopie, kterou jste nám zaslali. Brzy se vám ozveme.

---
Předmět: ${subjectLabels[data.subject] || data.subject}

${data.message}

---
${companyName}
Na tento email můžete přímo odpovědět.
            `.trim(),
          })

          console.log('✅ Kopie zprávy odeslána odesílateli')
        } catch (copyError: any) {
          console.error('⚠️ Nepodařilo se odeslat kopii odesílateli:', copyError.message)
          // Don't fail the main flow if copy fails
        }
      }
    } catch (err: any) {
      emailError = err.message || 'Neznámá chyba při odesílání emailu'
      console.error('❌ Chyba při odesílání e-mailu:', emailError)
    }

    // Update message status in database
    await prisma.contactMessage.update({
      where: { id: savedMessageId },
      data: {
        status: emailSent ? 'email_sent' : 'email_failed',
        emailSentAt: emailSent ? new Date() : null,
        emailError: emailError,
      },
    })

    // Return appropriate response
    if (emailSent) {
      return NextResponse.json(
        {
          success: true,
          message: 'Zpráva byla úspěšně odeslána.',
        },
        { status: 200 }
      )
    } else {
      // Email failed but message is saved - inform user
      return NextResponse.json(
        {
          success: true,
          message: 'Zpráva byla přijata. Ozveme se vám co nejdříve.',
          warning: 'Automatický email se nepodařilo odeslat, ale vaše zpráva byla uložena.',
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Chyba při zpracování kontaktního formuláře:', error)

    // If we saved the message, update its status
    if (savedMessageId) {
      try {
        await prisma.contactMessage.update({
          where: { id: savedMessageId },
          data: {
            status: 'email_failed',
            emailError: error instanceof Error ? error.message : 'Unknown error',
          },
        })
      } catch (updateError) {
        console.error('Failed to update message status:', updateError)
      }
    }

    return NextResponse.json(
      { error: 'Nastala chyba při odesílání zprávy.' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS - restricted to same origin
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = [
    process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'https://divadlo-studna.cz',
    'https://www.divadlo-studna.cz',
  ]

  // Only allow configured origins or same-origin requests
  const isAllowed = !origin || allowedOrigins.includes(origin)

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : '',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
