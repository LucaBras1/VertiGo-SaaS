/**
 * Event Reminder Email Template
 *
 * Email sent to customer and admin before confirmed events
 * Includes order summary and optional cancellation fee disclaimer
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

interface ReminderOrderData {
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
}

/**
 * Configurable reminder email settings from database
 */
export interface ReminderEmailSettings {
  subject?: string | null
  intro?: string | null
  companyName?: string | null
  companyEmail?: string | null
  companyWeb?: string | null
  // Cancellation fee settings
  cancellationFeeEnabled?: boolean
  cancellationFeeDaysBefore?: number
  cancellationFeeType?: string // 'percentage' | 'fixed'
  cancellationFeeValue?: number
  cancellationFeeText?: string | null
}

// Default values for reminder email template
const DEFAULT_SETTINGS = {
  subject: 'Pripominka: {eventName} - {date}',
  intro: 'Dobrý den, dovolujeme si Vám připomenout blížící se akci, na kterou máte potvrzenou objednávku.',
  companyName: 'Divadlo Studna',
  companyEmail: 'produkce@divadlo-studna.cz',
  companyWeb: 'www.divadlo-studna.cz',
  cancellationFeeEnabled: true,
  cancellationFeeDaysBefore: 14,
  cancellationFeeType: 'percentage',
  cancellationFeeValue: 50,
} as const

interface EffectiveSettings {
  subject: string
  intro: string
  companyName: string
  companyEmail: string
  companyWeb: string
  cancellationFeeEnabled: boolean
  cancellationFeeDaysBefore: number
  cancellationFeeType: string
  cancellationFeeValue: number
  cancellationFeeText: string | null
}

function getString(value: string | null | undefined, fallback: string): string {
  return value || fallback
}

function getEffectiveSettings(settings?: ReminderEmailSettings): EffectiveSettings {
  return {
    subject: getString(settings?.subject, DEFAULT_SETTINGS.subject),
    intro: getString(settings?.intro, DEFAULT_SETTINGS.intro),
    companyName: getString(settings?.companyName, DEFAULT_SETTINGS.companyName),
    companyEmail: getString(settings?.companyEmail, DEFAULT_SETTINGS.companyEmail),
    companyWeb: getString(settings?.companyWeb, DEFAULT_SETTINGS.companyWeb),
    cancellationFeeEnabled: settings?.cancellationFeeEnabled ?? DEFAULT_SETTINGS.cancellationFeeEnabled,
    cancellationFeeDaysBefore: settings?.cancellationFeeDaysBefore ?? DEFAULT_SETTINGS.cancellationFeeDaysBefore,
    cancellationFeeType: settings?.cancellationFeeType || DEFAULT_SETTINGS.cancellationFeeType,
    cancellationFeeValue: settings?.cancellationFeeValue ?? DEFAULT_SETTINGS.cancellationFeeValue,
    cancellationFeeText: settings?.cancellationFeeText || null,
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' Kč'
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return format(date, 'd. MMMM yyyy', { locale: cs })
  } catch {
    return dateString
  }
}

function formatTime(timeString: string): string {
  return timeString
}

/**
 * Generate cancellation fee disclaimer text
 */
function generateCancellationDisclaimer(settings: EffectiveSettings): string {
  if (!settings.cancellationFeeEnabled) {
    return ''
  }

  // Use custom text if provided
  if (settings.cancellationFeeText) {
    return settings.cancellationFeeText
      .replace('{days}', settings.cancellationFeeDaysBefore.toString())
      .replace('{fee}', settings.cancellationFeeType === 'percentage'
        ? `${settings.cancellationFeeValue} %`
        : formatCurrency(settings.cancellationFeeValue))
  }

  // Generate default text
  const feeText = settings.cancellationFeeType === 'percentage'
    ? `${settings.cancellationFeeValue} % z celkové ceny`
    : formatCurrency(settings.cancellationFeeValue)

  return `Upozornění: V případě zrušení akce ve lhůtě kratší než ${settings.cancellationFeeDaysBefore} dní před termínem akce bude účtován storno poplatek ve výši ${feeText}.`
}

