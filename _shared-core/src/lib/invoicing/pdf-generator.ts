/**
 * Invoice PDF Generator
 *
 * Generates Czech-compliant PDF invoices using @react-pdf/renderer
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer'
import { createElement } from 'react'
import {
  InvoiceWithRelations,
  InvoiceItem,
  SupplierInfo,
  BillingInfo,
  formatAmount,
  getDocumentTypeLabel,
  DocumentType,
} from '@/types/invoicing'
import { generateQRCodeDataUrl, PaymentData } from '@/lib/qr-payment'

// ============================================================================
// FONT REGISTRATION (optional - for better Czech character support)
// ============================================================================

// Register Inter font if available
try {
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 600 },
      { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2', fontWeight: 700 },
    ],
  })
} catch {
  // Font registration failed, will use default font
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  documentTitle: {
    textAlign: 'right',
  },
  documentType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 12,
    color: '#6b7280',
  },

  // Parties section (supplier + customer)
  partiesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  partyBox: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  partyLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partyText: {
    fontSize: 9,
    marginBottom: 2,
    color: '#4b5563',
  },
  partyIco: {
    fontSize: 9,
    marginTop: 6,
  },

  // Invoice details
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '1px solid #e5e7eb',
  },
  detailsColumn: {
    width: '32%',
  },
  detailLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Items table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: 8,
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  colNumber: { width: '6%', textAlign: 'center' },
  colDescription: { width: '40%' },
  colQuantity: { width: '10%', textAlign: 'right' },
  colUnit: { width: '8%', textAlign: 'center' },
  colUnitPrice: { width: '14%', textAlign: 'right' },
  colVat: { width: '8%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },

  // Totals section
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
    fontSize: 10,
  },
  totalsRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    borderRadius: 4,
  },
  totalsLabel: {},
  totalsValue: {
    fontWeight: 'bold',
  },

  // Payment section
  paymentSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
    borderLeft: '4px solid #22c55e',
  },
  paymentInfo: {
    width: '65%',
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#166534',
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  paymentLabel: {
    width: 100,
    fontSize: 9,
    color: '#6b7280',
  },
  paymentValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  qrCode: {
    width: 90,
    height: 90,
  },

  // Custom texts
  textSection: {
    marginBottom: 15,
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },

  // VAT breakdown
  vatSection: {
    marginBottom: 15,
    fontSize: 9,
  },
  vatTable: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
  },
  vatHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 6,
    fontSize: 8,
    fontWeight: 'bold',
  },
  vatRow: {
    flexDirection: 'row',
    padding: 6,
    borderTop: '1px solid #e5e7eb',
  },
  vatCol: { width: '25%', textAlign: 'right' },
  vatColFirst: { width: '25%', textAlign: 'left' },
})

// ============================================================================
// TYPES
// ============================================================================

interface InvoicePDFData {
  invoice: InvoiceWithRelations
  supplier: SupplierInfo
  template?: {
    showLogo: boolean
    showQrCode: boolean
    showBankDetails: boolean
    showItemNumbers: boolean
    showVatBreakdown: boolean
    logoUrl?: string
    primaryColor?: string
    headerText?: string
    footerText?: string
  }
  qrCodeDataUrl?: string
}

// ============================================================================
// PDF COMPONENTS
// ============================================================================

/**
 * Header with logo and document title
 */
function InvoiceHeader({ invoice, supplier, template }: InvoicePDFData) {
  return createElement(View, { style: styles.header },
    // Logo
    template?.showLogo && template?.logoUrl
      ? createElement(Image, { src: template.logoUrl, style: styles.logo })
      : supplier.logoUrl
        ? createElement(Image, { src: supplier.logoUrl, style: styles.logo })
        : createElement(View, { style: { width: 120 } }),

    // Document title
    createElement(View, { style: styles.documentTitle },
      createElement(Text, { style: styles.documentType },
        getDocumentTypeLabel(invoice.documentType as DocumentType)
      ),
      createElement(Text, { style: styles.documentNumber },
        `c. ${invoice.invoiceNumber}`
      )
    )
  )
}

