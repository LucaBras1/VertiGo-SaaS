import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadPhoto, deletePhoto } from '@/lib/storage'

// Force dynamic to avoid build-time Prisma proxy issues
export const dynamic = 'force-dynamic'

// GET - List photos in a gallery
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      },
      include: {
        photos: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    return NextResponse.json(gallery.photos)
  } catch (error) {
    console.error('GET /api/galleries/[id]/photos error:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

// POST - Upload photos to a gallery
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify gallery ownership
    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Upload each file
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer())

        const uploadResult = await uploadPhoto(buffer, {
          folder: `shootflow/${session.user.tenantId}/galleries/${params.id}`,
          tags: ['gallery', params.id],
          context: {
            galleryId: params.id,
            tenantId: session.user.tenantId
          }
        })

        // Create GalleryPhoto record
        const photo = await prisma.galleryPhoto.create({
          data: {
            galleryId: params.id,
            filename: file.name,
            url: uploadResult.url,
            thumbnailUrl: uploadResult.thumbnailUrl,
            publicId: uploadResult.publicId,
            width: uploadResult.width,
            height: uploadResult.height,
            size: uploadResult.bytes,
            mimeType: file.type
          }
        })

        return photo
      })
    )

    // Update gallery photo counts
    const photoCount = await prisma.galleryPhoto.count({
      where: { galleryId: params.id }
    })

    await prisma.gallery.update({
      where: { id: params.id },
      data: {
        totalPhotos: photoCount,
        status: 'READY'
      }
    })

    return NextResponse.json({
      success: true,
      count: uploadResults.length,
      photos: uploadResults
    })
  } catch (error) {
    console.error('POST /api/galleries/[id]/photos error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photos', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a photo from gallery
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }

    // Verify gallery ownership
    const gallery = await prisma.gallery.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId
      }
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Get photo
    const photo = await prisma.galleryPhoto.findFirst({
      where: {
        id: photoId,
        galleryId: params.id
      }
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from Cloudinary if publicId exists
    if (photo.publicId) {
      try {
        await deletePhoto(photo.publicId)
      } catch (err) {
        console.warn('Failed to delete from Cloudinary:', err)
      }
    }

    // Delete from database
    await prisma.galleryPhoto.delete({
      where: { id: photoId }
    })

    // Update gallery photo counts
    const photoCount = await prisma.galleryPhoto.count({
      where: { galleryId: params.id }
    })
    const selectedCount = await prisma.galleryPhoto.count({
      where: { galleryId: params.id, selected: true }
    })

    await prisma.gallery.update({
      where: { id: params.id },
      data: {
        totalPhotos: photoCount,
        selectedPhotos: selectedCount
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/galleries/[id]/photos error:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
