import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getInvoices, createInvoice, getInvoiceStats } from '@/lib/services/invoices'
import { z } from 'zod'

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  total: z.number(),
})

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  gigId: z.string().optional(),
  dueDate: z.string().datetime(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const customerId = searchParams.get('customerId') || undefined
    const gigId = searchParams.get('gigId') || undefined
    const search = searchParams.get('search') || undefined
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const invoiceStats = await getInvoiceStats(session.user.tenantId)
      return NextResponse.json(invoiceStats)
    }

    const result = await getInvoices(session.user.tenantId, { status, customerId, gigId, search })
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/invoices error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createInvoiceSchema.parse(body)

    const invoice = await createInvoice({
      ...validated,
      tenantId: session.user.tenantId,
      dueDate: new Date(validated.dueDate),
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('POST /api/invoices error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
