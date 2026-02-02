/**
 * Email Service - TeamForge
 * Email notifications for team building management
 * Using @vertigo/email shared package
 */

import {
  createEmailService,
  teamBuildingTheme,
  generateButton,
  generateInfoBox,
  generateNoticeBox,
  wrapInBaseTemplate,
  type EmailResult,
} from '@vertigo/email'

// Create email service with TeamForge branding
const emailService = createEmailService({
  branding: teamBuildingTheme,
})

// App URL for links
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3009'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@teamforge.ai'

// Re-export for convenience
export type { EmailResult }

// ============================================
// GENERIC EMAIL
// ============================================

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
  return emailService.sendCustom({ to, subject, html, text })
}

// ============================================
// WELCOME EMAIL
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

  const features = `
    <ul style="color: #666; margin: 0; padding-left: 20px;">
      <li>Match corporate objectives to team building activities with AI</li>
      <li>Calibrate difficulty based on team composition</li>
      <li>Generate professional HR-ready session debriefs</li>
      <li>Track customer engagement and analytics</li>
    </ul>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${name}</strong>!</p>
    <p>Thank you for registering <strong>${companyName}</strong> with TeamForge. Your account is now active and ready to use.</p>
    <p>With TeamForge, you can:</p>
    ${features}
    ${generateButton('Sign In to Dashboard', loginUrl, teamBuildingTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">If you have any questions, our support team is here to help.</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: 'Welcome to TeamForge!' })

  return emailService.sendCustom({
    to,
    subject: 'Welcome to TeamForge!',
    html,
    text: `Hello, ${name}! Thank you for registering ${companyName} with TeamForge. Sign in at: ${loginUrl}`,
  })
}

// ============================================
// SESSION CONFIRMATION EMAIL
// ============================================

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

  const sessionDetails = `
    <p style="margin: 8px 0;"><strong>Program:</strong> ${programTitle}</p>
    <p style="margin: 8px 0;"><strong>Date:</strong> ${sessionDate}</p>
    <p style="margin: 8px 0;"><strong>Time:</strong> ${sessionTime}</p>
    <p style="margin: 8px 0;"><strong>Venue:</strong> ${venue}</p>
    <p style="margin: 8px 0;"><strong>Team Size:</strong> ${teamSize} participants</p>
  `

  const objectivesSection = `
    <ul style="margin: 0; padding-left: 20px; color: #666;">
      ${objectivesList}
    </ul>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
    <p>Great news! Your team building session for <strong>${companyName}</strong> has been confirmed.</p>
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: ' + teamBuildingTheme.primaryColor + ';">Session Details</h3>' + sessionDetails, teamBuildingTheme.primaryColor)}
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #22C55E;">Session Objectives</h3>' + objectivesSection, '#22C55E')}
    <p style="color: #666; font-size: 14px;">We look forward to delivering an impactful session for your team!</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: 'Session Confirmed!' })

  return emailService.sendCustom({
    to,
    subject: `Session Confirmed: ${programTitle} on ${sessionDate}`,
    html,
    text: `Hello ${contactName}! Your team building session for ${companyName} has been confirmed. Program: ${programTitle}, Date: ${sessionDate} at ${sessionTime}, Venue: ${venue}, Team size: ${teamSize} participants.`,
  })
}

// ============================================
// DEBRIEF EMAIL
// ============================================

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

  const summarySection = `<p style="margin: 0; color: #666;">${debrief.executiveSummary}</p>`
  const insightsSection = `<ul style="margin: 0; padding-left: 20px; color: #666;">${insightsList}</ul>`
  const recommendationsSection = `<ul style="margin: 0; padding-left: 20px; color: #666;">${recommendationsList}</ul>`

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
    <p>The AI-generated debrief report for <strong>${companyName}</strong>'s team building session is now ready.</p>
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: ' + teamBuildingTheme.primaryColor + ';">Executive Summary</h3>' + summarySection, teamBuildingTheme.primaryColor)}
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #22C55E;">Key Insights</h3>' + insightsSection, '#22C55E')}
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #8B5CF6;">Recommendations</h3>' + recommendationsSection, '#8B5CF6')}
    ${generateButton('View Full Report', viewUrl, teamBuildingTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">This report was generated using our AI-powered DebriefGeneratorAI module.</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, {
    title: `Session Debrief: ${programTitle} - ${sessionDate}`,
  })

  return emailService.sendCustom({
    to,
    subject: `Session Debrief: ${programTitle} - ${sessionDate}`,
    html,
    text: `Hello ${contactName}! The debrief report for ${companyName}'s session (${programTitle} on ${sessionDate}) is ready. Executive Summary: ${debrief.executiveSummary}. View the full report at: ${viewUrl}`,
  })
}

