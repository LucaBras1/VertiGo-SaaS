/**
 * @vertigo/email
 * Shared email services with branding for VertiGo SaaS
 *
 * @example
 * // Create email service with vertical theme
 * import { createEmailService, verticalThemes } from '@vertigo/email'
 *
 * const emailService = createEmailService({
 *   branding: verticalThemes.fitness,
 * })
 *
 * // Send welcome email
 * await emailService.sendWelcome({
 *   to: 'user@example.com',
 *   data: { recipientName: 'John', loginUrl: 'https://...' }
 * })
 *
 * // Send password reset
 * await emailService.sendPasswordReset({
 *   to: 'user@example.com',
 *   data: { recipientName: 'John', resetUrl: '...', expiresIn: '1 hour' }
 * })
 *
 * // Send invoice
 * await emailService.sendInvoice({
 *   to: 'client@example.com',
 *   data: { recipientName: 'Client', invoiceNumber: 'INV-001', amount: '$100', dueDate: '2024-01-01', invoiceUrl: '...' }
 * })
 *
 * @example
 * // Custom branding
 * const emailService = createEmailService({
 *   branding: {
 *     appName: 'MyApp',
 *     primaryColor: '#FF5733',
 *     tagline: 'Your awesome app',
 *     fromEmail: 'MyApp <noreply@myapp.com>',
 *   }
 * })
 */

// Main factory
export { createEmailService, type EmailService } from './service'

// Client
export { getResendClient, isEmailConfigured } from './client'

// Types
export type {
  EmailBranding,
  VerticalType,
  EmailResult,
  EmailAttachment,
  SendEmailOptions,
  EmailServiceConfig,
  WelcomeEmailData,
  PasswordResetEmailData,
  InvoiceEmailData,
  ReminderEmailData,
  BookingConfirmationEmailData,
  GigConfirmationEmailData,
  GalleryReadyEmailData,
  PaymentReceiptEmailData,
} from './types'

// Branding
export {
  fitnessTheme,
  musiciansTheme,
  photographyTheme,
  teamBuildingTheme,
  eventsTheme,
  performingArtsTheme,
  kidsEntertainmentTheme,
  verticalThemes,
  getTheme,
} from './branding/index'

// Template utilities (for custom emails)
export {
  generateHeader,
  generateFooter,
  generateButton,
  generateInfoBox,
  generateNoticeBox,
  wrapInBaseTemplate,
} from './templates/base'
