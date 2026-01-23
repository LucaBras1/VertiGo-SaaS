/**
 * Participant Invite Email Template
 *
 * Email sent to event participants (employees, customers, external)
 * with event details and optional pricing
 */

import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { sendEmail } from '@/lib/email'
import type {
  OrderForCalendar,
  ParticipantForCalendar,
  SettingsForCalendar,
} from '@/lib/google-calendar/types'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://divadlo-studna.cz'

interface SendParticipantInviteParams {
  order: OrderForCalendar
  participant: ParticipantForCalendar
  settings: SettingsForCalendar
}

function buildItemUrl(item: OrderForCalendar['items'][0]): string | null {
  if (item.performance?.slug) {
    return `${BASE_URL}/predstaveni/${item.performance.slug}`
  }
  if (item.game?.slug) {
    return `${BASE_URL}/hry/${item.game.slug}`
  }
  if (item.service?.slug) {
    return `${BASE_URL}/sluzby/${item.service.slug}`
  }
  return null
}

function buildGoogleMapsUrl(gps: { lat: number; lng: number } | undefined): string | null {
  if (!gps) return null
  return `https://www.google.com/maps?q=${gps.lat},${gps.lng}`
}

function formatBoolean(value: boolean | undefined | null): string {
  return value ? 'Ano' : 'Ne'
}

