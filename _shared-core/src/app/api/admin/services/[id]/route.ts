/**
 * Service Detail API Routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ data: service }, { status: 200 })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.service.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        status: data.status,
        order: data.order,
        excerpt: data.excerpt,
        description: data.description,
        priceFrom: data.priceFrom,
        priceUnit: data.priceUnit,
        featuredImageUrl: data.featuredImageUrl,
        featuredImageAlt: data.featuredImageAlt,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: service }, { status: 200 })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await prisma.service.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
