import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInvoiceById, updateInvoice, deleteInvoice } from '@/lib/services/invoices'
import { z } from 'zod'


// Force dynamic to avoid build-time issues
export const dynamic = 'force-dynamic'
const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  total: z.number(),
})

const updateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue']).optional(),
  dueDate: z.string().datetime().optional(),
  items: z.array(invoiceItemSchema).optional(),
  taxRate: z.number().optional(),
  notes: z.string().optional(),
  paidDate: z.string().datetime().optional(),
  paidAmount: z.number().optional(),
})

export async function GET(
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateInvoiceSchema.parse(body)

    const invoice = await updateInvoice(params.id, session.user.tenantId, {
      ...validated,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
      paidDate: validated.paidDate ? new Date(validated.paidDate) : undefined,
    })

    return NextResponse.json(invoice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'Invoice not found') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    console.error('PUT /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteInvoice(params.id, session.user.tenantId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invoice not found') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
      if (error.message.includes('paid')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    console.error('DELETE /api/invoices/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
