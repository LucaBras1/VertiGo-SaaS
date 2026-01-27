import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const expenseCreateSchema = z.object({
  description: z.string().min(1, 'Popis je povinný'),
  amount: z.number().positive('Částka musí být kladná'),
  currency: z.string().default('CZK'),
  date: z.string(),
  categoryId: z.string(),
  vendor: z.string().optional(),
  receiptUrl: z.string().optional(),
  taxAmount: z.number().optional(),
  isTaxDeductible: z.boolean().default(false),
  notes: z.string().optional(),
})

// GET /api/expenses - List expenses
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { description: { contains: search, mode: 'insensitive' as const } },
          { vendor: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(status && { status: status as 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED' }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    }

    const [expenses, total, categories] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.expense.count({ where }),
      prisma.expenseCategory.findMany({
        where: { tenantId: session.user.tenantId },
        orderBy: { name: 'asc' },
      }),
    ])

    return NextResponse.json({
      expenses,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Chyba při načítání výdajů' }, { status: 500 })
  }
}

// POST /api/expenses - Create expense
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = expenseCreateSchema.parse(body)

    // Verify category belongs to tenant
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: data.categoryId,
        tenantId: session.user.tenantId,
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Kategorie nenalezena' }, { status: 404 })
    }

    const expense = await prisma.expense.create({
      data: {
        tenantId: session.user.tenantId,
        categoryId: data.categoryId,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: new Date(data.date),
        vendor: data.vendor,
        receiptUrl: data.receiptUrl,
        taxAmount: data.taxAmount,
        isTaxDeductible: data.isTaxDeductible,
        notes: data.notes,
        status: 'APPROVED', // Auto-approve for trainers
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Neplatná data', details: error.errors }, { status: 400 })
    }
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Chyba při vytváření výdaje' }, { status: 500 })
  }
}
