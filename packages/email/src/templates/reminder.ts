/**
 * @vertigo/email - Reminder Email Template
 */

import type { EmailBranding, ReminderEmailData } from '../types'
import { wrapInBaseTemplate, generateInfoBox } from './base'

/**
 * Generate reminder email HTML
 */
export function generateReminderEmail(
  branding: EmailBranding,
  data: ReminderEmailData
): string {
  const { recipientName, eventName, eventDate, eventTime, location, notes } = data

  const eventDetails = `
    <p style="margin: 5px 0;"><strong>Event:</strong> ${eventName}</p>
    <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate}</p>
    <p style="margin: 5px 0;"><strong>Time:</strong> ${eventTime}</p>
    ${location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>` : ''}
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${recipientName}</strong>!</p>
    <p>This is a reminder about your upcoming event:</p>
    ${generateInfoBox(eventDetails, branding.primaryColor)}
    ${notes ? `<p style="color: #666; font-size: 14px;"><strong>Notes:</strong> ${notes}</p>` : ''}
    <p style="color: #666; font-size: 14px;">We look forward to seeing you!</p>
  `

  return wrapInBaseTemplate(branding, content, { title: 'Event Reminder' })
}

/**
 * Generate reminder email plain text
 */
export function generateReminderEmailText(
  branding: EmailBranding,
  data: ReminderEmailData
): string {
  const { recipientName, eventName, eventDate, eventTime, location } = data
  return `Hello, ${recipientName}! Reminder: ${eventName} on ${eventDate} at ${eventTime}${location ? ` at ${location}` : ''}.`
}
