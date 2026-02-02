/**
 * @vertigo/email - Base Template
 * Shared HTML email template with branding
 */

import type { EmailBranding } from '../types'

/**
 * Generate email header with gradient and app name
 */
export function generateHeader(
  branding: EmailBranding,
  title?: string
): string {
  const { appName, primaryColor, secondaryColor, tagline } = branding
  const gradientEnd = secondaryColor || primaryColor

  return `
    <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${gradientEnd} 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">${title || appName}</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 14px;">${tagline}</p>
    </div>
  `
}

/**
 * Generate email footer
 */
export function generateFooter(branding: EmailBranding): string {
  const { appName, tagline, websiteUrl, primaryColor } = branding

  return `
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      ${appName} - ${tagline}
      ${websiteUrl ? `<br><a href="${websiteUrl}" style="color: ${primaryColor};">${websiteUrl.replace('https://', '')}</a>` : ''}
    </p>
  `
}

/**
 * Generate a call-to-action button
 */
export function generateButton(
  text: string,
  url: string,
  color: string
): string {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">${text}</a>
    </div>
  `
}

/**
 * Generate an info box with colored left border
 */
export function generateInfoBox(
  content: string,
  borderColor?: string
): string {
  return `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${borderColor || '#e5e7eb'};">
      ${content}
    </div>
  `
}

/**
 * Generate a warning/notice box
 */
export function generateNoticeBox(
  content: string,
  type: 'warning' | 'success' | 'info' = 'info'
): string {
  const colors = {
    warning: { bg: '#fef9c3', border: '#FACC15', text: '#78350f' },
    success: { bg: '#ecfdf5', border: '#10B981', text: '#047857' },
    info: { bg: '#eff6ff', border: '#3B82F6', text: '#1e40af' },
  }
  const { bg, border, text } = colors[type]

  return `
    <div style="background: ${bg}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${border};">
      <p style="margin: 0; color: ${text}; font-size: 14px;">${content}</p>
    </div>
  `
}

/**
 * Wrap content in base email template
 */
export function wrapInBaseTemplate(
  branding: EmailBranding,
  content: string,
  options: {
    title?: string
    backgroundColor?: string
  } = {}
): string {
  const { title, backgroundColor = '#f9fafb' } = options

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${generateHeader(branding, title)}
        <div style="background: ${backgroundColor}; padding: 30px; border-radius: 0 0 12px 12px;">
          ${content}
          ${generateFooter(branding)}
        </div>
      </body>
    </html>
  `
}
