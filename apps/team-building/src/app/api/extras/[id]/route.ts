/**
 * Extra Detail API Route
 * GET, PUT, DELETE for single extra
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const extraUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  category: z.enum(['facilitation', 'catering', 'transport', 'equipment', 'other']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  order: z.number().optional(),
  excerpt: z.string().optional(),
  description: z.any().optional(),
  priceFrom: z.number().optional(),
  priceUnit: z.enum(['per_session', 'per_person', 'per_hour', 'per_day']).optional(),
  featuredImageUrl: z.string().url().optional(),
  featuredImageAlt: z.string().optional(),
  seo: z.any().optional(),
})

// GET - Get single extra
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const extra = await prisma.extra.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!extra) {
      return NextResponse.json(
        { success: false, error: 'Extra not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: extra,
    })
  } catch (error) {
    console.error('Error fetching extra:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch extra' },
      { status: 500 }
    )
  }
}

// PUT - Update extra
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = extraUpdateSchema.parse(body)

    const existingExtra = await prisma.extra.findUnique({
      where: { id },
    })

    if (!existingExtra) {
      return NextResponse.json(
        { success: false, error: 'Extra not found' },
        { status: 404 }
      )
    }

    // Check if new slug conflicts with existing extra
    if (validatedData.slug && validatedData.slug !== existingExtra.slug) {
      const slugExists = await prisma.extra.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'Extra with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const extra = await prisma.extra.update({
      where: { id },
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

    console.error('Error updating extra:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update extra' },
      { status: 500 }
    )
  }
}

// DELETE - Delete extra
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const extra = await prisma.extra.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true },
        },
      },
    })

    if (!extra) {
      return NextResponse.json(
        { success: false, error: 'Extra not found' },
        { status: 404 }
      )
    }

    // Prevent deletion if used in orders
    if (extra._count.orderItems > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete extra that is used in orders' },
        { status: 400 }
      )
    }

    await prisma.extra.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Extra deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting extra:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete extra' },
      { status: 500 }
    )
  }
}
