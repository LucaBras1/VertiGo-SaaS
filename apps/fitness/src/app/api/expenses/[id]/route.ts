import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const expenseUpdateSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
  vendor: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  taxAmount: z.number().optional().nullable(),
  isTaxDeductible: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED']).optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/expenses/[id] - Get expense detail
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
      include: {
        category: true,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Výdaj nenalezen' }, { status: 404 })
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Chyba při načítání výdaje' }, { status: 500 })
  }
}

// PUT /api/expenses/[id] - Update expense
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = expenseUpdateSchema.parse(body)

    // Verify expense belongs to tenant
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: 'Výdaj nenalezen' }, { status: 404 })
    }

    // If categoryId is provided, verify it belongs to tenant
    if (data.categoryId) {
      const category = await prisma.expenseCategory.findFirst({
        where: {
          id: data.categoryId,
          tenantId: session.user.tenantId,
        },
      })

      if (!category) {
        return NextResponse.json({ error: 'Kategorie nenalezena' }, { status: 404 })
      }
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency && { currency: data.currency }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.vendor !== undefined && { vendor: data.vendor }),
        ...(data.receiptUrl !== undefined && { receiptUrl: data.receiptUrl }),
        ...(data.taxAmount !== undefined && { taxAmount: data.taxAmount }),
        ...(data.isTaxDeductible !== undefined && { isTaxDeductible: data.isTaxDeductible }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.status && { status: data.status }),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatná data', details: error.errors }, { status: 400 })
    }
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Chyba při aktualizaci výdaje' }, { status: 500 })
  }
}

// DELETE /api/expenses/[id] - Delete expense
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify expense belongs to tenant
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Výdaj nenalezen' }, { status: 404 })
    }

    await prisma.expense.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Chyba při mazání výdaje' }, { status: 500 })
  }
}
