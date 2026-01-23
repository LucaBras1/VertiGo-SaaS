/**
 * Page Detail API Routes
 *
 * GET    /api/admin/pages/[id] - Get single page
 * PUT    /api/admin/pages/[id] - Update page
 * DELETE /api/admin/pages/[id] - Delete page
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/pages/[id] - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: params.id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ data: page }, { status: 200 })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 })
  }
}

// PUT /api/admin/pages/[id] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Check if page exists
    const existing = await prisma.page.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Validate required fields
    if (!data.title || !data.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug is being changed and conflicts with another page
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.page.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Update page
    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        status: data.status,
        content: data.content,
        seo: data.seo,
      },
    })

    return NextResponse.json({ data: page }, { status: 200 })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

// DELETE /api/admin/pages/[id] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if page exists
    const existing = await prisma.page.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Delete page
    await prisma.page.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Page deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting page:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
