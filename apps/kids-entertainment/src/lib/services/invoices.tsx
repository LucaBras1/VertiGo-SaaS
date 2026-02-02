import { prisma } from '@/lib/prisma'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF, type InvoiceData } from '@/lib/pdf/invoice-pdf'
import type { Invoice, Order, Customer, OrderItem } from '@/generated/prisma'

// Generate invoice number in format: PP-INV-{YYYY}-{sequence}
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PP-INV-${year}-`

  // Find the highest invoice number for this year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
  })

  let sequence = 1
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10)
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1
    }
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`
}

// Redact child name for privacy (e.g., "Emma" -> "E***a")
function redactChildName(name: string): string {
  if (!name || name.length <= 2) return name
  const first = name.charAt(0)
  const last = name.charAt(name.length - 1)
  const middle = '*'.repeat(Math.min(name.length - 2, 3))
  return `${first}${middle}${last}`
}

// Format price from cents to CZK string
function formatPrice(cents: number): string {
  const czk = cents / 100
  return `${czk.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kc`
}

type OrderWithRelations = Order & {
  customer: Customer | null
  items: (OrderItem & {
    package?: { title: string } | null
    activity?: { title: string } | null
    extra?: { title: string } | null
  })[]
  linkedParty?: {
    date: Date
    childName: string | null
    theme: string | null
    venue: unknown
  } | null
}

// Create invoice from order after payment
export async function createInvoiceFromOrder(
  orderId: string,
  paymentType: 'deposit' | 'full_payment'
): Promise<Invoice> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: {
          package: { select: { title: true } },
          activity: { select: { title: true } },
          extra: { select: { title: true } },
        },
      },
      linkedParty: true,
    },
  }) as OrderWithRelations | null

  if (!order) {
    throw new Error(`Order not found: ${orderId}`)
  }

  if (!order.customer) {
    throw new Error(`Order has no customer: ${orderId}`)
  }

  const invoiceNumber = await generateInvoiceNumber()
  const pricing = (order.pricing as Record<string, unknown>) || {}

  // Calculate amounts based on payment type
  let subtotal: number
  let description: string

  if (paymentType === 'deposit') {
    subtotal = (pricing.deposit as number) || 0
    description = 'Zaloha na oslavu'
  } else {
    // Full payment = total - deposit
    const total = (pricing.total as number) || 0
    const deposit = (pricing.deposit as number) || 0
    subtotal = total - deposit
    description = 'Doplatek za oslavu'
  }

  // VAT calculation (21%)
  const vatRate = 21
  const vatAmount = Math.round(subtotal * (vatRate / 100))
  const totalAmount = subtotal + vatAmount

  // Build invoice items
  const items = order.items.map((item) => {
    const itemName =
      item.package?.title || item.activity?.title || item.extra?.title || 'Polozka'
    return {
      description: itemName,
      quantity: 1,
      unitPrice: item.price,
      total: item.price,
    }
  })

  // If payment is deposit/full, add a summary line item instead
  if (paymentType === 'deposit') {
    const summaryItems = [
      {
        description: `Zaloha (30%) - ${order.partyName || 'Detska oslava'}`,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
      },
    ]
    items.length = 0
    items.push(...summaryItems)
  } else {
    const summaryItems = [
      {
        description: `Doplatek (70%) - ${order.partyName || 'Detska oslava'}`,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
      },
    ]
    items.length = 0
    items.push(...summaryItems)
  }

  // Due date: 14 days from now
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      documentType: 'FAKTURA',
      invoiceStatus: 'DRAFT',
      status: 'draft',
      customerId: order.customer.id,
      orderId: order.id,
      issueDate: new Date(),
      dueDate,
      items: items,
      subtotal,
      vatRate,
      vatAmount,
      totalAmount,
      paidAmount: totalAmount, // Already paid via Stripe
      paidDate: new Date(),
      currency: 'CZK',
      notes:
        paymentType === 'deposit'
          ? 'Zaloha na detskou oslavu'
          : 'Doplatek za detskou oslavu',
    },
  })

  return invoice
}

// Get invoice data for PDF generation
export async function getInvoiceData(invoiceId: string): Promise<InvoiceData> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      order: {
        include: {
          linkedParty: {
            include: {
              package: { select: { title: true } },
            },
          },
        },
      },
    },
  })

  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceId}`)
  }

  // Get settings for tenant info
  const settings = await prisma.settings.findFirst()

  // Build customer info
  const customer = invoice.customer
  const customerAddress = customer.address as Record<string, string> | null
  const billingInfo = customer.billingInfo as Record<string, string> | null

  const customerInfo = {
    name: `${customer.firstName} ${customer.lastName}`,
    address: customerAddress
      ? `${customerAddress.street || ''}, ${customerAddress.city || ''} ${customerAddress.zip || ''}`
      : undefined,
    email: customer.email,
    phone: customer.phone || undefined,
    ico: billingInfo?.ico,
    dic: billingInfo?.dic,
  }

  // Build tenant info
  const settingsAddress = settings?.address as Record<string, string> | null
  const tenantInfo = {
    name: settings?.companyName || settings?.siteName || 'PartyPal',
    address: settingsAddress
      ? `${settingsAddress.street || ''}, ${settingsAddress.city || ''} ${settingsAddress.zip || ''}`
      : undefined,
    ico: settings?.companyIco || undefined,
    dic: settings?.companyDic || undefined,
    email: settings?.contactEmail || undefined,
    phone: settings?.contactPhone || undefined,
    website: 'partypal.cz',
    bankAccount: settings?.bankAccount || undefined,
  }

  // Build party details
  let partyDetails: InvoiceData['party'] | undefined
  const linkedParty = invoice.order?.linkedParty
  if (linkedParty) {
    partyDetails = {
      date: linkedParty.date.toISOString(),
      childName: linkedParty.childName
        ? redactChildName(linkedParty.childName)
        : undefined,
      theme: linkedParty.theme || undefined,
      packageName: (linkedParty as any).package?.title || undefined,
    }
  }

  // Parse invoice items
  const items = (invoice.items as any[]) || []

  return {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    customer: customerInfo,
    items: items.map((item) => ({
      description: item.description || 'Polozka',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: item.total || 0,
    })),
    subtotal: invoice.subtotal,
    taxRate: invoice.vatRate || 0,
    taxAmount: invoice.vatAmount || 0,
    total: invoice.totalAmount,
    notes: invoice.notes || undefined,
    variableSymbol: invoice.invoiceNumber.replace(/\D/g, '').slice(-10),
    tenant: tenantInfo,
    party: partyDetails,
  }
}

// Generate PDF buffer for invoice
export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const data = await getInvoiceData(invoiceId)
  const buffer = await renderToBuffer(<InvoicePDF data={data} />)
  return Buffer.from(buffer)
}
