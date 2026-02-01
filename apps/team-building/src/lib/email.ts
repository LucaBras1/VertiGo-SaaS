import { Resend } from 'resend'

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'TeamForge <noreply@teamforge.ai>'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3009'

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
  companyName,
}: {
  to: string
  name: string
  companyName: string
}): Promise<EmailResult> {
  const loginUrl = `${APP_URL}/login`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TeamForge!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${name}</strong>!</p>
          <p>Thank you for registering <strong>${companyName}</strong> with TeamForge. Your account is now active and ready to use.</p>
          <p>With TeamForge, you can:</p>
          <ul style="color: #666;">
            <li>Match corporate objectives to team building activities with AI</li>
            <li>Calibrate difficulty based on team composition</li>
            <li>Generate professional HR-ready session debriefs</li>
            <li>Track customer engagement and analytics</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Sign In to Dashboard</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, our support team is here to help.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">TeamForge - AI-Powered Team Building Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Welcome to TeamForge!',
    html,
    text: `Hello, ${name}! Thank you for registering ${companyName} with TeamForge. Sign in at: ${loginUrl}`,
  })
}

export async function sendSessionConfirmationEmail({
  to,
  contactName,
  companyName,
  programTitle,
  sessionDate,
  sessionTime,
  venue,
  teamSize,
  objectives,
}: {
  to: string
  contactName: string
  companyName: string
  programTitle: string
  sessionDate: string
  sessionTime: string
  venue: string
  teamSize: number
  objectives: string[]
}): Promise<EmailResult> {
  const objectivesList = objectives.length > 0
    ? objectives.map(obj => `<li>${obj}</li>`).join('')
    : '<li>General team building</li>'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Confirmed!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
          <p>Great news! Your team building session for <strong>${companyName}</strong> has been confirmed.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0EA5E9;">
            <h3 style="margin: 0 0 15px 0; color: #0EA5E9;">Session Details</h3>
            <p style="margin: 8px 0;"><strong>Program:</strong> ${programTitle}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${sessionDate}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${sessionTime}</p>
            <p style="margin: 8px 0;"><strong>Venue:</strong> ${venue}</p>
            <p style="margin: 8px 0;"><strong>Team Size:</strong> ${teamSize} participants</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22C55E;">
            <h3 style="margin: 0 0 15px 0; color: #22C55E;">Session Objectives</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              ${objectivesList}
            </ul>
          </div>

          <p style="color: #666; font-size: 14px;">We look forward to delivering an impactful session for your team!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">TeamForge - AI-Powered Team Building Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Session Confirmed: ${programTitle} on ${sessionDate}`,
    html,
    text: `Hello ${contactName}! Your team building session for ${companyName} has been confirmed. Program: ${programTitle}, Date: ${sessionDate} at ${sessionTime}, Venue: ${venue}, Team size: ${teamSize} participants.`,
  })
}

export async function sendDebriefEmail({
  to,
  contactName,
  companyName,
  programTitle,
  sessionDate,
  debrief,
  viewUrl,
}: {
  to: string
  contactName: string
  companyName: string
  programTitle: string
  sessionDate: string
  debrief: {
    executiveSummary: string
    keyInsights: string[]
    recommendations: string[]
  }
  viewUrl: string
}): Promise<EmailResult> {
  const insightsList = debrief.keyInsights.map(insight => `<li>${insight}</li>`).join('')
  const recommendationsList = debrief.recommendations.map(rec => `<li>${rec}</li>`).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Session Debrief Report</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${programTitle} - ${sessionDate}</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
          <p>The AI-generated debrief report for <strong>${companyName}</strong>'s team building session is now ready.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0EA5E9;">
            <h3 style="margin: 0 0 15px 0; color: #0EA5E9;">Executive Summary</h3>
            <p style="margin: 0; color: #666;">${debrief.executiveSummary}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22C55E;">
            <h3 style="margin: 0 0 15px 0; color: #22C55E;">Key Insights</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              ${insightsList}
            </ul>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
            <h3 style="margin: 0 0 15px 0; color: #8B5CF6;">Recommendations</h3>
            <ul style="margin: 0; padding-left: 20px; color: #666;">
              ${recommendationsList}
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #0EA5E9 0%, #22C55E 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Full Report</a>
          </div>

          <p style="color: #666; font-size: 14px;">This report was generated using our AI-powered DebriefGeneratorAI module.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">TeamForge - AI-Powered Team Building Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Session Debrief: ${programTitle} - ${sessionDate}`,
    html,
    text: `Hello ${contactName}! The debrief report for ${companyName}'s session (${programTitle} on ${sessionDate}) is ready. Executive Summary: ${debrief.executiveSummary}. View the full report at: ${viewUrl}`,
  })
}

export async function sendInvoiceEmail({
  to,
  contactName,
  companyName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  items,
  invoiceUrl,
}: {
  to: string
  contactName: string
  companyName: string
  invoiceNumber: string
  amount: string
  currency: string
  dueDate: string
  items: Array<{ description: string; quantity: number; unitPrice: string; total: string }>
  invoiceUrl: string
}): Promise<EmailResult> {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.unitPrice}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.total}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1E293B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Invoice ${invoiceNumber}</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
          <p>Please find attached the invoice for services provided to <strong>${companyName}</strong>.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
              <tfoot>
                <tr style="background: #f1f5f9;">
                  <td colspan="3" style="padding: 12px; font-weight: bold; text-align: right;">Total Due:</td>
                  <td style="padding: 12px; font-weight: bold; text-align: right; color: #0EA5E9;">${amount} ${currency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 0; font-size: 14px;"><strong>Payment Due:</strong> ${dueDate}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${invoiceUrl}" style="display: inline-block; background: #0EA5E9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Invoice</a>
          </div>

          <p style="color: #666; font-size: 14px;">Thank you for your business!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">TeamForge - AI-Powered Team Building Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Invoice ${invoiceNumber} - ${amount} ${currency}`,
    html,
    text: `Hello ${contactName}! Invoice ${invoiceNumber} for ${companyName} is ready. Amount: ${amount} ${currency}. Due: ${dueDate}. View at: ${invoiceUrl}`,
  })
}