/**
 * Supplier and Customer info boxes
 */
function PartiesSection({ invoice, supplier }: InvoicePDFData) {
  const customerBilling = invoice.customer?.billingInfo as BillingInfo | undefined
  const customerSnapshot = invoice.customerSnapshot as Record<string, unknown> | undefined

  return createElement(View, { style: styles.partiesSection },
    // Supplier
    createElement(View, { style: styles.partyBox },
      createElement(Text, { style: styles.partyLabel }, 'Dodavatel'),
      createElement(Text, { style: styles.partyName }, supplier.name || ''),
      supplier.street && createElement(Text, { style: styles.partyText }, supplier.street),
      createElement(Text, { style: styles.partyText },
        [supplier.zip, supplier.city].filter(Boolean).join(' ')
      ),
      supplier.ico && createElement(Text, { style: styles.partyIco }, `ICO: ${supplier.ico}`),
      supplier.dic && createElement(Text, { style: styles.partyText }, `DIC: ${supplier.dic}`)
    ),

    // Customer
    createElement(View, { style: styles.partyBox },
      createElement(Text, { style: styles.partyLabel }, 'Odberatel'),
      createElement(Text, { style: styles.partyName },
        customerBilling?.companyName ||
        customerSnapshot?.organization as string ||
        `${invoice.customer?.firstName} ${invoice.customer?.lastName}`
      ),
      customerBilling?.billingAddress?.street &&
        createElement(Text, { style: styles.partyText }, customerBilling.billingAddress.street),
      createElement(Text, { style: styles.partyText },
        [
          customerBilling?.billingAddress?.postalCode,
          customerBilling?.billingAddress?.city
        ].filter(Boolean).join(' ')
      ),
      customerBilling?.ico && createElement(Text, { style: styles.partyIco }, `ICO: ${customerBilling.ico}`),
      customerBilling?.dic && createElement(Text, { style: styles.partyText }, `DIC: ${customerBilling.dic}`)
    )
  )
}

/**
 * Invoice dates and details
 */
function DetailsSection({ invoice }: InvoicePDFData) {
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('cs-CZ')
  }

  return createElement(View, { style: styles.detailsSection },
    createElement(View, { style: styles.detailsColumn },
      createElement(Text, { style: styles.detailLabel }, 'Datum vystaveni'),
      createElement(Text, { style: styles.detailValue }, formatDate(invoice.issueDate))
    ),
    createElement(View, { style: styles.detailsColumn },
      createElement(Text, { style: styles.detailLabel }, 'Datum splatnosti'),
      createElement(Text, { style: styles.detailValue }, formatDate(invoice.dueDate))
    ),
    invoice.taxableSupplyDate && createElement(View, { style: styles.detailsColumn },
      createElement(Text, { style: styles.detailLabel }, 'DUZP'),
      createElement(Text, { style: styles.detailValue }, formatDate(invoice.taxableSupplyDate))
    )
  )
}

/**
 * Items table
 */
function ItemsTable({ invoice, template }: InvoicePDFData) {
  const items = invoice.items as InvoiceItem[]
  const showNumbers = template?.showItemNumbers !== false

  return createElement(View, { style: styles.table },
    // Header
    createElement(View, { style: styles.tableHeader },
      showNumbers && createElement(Text, { style: styles.colNumber }, '#'),
      createElement(Text, { style: styles.colDescription }, 'Popis'),
      createElement(Text, { style: styles.colQuantity }, 'Mnozstvi'),
      createElement(Text, { style: styles.colUnit }, 'MJ'),
      createElement(Text, { style: styles.colUnitPrice }, 'Cena/MJ'),
      createElement(Text, { style: styles.colVat }, 'DPH %'),
      createElement(Text, { style: styles.colTotal }, 'Celkem')
    ),

    // Rows
    ...items.map((item, index) =>
      createElement(View, {
        key: index,
        style: [styles.tableRow, index % 2 === 1 && styles.tableRowAlt]
      },
        showNumbers && createElement(Text, { style: styles.colNumber }, String(index + 1)),
        createElement(Text, { style: styles.colDescription }, item.description),
        createElement(Text, { style: styles.colQuantity }, String(item.quantity)),
        createElement(Text, { style: styles.colUnit }, item.unit),
        createElement(Text, { style: styles.colUnitPrice }, formatAmount(item.unitPrice)),
        createElement(Text, { style: styles.colVat }, `${item.vatRate}%`),
        createElement(Text, { style: styles.colTotal }, formatAmount(item.total))
      )
    )
  )
}

