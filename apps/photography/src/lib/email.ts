import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors without RESEND_API_KEY
let _resend: Resend | null = null

function getResend(): Resend | null {
  if (_resend === null && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'ShootFlow <noreply@shootflow.app>'

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
  const resend = getResend()

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

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  expiresIn = '1 hour',
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
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${name}</strong>!</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #F59E0B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Set New Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in ${expiresIn}.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">ShootFlow - Professional Photography Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Password Reset - ShootFlow',
    html,
    text: `Hello, ${name}! To reset your password, click here: ${resetUrl} (expires in ${expiresIn})`,
  })
}

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
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ShootFlow!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${name}</strong>!</p>
          <p>Your account has been created successfully. You can now start managing your photography business, clients, and shoots.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #F59E0B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Sign In</a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, feel free to contact us.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">ShootFlow - Professional Photography Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: 'Welcome to ShootFlow!',
    html,
    text: `Hello, ${name}! Your account has been created. Sign in at: ${loginUrl}`,
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
          <h1 style="color: white; margin: 0; font-size: 24px;">New Invoice</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
          <p>We're sending you a new invoice:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invoiceUrl}" style="display: inline-block; background: #F59E0B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Invoice</a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">ShootFlow - Professional Photography Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Invoice ${invoiceNumber} - ShootFlow`,
    html,
    text: `Hello, ${clientName}! Invoice ${invoiceNumber} for ${amount}. Due: ${dueDate}. View: ${invoiceUrl}`,
  })
}

export async function sendShootReminderEmail({
  to,
  clientName,
  shootDate,
  shootTime,
  location,
  photographerName,
}: {
  to: string
  clientName: string
  shootDate: string
  shootTime: string
  location?: string
  photographerName: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Shoot Reminder</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
          <p>This is a reminder about your upcoming photo shoot:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${shootDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${shootTime}</p>
            <p style="margin: 5px 0;"><strong>Photographer:</strong> ${photographerName}</p>
            ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 14px;">We look forward to seeing you!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">ShootFlow - Professional Photography Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Shoot Reminder - ${shootDate} at ${shootTime}`,
    html,
    text: `Hello, ${clientName}! Reminder: Photo shoot on ${shootDate} at ${shootTime} with ${photographerName}${location ? ` at ${location}` : ''}.`,
  })
}

export async function sendGalleryReadyEmail({
  to,
  clientName,
  galleryName,
  galleryUrl,
  password,
  expiresAt,
}: {
  to: string
  clientName: string
  galleryName: string
  galleryUrl: string
  password?: string
  expiresAt?: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Gallery is Ready!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px;">Hello, <strong>${clientName}</strong>!</p>
          <p>Great news! Your photo gallery <strong>${galleryName}</strong> is ready for viewing.</p>
          ${password ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 5px 0;"><strong>Gallery Password:</strong> ${password}</p>
          </div>
          ` : ''}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${galleryUrl}" style="display: inline-block; background: #F59E0B; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Gallery</a>
          </div>
          ${expiresAt ? `<p style="color: #666; font-size: 14px;">Please note: This gallery link will expire on ${expiresAt}.</p>` : ''}
          <p style="color: #666; font-size: 14px;">Thank you for choosing us for your photography needs!</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">ShootFlow - Professional Photography Management</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to,
    subject: `Your Gallery is Ready - ${galleryName}`,
    html,
    text: `Hello, ${clientName}! Your gallery "${galleryName}" is ready. View it at: ${galleryUrl}${password ? ` (Password: ${password})` : ''}`,
  })
}
