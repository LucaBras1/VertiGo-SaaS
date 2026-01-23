/**
 * Offer Email Template
 *
 * Email sent to customer with order offer for confirmation
 * Supports configurable text through EmailTemplateSettings
 */

import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface OrderItem {
  name: string
  date?: string
  startTime?: string
  endTime?: string
  price: number
}

interface OrderData {
  orderNumber: string
  eventName: string
  dates: string[]
  venue: {
    name: string
    street?: string
    city?: string
    postalCode?: string
  }
  items: OrderItem[]
  pricing: {
    subtotal?: number
    travelCosts?: number
    discount?: number
    totalPrice: number
    vatIncluded?: boolean
  }
  customer: {
    firstName: string
    lastName: string
    organization?: string
    email: string
  }
  confirmationUrl: string
  expirationDate: Date
}

/**
 * Configurable email template settings loaded from database
 */
export interface EmailTemplateSettings {
  subject?: string | null       // e.g. "Dohoda o umeleckem vykonu - {eventName}"
  greeting?: string | null      // e.g. "Dobry den,"
  intro?: string | null         // e.g. "zasilame Vam nabidku..."
  footerNote?: string | null    // e.g. "Pokud mate dotazy..."
  companyName?: string | null   // e.g. "Divadlo Studna"
  companyEmail?: string | null  // e.g. "produkce@divadlo-studna.cz"
  companyWeb?: string | null    // e.g. "www.divadlo-studna.cz"
}

// Default values for email template - all values are guaranteed non-null strings
const DEFAULT_SETTINGS = {
  subject: 'Dohoda o umeleckem vykonu - {eventName}',
  greeting: 'Dobry den,',
  intro: 'zasilame Vam nabidku na umelecky vykon. Prosim zkontrolujte nize uvedene udaje a pokud s nimi souhlasiste, potvrdte objednavku kliknutim na tlacitko.',
  footerNote: 'Pokud mate nejake dotazy nebo potrebujete upravit objednavku, neváhejte nas kontaktovat.',
  companyName: 'Divadlo Studna',
  companyEmail: 'produkce@divadlo-studna.cz',
  companyWeb: 'www.divadlo-studna.cz',
} as const

/**
 * Effective settings type - all values are guaranteed to be strings
 */
interface EffectiveSettings {
  subject: string
  greeting: string
  intro: string
  footerNote: string
  companyName: string
  companyEmail: string
  companyWeb: string
}

/**
 * Helper to get string value with fallback
 */
function getString(value: string | null | undefined, fallback: string): string {
  return value || fallback
}

/**
 * Get effective settings with fallback to defaults
 * Ensures all values are non-null strings
 */
function getEffectiveSettings(settings?: EmailTemplateSettings): EffectiveSettings {
  return {
    subject: getString(settings?.subject, DEFAULT_SETTINGS.subject),
    greeting: getString(settings?.greeting, DEFAULT_SETTINGS.greeting),
    intro: getString(settings?.intro, DEFAULT_SETTINGS.intro),
    footerNote: getString(settings?.footerNote, DEFAULT_SETTINGS.footerNote),
    companyName: getString(settings?.companyName, DEFAULT_SETTINGS.companyName),
    companyEmail: getString(settings?.companyEmail, DEFAULT_SETTINGS.companyEmail),
    companyWeb: getString(settings?.companyWeb, DEFAULT_SETTINGS.companyWeb),
  }
}

/**
 * Format currency in Czech format
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' Kc'
}

/**
 * Format date in Czech format
 */
function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd. MMMM yyyy', { locale: cs })
}

/**
 * Generate the offer email HTML
 */
