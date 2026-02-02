/**
 * Email Service - PartyPal
 * Email notifications for kids entertainment bookings
 * Using @vertigo/email shared package
 */

import {
  createEmailService,
  kidsEntertainmentTheme,
  generateButton,
  generateInfoBox,
  generateNoticeBox,
  wrapInBaseTemplate,
  type EmailResult,
  type EmailAttachment,
} from '@vertigo/email'

// Create email service with kids entertainment branding
const emailService = createEmailService({
  branding: kidsEntertainmentTheme,
})

// Re-export for convenience
export type { EmailResult }

interface Attachment {
  filename: string
  content: Buffer
  contentType?: string
}

// Booking Confirmation Email
export async function sendBookingConfirmationEmail({
  to,
  parentName,
  childName,
  partyDate,
  partyTime,
  venue,
  packageName,
  depositAmount,
  paymentUrl,
}: {
  to: string
  parentName: string
  childName: string
  partyDate: string
  partyTime?: string
  venue: string
  packageName: string
  depositAmount: string
  paymentUrl: string
}): Promise<EmailResult> {
  const partyDetails = `
    <h3 style="margin: 0 0 15px; color: ${kidsEntertainmentTheme.primaryColor};">Detaily oslavy</h3>
    <p style="margin: 5px 0;"><strong>Datum:</strong> ${partyDate}${partyTime ? ` v ${partyTime}` : ''}</p>
    <p style="margin: 5px 0;"><strong>Místo:</strong> ${venue}</p>
    <p style="margin: 5px 0;"><strong>Balíček:</strong> ${packageName}</p>
  `

  const depositNotice = `<strong>Záloha k úhradě:</strong> ${depositAmount}`

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${parentName}</strong>!</p>
    <p>Děkujeme za Vaši rezervaci! Těšíme se na oslavu <strong>${childName}</strong>.</p>
    ${generateInfoBox(partyDetails, kidsEntertainmentTheme.primaryColor)}
    ${generateNoticeBox(depositNotice, 'warning')}
    ${generateButton('Zaplatit zálohu', paymentUrl, kidsEntertainmentTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Po uhrazení zálohy Vám pošleme potvrzení a další informace k přípravě oslavy.</p>
  `

  const html = wrapInBaseTemplate(kidsEntertainmentTheme, content, { backgroundColor: '#fdf2f8' })

  return emailService.sendCustom({
    to,
    subject: `Potvrzení rezervace - Oslava ${childName}`,
    html,
    text: `Dobrý den, ${parentName}! Děkujeme za rezervaci oslavy pro ${childName} dne ${partyDate}. Balíček: ${packageName}. Místo: ${venue}. Záloha: ${depositAmount}. Zaplaťte na: ${paymentUrl}`,
  })
}

// Payment Receipt Email (with PDF attachment)
export async function sendPaymentReceiptEmail({
  to,
  parentName,
  invoiceNumber,
  amount,
  paymentType,
  partyDate,
  pdfBuffer,
}: {
  to: string
  parentName: string
  invoiceNumber: string
  amount: string
  paymentType: 'deposit' | 'full_payment'
  partyDate?: string
  pdfBuffer?: Buffer
}): Promise<EmailResult> {
  const paymentTypeText = paymentType === 'deposit' ? 'Záloha' : 'Doplatek'

  const paymentDetails = `
    <h3 style="margin: 0 0 15px; color: #10B981;">Platba přijata</h3>
    <p style="margin: 5px 0;"><strong>Číslo faktury:</strong> ${invoiceNumber}</p>
    <p style="margin: 5px 0;"><strong>Typ platby:</strong> ${paymentTypeText}</p>
    <p style="margin: 5px 0;"><strong>Částka:</strong> ${amount}</p>
    ${partyDate ? `<p style="margin: 5px 0;"><strong>Datum oslavy:</strong> ${partyDate}</p>` : ''}
  `

  const nextSteps = paymentType === 'deposit'
    ? generateNoticeBox('<strong>Další kroky:</strong> Před oslavou Vás budeme kontaktovat s dalšími detaily a připomeneme doplatek.', 'warning')
    : generateNoticeBox('<strong>Vše je připraveno!</strong> Těšíme se na Vás na oslavě.', 'success')

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${parentName}</strong>!</p>
    <p>Děkujeme za Vaši platbu! Faktura je v příloze tohoto emailu.</p>
    ${generateInfoBox(paymentDetails, '#10B981')}
    ${nextSteps}
    <p style="color: #666; font-size: 14px;">Faktura je přiložena k tomuto emailu ve formátu PDF.</p>
  `

  const html = wrapInBaseTemplate(kidsEntertainmentTheme, content, { backgroundColor: '#fdf2f8' })

  const attachments: EmailAttachment[] = []
  if (pdfBuffer) {
    attachments.push({
      filename: `faktura-${invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    })
  }

  return emailService.sendCustom({
    to,
    subject: `Faktura ${invoiceNumber} - ${paymentTypeText} přijata`,
    html,
    text: `Dobrý den, ${parentName}! Děkujeme za platbu. Číslo faktury: ${invoiceNumber}. Typ: ${paymentTypeText}. Částka: ${amount}. Faktura je v příloze.`,
    attachments,
  })
}

// Party Reminder Email (24h before)
export async function sendPartyReminderEmail({
  to,
  parentName,
  childName,
  partyDate,
  partyTime,
  venue,
  packageName,
  allergyNotes,
  emergencyContact,
}: {
  to: string
  parentName: string
  childName: string
  partyDate: string
  partyTime: string
  venue: string
  packageName: string
  allergyNotes?: string
  emergencyContact?: { name: string; phone: string }
}): Promise<EmailResult> {
  const partyDetails = `
    <h3 style="margin: 0 0 15px; color: ${kidsEntertainmentTheme.primaryColor};">Připomenutí oslavy</h3>
    <p style="margin: 5px 0;"><strong>Datum:</strong> ${partyDate}</p>
    <p style="margin: 5px 0;"><strong>Čas:</strong> ${partyTime}</p>
    <p style="margin: 5px 0;"><strong>Místo:</strong> ${venue}</p>
    <p style="margin: 5px 0;"><strong>Program:</strong> ${packageName}</p>
  `

  const allergyBox = allergyNotes ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <h4 style="margin: 0 0 10px; color: #D97706;">Alergie a dietetika</h4>
      <p style="margin: 0; color: #92400E; font-size: 14px;">${allergyNotes}</p>
    </div>
  ` : ''

  const emergencyBox = emergencyContact ? `
    <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
      <h4 style="margin: 0 0 10px; color: #DC2626;">Nouzový kontakt</h4>
      <p style="margin: 0; color: #991B1B; font-size: 14px;">${emergencyContact.name}: ${emergencyContact.phone}</p>
    </div>
  ` : ''

  const whatToExpect = `
    <div style="background: #fef9c3; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px; color: #78350f;">Co očekávat</h4>
      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px;">
        <li>Náš tým dorazí 30 minut před začátkem</li>
        <li>Připravíme výzdobu a atrakce</li>
        <li>Postaráme se o program a zábavu pro děti</li>
        <li>Na konci uklidíme prostor</li>
      </ul>
    </div>
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${parentName}</strong>!</p>
    <p style="font-size: 18px; color: ${kidsEntertainmentTheme.primaryColor}; font-weight: bold;">
      Zítra je velký den! Oslava ${childName} je už za rohem.
    </p>
    ${generateInfoBox(partyDetails, kidsEntertainmentTheme.primaryColor)}
    ${allergyBox}
    ${emergencyBox}
    ${whatToExpect}
    <p style="color: #666; font-size: 14px;">V případě dotazů nás kontaktujte. Těšíme se na Vás!</p>
  `

  const html = wrapInBaseTemplate(kidsEntertainmentTheme, content, { backgroundColor: '#fdf2f8' })

  return emailService.sendCustom({
    to,
    subject: `Připomenutí: Oslava ${childName} - ZÍTRA`,
    html,
    text: `Dobrý den, ${parentName}! Zítra je oslava ${childName}. Datum: ${partyDate}, Čas: ${partyTime}, Místo: ${venue}. Program: ${packageName}. Těšíme se na Vás!`,
  })
}

// Generic email sending (for backwards compatibility)
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Attachment[]
}): Promise<EmailResult> {
  return emailService.sendCustom({
    to,
    subject,
    html,
    text,
    attachments: attachments?.map(a => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  })
}
