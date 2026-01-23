/**
 * Invoice Sync Service
 *
 * Service for creating and synchronizing invoices between
 * local database and Vyfakturuj.cz
 */

import { prisma } from '@/lib/prisma'
import { getVyfakturujClient } from './index'
import type {
  VyfakturujInvoice,
  CreateInvoiceData,
} from '@/types/vyfakturuj'
import { INVOICE_TYPE, INVOICE_FLAGS } from '@/types/vyfakturuj'

// Type for invoice items when creating (simpler than VyfakturujInvoiceItem)
type CreateInvoiceItem = CreateInvoiceData['items'][number]

// ============================================================================
// TYPES
// ============================================================================

export interface CreateInvoiceOptions {
  type?: 'invoice' | 'proforma' | 'advance'
  sendEmail?: boolean
  emailRecipients?: string[]
  notes?: string
}

export interface InvoiceSyncResult {
  success: boolean
  message: string
  invoiceId?: string
  vyfakturujId?: number
  vyfakturujNumber?: string
  pdfUrl?: string
  publicUrl?: string
}

interface CustomerData {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  organization: string | null
  address: unknown
  billingInfo: unknown
  vyfakturujContactId: number | null
}

interface OrderWithRelations {
  id: string
  orderNumber: string
  customerId: string | null
  eventName: string | null
  dates: unknown
  venue: unknown
  pricing: unknown
  items: Array<{
    id: string
    date: string
    startTime: string | null
    endTime: string | null
    price: number
    notes: string | null
    performance: { id: string; title: string } | null
    game: { id: string; title: string } | null
    service: { id: string; title: string } | null
  }>
  // Customer data - fetched from Prisma
  customer?: CustomerData
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract pricing info from JSON field
 */
function extractPricing(pricing: unknown): {
  items?: Array<{ description: string; amount: number }>
  subtotal?: number
  travelCosts?: number
  discount?: number
  totalPrice?: number
  vatIncluded?: boolean
  notes?: string
} {
  if (!pricing || typeof pricing !== 'object') return {}
  return pricing as ReturnType<typeof extractPricing>
}

/**
 * Extract billing info from JSON field
 */
function extractBillingInfo(billingInfo: unknown): {
  ico?: string
  dic?: string
  companyName?: string
  billingAddress?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
} {
  if (!billingInfo || typeof billingInfo !== 'object') return {}
  return billingInfo as ReturnType<typeof extractBillingInfo>
}

/**
 * Extract address from JSON field
 */
function extractAddress(address: unknown): {
  street?: string
  city?: string
  postalCode?: string
  country?: string
} {
  if (!address || typeof address !== 'object') return {}
  return address as ReturnType<typeof extractAddress>
}

/**
 * Get invoice type number from string
 */
function getInvoiceType(type: CreateInvoiceOptions['type']): typeof INVOICE_TYPE[keyof typeof INVOICE_TYPE] {
  switch (type) {
    case 'proforma':
      return INVOICE_TYPE.PROFORMA
    case 'advance':
      return INVOICE_TYPE.ZALOHOVA_FAKTURA
    case 'invoice':
    default:
      return INVOICE_TYPE.FAKTURA
  }
}

/**
 * Get invoice type name in Czech
 */
function getInvoiceTypeName(type: CreateInvoiceOptions['type']): string {
  switch (type) {
    case 'proforma':
      return 'Proforma faktura'
    case 'advance':
      return 'Zálohová faktura'
    case 'invoice':
    default:
      return 'Faktura'
  }
}

/**
 * Map Vyfakturuj flags to local invoice status
 */
function mapFlagsToStatus(flags: number): 'draft' | 'sent' | 'paid' | 'cancelled' {
  if (flags & INVOICE_FLAGS.STORNOVANO) return 'cancelled'
  if (flags & INVOICE_FLAGS.UHRAZENO) return 'paid'
  if (flags & INVOICE_FLAGS.ODESLANO_EMAILEM) return 'sent'
  return 'draft'
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Map order with customer to Vyfakturuj invoice data
 */
function mapOrderToVyfakturujInvoice(
  order: OrderWithRelations & { customer: CustomerData },
  settings: {
    defaultPaymentMethodId?: number | null
    defaultNumberSeriesId?: number | null
    defaultDaysDue: number
    supplierName?: string | null
    supplierIco?: string | null
    supplierDic?: string | null
    supplierStreet?: string | null
    supplierCity?: string | null
    supplierZip?: string | null
    supplierCountry?: string | null
    supplierEmail?: string | null
    supplierPhone?: string | null
    supplierWeb?: string | null
    supplierBankAccount?: string | null
    supplierIban?: string | null
    supplierBic?: string | null
    textUnderSupplier?: string | null
    textInvoiceFooter?: string | null
  },
  options: CreateInvoiceOptions
): CreateInvoiceData {
  const customer = order.customer
  const billing = extractBillingInfo(customer.billingInfo)
  const address = extractAddress(customer.address)
  const pricing = extractPricing(order.pricing)

  // Build items array from order items and pricing items
  const items: CreateInvoiceItem[] = []

  // Add order items (performances, games, services)
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      const title = item.performance?.title || item.game?.title || item.service?.title || 'Položka'
      const dateStr = item.date ? new Date(item.date).toLocaleDateString('cs-CZ') : ''

      items.push({
        text: dateStr ? `${title} (${dateStr})` : title,
        quantity: 1,
        unit: 'ks',
        unit_price: item.price,
        vat_rate: 0, // Non-VAT payer by default
      })
    }
  }

