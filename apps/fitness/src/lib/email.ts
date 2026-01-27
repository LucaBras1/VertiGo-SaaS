import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'FitAdmin <noreply@fitadmin.app>'

// Email sending result type
interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Send generic email
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}): Promise<EmailResult> {
  if (!resend) {
    console.warn('Resend not configured - email not sent:', { to, subject })
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export async function sendWelcomeEmail({
  to,
  name,
  loginUrl,
}: {
  to: string
  name: string
  loginUrl: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Vítejte v FitAdmin!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den, <strong>${name}</strong>!</p>
          <p>Váš účet byl úspěšně vytvořen. Nyní můžete začít spravovat své klienty, plánovat tréninky a sledovat pokrok.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Přihlásit se</a>
          </div>
          <p style="color: #666; font-size: 14px;">Pokud máte jakékoliv otázky, neváhejte nás kontaktovat.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Vítejte v FitAdmin!',
    html,
    text: `Dobrý den, ${name}! Váš účet byl úspěšně vytvořen. Přihlaste se na: ${loginUrl}`,
  })
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresIn = '1 hodinu',
}: {
  to: string
  name: string
  resetUrl: string
  expiresIn?: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1E293B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Obnovení hesla</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den, <strong>${name}</strong>!</p>
          <p>Obdrželi jsme žádost o obnovení hesla k vašemu účtu. Klikněte na tlačítko níže pro nastavení nového hesla:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Nastavit nové heslo</a>
          </div>
          <p style="color: #666; font-size: 14px;">Tento odkaz je platný ${expiresIn}.</p>
          <p style="color: #666; font-size: 14px;">Pokud jste o obnovení hesla nežádali, tento email ignorujte.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Obnovení hesla - FitAdmin',
    html,
    text: `Dobrý den, ${name}! Pro obnovení hesla klikněte na: ${resetUrl} (platnost ${expiresIn})`,
  })
}

export async function sendSessionReminderEmail({
  to,
  clientName,
  trainerName,
  sessionDate,
  sessionTime,
  duration,
  location,
}: {
  to: string
  clientName: string
  trainerName: string
  sessionDate: string
  sessionTime: string
  duration: number
  location?: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Připomínka tréninku</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
          <p>Připomínáme vám blížící se trénink:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <p style="margin: 5px 0;"><strong>Datum:</strong> ${sessionDate}</p>
            <p style="margin: 5px 0;"><strong>Čas:</strong> ${sessionTime}</p>
            <p style="margin: 5px 0;"><strong>Délka:</strong> ${duration} minut</p>
            <p style="margin: 5px 0;"><strong>Trenér:</strong> ${trainerName}</p>
            ${location ? `<p style="margin: 5px 0;"><strong>Místo:</strong> ${location}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 14px;">Těšíme se na vás!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Připomínka tréninku - ${sessionDate} v ${sessionTime}`,
    html,
    text: `Dobrý den, ${clientName}! Připomínáme trénink dne ${sessionDate} v ${sessionTime} (${duration} min) s trenérem ${trainerName}.`,
  })
}

export async function sendBillingReminderEmail({
  to,
  clientName,
  packageName,
  amount,
  currency,
  nextBillingDate,
  frequency,
  manageUrl,
}: {
  to: string
  clientName: string
  packageName?: string | null
  amount: number | string
  currency: string
  nextBillingDate: Date
  frequency: string
  manageUrl?: string
}): Promise<EmailResult> {
  const formattedAmount = typeof amount === 'number'
    ? amount.toLocaleString('cs-CZ')
    : amount
  const formattedDate = nextBillingDate.toLocaleDateString('cs-CZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const frequencyText: Record<string, string> = {
    WEEKLY: 'týdenní',
    BIWEEKLY: 'čtrnáctidenní',
    MONTHLY: 'měsíční',
    QUARTERLY: 'čtvrtletní',
    YEARLY: 'roční',
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Připomínka platby</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
          <p>Rádi bychom Vás upozornili na blížící se platbu za Vaše předplatné.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            ${packageName ? `<p style="margin: 5px 0;"><strong>Balíček:</strong> ${packageName}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Částka:</strong> ${formattedAmount} ${currency}</p>
            <p style="margin: 5px 0;"><strong>Datum platby:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Frekvence:</strong> ${frequencyText[frequency] || frequency}</p>
          </div>
          <p style="color: #666; font-size: 14px;">Ujistěte se prosím, že máte na účtu dostatek prostředků pro úspěšné zpracování platby.</p>
          ${manageUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${manageUrl}" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Spravovat předplatné</a>
          </div>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Připomínka platby - ${formattedDate}`,
    html,
    text: `Dobrý den, ${clientName}! Připomínáme blížící se platbu ${formattedAmount} ${currency} dne ${formattedDate}${packageName ? ` za balíček ${packageName}` : ''}.`,
  })
}

export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  amount,
  dueDate,
  invoiceUrl,
}: {
  to: string
  clientName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  invoiceUrl: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1E293B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Nová faktura</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Dobrý den, <strong>${clientName}</strong>!</p>
          <p>Posíláme vám novou fakturu:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;"><strong>Číslo faktury:</strong> ${invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Částka:</strong> ${amount}</p>
            <p style="margin: 5px 0;"><strong>Splatnost:</strong> ${dueDate}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invoiceUrl}" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Zobrazit fakturu</a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">FitAdmin - Správa fitness studia</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Faktura ${invoiceNumber} - FitAdmin`,
    html,
    text: `Dobrý den, ${clientName}! Posíláme fakturu ${invoiceNumber} na částku ${amount}. Splatnost: ${dueDate}. Zobrazit: ${invoiceUrl}`,
  })
}
