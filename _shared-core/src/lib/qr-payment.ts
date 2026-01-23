/**
 * QR Payment Code Generator
 *
 * Generuje QR kódy ve formátu SPAYD pro rychlé platby.
 * SPAYD (Short Payment Descriptor) je český standard pro QR platby.
 *
 * @see https://qr-platba.cz/pro-vyvojare/
 */

import QRCode from 'qrcode'

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentData {
  /** IBAN nebo české číslo účtu (bez mezer) */
  accountNumber: string
  /** Částka v CZK (celé jednotky, ne haléře) */
  amount: number
  /** Variabilní symbol (max 10 číslic) */
  variableSymbol?: string
  /** Konstantní symbol (max 10 číslic) */
  constantSymbol?: string
  /** Specifický symbol (max 10 číslic) */
  specificSymbol?: string
  /** Zpráva pro příjemce (max 60 znaků) */
  message?: string
  /** Měna (default: CZK) */
  currency?: string
  /** Jméno příjemce (max 35 znaků) */
  recipientName?: string
  /** Datum splatnosti (YYYYMMDD) */
  dueDate?: string
}

export interface QRCodeOptions {
  /** Šířka QR kódu v pixelech */
  width?: number
  /** Okraj kolem QR kódu */
  margin?: number
  /** Úroveň korekce chyb (L, M, Q, H) */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitize string for SPAYD (remove diacritics, special chars)
 */
function sanitizeSpaydString(str: string): string {
  // Replace Czech diacritics
  const diacriticsMap: Record<string, string> = {
    'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i',
    'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u',
    'ů': 'u', 'ý': 'y', 'ž': 'z',
    'Á': 'A', 'Č': 'C', 'Ď': 'D', 'É': 'E', 'Ě': 'E', 'Í': 'I',
    'Ň': 'N', 'Ó': 'O', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ú': 'U',
    'Ů': 'U', 'Ý': 'Y', 'Ž': 'Z',
  }

  let result = str
  for (const [diacritic, replacement] of Object.entries(diacriticsMap)) {
    result = result.replace(new RegExp(diacritic, 'g'), replacement)
  }

  // Remove any remaining special characters (keep alphanumeric and spaces)
  return result.replace(/[^a-zA-Z0-9\s]/g, '').trim()
}

/**
 * Format Czech bank account to IBAN
 * Format: předčíslí-číslo účtu/kód banky
 */
function formatCzechAccountToIban(account: string): string {
  // If already IBAN format, return as is
  if (account.startsWith('CZ')) {
    return account.replace(/\s/g, '')
  }

  // Parse Czech format: předčíslí-číslo/kód nebo číslo/kód
  const match = account.match(/^(?:(\d{1,6})-)?(\d{1,10})\/(\d{4})$/)
  if (!match) {
    // Return as is if not matching Czech format
    return account.replace(/\s/g, '')
  }

  const prefix = match[1] || ''
  const number = match[2]
  const bankCode = match[3]

  // Pad numbers
  const paddedPrefix = prefix.padStart(6, '0')
  const paddedNumber = number.padStart(10, '0')

  // BBAN = kód banky + předčíslí + číslo účtu
  const bban = bankCode + paddedPrefix + paddedNumber

  // Calculate check digits
  // IBAN check: move CZ00 to end, replace letters, calculate mod 97
  const numericBban = bban + '1235' + '00' // CZ = 12, 35

  // Modulo 97 for large numbers using string chunks
  let remainder = 0
  for (let i = 0; i < numericBban.length; i += 7) {
    const chunk = numericBban.slice(i, i + 7)
    remainder = parseInt(remainder.toString() + chunk, 10) % 97
  }
  const checkDigits = 98 - remainder
  const checkStr = checkDigits.toString().padStart(2, '0')

  return `CZ${checkStr}${bban}`
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generuje SPAYD string pro QR kód
 *
 * @param data - Platební údaje
 * @returns SPAYD formátovaný string
 *
 * @example
 * ```typescript
 * const spayd = generateSpaydString({
 *   accountNumber: '123456789/0100',
 *   amount: 1500,
 *   variableSymbol: '2024001',
 *   message: 'Faktura FA2024001'
 * })
 * // Returns: SPD*1.0*ACC:CZ....*AM:1500.00*CC:CZK*X-VS:2024001*MSG:Faktura FA2024001
 * ```
 */
export function generateSpaydString(data: PaymentData): string {
  const parts: string[] = ['SPD*1.0']

  // Account (required) - convert to IBAN if needed
  const iban = formatCzechAccountToIban(data.accountNumber)
  parts.push(`ACC:${iban}`)

  // Amount (required)
  parts.push(`AM:${data.amount.toFixed(2)}`)

  // Currency
  parts.push(`CC:${data.currency || 'CZK'}`)

  // Variable symbol
  if (data.variableSymbol) {
    // Max 10 digits
    const vs = data.variableSymbol.replace(/\D/g, '').substring(0, 10)
    if (vs) {
      parts.push(`X-VS:${vs}`)
    }
  }

  // Constant symbol
  if (data.constantSymbol) {
    const ks = data.constantSymbol.replace(/\D/g, '').substring(0, 10)
    if (ks) {
      parts.push(`X-KS:${ks}`)
    }
  }

  // Specific symbol
  if (data.specificSymbol) {
    const ss = data.specificSymbol.replace(/\D/g, '').substring(0, 10)
    if (ss) {
      parts.push(`X-SS:${ss}`)
    }
  }

  // Recipient name
  if (data.recipientName) {
    const name = sanitizeSpaydString(data.recipientName).substring(0, 35)
    if (name) {
      parts.push(`RN:${name}`)
    }
  }

  // Due date
  if (data.dueDate) {
    const date = data.dueDate.replace(/\D/g, '').substring(0, 8)
    if (date.length === 8) {
      parts.push(`DT:${date}`)
    }
  }

  // Message (max 60 chars)
  if (data.message) {
    const msg = sanitizeSpaydString(data.message).substring(0, 60)
    if (msg) {
      parts.push(`MSG:${msg}`)
    }
  }

  return parts.join('*')
}

/**
 * Generuje QR kód jako Data URL (base64 PNG)
 *
 * @param data - Platební údaje
 * @param options - Volitelné nastavení QR kódu
 * @returns Promise s Data URL (base64)
 *
 * @example
 * ```typescript
 * const dataUrl = await generateQRCodeDataUrl({
 *   accountNumber: '123456789/0100',
 *   amount: 1500,
 *   variableSymbol: '2024001'
 * })
 * // Use in <img src={dataUrl} />
 * ```
 */
export async function generateQRCodeDataUrl(
  data: PaymentData,
  options: QRCodeOptions = {}
): Promise<string> {
  const spaydString = generateSpaydString(data)

  return QRCode.toDataURL(spaydString, {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'image/png',
    width: options.width || 200,
    margin: options.margin ?? 2,
  })
}

/**
 * Generuje QR kód jako SVG string
 *
 * @param data - Platební údaje
 * @param options - Volitelné nastavení QR kódu
 * @returns Promise s SVG stringem
 */
export async function generateQRCodeSvg(
  data: PaymentData,
  options: QRCodeOptions = {}
): Promise<string> {
  const spaydString = generateSpaydString(data)

  return QRCode.toString(spaydString, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    width: options.width || 200,
    margin: options.margin ?? 2,
  })
}

/**
 * Generuje QR kód jako Buffer (pro server-side použití)
 *
 * @param data - Platební údaje
 * @param options - Volitelné nastavení QR kódu
 * @returns Promise s Buffer obsahujícím PNG
 */
export async function generateQRCodeBuffer(
  data: PaymentData,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const spaydString = generateSpaydString(data)

  return QRCode.toBuffer(spaydString, {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: 'png',
    width: options.width || 200,
    margin: options.margin ?? 2,
  })
}

/**
 * Vytvoří platební data z faktury
 *
 * @param invoice - Faktura z databáze
 * @param settings - Vyfakturuj nastavení s bankovními údaji
 * @returns PaymentData pro generování QR kódu
 */
export function createPaymentDataFromInvoice(
  invoice: {
    invoiceNumber: string | null
    totalAmount: number | null
    vyfakturujVS?: number | null
    dueDate?: Date | null
  },
  settings: {
    supplierIban?: string | null
    supplierBankAccount?: string | null
    supplierName?: string | null
  }
): PaymentData | null {
  const accountNumber = settings.supplierIban || settings.supplierBankAccount
  if (!accountNumber) {
    return null
  }

  const amount = (invoice.totalAmount || 0) / 100

  // Format due date
  let dueDate: string | undefined
  if (invoice.dueDate) {
    const d = new Date(invoice.dueDate)
    dueDate = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  }

  return {
    accountNumber,
    amount,
    variableSymbol: invoice.vyfakturujVS?.toString(),
    message: invoice.invoiceNumber ? `Faktura ${invoice.invoiceNumber}` : undefined,
    recipientName: settings.supplierName || undefined,
    dueDate,
  }
}
