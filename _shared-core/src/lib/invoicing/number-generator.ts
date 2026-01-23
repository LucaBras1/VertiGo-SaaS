/**
 * Invoice Number Generator
 *
 * Generates unique invoice numbers based on configured patterns
 */

import { prisma } from '@/lib/prisma'
import { DocumentType } from '@/types/invoicing'

/**
 * Pattern placeholders:
 * {PREFIX} - Series prefix (e.g., "FV")
 * {SUFFIX} - Series suffix
 * {YEAR} - Full year (2024)
 * {YY} - Short year (24)
 * {MM} - Month with leading zero (01-12)
 * {NUMBER} - Sequential number
 * {NUMBER:4} - Sequential number with padding (0001)
 */

interface GenerateNumberOptions {
  documentType: DocumentType
  numberSeriesId?: string
  date?: Date
}

interface GeneratedNumber {
  invoiceNumber: string
  variableSymbol: string
  numberSeriesId: string
  sequenceNumber: number
}

/**
 * Generate next invoice number for a document type
 */
export async function generateInvoiceNumber(
  options: GenerateNumberOptions
): Promise<GeneratedNumber> {
  const { documentType, numberSeriesId, date = new Date() } = options

  // Get number series (specific or default for document type)
  const numberSeries = numberSeriesId
    ? await prisma.numberSeries.findUnique({ where: { id: numberSeriesId } })
    : await prisma.numberSeries.findFirst({
        where: {
          documentType,
          isDefault: true,
          isActive: true,
        },
      })

  if (!numberSeries) {
    // Create default number series if none exists
    return generateDefaultNumber(documentType, date)
  }

  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth() + 1

  // Check if we need to reset for new year
  let nextNumber: number
  if (numberSeries.currentYear !== currentYear) {
    // Reset for new year
    nextNumber = 1
    await prisma.numberSeries.update({
      where: { id: numberSeries.id },
      data: {
        currentYear,
        currentNumber: 1,
      },
    })
  } else {
    // Increment number
    nextNumber = numberSeries.currentNumber + 1
    await prisma.numberSeries.update({
      where: { id: numberSeries.id },
      data: {
        currentNumber: nextNumber,
      },
    })
  }

  // Build invoice number from pattern
  const invoiceNumber = buildNumberFromPattern(
    numberSeries.pattern,
    {
      prefix: numberSeries.prefix,
      suffix: numberSeries.suffix || '',
      year: currentYear,
      month: currentMonth,
      number: nextNumber,
      padding: numberSeries.numberPadding,
      yearFormat: numberSeries.yearFormat,
    }
  )

  // Generate variable symbol (numeric only, max 10 digits)
  const variableSymbol = generateVariableSymbol(invoiceNumber, nextNumber, currentYear)

  return {
    invoiceNumber,
    variableSymbol,
    numberSeriesId: numberSeries.id,
    sequenceNumber: nextNumber,
  }
}

/**
 * Build invoice number from pattern template
 */
function buildNumberFromPattern(
  pattern: string,
  vars: {
    prefix: string
    suffix: string
    year: number
    month: number
    number: number
    padding: number
    yearFormat: string
  }
): string {
  let result = pattern

  // Replace placeholders
  result = result.replace('{PREFIX}', vars.prefix)
  result = result.replace('{SUFFIX}', vars.suffix)

  // Year formats
  result = result.replace('{YEAR}', vars.year.toString())
  result = result.replace('{YY}', vars.year.toString().slice(-2))

  // Month
  result = result.replace('{MM}', vars.month.toString().padStart(2, '0'))

  // Number with optional padding
  const paddedNumber = vars.number.toString().padStart(vars.padding, '0')
  result = result.replace(/{NUMBER:\d+}/g, paddedNumber)
  result = result.replace('{NUMBER}', paddedNumber)

  return result
}

/**
 * Generate variable symbol for bank transfers
 */