/**
 * Get reminder email subject with placeholders replaced
 */
export function getEventReminderSubject(
  eventName: string,
  eventDate: string,
  settings?: ReminderEmailSettings
): string {
  const effective = getEffectiveSettings(settings)
  return effective.subject
    .replace('{eventName}', eventName || 'Akce')
    .replace('{date}', formatDate(eventDate))
}

/**
 * Generate HTML version of the event reminder email
 */
export function generateEventReminderHtml(
  data: ReminderOrderData,
  settings?: ReminderEmailSettings,
  isAdminCopy: boolean = false
): string {
  const effective = getEffectiveSettings(settings)
  const disclaimer = generateCancellationDisclaimer(effective)
  const firstDate = data.dates[0] || ''

  const itemsHtml = data.items
    .map((item) => {
      let details = item.name
      if (item.date) {
        details += ` - ${formatDate(item.date)}`
      }
      if (item.startTime) {
        details += ` v ${formatTime(item.startTime)}`
        if (item.endTime) {
          details += ` - ${formatTime(item.endTime)}`
        }
      }
      return `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${details}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
        </tr>
      `
    })
    .join('')

  const venueAddress = [data.venue.street, data.venue.city, data.venue.postalCode]
    .filter(Boolean)
    .join(', ')

  const datesFormatted = data.dates.map(formatDate).join(', ')

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Připomínka akce</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #D32F2F; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                ${isAdminCopy ? '📋 Kopie připomínky' : '🔔 Připomínka akce'}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              ${isAdminCopy ? `
              <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 12px 16px; margin-bottom: 20px;">
                <strong>Admin kopie:</strong> Tato připomínka byla odeslána zákazníkovi ${data.customer.firstName} ${data.customer.lastName} (${data.customer.email})
              </div>
              ` : ''}

              <p style="margin: 0 0 20px 0; color: #333; line-height: 1.6;">
                ${effective.intro}
              </p>

              <!-- Order Info Box -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 15px 0; color: #D32F2F; font-size: 18px;">
                  📅 ${data.eventName || 'Objednávka'} #${data.orderNumber}
                </h2>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                  <tr>
                    <td style="padding: 5px 0; color: #666; width: 120px;">Datum:</td>
                    <td style="padding: 5px 0; color: #333; font-weight: bold;">${datesFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666;">Místo:</td>
                    <td style="padding: 5px 0; color: #333; font-weight: bold;">${data.venue.name}</td>
                  </tr>
                  ${venueAddress ? `
                  <tr>
                    <td style="padding: 5px 0; color: #666;">Adresa:</td>
                    <td style="padding: 5px 0; color: #333;">${venueAddress}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <!-- Items -->
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Program</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              <!-- Pricing Summary -->
              <div style="background-color: #f0f0f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                ${data.pricing.subtotal ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="color: #666;">Mezisoučet:</span>
                  <span style="color: #333;">${formatCurrency(data.pricing.subtotal)}</span>
                </div>
                ` : ''}
                ${data.pricing.travelCosts ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="color: #666;">Cestovné:</span>
                  <span style="color: #333;">${formatCurrency(data.pricing.travelCosts)}</span>
                </div>
                ` : ''}
                ${data.pricing.discount ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="color: #666;">Sleva:</span>
                  <span style="color: #4CAF50;">-${formatCurrency(data.pricing.discount)}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #ddd; font-weight: bold;">
                  <span style="color: #333;">Celkem:</span>
                  <span style="color: #D32F2F; font-size: 18px;">${formatCurrency(data.pricing.totalPrice)}</span>
                </div>
                ${data.pricing.vatIncluded ? `
                <div style="text-align: right; margin-top: 5px;">
                  <span style="color: #666; font-size: 12px;">Cena včetně DPH</span>
                </div>
                ` : ''}
              </div>

              <!-- Customer Info -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Objednavatel</h4>
                <p style="margin: 0; color: #333;">
                  ${data.customer.firstName} ${data.customer.lastName}<br>
                  ${data.customer.organization ? `${data.customer.organization}<br>` : ''}
                  ${data.customer.email}
                </p>
              </div>

              ${disclaimer ? `
              <!-- Cancellation Fee Disclaimer -->
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; margin-bottom: 20px;">
                <p style="margin: 0; color: #e65100; font-size: 13px;">
                  ⚠️ ${disclaimer}
                </p>
              </div>
              ` : ''}

              <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
                V případě jakýchkoli dotazů nás neváhejte kontaktovat.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 5px 0; color: #333; font-weight: bold;">${effective.companyName}</p>
              <p style="margin: 0; color: #666; font-size: 13px;">
                <a href="mailto:${effective.companyEmail}" style="color: #D32F2F;">${effective.companyEmail}</a>
                ${effective.companyWeb ? ` | <a href="https://${effective.companyWeb}" style="color: #D32F2F;">${effective.companyWeb}</a>` : ''}
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
 * Generate plain text version of the event reminder email
 */
export function generateEventReminderText(
  data: ReminderOrderData,
  settings?: ReminderEmailSettings,
  isAdminCopy: boolean = false
): string {
  const effective = getEffectiveSettings(settings)
  const disclaimer = generateCancellationDisclaimer(effective)

  const itemsList = data.items
    .map((item) => {
      let line = `- ${item.name}`
      if (item.date) {
        line += ` (${formatDate(item.date)}`
        if (item.startTime) {
          line += ` v ${formatTime(item.startTime)}`
        }
        line += ')'
      }
      line += ` - ${formatCurrency(item.price)}`
      return line
    })
    .join('\n')

  const venueAddress = [data.venue.street, data.venue.city, data.venue.postalCode]
    .filter(Boolean)
    .join(', ')

  const datesFormatted = data.dates.map(formatDate).join(', ')

  let text = ''

  if (isAdminCopy) {
    text += `=== ADMIN KOPIE ===\n`
    text += `Tato připomínka byla odeslána zákazníkovi ${data.customer.firstName} ${data.customer.lastName} (${data.customer.email})\n\n`
  }

  text += `PŘIPOMÍNKA AKCE\n`
  text += `${'='.repeat(50)}\n\n`

  text += `${effective.intro}\n\n`

  text += `OBJEDNÁVKA #${data.orderNumber}\n`
  text += `${'-'.repeat(30)}\n`
  text += `Název: ${data.eventName || 'Akce'}\n`
  text += `Datum: ${datesFormatted}\n`
  text += `Místo: ${data.venue.name}\n`
  if (venueAddress) {
    text += `Adresa: ${venueAddress}\n`
  }
  text += `\n`

  text += `PROGRAM\n`
  text += `${'-'.repeat(30)}\n`
  text += `${itemsList}\n\n`

  text += `CENA\n`
  text += `${'-'.repeat(30)}\n`
  if (data.pricing.subtotal) {
    text += `Mezisoučet: ${formatCurrency(data.pricing.subtotal)}\n`
  }
  if (data.pricing.travelCosts) {
    text += `Cestovné: ${formatCurrency(data.pricing.travelCosts)}\n`
  }
  if (data.pricing.discount) {
    text += `Sleva: -${formatCurrency(data.pricing.discount)}\n`
  }
  text += `Celkem: ${formatCurrency(data.pricing.totalPrice)}\n`
  if (data.pricing.vatIncluded) {
    text += `(Cena včetně DPH)\n`
  }
  text += `\n`

  text += `OBJEDNAVATEL\n`
  text += `${'-'.repeat(30)}\n`
  text += `${data.customer.firstName} ${data.customer.lastName}\n`
  if (data.customer.organization) {
    text += `${data.customer.organization}\n`
  }
  text += `${data.customer.email}\n\n`

  if (disclaimer) {
    text += `⚠️ ${disclaimer}\n\n`
  }

  text += `V případě jakýchkoli dotazů nás neváhejte kontaktovat.\n\n`

  text += `${'-'.repeat(50)}\n`
  text += `${effective.companyName}\n`
  text += `${effective.companyEmail}\n`
  if (effective.companyWeb) {
    text += `${effective.companyWeb}\n`
  }

  return text
}
