/**
 * Text Generator
 *
 * AI modul pro generování textů faktur, upomínek a emailů.
 * Generuje personalizované texty na základě kontextu a historie.
 */

import prisma from '@/lib/prisma'
import type { DocumentType } from '@/types/invoicing'

// ============================================================================
// TYPES
// ============================================================================

export interface GeneratedText {
  text: string
  variants: string[]
  context: TextContext
}

export interface TextContext {
  documentType?: DocumentType
  customerName?: string
  amount?: number
  dueDate?: Date
  isOverdue?: boolean
  daysOverdue?: number
  reminderLevel?: number
  isRecurring?: boolean
  previousInteraction?: string
}

export interface InvoiceTextSuggestions {
  headerText: string[]
  footerText: string[]
  itemDescriptions: string[]
  emailSubject: string[]
  emailBody: string[]
}

// ============================================================================
// TEMPLATES
// ============================================================================

const HEADER_TEMPLATES = {
  FAKTURA: [
    'Fakturujeme Vám za poskytnuté služby:',
    'Za objednané služby Vám účtujeme:',
    'Vyúčtování za období {period}:',
    'Na základě naší spolupráce Vám fakturujeme:',
  ],
  PROFORMA: [
    'Zálohová faktura na následující služby:',
    'Prosíme o úhradu zálohy za:',
    'Předfaktura na objednané služby:',
  ],
  ZALOHOVA: [
    'Žádáme o úhradu zálohy na:',
    'Zálohová faktura před realizací:',
  ],
  VYZVA_K_PLATBE: [
    'Žádáme o úhradu následující částky:',
    'Výzva k úhradě za služby:',
  ],
  OPRAVNY_DOKLAD: [
    'Opravný daňový doklad k faktuře č. {originalNumber}:',
    'Dobropis k faktuře č. {originalNumber}:',
  ],
  PRIJMOVY_DOKLAD: [
    'Potvrzujeme příjem platby:',
    'Příjmový doklad za:',
  ],
  DANOVY_DOKLAD: [
    'Daňový doklad k přijaté platbě:',
    'Zjednodušený daňový doklad:',
  ],
  CENOVA_NABIDKA: [
    'Nabízíme Vám následující služby:',
    'Cenová nabídka pro {customerName}:',
    'Na základě Vašeho zájmu Vám nabízíme:',
  ],
}

const FOOTER_TEMPLATES = {
  standard: [
    'Děkujeme za spolupráci.',
    'Děkujeme za Vaši důvěru.',
    'Těšíme se na další spolupráci.',
    'V případě dotazů nás neváhejte kontaktovat.',
  ],
  payment: [
    'Platbu prosím proveďte na uvedený účet s variabilním symbolem.',
    'Prosíme o úhradu na bankovní účet uvedený výše.',
    'Částku uhraďte na účet uvedený v záhlaví dokladu.',
  ],
  legal: [
    'Doklad byl vystaven v souladu se zákonem o DPH.',
    'Nejsme plátci DPH dle §6 zákona č. 235/2004 Sb.',
    'Faktura slouží jako daňový doklad.',
  ],
}