function generateVariableSymbol(
  invoiceNumber: string,
  sequenceNumber: number,
  year: number
): string {
  // Format: YYYYNNNNN (year + sequence padded to 5 digits)
  // Max 10 digits for Czech VS
  const yearPart = year.toString()
  const numberPart = sequenceNumber.toString().padStart(5, '0')

  // If too long, use just the sequence number
  const vs = yearPart + numberPart
  if (vs.length > 10) {
    return numberPart.slice(-10)
  }

  return vs
}

/**
 * Generate default number when no series is configured
 */
async function generateDefaultNumber(
  documentType: DocumentType,
  date: Date
): Promise<GeneratedNumber> {
  const year = date.getFullYear()

  // Get prefix based on document type
  const prefixes: Record<DocumentType, string> = {
    FAKTURA: 'FV',
    PROFORMA: 'PF',
    ZALOHOVA: 'ZF',
    VYZVA_K_PLATBE: 'VP',
    OPRAVNY_DOKLAD: 'OD',
    PRIJMOVY_DOKLAD: 'PD',
    DANOVY_DOKLAD: 'DD',
    CENOVA_NABIDKA: 'CN',
    OBJEDNAVKA: 'OB',
  }

  const prefix = prefixes[documentType] || 'DOC'

  // Count existing invoices of this type this year
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year + 1, 0, 1)

  const count = await prisma.invoice.count({
    where: {
      documentType,
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  })

  const nextNumber = count + 1
  const paddedNumber = nextNumber.toString().padStart(4, '0')
  const invoiceNumber = `${prefix}${year}-${paddedNumber}`

  // Create default number series for future use
  const numberSeries = await prisma.numberSeries.create({
    data: {
      name: `${prefixes[documentType]} ${year}`,
      documentType,
      prefix,
      pattern: '{PREFIX}{YEAR}-{NUMBER:4}',
      yearFormat: 'YYYY',
      numberPadding: 4,
      currentYear: year,
      currentNumber: nextNumber,
      isDefault: true,
      isActive: true,
    },
  })

  return {
    invoiceNumber,
    variableSymbol: generateVariableSymbol(invoiceNumber, nextNumber, year),
    numberSeriesId: numberSeries.id,
    sequenceNumber: nextNumber,
  }
}

/**
 * Preview next invoice number without incrementing
 */
export async function previewNextNumber(
  documentType: DocumentType,
  numberSeriesId?: string,
  date: Date = new Date()
): Promise<string> {
  const numberSeries = numberSeriesId
    ? await prisma.numberSeries.findUnique({ where: { id: numberSeriesId } })
    : await prisma.numberSeries.findFirst({
        where: {
          documentType,
          isDefault: true,
          isActive: true,
        },
      })

  if (!numberSeries) {
    // Return preview of default format
    const prefixes: Record<DocumentType, string> = {
      FAKTURA: 'FV',
      PROFORMA: 'PF',
      ZALOHOVA: 'ZF',
      VYZVA_K_PLATBE: 'VP',
      OPRAVNY_DOKLAD: 'OD',
      PRIJMOVY_DOKLAD: 'PD',
      DANOVY_DOKLAD: 'DD',
      CENOVA_NABIDKA: 'CN',
      OBJEDNAVKA: 'OB',
    }
    const year = date.getFullYear()
    return `${prefixes[documentType] || 'DOC'}${year}-0001`
  }

  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth() + 1

  // Determine next number
  const nextNumber = numberSeries.currentYear !== currentYear ? 1 : numberSeries.currentNumber + 1

  return buildNumberFromPattern(numberSeries.pattern, {
    prefix: numberSeries.prefix,
    suffix: numberSeries.suffix || '',
    year: currentYear,
    month: currentMonth,
    number: nextNumber,
    padding: numberSeries.numberPadding,
    yearFormat: numberSeries.yearFormat,
  })
}

/**
 * Generate expense number
 */
export async function generateExpenseNumber(date: Date = new Date()): Promise<string> {
  const year = date.getFullYear()

  // Count existing expenses this year
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year + 1, 0, 1)

  const count = await prisma.expense.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  })

  const nextNumber = count + 1
  const paddedNumber = nextNumber.toString().padStart(4, '0')

  return `NAK${year}-${paddedNumber}`
}
