/**
 * Extras API Route
 * GET all extras, POST create new extra
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const extraSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.enum(['facilitation', 'catering', 'transport', 'equipment', 'other']),
  status: z.enum(['active', 'inactive']).default('active'),
  order: z.number().default(100),
  excerpt: z.string().optional(),
  description: z.any().optional(),
  priceFrom: z.number().optional(),
  priceUnit: z.enum(['per_session', 'per_person', 'per_hour', 'per_day']).optional(),
  featuredImageUrl: z.string().url().optional(),
  featuredImageAlt: z.string().optional(),
  seo: z.any().optional(),
})

// GET - List all extras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const where: any = {}
    if (status) where.status = status
    if (category) where.category = category

    const extras = await prisma.extra.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { title: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: extras,
    })
  } catch (error) {
    console.error('Error fetching extras:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch extras' },
      { status: 500 }
    )
  }
}

// POST - Create new extra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = extraSchema.parse(body)

    // Check if slug already exists
    const existingExtra = await prisma.extra.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingExtra) {
      return NextResponse.json(
        { success: false, error: 'Extra with this slug already exists' },
        { status: 409 }
      )
    }

    const extra = await prisma.extra.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: extra,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating extra:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create extra' },
      { status: 500 }
    )
  }
}