const REMINDER_TEMPLATES = {
  1: {
    subject: ['Připomínka platby - faktura {number}', 'Upomínka splatnosti faktury {number}'],
    body: [
      'Dovolujeme si Vás upozornit, že faktura č. {number} ze dne {issueDate} ve výši {amount} Kč je po splatnosti již {days} dní.\n\nProsíme o úhradu na účet {bankAccount} s variabilním symbolem {vs}.\n\nPokud jste již platbu provedli, považujte tento email za bezpředmětný.',
      'Připomínáme, že splatnost faktury č. {number} již vypršela. Prosíme o úhradu částky {amount} Kč.\n\nDěkujeme za pochopení.',
    ],
  },
  2: {
    subject: [
      'Druhá upomínka - faktura {number}',
      'Urgentní: Neuhrazená faktura {number}',
    ],
    body: [
      'Bohužel jsme dosud neobdrželi platbu za fakturu č. {number} ve výši {amount} Kč, která je po splatnosti již {days} dní.\n\nŽádáme o neprodlenou úhradu. V případě problémů nás prosím kontaktujte.',
      'Opakovaně Vás upozorňujeme na neuhrazenou fakturu č. {number}. Prosíme o okamžitou úhradu částky {amount} Kč nebo nás kontaktujte pro domluvení splátkového kalendáře.',
    ],
  },
  3: {
    subject: [
      'Poslední upomínka před vymáháním - {number}',
      'Urgentní výzva k úhradě - {number}',
    ],
    body: [
      'Toto je poslední upomínka před předáním pohledávky k vymáhání. Faktura č. {number} ve výši {amount} Kč je po splatnosti {days} dní.\n\nPokud neobdržíme platbu do 7 dnů, budeme nuceni pohledávku předat k právnímu vymáhání, což může vést k dalším nákladům na Vaší straně.\n\nProsíme o okamžitou úhradu.',
      'Vážený zákazníku,\n\nopakovaně jsme Vás upozorňovali na neuhrazenou fakturu č. {number}. Jelikož jsme platbu stále neobdrželi, zvažujeme předání pohledávky k vymáhání.\n\nProsíme o neprodlenou úhradu {amount} Kč nebo kontaktujte nás k dohodě.',
    ],
  },
}

const EMAIL_TEMPLATES = {
  newInvoice: {
    subject: [
      'Faktura č. {number} - {companyName}',
      'Nová faktura od {companyName}',
      'Vyúčtování služeb - {number}',
    ],
    body: [
      'Dobrý den,\n\nv příloze zasíláme fakturu č. {number} na částku {amount} Kč se splatností {dueDate}.\n\nPlatební údaje:\nČíslo účtu: {bankAccount}\nVariabilní symbol: {vs}\n\nDěkujeme za spolupráci.\n\nS pozdravem,\n{companyName}',
      'Vážený zákazníku,\n\nzasíláme Vám fakturu č. {number}.\n\nČástka: {amount} Kč\nSplatnost: {dueDate}\n\nPro rychlou platbu můžete použít QR kód v příloze.\n\nDěkujeme,\n{companyName}',
    ],
  },
  quote: {
    subject: [
      'Cenová nabídka - {companyName}',
      'Nabídka č. {number}',
    ],
    body: [
      'Dobrý den,\n\nděkujeme za Váš zájem o naše služby. V příloze zasíláme cenovou nabídku č. {number}.\n\nNabídka je platná do {validUntil}.\n\nV případě dotazů jsme Vám k dispozici.\n\nS pozdravem,\n{companyName}',
    ],
  },
  paymentReceived: {
    subject: [
      'Potvrzení platby - faktura {number}',
      'Platba přijata - {companyName}',
    ],
    body: [
      'Dobrý den,\n\npotvrzujeme přijetí platby za fakturu č. {number} ve výši {amount} Kč.\n\nDěkujeme za úhradu.\n\nS pozdravem,\n{companyName}',
    ],
  },
}