export function generateOfferEmailHtml(data: OrderData, settings?: EmailTemplateSettings): string {
  const s = getEffectiveSettings(settings)
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${escapeHtml(item.name)}</strong>
        ${item.date ? `<br><span style="color: #666; font-size: 14px;">${formatDate(item.date)}${item.startTime ? `, ${item.startTime}` : ''}${item.endTime ? ` - ${item.endTime}` : ''}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; white-space: nowrap;">
        ${formatCurrency(item.price)}
      </td>
    </tr>
  `).join('')

  const datesFormatted = data.dates.map(d => formatDate(d)).join(', ')

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dohoda o umeleckem vykonu</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #D32F2F; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${escapeHtml(s.companyName)}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #D32F2F; margin-top: 0;">Dohoda o umeleckem vykonu</h2>
              <p style="color: #666; margin-bottom: 5px;">Objednavka c. <strong>${escapeHtml(data.orderNumber)}</strong></p>

              <p>${escapeHtml(s.greeting)}</p>
              <p>${escapeHtml(s.intro)}</p>

              <!-- Order Summary Box -->
              <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Shrnutí objednavky</h3>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                  <tr>
                    <td style="padding: 5px 0; color: #666; width: 120px;">Akce:</td>
                    <td style="padding: 5px 0;"><strong>${escapeHtml(data.eventName || 'Neuvedeno')}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666;">Datum:</td>
                    <td style="padding: 5px 0;">${datesFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666;">Misto:</td>
                    <td style="padding: 5px 0;">
                      ${escapeHtml(data.venue.name)}
                      ${data.venue.street ? `<br>${escapeHtml(data.venue.street)}` : ''}
                      ${data.venue.city ? `<br>${escapeHtml(data.venue.postalCode || '')} ${escapeHtml(data.venue.city)}` : ''}
                    </td>
                  </tr>
                </table>

                <h4 style="margin-bottom: 10px; color: #333;">Polozky:</h4>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  ${itemsHtml}
                </table>

                <!-- Pricing Summary -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                  ${data.pricing.travelCosts ? `
                  <tr>
                    <td style="padding: 5px 0; color: #666;">Cestovne:</td>
                    <td style="padding: 5px 0; text-align: right;">${formatCurrency(data.pricing.travelCosts)}</td>
                  </tr>
                  ` : ''}
                  ${data.pricing.discount ? `
                  <tr>
                    <td style="padding: 5px 0; color: #666;">Sleva:</td>
                    <td style="padding: 5px 0; text-align: right; color: #4CAF50;">-${formatCurrency(data.pricing.discount)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 10px 0; border-top: 2px solid #D32F2F; font-size: 18px;"><strong>Celkem:</strong></td>
                    <td style="padding: 10px 0; border-top: 2px solid #D32F2F; text-align: right; font-size: 18px; color: #D32F2F;"><strong>${formatCurrency(data.pricing.totalPrice)}</strong></td>
                  </tr>
                </table>
                ${data.pricing.vatIncluded === false ? '<p style="font-size: 12px; color: #666; margin-bottom: 0;">* Ceny jsou uvedeny bez DPH</p>' : '<p style="font-size: 12px; color: #666; margin-bottom: 0;">* Ceny jsou uvedeny vcetne DPH</p>'}
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${escapeHtml(data.confirmationUrl)}" style="display: inline-block; background-color: #D32F2F; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  ZOBRAZIT A POTVRDIT NABIDKU
                </a>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center;">
                Odkaz je platny do <strong>${formatDate(data.expirationDate)}</strong>
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

              <p style="color: #666; font-size: 14px;">
                ${escapeHtml(s.footerNote)}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #333; padding: 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">${escapeHtml(s.companyName)}</p>
              <p style="color: #999; margin: 5px 0 0; font-size: 12px;">
                ${escapeHtml(s.companyEmail)} | ${escapeHtml(s.companyWeb)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of the email
 */
export function generateOfferEmailText(data: OrderData, settings?: EmailTemplateSettings): string {
  const s = getEffectiveSettings(settings)
  const datesFormatted = data.dates.map(d => formatDate(d)).join(', ')
  const itemsList = data.items.map(item =>
    `- ${item.name}${item.date ? ` (${formatDate(item.date)})` : ''}: ${formatCurrency(item.price)}`
  ).join('\n')

  return `
DOHODA O UMELECKEM VYKONU
Objednavka c. ${data.orderNumber}

${s.greeting}

${s.intro}

SHRNUTÍ OBJEDNAVKY
==================
Akce: ${data.eventName || 'Neuvedeno'}
Datum: ${datesFormatted}
Misto: ${data.venue.name}${data.venue.city ? `, ${data.venue.city}` : ''}

Polozky:
${itemsList}

${data.pricing.travelCosts ? `Cestovne: ${formatCurrency(data.pricing.travelCosts)}\n` : ''}${data.pricing.discount ? `Sleva: -${formatCurrency(data.pricing.discount)}\n` : ''}
Celkem: ${formatCurrency(data.pricing.totalPrice)}

Pro potvrzeni objednavky kliknete na nasledujici odkaz:
${data.confirmationUrl}

Odkaz je platny do ${formatDate(data.expirationDate)}.

${s.footerNote}

---
${s.companyName}
${s.companyEmail}
${s.companyWeb}
  `.trim()
}

/**
 * Get email subject
 * Supports {eventName} placeholder in subject template
 */
export function getOfferEmailSubject(eventName: string, settings?: EmailTemplateSettings): string {
  const s = getEffectiveSettings(settings)
  const subject = s.subject.replace('{eventName}', eventName || '')
  // Clean up if eventName was empty (remove trailing " - ")
  return subject.replace(/ - $/, '').trim()
}

/**
 * Escape HTML special characters
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
