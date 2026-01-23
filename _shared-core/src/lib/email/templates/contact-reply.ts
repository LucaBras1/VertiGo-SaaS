/**
 * Email template for contact message replies
 */

interface ContactReplyEmailData {
  recipientName: string
  originalSubject: string
  originalMessage: string
  replyMessage: string
  companyName: string
  companyEmail: string
  companyWeb?: string
}

/**
 * Generate reply email for contact message
 */
export function generateContactReplyEmail(data: ContactReplyEmailData): {
  html: string
  text: string
} {
  const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re: ${data.originalSubject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF4444 0%, #FF2222 100%); padding: 24px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                ${data.companyName}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dobrý den, ${data.recipientName},
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                děkujeme za vaši zprávu. Zde je naše odpověď:
              </p>

              <!-- Reply -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 0 8px 8px 0; padding: 20px; margin-bottom: 30px;">
                <div style="color: #333333; font-size: 15px; line-height: 1.8; white-space: pre-line;">
${data.replyMessage}
                </div>
              </div>

              <!-- Original Message -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 13px; margin: 0 0 12px 0; font-weight: 600;">
                  Vaše původní zpráva:
                </p>
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px;">
                  <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;">
                    <strong>Předmět:</strong> ${data.originalSubject}
                  </p>
                  <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-line;">
${data.originalMessage}
                  </p>
                </div>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                S přátelským pozdravem,<br>
                <strong>${data.companyName}</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #333333; padding: 24px 40px; text-align: center;">
              <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 14px;">
                ${data.companyName}
              </p>
              <p style="color: #9ca3af; margin: 0 0 4px 0; font-size: 13px;">
                <a href="mailto:${data.companyEmail}" style="color: #FF6666; text-decoration: none;">
                  ${data.companyEmail}
                </a>
              </p>
              ${data.companyWeb ? `
              <p style="margin: 0;">
                <a href="https://${data.companyWeb}" style="color: #FF6666; text-decoration: none; font-size: 13px;">
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
Dobrý den, ${data.recipientName},

děkujeme za vaši zprávu. Zde je naše odpověď:

---
${data.replyMessage}
---

Vaše původní zpráva:
Předmět: ${data.originalSubject}

${data.originalMessage}

S přátelským pozdravem,
${data.companyName}
${data.companyEmail}
${data.companyWeb || ''}
  `.trim()

  return { html, text }
}