/**
 * Totals section
 */
function TotalsSection({ invoice }: InvoicePDFData) {
  return createElement(View, { style: styles.totalsSection },
    createElement(View, { style: styles.totalsBox },
      // Subtotal
      createElement(View, { style: styles.totalsRow },
        createElement(Text, { style: styles.totalsLabel }, 'Zaklad dane'),
        createElement(Text, { style: styles.totalsValue }, formatAmount(invoice.subtotal))
      ),

      // VAT
      invoice.vatAmount && invoice.vatAmount > 0 && createElement(View, { style: styles.totalsRow },
        createElement(Text, { style: styles.totalsLabel }, `DPH ${invoice.vatRate || 0}%`),
        createElement(Text, { style: styles.totalsValue }, formatAmount(invoice.vatAmount))
      ),

      // Discount
      invoice.discount && invoice.discount > 0 && createElement(View, { style: styles.totalsRow },
        createElement(Text, { style: styles.totalsLabel }, 'Sleva'),
        createElement(Text, { style: styles.totalsValue }, `-${formatAmount(invoice.discount)}`)
      ),

      // Total
      createElement(View, { style: styles.totalsRowBold },
        createElement(Text, null, 'Celkem k uhrade'),
        createElement(Text, null, formatAmount(invoice.totalAmount))
      )
    )
  )
}

/**
 * Payment section with QR code
 */
function PaymentSection({ invoice, supplier, template, qrCodeDataUrl }: InvoicePDFData) {
  const showQr = template?.showQrCode !== false && qrCodeDataUrl
  const showBank = template?.showBankDetails !== false

  if (!showBank) return null

  return createElement(View, { style: styles.paymentSection },
    createElement(View, { style: styles.paymentInfo },
      createElement(Text, { style: styles.paymentTitle }, 'Platebni udaje'),

      supplier.bankAccount && createElement(View, { style: styles.paymentRow },
        createElement(Text, { style: styles.paymentLabel }, 'Cislo uctu:'),
        createElement(Text, { style: styles.paymentValue }, supplier.bankAccount)
      ),

      supplier.iban && createElement(View, { style: styles.paymentRow },
        createElement(Text, { style: styles.paymentLabel }, 'IBAN:'),
        createElement(Text, { style: styles.paymentValue }, supplier.iban)
      ),

      supplier.bic && createElement(View, { style: styles.paymentRow },
        createElement(Text, { style: styles.paymentLabel }, 'BIC/SWIFT:'),
        createElement(Text, { style: styles.paymentValue }, supplier.bic)
      ),

      invoice.variableSymbol && createElement(View, { style: styles.paymentRow },
        createElement(Text, { style: styles.paymentLabel }, 'Variabilni symbol:'),
        createElement(Text, { style: styles.paymentValue }, invoice.variableSymbol)
      ),

      invoice.constantSymbol && createElement(View, { style: styles.paymentRow },
        createElement(Text, { style: styles.paymentLabel }, 'Konstantni symbol:'),
        createElement(Text, { style: styles.paymentValue }, invoice.constantSymbol)
      )
    ),

    // QR Code
    showQr && createElement(Image, { src: qrCodeDataUrl, style: styles.qrCode })
  )
}

/**
 * Footer with custom text
 */
function InvoiceFooter({ template, supplier }: InvoicePDFData) {
  const footerText = template?.footerText ||
    (supplier.dic ? '' : 'Nejsme platci DPH.')

  return createElement(View, { style: styles.footer },
    createElement(Text, null, footerText),
    supplier.web && createElement(Text, null, supplier.web)
  )
}

