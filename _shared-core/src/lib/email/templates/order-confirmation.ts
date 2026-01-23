/**
 * Email templates for public order confirmations
 */

interface OrderConfirmationEmailData {
  orderNumber: string
  customerName: string
  performanceTitle?: string
  preferredDate: string
  alternativeDate?: string
  venueCity: string
  venueType: string
  companyName: string
  companyEmail: string
  companyWeb: string
}

interface AdminNotificationEmailData {
  orderNumber: string
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  organization?: string
  performanceTitle?: string
  preferredDate: string
  alternativeDate?: string
  venueCity: string
  venueType: string
  audienceCount?: number | null
  message?: string
}

/**
 * Format date to Czech format
 */
function formatDateCZ(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Generate confirmation email for customer
 */
export function generateOrderConfirmationEmail(data: OrderConfirmationEmailData): {
  html: string
  text: string
} {
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potvrzení poptávky</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF4444 0%, #FF2222 100%); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Poptávka odeslána!
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                Číslo: <strong>${data.orderNumber}</strong>
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dobrý den, ${data.customerName},
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                děkujeme za váš zájem o naše představení! Vaše poptávka byla úspěšně přijata a brzy se vám ozveme s cenovou nabídkou.
              </p>

              <!-- Order Summary -->
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                <h2 style="color: #333333; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
                  Shrnutí poptávky
                </h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${data.performanceTitle ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 140px;">Představení:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.performanceTitle}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Preferovaný termín:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 500;">${formatDateCZ(data.preferredDate)}</td>
                  </tr>
                  ${data.alternativeDate ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Náhradní termín:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${formatDateCZ(data.alternativeDate)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;">Místo:</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${data.venueCity} (${data.venueType})</td>
                  </tr>
                </table>
              </div>

              <!-- What's Next -->
              <h2 style="color: #333333; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
                Co bude následovat?
              </h2>
              <ol style="color: #333333; font-size: 15px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Do <strong>24 hodin</strong> vám zašleme cenovou nabídku</li>
                <li style="margin-bottom: 8px;">Po vašem potvrzení rezervujeme termín</li>
                <li>Před akcí vám zašleme vše potřebné (technické info, smlouvu...)</li>
              </ol>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                Máte dotaz? Neváhejte nás kontaktovat na <a href="mailto:${data.companyEmail}" style="color: #FF4444;">${data.companyEmail}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #333333; padding: 30px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                ${data.companyName}
              </p>
              ${data.companyWeb ? `
              <p style="margin: 0;">
                <a href="https://${data.companyWeb}" style="color: #FF6666; text-decoration: none; font-size: 14px;">
                  ${data.companyWeb}
                </a>
              </p>
              ` : ''}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Poptávka odeslána!
Číslo: ${data.orderNumber}

Dobrý den, ${data.customerName},

děkujeme za váš zájem o naše představení! Vaše poptávka byla úspěšně přijata a brzy se vám ozveme s cenovou nabídkou.

SHRNUTÍ POPTÁVKY
${data.performanceTitle ? `Představení: ${data.performanceTitle}\n` : ''}Preferovaný termín: ${formatDateCZ(data.preferredDate)}
${data.alternativeDate ? `Náhradní termín: ${formatDateCZ(data.alternativeDate)}\n` : ''}Místo: ${data.venueCity} (${data.venueType})

CO BUDE NÁSLEDOVAT?
1. Do 24 hodin vám zašleme cenovou nabídku
2. Po vašem potvrzení rezervujeme termín
3. Před akcí vám zašleme vše potřebné

Máte dotaz? Kontaktujte nás na ${data.companyEmail}

${data.companyName}
${data.companyWeb}
  `.trim()

  return { html, text }
}

/**
 * Generate notification email for admin
 */
export function generateAdminOrderNotificationEmail(data: AdminNotificationEmailData): {
  html: string
  text: string
} {
  const adminUrl = `/admin/orders/${data.orderId}`

  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nová poptávka z webu</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 24px 40px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: bold;">
                Nová poptávka z webu
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
                #${data.orderNumber}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px;">

              <!-- Customer Info -->
              <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #0ea5e9;">
                <h3 style="color: #0369a1; font-size: 14px; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.5px;">
                  Zákazník
                </h3>
                <p style="color: #333333; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">
                  ${data.customerName}
                </p>
                <p style="color: #666666; font-size: 14px; margin: 0 0 4px 0;">
                  📧 <a href="mailto:${data.customerEmail}" style="color: #0369a1;">${data.customerEmail}</a>
                </p>
                <p style="color: #666666; font-size: 14px; margin: 0 0 4px 0;">
                  📞 <a href="tel:${data.customerPhone}" style="color: #0369a1;">${data.customerPhone}</a>
                </p>
                ${data.organization ? `
                <p style="color: #666666; font-size: 14px; margin: 0;">
                  🏢 ${data.organization}
                </p>
                ` : ''}
              </div>

              <!-- Order Details -->
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="color: #333333; font-size: 14px; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.5px;">
                  Detaily poptávky
                </h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  ${data.performanceTitle ? `
                  <tr>
                    <td style="padding: 6px 0; color: #666666; font-size: 14px; width: 140px;">Představení:</td>
                    <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${data.performanceTitle}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 6px 0; color: #666666; font-size: 14px;">Preferovaný termín:</td>
                    <td style="padding: 6px 0; color: #333333; font-size: 14px; font-weight: 500;">${formatDateCZ(data.preferredDate)}</td>
                  </tr>
                  ${data.alternativeDate ? `
                  <tr>
                    <td style="padding: 6px 0; color: #666666; font-size: 14px;">Náhradní termín:</td>
                    <td style="padding: 6px 0; color: #333333; font-size: 14px;">${formatDateCZ(data.alternativeDate)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 6px 0; color: #666666; font-size: 14px;">Místo:</td>
                    <td style="padding: 6px 0; color: #333333; font-size: 14px;">${data.venueCity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #666666; font-size: 14px;">Typ akce:</td>
                    <td style="padding: 6px 0; color: #333333; font-size: 14px;">${data.venueType}</td>
                  </tr>
                  ${data.audienceCount ? `
                  <tr>
                    <td style="padding: 6px 0; color: #666666; font-size: 14px;">Počet diváků:</td>
                    <td style="padding: 6px 0; color: #333333; font-size: 14px;">~${data.audienceCount}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${data.message ? `
              <!-- Message -->
              <div style="background-color: #fefce8; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #eab308;">
                <h3 style="color: #854d0e; font-size: 14px; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.5px;">
                  Zpráva od zákazníka
                </h3>
                <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-line;">
                  ${data.message}
                </p>
              </div>
              ` : ''}

              <!-- CTA -->
              <div style="text-align: center; padding-top: 16px;">
                <a href="${adminUrl}" style="display: inline-block; background-color: #FF4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                  Zobrazit objednávku →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 40px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Tato notifikace byla automaticky vygenerována z webu.
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

  const text = `
NOVÁ POPTÁVKA Z WEBU #${data.orderNumber}

ZÁKAZNÍK
${data.customerName}
Email: ${data.customerEmail}
Telefon: ${data.customerPhone}
${data.organization ? `Organizace: ${data.organization}` : ''}

DETAILY POPTÁVKY
${data.performanceTitle ? `Představení: ${data.performanceTitle}\n` : ''}Preferovaný termín: ${formatDateCZ(data.preferredDate)}
${data.alternativeDate ? `Náhradní termín: ${formatDateCZ(data.alternativeDate)}\n` : ''}Místo: ${data.venueCity}
Typ akce: ${data.venueType}
${data.audienceCount ? `Počet diváků: ~${data.audienceCount}` : ''}

${data.message ? `ZPRÁVA OD ZÁKAZNÍKA\n${data.message}` : ''}

Zobrazit objednávku v admin panelu: ${adminUrl}
  `.trim()

  return { html, text }
}
