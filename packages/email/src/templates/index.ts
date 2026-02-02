/**
 * @vertigo/email - Templates
 * Export all email templates
 */

// Base template utilities
export {
  generateHeader,
  generateFooter,
  generateButton,
  generateInfoBox,
  generateNoticeBox,
  wrapInBaseTemplate,
} from './base'

// Template generators
export {
  generateWelcomeEmail,
  generateWelcomeEmailText,
} from './welcome'

export {
  generatePasswordResetEmail,
  generatePasswordResetEmailText,
} from './password-reset'

export {
  generateInvoiceEmail,
  generateInvoiceEmailText,
} from './invoice'

export {
  generateReminderEmail,
  generateReminderEmailText,
} from './reminder'
