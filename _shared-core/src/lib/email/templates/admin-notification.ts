/**
 * Admin Notification Email Templates
 *
 * Emails sent to admin when customer confirms or rejects an offer
 */

import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface NotificationData {
  orderNumber: string
  eventName: string
  customerName: string
  customerOrganization?: string
  adminUrl: string
}

interface ConfirmationNotificationData extends NotificationData {
  confirmedByName: string
  confirmedByEmail: string
  confirmedAt: Date
}

interface RejectionNotificationData extends NotificationData {
  customerComments: string
  submittedAt: Date
}

/**
 * Format date in Czech format with time
 */
function formatDateTime(date: Date): string {
  return format(date, "d. MMMM yyyy 'v' HH:mm", { locale: cs })
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

/**
 * Generate confirmation notification email HTML
 */
export function generateConfirmationNotificationHtml(data: ConfirmationNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Objednavka potvrzena</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #4CAF50; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Objednavka potvrzena</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px;">
                  <strong>Zakaznik zavazne potvrdil objednavku!</strong>
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;">Objednavka:</td>
                  <td style="padding: 8px 0;"><strong>${escapeHtml(data.orderNumber)}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Akce:</td>
                  <td style="padding: 8px 0;">${escapeHtml(data.eventName || 'Neuvedeno')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Zakaznik:</td>
                  <td style="padding: 8px 0;">
                    ${escapeHtml(data.customerName)}
                    ${data.customerOrganization ? `<br><span style="color: #666;">${escapeHtml(data.customerOrganization)}</span>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Potvrdil:</td>
                  <td style="padding: 8px 0;">
                    ${escapeHtml(data.confirmedByName)}
                    <br><a href="mailto:${escapeHtml(data.confirmedByEmail)}" style="color: #1976D2;">${escapeHtml(data.confirmedByEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Datum potvrzeni:</td>
                  <td style="padding: 8px 0;">${formatDateTime(data.confirmedAt)}</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${escapeHtml(data.adminUrl)}" style="display: inline-block; background-color: #1976D2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                  ZOBRAZIT OBJEDNAVKU
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                Toto je automaticke upozorneni ze systemu Divadlo Studna
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
 * Generate confirmation notification plain text
 */
export function generateConfirmationNotificationText(data: ConfirmationNotificationData): string {
  return `
OBJEDNAVKA POTVRZENA

Zakaznik zavazne potvrdil objednavku!

Objednavka: ${data.orderNumber}
Akce: ${data.eventName || 'Neuvedeno'}
Zakaznik: ${data.customerName}${data.customerOrganization ? ` (${data.customerOrganization})` : ''}
Potvrdil: ${data.confirmedByName} (${data.confirmedByEmail})
Datum potvrzeni: ${formatDateTime(data.confirmedAt)}

Zobrazit objednavku: ${data.adminUrl}

---
Automaticke upozorneni ze systemu Divadlo Studna
  `.trim()
}

/**
 * Get confirmation notification email subject
 */
export function getConfirmationNotificationSubject(orderNumber: string, eventName: string): string {
  return `Objednavka potvrzena - ${orderNumber}${eventName ? ` ${eventName}` : ''}`
}

/**
 * Generate rejection notification email HTML
 */
export function generateRejectionNotificationHtml(data: RejectionNotificationData): string {
  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pripominky k objednavce</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #FF9800; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Pripominky k objednavce</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 16px;">
                  <strong>Zakaznik zaslal pripominky k nabidce</strong>
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;">Objednavka:</td>
                  <td style="padding: 8px 0;"><strong>${escapeHtml(data.orderNumber)}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Akce:</td>
                  <td style="padding: 8px 0;">${escapeHtml(data.eventName || 'Neuvedeno')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Zakaznik:</td>
                  <td style="padding: 8px 0;">
                    ${escapeHtml(data.customerName)}
                    ${data.customerOrganization ? `<br><span style="color: #666;">${escapeHtml(data.customerOrganization)}</span>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Odeslano:</td>
                  <td style="padding: 8px 0;">${formatDateTime(data.submittedAt)}</td>
                </tr>
              </table>

              <div style="background-color: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333; font-size: 16px;">Pripominky zakaznika:</h3>
                <p style="margin-bottom: 0; white-space: pre-wrap;">${escapeHtml(data.customerComments)}</p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${escapeHtml(data.adminUrl)}" style="display: inline-block; background-color: #1976D2; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                  ZOBRAZIT A UPRAVIT OBJEDNAVKU
                </a>
              </div>

              <p style="color: #666; font-size: 14px; text-align: center;">
                Po uprave objednavky muzete znovu odeslat nabidku zakaznikovi.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 15px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                Toto je automaticke upozorneni ze systemu Divadlo Studna
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
 * Generate rejection notification plain text
 */
export function generateRejectionNotificationText(data: RejectionNotificationData): string {
  return `
PRIPOMINKY K OBJEDNAVCE

Zakaznik zaslal pripominky k nabidce.

Objednavka: ${data.orderNumber}
Akce: ${data.eventName || 'Neuvedeno'}
Zakaznik: ${data.customerName}${data.customerOrganization ? ` (${data.customerOrganization})` : ''}
Odeslano: ${formatDateTime(data.submittedAt)}

PRIPOMINKY ZAKAZNIKA:
${data.customerComments}

Zobrazit a upravit objednavku: ${data.adminUrl}

Po uprave objednavky muzete znovu odeslat nabidku zakaznikovi.

---
Automaticke upozorneni ze systemu Divadlo Studna
  `.trim()
}

/**
 * Get rejection notification email subject
 */
export function getRejectionNotificationSubject(orderNumber: string, eventName: string): string {
  return `Pripominky k objednavce - ${orderNumber}${eventName ? ` ${eventName}` : ''}`
}
