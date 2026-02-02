import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

// GET - Fetch public gallery (requires password if set)
export async function GET(
  req: NextRequest,
  { params }: { params: { publicUrl: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const password = searchParams.get('password')

    const gallery = await prisma.gallery.findFirst({
      where: {
        publicUrl: params.publicUrl
      },
      include: {
        photos: {
          where: {
            selected: true,
            rejected: false
          },
          orderBy: [
            { isHighlight: 'desc' },
            { qualityScore: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        shoot: {
          include: {
            package: {
              include: {
                client: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        tenant: {
          select: {
            name: true
          }
        }
      }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    // Check if gallery has expired
    if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This gallery has expired', code: 'EXPIRED' },
        { status: 410 }
      )
    }

    // Check if gallery requires password
    if (gallery.password) {
      if (!password) {
        return NextResponse.json(
          {
            requiresPassword: true,
            galleryName: gallery.name,
            photographerName: gallery.tenant?.name || 'Photographer'
          },
          { status: 200 }
        )
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, gallery.password)
      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Invalid password', code: 'INVALID_PASSWORD' },
          { status: 401 }
        )
      }
    }

    // Return full gallery data
    return NextResponse.json({
      id: gallery.id,
      name: gallery.name,
      status: gallery.status,
      downloadEnabled: gallery.downloadEnabled,
      photographerName: gallery.tenant?.name || 'Photographer',
      clientName: gallery.shoot?.package?.client?.name || 'Client',
      eventType: gallery.shoot?.package?.eventType,
      eventDate: gallery.shoot?.date,
      venueName: gallery.shoot?.venueName,
      totalPhotos: gallery.photos.length,
      photos: gallery.photos.map((photo: {
        id: string
        url: string
        thumbnailUrl: string | null
        width: number | null
        height: number | null
        isHighlight: boolean
        category: string | null
      }) => ({
        id: photo.id,
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        width: photo.width,
        height: photo.height,
        isHighlight: photo.isHighlight,
        category: photo.category
      }))
    })
  } catch (error) {
    console.error('GET /api/public/galleries/[publicUrl] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
}

// POST - Verify password (separate endpoint for better UX)
export async function POST(
  req: NextRequest,
  { params }: { params: { publicUrl: string } }
) {
  try {
    const { password } = await req.json()

    const gallery = await prisma.gallery.findFirst({
      where: {
        publicUrl: params.publicUrl
      },
      select: {
        id: true,
        password: true
      }
    })

    if (!gallery) {
      return NextResponse.json(
        { error: 'Gallery not found' },
        { status: 404 }
      )
    }

    if (!gallery.password) {
      return NextResponse.json({ valid: true })
    }

    const passwordMatch = await bcrypt.compare(password, gallery.password)

    return NextResponse.json({
      valid: passwordMatch
    })
  } catch (error) {
    console.error('POST /api/public/galleries/[publicUrl] error:', error)
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    )
  }
}
