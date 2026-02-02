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

// Order Cancellation Email
export async function sendOrderCancellationEmail({
  to,
  parentName,
  childName,
  partyDate,
  orderNumber,
  refundAmount,
  reason,
}: {
  to: string
  parentName: string
  childName: string
  partyDate: string
  orderNumber: string
  refundAmount?: string
  reason?: string
}): Promise<EmailResult> {
  const cancellationDetails = `
    <h3 style="margin: 0 0 15px; color: #DC2626;">Zrušení rezervace</h3>
    <p style="margin: 5px 0;"><strong>Číslo objednávky:</strong> ${orderNumber}</p>
    <p style="margin: 5px 0;"><strong>Původní datum:</strong> ${partyDate}</p>
    ${reason ? `<p style="margin: 5px 0;"><strong>Důvod:</strong> ${reason}</p>` : ''}
  `

  const refundInfo = refundAmount
    ? generateNoticeBox(`<strong>Vrácení platby:</strong> Částka ${refundAmount} bude vrácena na Váš účet do 5-7 pracovních dnů.`, 'warning')
    : ''

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${parentName}</strong>,</p>
    <p>S lítostí Vám oznamujeme, že oslava pro <strong>${childName}</strong> byla zrušena.</p>
    ${generateInfoBox(cancellationDetails, '#DC2626')}
    ${refundInfo}
    <p style="color: #666; font-size: 14px;">Pokud máte zájem o náhradní termín, neváhejte nás kontaktovat. Rádi Vám pomůžeme naplánovat novou oslavu.</p>
    ${generateButton('Kontaktovat nás', 'mailto:info@partypal.cz', kidsEntertainmentTheme.primaryColor)}
  `

  const html = wrapInBaseTemplate(kidsEntertainmentTheme, content, { backgroundColor: '#fdf2f8' })

  return emailService.sendCustom({
    to,
    subject: `Zrušení rezervace - ${orderNumber}`,
    html,
    text: `Dobrý den, ${parentName}. Oslava pro ${childName} plánovaná na ${partyDate} byla zrušena. Číslo objednávky: ${orderNumber}.${refundAmount ? ` Vrácení platby: ${refundAmount}` : ''}`,
  })
}

// Payment Reminder Email (3 days before due date)
export async function sendPaymentReminderEmail({
  to,
  parentName,
  childName,
  partyDate,
  invoiceNumber,
  amount,
  dueDate,
  paymentUrl,
}: {
  to: string
  parentName: string
  childName: string
  partyDate: string
  invoiceNumber: string
  amount: string
  dueDate: string
  paymentUrl: string
}): Promise<EmailResult> {
  const reminderDetails = `
    <h3 style="margin: 0 0 15px; color: #F59E0B;">Připomenutí platby</h3>
    <p style="margin: 5px 0;"><strong>Číslo faktury:</strong> ${invoiceNumber}</p>
    <p style="margin: 5px 0;"><strong>Částka k úhradě:</strong> ${amount}</p>
    <p style="margin: 5px 0;"><strong>Splatnost:</strong> ${dueDate}</p>
    <p style="margin: 5px 0;"><strong>Oslava:</strong> ${partyDate}</p>
  `

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${parentName}</strong>,</p>
    <p>Připomínáme Vám blížící se splatnost faktury pro oslavu <strong>${childName}</strong>.</p>
    ${generateInfoBox(reminderDetails, '#F59E0B')}
    ${generateButton('Zaplatit nyní', paymentUrl, kidsEntertainmentTheme.primaryColor)}
    <p style="color: #666; font-size: 14px;">Pokud jste již platbu provedli, prosím ignorujte tuto zprávu. Platby se mohou na našem účtu projevit až za 1-2 pracovní dny.</p>
  `

  const html = wrapInBaseTemplate(kidsEntertainmentTheme, content, { backgroundColor: '#fdf2f8' })

  return emailService.sendCustom({
    to,
    subject: `Připomenutí platby - Faktura ${invoiceNumber}`,
    html,
    text: `Dobrý den, ${parentName}. Připomínáme Vám splatnost faktury ${invoiceNumber} na částku ${amount}. Splatnost: ${dueDate}. Zaplaťte na: ${paymentUrl}`,
  })
}

// Post-Party Feedback Email (1 day after party)
export async function sendPostPartyFeedbackEmail({
  to,
  parentName,
  childName,
  partyDate,
  feedbackUrl,
  photoGalleryUrl,
}: {
  to: string
  parentName: string
  childName: string
  partyDate: string
  feedbackUrl: string
  photoGalleryUrl?: string
}): Promise<EmailResult> {
  const thankYouMessage = `
    <h3 style="margin: 0 0 15px; color: ${kidsEntertainmentTheme.primaryColor};">Děkujeme!</h3>
    <p style="margin: 5px 0;">Bylo nám ctí být součástí oslavy <strong>${childName}</strong>.</p>
    <p style="margin: 5px 0;">Doufáme, že se všem dětem i dospělým oslava líbila!</p>
  `

  const photoGallerySection = photoGalleryUrl ? `
    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px; color: #78350f;">Fotogalerie</h4>
      <p style="margin: 0; color: #78350f; font-size: 14px;">Připravili jsme pro Vás fotky z oslavy!</p>
      ${generateButton('Zobrazit fotky', photoGalleryUrl, '#F59E0B')}
    </div>
  ` : ''

  const content = `
    <p style="font-size: 16px;">Dobrý den, <strong>${parentName}</strong>!</p>
    ${generateInfoBox(thankYouMessage, kidsEntertainmentTheme.primaryColor)}
    ${photoGallerySection}
    <p style="font-size: 16px; margin: 20px 0;">Vaše zpětná vazba je pro nás velmi důležitá. Pomůže nám zlepšovat naše služby a připravovat ještě lepší oslavy.</p>
    ${generateButton('Napsat hodnocení', feedbackUrl, kidsEntertainmentTheme.primaryColor)}
    <div style="margin-top: 30px; padding: 20px; background: #fdf2f8; border-radius: 8px;">
      <h4 style="margin: 0 0 10px; color: ${kidsEntertainmentTheme.primaryColor};">Plánujete další oslavu?</h4>
      <p style="margin: 0; font-size: 14px; color: #666;">Pro naše stálé zákazníky máme speciální nabídky. Kontaktujte nás pro více informací!</p>
    </div>
    <p style="color: #666; font-size: 14px; margin-top: 20px;">Ještě jednou děkujeme a těšíme se na další setkání!</p>
  `

  const html = wrapInBaseTemplate(kidsEntertainmentTheme, content, { backgroundColor: '#fdf2f8' })

  return emailService.sendCustom({
    to,
    subject: `Jak se Vám líbila oslava ${childName}?`,
    html,
    text: `Dobrý den, ${parentName}! Děkujeme, že jste si vybrali PartyPal pro oslavu ${childName}. Budeme rádi za Vaše hodnocení: ${feedbackUrl}${photoGalleryUrl ? `. Fotky z oslavy: ${photoGalleryUrl}` : ''}`,
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
