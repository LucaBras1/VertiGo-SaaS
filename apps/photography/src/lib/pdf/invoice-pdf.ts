import jsPDF from 'jspdf'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoicePDFData {
  invoiceNumber: string
  status: string
  createdAt: string
  dueDate: string | null
  paidAt: string | null

  // Business info (from tenant settings)
  businessName: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string

  // Client info
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientAddress?: string

  // Package info
  packageTitle?: string

  // Items & amounts
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number

  notes?: string
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF()

  // Colors
  const primaryColor = '#F59E0B' // Amber-500
  const textColor = '#1F2937' // Gray-800
  const mutedColor = '#6B7280' // Gray-500

  // Helper functions
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Header with brand
  doc.setFillColor(primaryColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 20, 25)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(data.invoiceNumber, 20, 33)

  // Status badge
  const statusColors: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: '#9CA3AF', text: '#FFFFFF' },
    SENT: { bg: '#3B82F6', text: '#FFFFFF' },
    PAID: { bg: '#10B981', text: '#FFFFFF' },
    OVERDUE: { bg: '#EF4444', text: '#FFFFFF' },
    CANCELLED: { bg: '#6B7280', text: '#FFFFFF' }
  }

  const statusStyle = statusColors[data.status] || statusColors.DRAFT
  doc.setFillColor(statusStyle.bg)
  doc.roundedRect(150, 15, 40, 12, 2, 2, 'F')
  doc.setFontSize(10)
  doc.setTextColor(statusStyle.text)
  doc.text(data.status, 170, 23, { align: 'center' })

  // Reset text color
  doc.setTextColor(textColor)

  // Business info (right aligned)
  let yPos = 55
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(data.businessName, 190, yPos, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mutedColor)

  if (data.businessAddress) {
    yPos += 6
    doc.text(data.businessAddress, 190, yPos, { align: 'right' })
  }
  if (data.businessPhone) {
    yPos += 5
    doc.text(data.businessPhone, 190, yPos, { align: 'right' })
  }
  if (data.businessEmail) {
    yPos += 5
    doc.text(data.businessEmail, 190, yPos, { align: 'right' })
  }

  // Bill To section
  yPos = 55
  doc.setTextColor(mutedColor)
  doc.setFontSize(10)
  doc.text('BILL TO', 20, yPos)

  yPos += 7
  doc.setTextColor(textColor)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(data.clientName, 20, yPos)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(mutedColor)

  yPos += 6
  doc.text(data.clientEmail, 20, yPos)

  if (data.clientPhone) {
    yPos += 5
    doc.text(data.clientPhone, 20, yPos)
  }
  if (data.clientAddress) {
    yPos += 5
    doc.text(data.clientAddress, 20, yPos)
  }

  // Invoice details
  yPos = 95
  doc.setTextColor(textColor)
  doc.setFontSize(10)

  const detailsLeft = [
    ['Invoice Date:', formatDate(data.createdAt)],
    ['Due Date:', data.dueDate ? formatDate(data.dueDate) : 'N/A'],
    ...(data.paidAt ? [['Paid Date:', formatDate(data.paidAt)]] : [])
  ]

  detailsLeft.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(mutedColor)
    doc.text(label, 20, yPos)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor)
    doc.text(value, 60, yPos)

    yPos += 6
  })

  // Package info
  if (data.packageTitle) {
    yPos += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(mutedColor)
    doc.text('Package:', 20, yPos)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor)
    doc.text(data.packageTitle, 60, yPos)
  }

  // Items table
  yPos = 140

  // Table header
  doc.setFillColor('#F3F4F6')
  doc.rect(20, yPos - 5, 170, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(textColor)
  doc.text('Description', 25, yPos + 2)
  doc.text('Qty', 110, yPos + 2, { align: 'center' })
  doc.text('Unit Price', 135, yPos + 2, { align: 'right' })
  doc.text('Amount', 185, yPos + 2, { align: 'right' })

  // Table rows
  yPos += 12
  doc.setFont('helvetica', 'normal')

  data.items.forEach((item: InvoiceItem) => {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }

    doc.setTextColor(textColor)
    doc.text(item.description.substring(0, 40), 25, yPos)
    doc.text(item.quantity.toString(), 110, yPos, { align: 'center' })
    doc.text(formatCurrency(item.unitPrice), 135, yPos, { align: 'right' })
    doc.text(formatCurrency(item.total), 185, yPos, { align: 'right' })

    yPos += 8
  })

  // Totals
  yPos += 10

  // Line
  doc.setDrawColor('#E5E7EB')
  doc.line(100, yPos - 5, 190, yPos - 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(mutedColor)
  doc.text('Subtotal:', 130, yPos)
  doc.setTextColor(textColor)
  doc.text(formatCurrency(data.subtotal), 185, yPos, { align: 'right' })

  if (data.tax > 0) {
    yPos += 7
    doc.setTextColor(mutedColor)
    doc.text('Tax:', 130, yPos)
    doc.setTextColor(textColor)
    doc.text(formatCurrency(data.tax), 185, yPos, { align: 'right' })
  }

  yPos += 10
  doc.setDrawColor('#E5E7EB')
  doc.line(100, yPos - 3, 190, yPos - 3)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total:', 130, yPos + 4)
  doc.text(formatCurrency(data.total), 185, yPos + 4, { align: 'right' })

  // Notes
  if (data.notes) {
    yPos += 25

    if (yPos > 250) {
      doc.addPage()
      yPos = 30
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(textColor)
    doc.text('Notes:', 20, yPos)

    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(mutedColor)

    const splitNotes = doc.splitTextToSize(data.notes, 170)
    doc.text(splitNotes, 20, yPos)
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(mutedColor)
    doc.text(
      `Page ${i} of ${pageCount} - Generated by ShootFlow`,
      105,
      290,
      { align: 'center' }
    )
  }

  return doc
}

export function downloadInvoicePDF(data: InvoicePDFData): void {
  const doc = generateInvoicePDF(data)
  doc.save(`${data.invoiceNumber}.pdf`)
}
