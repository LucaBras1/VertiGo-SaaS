import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInvoiceById, updateInvoice } from '@/lib/services/invoices'
import { sendInvoiceEmail } from '@/lib/email'
import { formatCurrency, formatDate } from '@/lib/utils'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoice = await getInvoiceById(params.id, session.user.tenantId)
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Cannot send a paid invoice' },
        { status: 400 }
      )
    }

    if (!invoice.customer?.email) {
      return NextResponse.json(
        { error: 'Customer has no email address' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://gigbook.muzx.cz'
    const invoiceUrl = `${baseUrl}/dashboard/invoices/${invoice.id}`

    const result = await sendInvoiceEmail({
      to: invoice.customer.email,
      clientName: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      invoiceNumber: invoice.invoiceNumber,
      amount: formatCurrency(invoice.totalAmount / 100),
      dueDate: formatDate(new Date(invoice.dueDate)),
      invoiceUrl,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Update invoice status to 'sent' if it was a draft
    if (invoice.status === 'draft') {
      await updateInvoice(params.id, session.user.tenantId, { status: 'sent' })
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Invoice email sent successfully',
    })
  } catch (error) {
    console.error('POST /api/invoices/[id]/send error:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    )
  }
}