/**
 * Complete Invoice Document
 */
function InvoiceDocument(data: InvoicePDFData) {
  return createElement(Document, null,
    createElement(Page, { size: 'A4', style: styles.page },
      // Header with logo
      createElement(InvoiceHeader, data),

      // Text before items (if any)
      data.invoice.textBeforeItems && createElement(View, { style: styles.textSection },
        createElement(Text, null, data.invoice.textBeforeItems)
      ),

      // Parties (supplier + customer)
      createElement(PartiesSection, data),

      // Invoice details (dates)
      createElement(DetailsSection, data),

      // Items table
      createElement(ItemsTable, data),

      // Totals
      createElement(TotalsSection, data),

      // Text after items (if any)
      data.invoice.textAfterItems && createElement(View, { style: styles.textSection },
        createElement(Text, null, data.invoice.textAfterItems)
      ),

      // Payment info with QR
      createElement(PaymentSection, data),

      // Notes
      data.invoice.notes && createElement(View, { style: styles.textSection },
        createElement(Text, { style: { fontWeight: 'bold', marginBottom: 4 } }, 'Poznamka:'),
        createElement(Text, null, data.invoice.notes)
      ),

      // Footer
      createElement(InvoiceFooter, data)
    )
  )
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Generate PDF buffer for an invoice
 */
export async function generateInvoicePDF(
  invoice: InvoiceWithRelations,
  supplier: SupplierInfo,
  template?: InvoicePDFData['template']
): Promise<Buffer> {
  // Generate QR code if needed
  let qrCodeDataUrl: string | undefined

  if (template?.showQrCode !== false && supplier.bankAccount) {
    const bankAccount = supplier.iban || supplier.bankAccount
    if (bankAccount) {
      const paymentData: PaymentData = {
        accountNumber: bankAccount,
        amount: invoice.totalAmount / 100,
        variableSymbol: invoice.variableSymbol || undefined,
        message: `Faktura ${invoice.invoiceNumber}`,
        recipientName: supplier.name || undefined,
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate).toISOString().replace(/-/g, '').slice(0, 8)
          : undefined,
      }

      try {
        qrCodeDataUrl = await generateQRCodeDataUrl(paymentData, { width: 150 })
      } catch (error) {
        console.error('Failed to generate QR code:', error)
      }
    }
  }

  // Create PDF data
  const pdfData: InvoicePDFData = {
    invoice,
    supplier,
    template,
    qrCodeDataUrl,
  }

  // Render PDF to buffer
  const pdfDocument = createElement(InvoiceDocument, pdfData)
  const buffer = await renderToBuffer(pdfDocument as React.ReactElement)

  return buffer as Buffer
}

/**
 * Generate PDF and return as base64 data URL
 */
export async function generateInvoicePDFDataUrl(
  invoice: InvoiceWithRelations,
  supplier: SupplierInfo,
  template?: InvoicePDFData['template']
): Promise<string> {
  const buffer = await generateInvoicePDF(invoice, supplier, template)
  const base64 = buffer.toString('base64')
  return `data:application/pdf;base64,${base64}`
}

/**
 * Get supplier info from invoicing settings
 */
export async function getSupplierFromSettings(): Promise<SupplierInfo> {
  const { prisma } = await import('@/lib/prisma')

  const settings = await prisma.invoicingSettings.findUnique({
    where: { id: 'singleton' },
  })

  if (!settings) {
    return {}
  }

  return {
    name: settings.supplierName || undefined,
    ico: settings.supplierIco || undefined,
    dic: settings.supplierDic || undefined,
    street: settings.supplierStreet || undefined,
    city: settings.supplierCity || undefined,
    zip: settings.supplierZip || undefined,
    country: settings.supplierCountry || undefined,
    email: settings.supplierEmail || undefined,
    phone: settings.supplierPhone || undefined,
    web: settings.supplierWeb || undefined,
    logoUrl: settings.supplierLogoUrl || undefined,
  }
}
