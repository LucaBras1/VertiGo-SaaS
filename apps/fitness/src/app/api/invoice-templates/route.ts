import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  logo: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  headerText: z.string().max(1000).optional(),
  footerText: z.string().max(1000).optional(),
  showLogo: z.boolean().default(true),
  showVat: z.boolean().default(true),
  showQrCode: z.boolean().default(true),
  isDefault: z.boolean().default(false),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.invoiceTemplate.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Invoice templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = createTemplateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await prisma.invoiceTemplate.updateMany({
        where: {
          tenantId: session.user.tenantId,
          isDefault: true,
        },
        data: { isDefault: false },
      })
    }

    const template = await prisma.invoiceTemplate.create({
      data: {
        tenantId: session.user.tenantId,
        ...data,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Invoice template create error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
