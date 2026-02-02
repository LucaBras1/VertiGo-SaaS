/**
 * @vertigo/email - Invoice Email Template
 */

import type { EmailBranding, InvoiceEmailData } from '../types'
import { wrapInBaseTemplate, generateButton, generateInfoBox } from './base'

/**
 * Generate invoice email HTML
 */
export function generateInvoiceEmail(
  branding: EmailBranding,
  data: InvoiceEmailData
): string {
  const { recipientName, invoiceNumber, amount, dueDate, invoiceUrl } = data

  const invoiceDetails = `
    <p style="margin: 5px 0;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
    <p style="margin: 5px 0;"><strong>Amount:</strong> ${amount}</p>
    <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDate}</p>
  `

  const content = `
    <p style="font-size: 16px;">Hello, <strong>${recipientName}</strong>!</p>
    <p>We're sending you a new invoice:</p>
    ${generateInfoBox(invoiceDetails, '#e5e7eb')}
    ${generateButton('View Invoice', invoiceUrl, branding.primaryColor)}
  `

  return wrapInBaseTemplate(branding, content, { title: 'New Invoice' })
}

/**
 * Generate invoice email plain text
 */
export function generateInvoiceEmailText(
  branding: EmailBranding,
  data: InvoiceEmailData
): string {
  const { recipientName, invoiceNumber, amount, dueDate, invoiceUrl } = data
  return `Hello, ${recipientName}! Invoice ${invoiceNumber} for ${amount}. Due: ${dueDate}. View: ${invoiceUrl}`
}