// ============================================
// CONTACT FORM EMAIL (to admin)
// ============================================

export async function sendContactFormEmail({
  name,
  email,
  phone,
  inquiryType,
  message,
}: {
  name: string
  email: string
  phone?: string
  inquiryType: string
  message: string
}): Promise<EmailResult> {
  const inquiryTypeLabels: Record<string, string> = {
    general: 'Obecný dotaz',
    sales: 'Prodej',
    support: 'Podpora',
    partnership: 'Partnerství',
    other: 'Jiný',
  }

  const contactDetails = `
    <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
    <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
    ${phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
    <p style="margin: 8px 0;"><strong>Inquiry Type:</strong> ${inquiryTypeLabels[inquiryType] || inquiryType}</p>
  `

  const messageSection = `<p style="margin: 0; color: #666; white-space: pre-wrap;">${message}</p>`

  const content = `
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: ' + teamBuildingTheme.primaryColor + ';">Contact Details</h3>' + contactDetails, teamBuildingTheme.primaryColor)}
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #22C55E;">Message</h3>' + messageSection, '#22C55E')}
    <p style="color: #666; font-size: 14px;">Reply directly to this email to respond to <strong>${name}</strong>.</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: 'New Contact Form Submission' })

  return emailService.sendCustom({
    to: ADMIN_EMAIL,
    subject: `[TeamForge Contact] ${inquiryTypeLabels[inquiryType] || inquiryType}: ${name}`,
    html,
    text: `New contact form submission from ${name} (${email}). Type: ${inquiryType}. Message: ${message}`,
  })
}

// ============================================
// DEMO REQUEST EMAIL (to admin)
// ============================================

export async function sendDemoRequestEmail({
  name,
  email,
  company,
  teamSize,
  message,
}: {
  name: string
  email: string
  company: string
  teamSize: string
  message?: string
}): Promise<EmailResult> {
  const leadInfo = `
    <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
    <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
    <p style="margin: 8px 0;"><strong>Company:</strong> ${company}</p>
    <p style="margin: 8px 0;"><strong>Team Size:</strong> ${teamSize} employees</p>
  `

  const content = `
    <p style="font-size: 16px; color: #666;">A potential customer wants to schedule a demo!</p>
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #8B5CF6;">Lead Information</h3>' + leadInfo, '#8B5CF6')}
    ${message ? generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #22C55E;">Additional Notes</h3><p style="margin: 0; color: #666; white-space: pre-wrap;">' + message + '</p>', '#22C55E') : ''}
    ${generateNoticeBox('<strong>⏰ Action Required:</strong> Respond within 24 hours to schedule the demo.', 'warning')}
    <p style="color: #666; font-size: 14px;">Reply directly to this email to contact <strong>${name}</strong>.</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: '🎯 New Demo Request!' })

  return emailService.sendCustom({
    to: ADMIN_EMAIL,
    subject: `[TeamForge Demo] ${company} (${teamSize} employees) - ${name}`,
    html,
    text: `New demo request from ${name} at ${company}. Email: ${email}. Team size: ${teamSize}. ${message ? `Message: ${message}` : ''}`,
  })
}

// ============================================
// DEMO CONFIRMATION EMAIL (to customer)
// ============================================