const ITEM_DESCRIPTION_TEMPLATES = {
  services: [
    'Služby za období {period}',
    'Konzultační služby - {hours} hodin',
    'Grafické práce - {description}',
    'Webové služby za {month} {year}',
    'Programátorské práce',
    'Správa a údržba systému',
    'Hosting a domény za {period}',
  ],
  products: [
    '{productName} - {quantity} ks',
    'Materiál: {description}',
    'Zboží dle objednávky č. {orderNumber}',
  ],
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generuje návrhy textů pro fakturu
 */
export async function generateInvoiceSuggestions(
  documentType: DocumentType,
  customerId?: string
): Promise<InvoiceTextSuggestions> {
  const headers = HEADER_TEMPLATES[documentType] || HEADER_TEMPLATES.FAKTURA
  const footers = [...FOOTER_TEMPLATES.standard, ...FOOTER_TEMPLATES.payment]

  // Získat historii položek pro zákazníka
  let itemDescriptions = [...ITEM_DESCRIPTION_TEMPLATES.services]

  if (customerId) {
    const previousItems = await getCustomerPreviousItems(customerId)
    if (previousItems.length > 0) {
      itemDescriptions = [...previousItems, ...itemDescriptions]
    }
  }

  // Email templates
  const emailTemplate = EMAIL_TEMPLATES.newInvoice

  return {
    headerText: headers,
    footerText: footers,
    itemDescriptions: [...new Set(itemDescriptions)].slice(0, 10),
    emailSubject: emailTemplate.subject,
    emailBody: emailTemplate.body,
  }
}

/**
 * Generuje text upomínky
 */
export function generateReminderText(
  level: 1 | 2 | 3,
  context: {
    invoiceNumber: string
    issueDate: Date
    amount: number
    daysOverdue: number
    bankAccount: string
    variableSymbol: string
    customerName?: string
  }
): { subject: string; body: string } {
  const templates = REMINDER_TEMPLATES[level]

  const subject = replaceTemplateVariables(
    templates.subject[Math.floor(Math.random() * templates.subject.length)],
    {
      number: context.invoiceNumber,
    }
  )

  const body = replaceTemplateVariables(
    templates.body[Math.floor(Math.random() * templates.body.length)],
    {
      number: context.invoiceNumber,
      issueDate: formatDate(context.issueDate),
      amount: formatCurrency(context.amount),
      days: context.daysOverdue.toString(),
      bankAccount: context.bankAccount,
      vs: context.variableSymbol,
      customerName: context.customerName || 'Vážený zákazníku',
    }
  )

  return { subject, body }
}

/**
 * Generuje email pro fakturu
 */
export function generateInvoiceEmail(
  type: 'newInvoice' | 'quote' | 'paymentReceived',
  context: {
    invoiceNumber: string
    amount: number
    dueDate?: Date
    validUntil?: Date
    bankAccount?: string
    variableSymbol?: string
    companyName: string
  }
): { subject: string; body: string } {
  const templates = EMAIL_TEMPLATES[type]

  const subject = replaceTemplateVariables(
    templates.subject[Math.floor(Math.random() * templates.subject.length)],
    {
      number: context.invoiceNumber,
      companyName: context.companyName,
    }
  )

  const body = replaceTemplateVariables(
    templates.body[Math.floor(Math.random() * templates.body.length)],
    {
      number: context.invoiceNumber,
      amount: formatCurrency(context.amount),
      dueDate: context.dueDate ? formatDate(context.dueDate) : '',
      validUntil: context.validUntil ? formatDate(context.validUntil) : '',
      bankAccount: context.bankAccount || '',
      vs: context.variableSymbol || '',
      companyName: context.companyName,
    }
  )

  return { subject, body }
}

/**
 * Navrhuje popis položky na základě předchozích
 */
export async function suggestItemDescription(
  partialText: string,
  customerId?: string
): Promise<string[]> {
  const suggestions: string[] = []

  // Hledat v předchozích položkách
  const previousItems = await prisma.invoiceItem.findMany({
    where: {
      description: { contains: partialText, mode: 'insensitive' },
      invoice: customerId ? { customerId } : undefined,
    },
    select: { description: true },
    distinct: ['description'],
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  suggestions.push(...previousItems.map((i) => i.description))

  // Přidat šablony pokud je málo návrhů
  if (suggestions.length < 5) {
    const templates = [
      ...ITEM_DESCRIPTION_TEMPLATES.services,
      ...ITEM_DESCRIPTION_TEMPLATES.products,
    ]

    for (const template of templates) {
      if (
        template.toLowerCase().includes(partialText.toLowerCase()) &&
        !suggestions.includes(template)
      ) {
        suggestions.push(template)
      }
    }
  }

  return suggestions.slice(0, 10)
}

/**
 * Generuje personalizovaný text na základě zákazníka
 */
export async function generatePersonalizedText(
  customerId: string,
  textType: 'greeting' | 'closing' | 'thanks'
): Promise<string> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        select: { totalAmount: true },
        where: { status: 'PAID' },
      },
    },
  })

  if (!customer) {
    return getDefaultText(textType)
  }

  const isLongTermCustomer = customer.invoices.length >= 5
  const isHighValue =
    customer.invoices.reduce((sum, i) => sum + i.totalAmount, 0) > 100000

  switch (textType) {
    case 'greeting':
      if (isLongTermCustomer) {
        return `Vážený dlouholetý partnere,`
      }
      return `Dobrý den,`

    case 'closing':
      if (isHighValue) {
        return `Děkujeme za Vaši důvěru a těšíme se na další spolupráci.`
      }
      return `S pozdravem,`

    case 'thanks':
      if (isLongTermCustomer && isHighValue) {
        return `Velmi si vážíme naší dlouhodobé spolupráce a děkujeme za Vaši věrnost.`
      }
      if (isLongTermCustomer) {
        return `Děkujeme za dlouholetou spolupráci.`
      }
      return `Děkujeme za spolupráci.`

    default:
      return getDefaultText(textType)
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCustomerPreviousItems(customerId: string): Promise<string[]> {
  const items = await prisma.invoiceItem.findMany({
    where: {
      invoice: { customerId },
    },
    select: { description: true },
    distinct: ['description'],
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  return items.map((i) => i.description)
}

function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }

  return result
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function getDefaultText(textType: 'greeting' | 'closing' | 'thanks'): string {
  switch (textType) {
    case 'greeting':
      return 'Dobrý den,'
    case 'closing':
      return 'S pozdravem,'
    case 'thanks':
      return 'Děkujeme za spolupráci.'
    default:
      return ''
  }
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

/**
 * Analyzuje předchozí faktury a navrhuje optimální texty
 */
export async function analyzeAndSuggest(customerId: string): Promise<{
  suggestedPaymentDays: number
  suggestedHeaderText: string
  suggestedFooterText: string
  reasoning: string[]
}> {
  const reasoning: string[] = []

  // Získat historii zákazníka
  const invoices = await prisma.invoice.findMany({
    where: { customerId },
    include: { payments: true },
    orderBy: { issueDate: 'desc' },
    take: 10,
  })

  // Výpočet průměrné splatnosti
  let avgPaymentDays = 14
  if (invoices.length > 0) {
    const paymentDelays: number[] = []

    for (const inv of invoices) {
      if (inv.status === 'PAID' && inv.payments.length > 0) {
        const lastPayment = inv.payments.sort(
          (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
        )[0]

        const dueDate = new Date(inv.dueDate)
        const paidDate = new Date(lastPayment.paidAt)
        const delay = Math.floor(
          (paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        paymentDelays.push(delay)
      }
    }

    if (paymentDelays.length > 0) {
      const avgDelay =
        paymentDelays.reduce((a, b) => a + b, 0) / paymentDelays.length

      if (avgDelay <= -3) {
        avgPaymentDays = 21 // Platí předčasně - můžeme prodloužit
        reasoning.push('Zákazník obvykle platí před splatností, doporučujeme delší splatnost.')
      } else if (avgDelay > 7) {
        avgPaymentDays = 7 // Platí pozdě - zkrátit
        reasoning.push('Zákazník často platí po splatnosti, doporučujeme kratší splatnost.')
      }
    }
  } else {
    reasoning.push('Nový zákazník - použita standardní splatnost 14 dní.')
  }

  // Vybrat texty
  const isLongTerm = invoices.length >= 5
  const suggestedHeaderText = isLongTerm
    ? 'Děkujeme za Vaši dlouholetou spolupráci. Fakturujeme Vám:'
    : 'Fakturujeme Vám za poskytnuté služby:'

  const suggestedFooterText = isLongTerm
    ? 'Těšíme se na pokračování naší spolupráce.'
    : 'Děkujeme za spolupráci a včasnou úhradu.'

  if (isLongTerm) {
    reasoning.push('Dlouholetý zákazník - použity personalizované texty.')
  }

  return {
    suggestedPaymentDays: avgPaymentDays,
    suggestedHeaderText,
    suggestedFooterText,
    reasoning,
  }
}
