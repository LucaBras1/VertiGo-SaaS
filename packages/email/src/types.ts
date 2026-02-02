/**
 * @vertigo/email - Type definitions
 * Shared email types for all VertiGo verticals
 */

/**
 * Email branding configuration for a vertical
 */
export interface EmailBranding {
  /** Application name displayed in emails */
  appName: string
  /** Primary brand color (hex) */
  primaryColor: string
  /** Secondary/gradient end color (hex) */
  secondaryColor?: string
  /** Email footer tagline */
  tagline: string
  /** Website URL */
  websiteUrl?: string
  /** Default from email address */
  fromEmail: string
}

/**
 * Vertical type enum for theme selection
 */
export type VerticalType =
  | 'fitness'
  | 'musicians'
  | 'photography'
  | 'team-building'
  | 'events'
  | 'performing-arts'
  | 'kids-entertainment'

/**
 * Email sending result
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string
  content: Buffer
  contentType?: string
}

/**
 * Base email options
 */
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
}

/**
 * Email service configuration
 */
export interface EmailServiceConfig {
  /** Email branding to use */
  branding: EmailBranding
  /** Override from email (default: from branding) */
  fromEmail?: string
}

// Template data types

export interface WelcomeEmailData {
  recipientName: string
  loginUrl: string
}

export interface PasswordResetEmailData {
  recipientName: string
  resetUrl: string
  expiresIn?: string
}

export interface InvoiceEmailData {
  recipientName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  invoiceUrl: string
}

export interface ReminderEmailData {
  recipientName: string
  eventName: string
  eventDate: string
  eventTime: string
  location?: string
  notes?: string
}

export interface BookingConfirmationEmailData {
  recipientName: string
  childName?: string
  eventDate: string
  eventTime?: string
  venue: string
  packageName: string
  depositAmount?: string
  paymentUrl?: string
}

export interface GigConfirmationEmailData {
  recipientName: string
  gigName: string
  gigDate: string
  gigTime: string
  venue: string
  bandName: string
  amount?: string
  detailsUrl?: string
}

export interface GalleryReadyEmailData {
  recipientName: string
  galleryName: string
  galleryUrl: string
  password?: string
  expiresAt?: string
}

export interface PaymentReceiptEmailData {
  recipientName: string
  invoiceNumber: string
  amount: string
  paymentType: 'deposit' | 'full_payment'
  eventDate?: string
  pdfBuffer?: Buffer
}