export async function sendDemoConfirmationEmail({
  to,
  name,
  company,
}: {
  to: string
  name: string
  company: string
}): Promise<EmailResult> {
  const whatToExpect = `
    <ul style="margin: 0; padding-left: 20px; color: #666;">
      <li>A member of our team will contact you within 24 hours</li>
      <li>We'll schedule a personalized 30-minute demo</li>
      <li>See our AI-powered features in action</li>
      <li>Get answers to all your questions</li>
    </ul>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${name}</strong>!</p>
    <p>Thank you for requesting a demo for <strong>${company}</strong>. We're excited to show you how TeamForge can transform your team building programs.</p>
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: ' + teamBuildingTheme.primaryColor + ';">What to Expect</h3>' + whatToExpect, teamBuildingTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">In the meantime, feel free to reply to this email with any questions!</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: 'Thank You for Your Interest!' })

  return emailService.sendCustom({
    to,
    subject: "Your TeamForge Demo Request - We'll Be In Touch!",
    html,
    text: `Hello ${name}! Thank you for requesting a demo for ${company}. We'll contact you within 24 hours to schedule a personalized demo.`,
  })
}

// ============================================
// INVOICE EMAIL
// ============================================

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

  const invoiceTable = `
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
          <td style="padding: 12px; font-weight: bold; text-align: right; color: ${teamBuildingTheme.primaryColor};">${amount} ${currency}</td>
        </tr>
      </tfoot>
    </table>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
    <p>Please find attached the invoice for services provided to <strong>${companyName}</strong>.</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
      ${invoiceTable}
    </div>
    ${generateNoticeBox('<strong>Payment Due:</strong> ' + dueDate, 'warning')}
    ${generateButton('View Invoice', invoiceUrl, teamBuildingTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Thank you for your business!</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: `Invoice ${invoiceNumber}` })

  return emailService.sendCustom({
    to,
    subject: `Invoice ${invoiceNumber} - ${amount} ${currency}`,
    html,
    text: `Hello ${contactName}! Invoice ${invoiceNumber} for ${companyName} is ready. Amount: ${amount} ${currency}. Due: ${dueDate}. View at: ${invoiceUrl}`,
  })
}

// ============================================
// PAYMENT CONFIRMATION EMAIL
// ============================================

export async function sendPaymentConfirmationEmail({
  to,
  contactName,
  companyName,
  orderNumber,
  amount,
  currency,
  items,
}: {
  to: string
  contactName: string
  companyName: string
  orderNumber: string
  amount: string
  currency: string
  items: Array<{ description: string; quantity: number; total: string }>
}): Promise<EmailResult> {
  const itemsList = items.map(item =>
    `<p style="margin: 5px 0;">• ${item.description} (qty: ${item.quantity}) - ${item.total}</p>`
  ).join('')

  const paymentDetails = `
    <p style="margin: 8px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
    <p style="margin: 8px 0;"><strong>Company:</strong> ${companyName}</p>
    <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ${amount} ${currency}</p>
    <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('cs-CZ')}</p>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${contactName}</strong>!</p>
    <p>Your payment has been successfully processed. Thank you for your order!</p>
    ${generateInfoBox('<h3 style="margin: 0 0 15px 0; color: #22C55E;">Payment Confirmed</h3>' + paymentDetails, '#22C55E')}
    ${items.length > 0 ? generateInfoBox('<h3 style="margin: 0 0 15px 0; color: ' + teamBuildingTheme.primaryColor + ';">Order Items</h3>' + itemsList, teamBuildingTheme.primaryColor) : ''}
    <p style="color: #666; font-size: 14px;">If you have any questions, please don't hesitate to contact us.</p>
  `

  const html = wrapInBaseTemplate(teamBuildingTheme, content, { title: 'Payment Confirmed' })

  return emailService.sendCustom({
    to,
    subject: `Payment Confirmed - Order ${orderNumber}`,
    html,
    text: `Hello ${contactName}! Your payment of ${amount} ${currency} for order ${orderNumber} has been confirmed. Thank you for your business!`,
  })
}
