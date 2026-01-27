import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const categorySchema = z.object({
  name: z.string().min(1, 'Název je povinný'),
  description: z.string().optional(),
})

// GET /api/expense-categories - List categories
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.expenseCategory.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání kategorií' },
      { status: 500 }
    )
  }
}

// POST /api/expense-categories - Create category
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = categorySchema.parse(body)

    // Check if category with same name exists
    const existing = await prisma.expenseCategory.findFirst({
      where: {
        tenantId: session.user.tenantId,
        name: data.name,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Kategorie s tímto názvem již existuje' },
        { status: 400 }
      )
    }

    const category = await prisma.expenseCategory.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        description: data.description,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Neplatná data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření kategorie' },
      { status: 500 }
    )
  }
}
