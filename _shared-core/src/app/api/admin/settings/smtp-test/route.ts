/**
 * API Route: /api/admin/settings/smtp-test
 * Test SMTP configuration by sending a test email
 */

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/settings/smtp-test
 * Send test email with current SMTP settings from database
 */
export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Zadejte testovací email' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        { success: false, error: 'Neplatný formát emailu' },
        { status: 400 }
      )
    }

    // Load SMTP settings from database
    const settings = await prisma.settings.findFirst()

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Nastavení nebylo nalezeno' },
        { status: 400 }
      )
    }

    // Check required SMTP configuration
    const smtpHost = settings.smtpHost || process.env.SMTP_HOST
    const smtpPort = settings.smtpPort || parseInt(process.env.SMTP_PORT || '587')
    const smtpSecure = settings.smtpSecure ?? (process.env.SMTP_SECURE === 'true')
    const smtpUser = settings.smtpUser || process.env.SMTP_USER
    const smtpPassword = settings.smtpPassword || process.env.SMTP_PASSWORD
    const emailFrom = settings.emailFrom || process.env.EMAIL_FROM || '"Test" <test@example.com>'

    if (!smtpHost) {
      return NextResponse.json(
        { success: false, error: 'SMTP server není nakonfigurován (chybí host)' },
        { status: 400 }
      )
    }

    // Create transporter with settings
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser && smtpPassword ? {
        user: smtpUser,
        pass: smtpPassword,
      } : undefined,
    })

    // Verify connection first
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      let errorMessage = 'Nelze se připojit k SMTP serveru'

      if (verifyError.code === 'ECONNREFUSED') {
        errorMessage = `Nelze se připojit k ${smtpHost}:${smtpPort} - zkontrolujte adresu a port`
      } else if (verifyError.code === 'EAUTH' || verifyError.responseCode === 535) {
        errorMessage = 'Chyba autentizace - zkontrolujte uživatelské jméno a heslo'
      } else if (verifyError.code === 'ESOCKET') {
        errorMessage = `Chyba připojení - zkontrolujte zda je SSL/TLS nastavení správné (port ${smtpPort}, secure: ${smtpSecure})`
      } else if (verifyError.message) {
        errorMessage = verifyError.message
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    // Send test email
    const now = new Date()
    await transporter.sendMail({
      from: emailFrom,
      to: testEmail,
      subject: 'Test SMTP - Divadlo Studna',
      text: `Toto je testovací email z administrace Divadlo Studna.\n\nPokud vidíte tento email, SMTP konfigurace funguje správně.\n\nOdesláno: ${now.toLocaleString('cs-CZ')}\nServer: ${smtpHost}:${smtpPort}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #D32F2F; margin-top: 0;">Test SMTP konfigurace</h2>
          <p>Toto je testovací email z administrace Divadlo Studna.</p>
          <p style="color: #4CAF50; font-weight: bold; font-size: 16px;">
            ✓ Pokud vidíte tento email, SMTP konfigurace funguje správně.
          </p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Odesláno: ${now.toLocaleString('cs-CZ')}<br>
            Server: ${smtpHost}:${smtpPort}<br>
            Secure: ${smtpSecure ? 'Ano (SSL/TLS)' : 'Ne'}<br>
            Autentizace: ${smtpUser ? 'Ano' : 'Ne'}
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Testovací email odeslán na ${testEmail}`,
    })
  } catch (error: any) {
    console.error('SMTP test failed:', error)

    // Provide helpful error messages
    let errorMessage = 'Test SMTP selhal'

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Nelze se připojit k SMTP serveru - zkontrolujte adresu a port'
    } else if (error.code === 'EAUTH' || error.responseCode === 535) {
      errorMessage = 'Nesprávné přihlašovací údaje SMTP'
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Neplatná adresa odesílatele (emailFrom)'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