  // Add pricing items (custom line items like travel costs)
  if (pricing.items && pricing.items.length > 0) {
    for (const pricingItem of pricing.items) {
      // Skip if this is just a summary item
      if (pricingItem.description && pricingItem.amount > 0) {
        items.push({
          text: pricingItem.description,
          quantity: 1,
          unit: 'ks',
          unit_price: pricingItem.amount,
          vat_rate: 0,
        })
      }
    }
  }

  // Add travel costs if separate
  if (pricing.travelCosts && pricing.travelCosts > 0) {
    items.push({
      text: 'Cestovné',
      quantity: 1,
      unit: 'ks',
      unit_price: pricing.travelCosts,
      vat_rate: 0,
    })
  }

  // If no items, create a generic one from total
  if (items.length === 0 && pricing.totalPrice) {
    items.push({
      text: order.eventName || `Služby dle objednávky ${order.orderNumber}`,
      quantity: 1,
      unit: 'ks',
      unit_price: pricing.totalPrice,
      vat_rate: 0,
    })
  }

  // Calculate due date
  const issueDate = new Date()
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + settings.defaultDaysDue)

  // Build invoice data
  const invoiceData: CreateInvoiceData = {
    type: getInvoiceType(options.type),

    // Number series
    id_number_series: settings.defaultNumberSeriesId || undefined,

    // Payment
    id_payment_method: settings.defaultPaymentMethodId || undefined,
    days_due: settings.defaultDaysDue,

    // Dates
    date_created: formatDate(issueDate),
    date_due: formatDate(dueDate),
    date_taxable_supply: formatDate(issueDate),

    // Customer - use linked contact or inline data
    id_customer: customer.vyfakturujContactId || undefined,

    // Customer inline data (used if no linked contact)
    customer_IC: billing.ico,
    customer_DIC: billing.dic,
    customer_name: customer.organization || `${customer.firstName} ${customer.lastName}`,
    customer_firstname: customer.firstName,
    customer_lastname: customer.lastName,
    customer_street: billing.billingAddress?.street || address.street,
    customer_city: billing.billingAddress?.city || address.city,
    customer_zip: billing.billingAddress?.postalCode || address.postalCode,
    customer_country_code: billing.billingAddress?.country || address.country || 'CZ',
    customer_tel: customer.phone || undefined,

    // Supplier info (from settings)
    supplier_name: settings.supplierName || undefined,
    supplier_IC: settings.supplierIco || undefined,
    supplier_DIC: settings.supplierDic || undefined,
    supplier_street: settings.supplierStreet || undefined,
    supplier_city: settings.supplierCity || undefined,
    supplier_zip: settings.supplierZip || undefined,
    supplier_country_code: settings.supplierCountry || 'CZ',
    supplier_contact_mail: settings.supplierEmail || undefined,
    supplier_contact_tel: settings.supplierPhone || undefined,
    supplier_contact_web: settings.supplierWeb || undefined,

    // Bank info
    bank_account_number: settings.supplierBankAccount || undefined,
    bank_IBAN: settings.supplierIban || undefined,
    bank_BIC: settings.supplierBic || undefined,

    // Items
    items,

    // Texts
    text_under_subscriber: settings.textUnderSupplier || undefined,
    text_invoice_footer: settings.textInvoiceFooter || undefined,
    order_number: order.orderNumber,
    note_internal: `Objednávka: ${order.orderNumber}${order.eventName ? ` - ${order.eventName}` : ''}`,

    // VAT settings (non-VAT payer)
    calculate_vat: 5, // NEPLATCE

    // Email recipients
    mail_to: options.sendEmail && options.emailRecipients
      ? options.emailRecipients
      : [customer.email],
  }

  // Add discount if present
  if (pricing.discount && pricing.discount > 0) {
    invoiceData.discount = pricing.discount
  }

  return invoiceData
}

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Create invoice in Vyfakturuj from order
 */