export async function sendParticipantInviteEmail(params: SendParticipantInviteParams): Promise<void> {
  const { order, participant, settings } = params

  const participantName = participant.name ||
    (participant.teamMember
      ? `${participant.teamMember.firstName} ${participant.teamMember.lastName}`
      : '')

  const datesFormatted = order.dates
    .map((d) => format(new Date(d), 'd. MMMM yyyy', { locale: cs }))
    .join(', ')

  const gpsUrl = buildGoogleMapsUrl(order.venue.gpsCoordinates)

  // Build items HTML
  const itemsHtml = order.items
    .map((item) => {
      const title = item.performance?.title || item.game?.title || item.service?.title || 'Bez nazvu'
      const url = buildItemUrl(item)
      const dateStr = format(new Date(item.date), 'd.M.yyyy', { locale: cs })
      const time = item.startTime ? `${item.startTime}${item.endTime ? ` - ${item.endTime}` : ''}` : ''

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${url
              ? `<a href="${url}" style="color: #D32F2F; text-decoration: none; font-weight: 500;">${title}</a>`
              : `<span style="font-weight: 500;">${title}</span>`
            }
            <br>
            <span style="color: #666; font-size: 14px;">
              ${dateStr}${time ? ` v ${time}` : ''}
            </span>
          </td>
          ${participant.includePricing
            ? `<td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                ${item.price.toLocaleString('cs-CZ')} Kc
              </td>`
            : ''
          }
        </tr>
      `
    })
    .join('')

  // Build technical requirements section
  const techReqs = order.technicalRequirements
  const techReqsHtml = techReqs
    ? `
      <div style="margin-top: 10px;">
        <strong>Technicke pozadavky:</strong>
        <ul style="margin: 5px 0; padding-left: 20px; color: #666;">
          ${techReqs.parking !== undefined ? `<li>Parkovani: ${formatBoolean(techReqs.parking)}${techReqs.parkingSpaces ? ` (${techReqs.parkingSpaces} mist)` : ''}</li>` : ''}
          ${techReqs.electricity !== undefined ? `<li>Elektrina: ${formatBoolean(techReqs.electricity)}${techReqs.electricityVoltage ? ` (${techReqs.electricityVoltage}V)` : ''}</li>` : ''}
          ${techReqs.sound !== undefined ? `<li>Zvuk: ${formatBoolean(techReqs.sound)}</li>` : ''}
          ${techReqs.lighting !== undefined ? `<li>Osvetleni: ${formatBoolean(techReqs.lighting)}</li>` : ''}
        </ul>
      </div>
    `
    : ''

  // Build pricing section (only for participants with includePricing)
  const pricingHtml = participant.includePricing && order.pricing
    ? `
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; color: #333;">Cena (nejsme platci DPH)</h4>
        ${order.pricing.travelCosts
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #666;">Cestovne:</span>
              <span>${order.pricing.travelCosts.toLocaleString('cs-CZ')} Kc</span>
            </div>`
          : ''
        }
        ${order.pricing.discount
          ? `<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #666;">Sleva:</span>
              <span style="color: #4CAF50;">-${order.pricing.discount.toLocaleString('cs-CZ')} Kc</span>
            </div>`
          : ''
        }
        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #ddd; font-weight: bold;">
          <span>Celkem:</span>
          <span style="color: #D32F2F; font-size: 18px;">${(order.pricing.totalPrice || 0).toLocaleString('cs-CZ')} Kc</span>
        </div>
      </div>
    `
    : ''

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #D32F2F; padding: 30px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">${settings.offerEmailCompanyName || 'Divadlo Studna'}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #D32F2F; margin-top: 0;">Pozvanka na akci</h2>

              <p>Dobry den${participantName ? `, ${participantName}` : ''},</p>
              <p>byli jste pozvan/a jako ${
                participant.type === 'employee' ? 'clen tymu' :
                participant.type === 'customer' ? 'objednavatel' : 'ucastnik'
              } na nasledujici akci:</p>

              <!-- Event Info -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">${order.eventName || `Akce #${order.orderNumber}`}</h3>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 5px 0; color: #666; width: 120px; vertical-align: top;">Datum:</td>
                    <td style="padding: 5px 0;">${datesFormatted}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; vertical-align: top;">Cas prijezdu:</td>
                    <td style="padding: 5px 0;">${order.arrivalTime || '-'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #666; vertical-align: top;">Misto:</td>
                    <td style="padding: 5px 0;">
                      <strong>${order.venue.name}</strong>
                      ${order.venue.street ? `<br>${order.venue.street}` : ''}
                      ${order.venue.city ? `<br>${order.venue.postalCode || ''} ${order.venue.city}` : ''}
                    </td>
                  </tr>
                </table>

                ${gpsUrl
                  ? `<div style="margin-top: 15px;">
                      <a href="${gpsUrl}" style="display: inline-block; background-color: #4285F4; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">
                        Otevrit v Google Maps
                      </a>
                    </div>`
                  : ''
                }

                ${techReqsHtml}
              </div>

              <!-- Program -->
              <h4 style="color: #333; margin-bottom: 10px;">Program</h4>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              ${pricingHtml}

              <!-- Contact Info -->
              <div style="background-color: #fff3e0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Kontakt</h4>
                <p style="margin: 5px 0; color: #666;">
                  ${order.contacts?.divadloOnSite?.name
                    ? `Kontakt na akci: ${order.contacts.divadloOnSite.name}${order.contacts.divadloOnSite.phone ? ` / ${order.contacts.divadloOnSite.phone}` : ''}<br>`
                    : ''
                  }
                  Objednavka c.: ${order.orderNumber}
                </p>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Tato pozvanka byla automaticky vygenerovana.
                ${participant.type !== 'employee' ? 'Udalost by mela byt take ve vasem Google Kalendari.' : ''}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #333; padding: 20px; text-align: center;">
              <p style="color: #fff; margin: 0;">${settings.offerEmailCompanyName || 'Divadlo Studna'}</p>
              <p style="color: #999; margin: 5px 0 0; font-size: 12px;">
                ${settings.offerEmailCompanyEmail || 'produkce@divadlo-studna.cz'} | ${settings.offerEmailCompanyWeb || 'www.divadlo-studna.cz'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  await sendEmail({
    to: participant.email,
    subject: `Pozvanka: ${order.eventName || `Akce #${order.orderNumber}`}`,
    html,
  })
}