export async function createInvoiceFromOrder(
  orderId: string,
  options: CreateInvoiceOptions = {}
): Promise<InvoiceSyncResult> {
  try {
    // Get order with items (customer fetched separately via API)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            performance: { select: { id: true, title: true } },
            game: { select: { id: true, title: true } },
            service: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!order) {
      return {
        success: false,
        message: 'Objednávka nebyla nalezena',
      }
    }

    // Fetch customer from Prisma via API
    let customer: CustomerData | undefined
    if (order.customerId) {
      try {
        const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/customers/${order.customerId}`)
        if (customerResponse.ok) {
          const customerResult = await customerResponse.json()
          if (customerResult.success && customerResult.data) {
            const c = customerResult.data
            customer = {
              id: c._id || c.id,
              email: c.email,
              firstName: c.firstName,
              lastName: c.lastName,
              phone: c.phone || null,
              organization: c.organization || null,
              address: c.address || null,
              billingInfo: c.billingInfo || null,
              vyfakturujContactId: c.vyfakturujContactId || null,
            }
          }
        }
      } catch (error) {
        console.error('Error fetching customer for invoice:', error)
      }
    }

    if (!customer) {
      return {
        success: false,
        message: 'Zákazník nebyl nalezen. Pro vytvoření faktury musí být zákazník přiřazen k objednávce.',
      }
    }

    // Attach customer to order for mapping
    const orderWithCustomer: OrderWithRelations & { customer: CustomerData } = {
      ...order,
      customer,
    }

    // Check if invoice already exists for this order
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        orderId: orderId,
        vyfakturujId: { not: null },
      },
    })

    if (existingInvoice) {
      return {
        success: false,
        message: `Pro tuto objednávku již existuje faktura ${existingInvoice.invoiceNumber}`,
        invoiceId: existingInvoice.id,
        vyfakturujId: existingInvoice.vyfakturujId || undefined,
      }
    }

    // Get Vyfakturuj settings
    const settings = await prisma.vyfakturujSettings.findFirst({
      where: { id: 'singleton' },
    })

    if (!settings?.isConfigured) {
      return {
        success: false,
        message: 'Vyfakturuj není nakonfigurován',
      }
    }

    // Get Vyfakturuj client
    const client = await getVyfakturujClient()

    // Map order to invoice data
    const invoiceData = mapOrderToVyfakturujInvoice(
      orderWithCustomer,
      settings,
      options
    )

    // Create invoice in Vyfakturuj
    const vfInvoice = await client.createInvoice(invoiceData)

    // Calculate totals for local invoice
    const pricing = extractPricing(order.pricing)
    const totalAmount = pricing.totalPrice || 0

    // customerId is guaranteed to exist at this point (checked via customer fetch above)
    if (!order.customerId) {
      return {
        success: false,
        message: 'Objednávka nemá přiřazeného zákazníka',
      }
    }

    // Create local invoice record
    const localInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: vfInvoice.number,
        customerId: order.customerId,
        orderId: order.id,
        issueDate: new Date(),
        dueDate: new Date(vfInvoice.date_due),
        status: 'sent',
        items: invoiceData.items as unknown as Parameters<typeof prisma.invoice.create>[0]['data']['items'],
        subtotal: Math.round(parseFloat(vfInvoice.total_without_vat) * 100),
        vatRate: 0,
        vatAmount: 0,
        totalAmount: Math.round(parseFloat(vfInvoice.total) * 100),
        notes: options.notes,
        // Vyfakturuj integration fields
        vyfakturujId: vfInvoice.id,
        vyfakturujNumber: vfInvoice.number,
        vyfakturujType: vfInvoice.type,
        vyfakturujFlags: vfInvoice.flags,
        vyfakturujVS: vfInvoice.VS,
        publicUrl: vfInvoice.url_public_webpage,
        onlinePaymentUrl: vfInvoice.url_online_payment,
        bankAccount: settings.supplierBankAccount,
        iban: settings.supplierIban,
        vyfakturujSyncedAt: new Date(),
        vyfakturujRawData: vfInvoice as unknown as Parameters<typeof prisma.invoice.create>[0]['data']['vyfakturujRawData'],
      },
    })

    // Send email if requested
    if (options.sendEmail) {
      const recipients = options.emailRecipients || [customer.email]
      try {
        await client.sendInvoiceEmail(vfInvoice.id, recipients)
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError)
        // Don't fail the whole operation if email fails
      }
    }

    return {
      success: true,
      message: `${getInvoiceTypeName(options.type)} ${vfInvoice.number} byla úspěšně vytvořena`,
      invoiceId: localInvoice.id,
      vyfakturujId: vfInvoice.id,
      vyfakturujNumber: vfInvoice.number,
      pdfUrl: vfInvoice.url_download_pdf,
      publicUrl: vfInvoice.url_public_webpage,
    }
  } catch (error) {
    console.error('Error creating invoice from order:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Nepodařilo se vytvořit fakturu',
    }
  }
}

/**
 * Sync invoice status from Vyfakturuj
 */
export async function syncInvoiceStatus(invoiceId: string): Promise<InvoiceSyncResult> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return {
        success: false,
        message: 'Faktura nebyla nalezena',
      }
    }

    if (!invoice.vyfakturujId) {
      return {
        success: false,
        message: 'Faktura není propojena s Vyfakturuj',
      }
    }

    const client = await getVyfakturujClient()
    const vfInvoice = await client.getInvoice(invoice.vyfakturujId)

    // Update local invoice with Vyfakturuj data
    const newStatus = mapFlagsToStatus(vfInvoice.flags)
    const paidDate = vfInvoice.date_paid && vfInvoice.date_paid !== '0000-00-00'
      ? new Date(vfInvoice.date_paid)
      : null

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: newStatus,
        paidDate: paidDate,
        paidAmount: paidDate ? Math.round(parseFloat(vfInvoice.total) * 100) : 0,
        vyfakturujFlags: vfInvoice.flags,
        vyfakturujSyncedAt: new Date(),
        vyfakturujRawData: vfInvoice as unknown as Parameters<typeof prisma.invoice.update>[0]['data']['vyfakturujRawData'],
      },
    })

    return {
      success: true,
      message: `Stav faktury aktualizován na: ${newStatus}`,
      invoiceId: invoice.id,
      vyfakturujId: invoice.vyfakturujId,
    }
  } catch (error) {
    console.error('Error syncing invoice status:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Synchronizace selhala',
    }
  }
}

/**
 * Sync all invoices status from Vyfakturuj
 */
export async function syncAllInvoicesStatus(): Promise<{
  success: boolean
  message: string
  synced: number
  errors: number
}> {
  const stats = { synced: 0, errors: 0 }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        vyfakturujId: { not: null },
        status: { notIn: ['paid', 'cancelled'] },
      },
    })

    for (const invoice of invoices) {
      const result = await syncInvoiceStatus(invoice.id)
      if (result.success) {
        stats.synced++
      } else {
        stats.errors++
      }
    }

    return {
      success: stats.errors === 0,
      message: `Synchronizováno ${stats.synced} faktur, ${stats.errors} chyb`,
      ...stats,
    }
  } catch (error) {
    console.error('Error syncing all invoices:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Synchronizace selhala',
      ...stats,
    }
  }
}

/**
 * Mark invoice as paid in Vyfakturuj
 */
export async function markInvoicePaid(
  invoiceId: string,
  paidDate: Date,
  amount?: number
): Promise<InvoiceSyncResult> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return {
        success: false,
        message: 'Faktura nebyla nalezena',
      }
    }

    if (!invoice.vyfakturujId) {
      return {
        success: false,
        message: 'Faktura není propojena s Vyfakturuj',
      }
    }

    const client = await getVyfakturujClient()
    const payAmount = amount || (invoice.totalAmount ? invoice.totalAmount / 100 : 0)

    await client.setInvoicePaid(
      invoice.vyfakturujId,
      formatDate(paidDate),
      payAmount
    )

    // Update local invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidDate: paidDate,
        paidAmount: Math.round(payAmount * 100),
        vyfakturujSyncedAt: new Date(),
      },
    })

    return {
      success: true,
      message: 'Faktura byla označena jako uhrazená',
      invoiceId: invoice.id,
      vyfakturujId: invoice.vyfakturujId,
    }
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Nepodařilo se označit jako uhrazeno',
    }
  }
}

/**
 * Send invoice email via Vyfakturuj
 */
export async function sendInvoiceEmail(
  invoiceId: string,
  recipients: string[]
): Promise<InvoiceSyncResult> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return {
        success: false,
        message: 'Faktura nebyla nalezena',
      }
    }

    if (!invoice.vyfakturujId) {
      return {
        success: false,
        message: 'Faktura není propojena s Vyfakturuj',
      }
    }

    const client = await getVyfakturujClient()
    await client.sendInvoiceEmail(invoice.vyfakturujId, recipients)

    // Update status to sent if it was draft
    if (invoice.status === 'draft') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'sent' },
      })
    }

    return {
      success: true,
      message: `Faktura byla odeslána na: ${recipients.join(', ')}`,
      invoiceId: invoice.id,
      vyfakturujId: invoice.vyfakturujId,
    }
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Nepodařilo se odeslat email',
    }
  }
}

/**
 * Get invoice PDF URL from Vyfakturuj
 */
export async function getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice?.vyfakturujId) {
      return null
    }

    const client = await getVyfakturujClient()
    return await client.getInvoicePdfUrl(invoice.vyfakturujId)
  } catch (error) {
    console.error('Error getting invoice PDF URL:', error)
    return null
  }
}

/**
 * Create credit note (dobropis) for invoice
 */
export async function createCreditNote(
  invoiceId: string,
  items?: Array<{ text: string; amount: number }>
): Promise<InvoiceSyncResult> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    })

    if (!invoice) {
      return {
        success: false,
        message: 'Faktura nebyla nalezena',
      }
    }

    if (!invoice.vyfakturujId) {
      return {
        success: false,
        message: 'Faktura není propojena s Vyfakturuj',
      }
    }

    const client = await getVyfakturujClient()

    // Create credit note items (negative amounts)
    // Use Partial<VyfakturujInvoiceItem> as expected by client.createCreditNote
    const creditItems = items
      ? items.map(item => ({
          text: item.text,
          quantity: 1,
          unit: 'ks',
          unit_price: String(-Math.abs(item.amount)),
          vat_rate: 0,
        }))
      : (invoice.items as Array<{ description: string; unitPrice: number; quantity: number }>).map(item => ({
          text: item.description,
          quantity: item.quantity,
          unit: 'ks',
          unit_price: String(-Math.abs(item.unitPrice)),
          vat_rate: 0,
        }))

    const creditNote = await client.createCreditNote(invoice.vyfakturujId, creditItems)

    // Create local credit note record
    const localCreditNote = await prisma.invoice.create({
      data: {
        invoiceNumber: creditNote.number,
        customerId: invoice.customerId,
        orderId: invoice.orderId,
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'sent',
        items: creditItems as unknown as Parameters<typeof prisma.invoice.create>[0]['data']['items'],
        subtotal: Math.round(parseFloat(creditNote.total_without_vat) * 100),
        vatRate: 0,
        vatAmount: 0,
        totalAmount: Math.round(parseFloat(creditNote.total) * 100),
        notes: `Dobropis k faktuře ${invoice.invoiceNumber}`,
        vyfakturujId: creditNote.id,
        vyfakturujNumber: creditNote.number,
        vyfakturujType: creditNote.type,
        vyfakturujFlags: creditNote.flags,
        publicUrl: creditNote.url_public_webpage,
        vyfakturujSyncedAt: new Date(),
        vyfakturujRawData: creditNote as unknown as Parameters<typeof prisma.invoice.create>[0]['data']['vyfakturujRawData'],
      },
    })

    return {
      success: true,
      message: `Dobropis ${creditNote.number} byl vytvořen`,
      invoiceId: localCreditNote.id,
      vyfakturujId: creditNote.id,
      vyfakturujNumber: creditNote.number,
      pdfUrl: creditNote.url_download_pdf,
      publicUrl: creditNote.url_public_webpage,
    }
  } catch (error) {
    console.error('Error creating credit note:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Nepodařilo se vytvořit dobropis',
    }
  }
}
