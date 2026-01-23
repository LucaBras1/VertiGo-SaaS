import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Images, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export async function GalleryStatus({ tenantId }: { tenantId: string }) {
  const galleries = await prisma.gallery.findMany({
    where: {
      shoot: {
        tenantId
      }
    },
    include: {
      shoot: {
        include: {
          package: {
            include: {
              client: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 5
  })

  const statusVariant = (status: string) => {
    switch (status) {
      case 'PROCESSING': return 'warning'
      case 'READY': return 'success'
      case 'DELIVERED': return 'default'
      default: return 'default'
    }
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSING': return <Clock className="w-4 h-4" />
      case 'READY': return <CheckCircle className="w-4 h-4" />
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gallery Status</CardTitle>
          <Link href="/dashboard/galleries" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all
          </Link>
        </div>
      </CardHeader>

      <div className="space-y-3">
        {galleries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Images className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No galleries yet</p>
            <Link href="/dashboard/galleries/new" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
              Create your first gallery
            </Link>
          </div>
        ) : (
          galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/dashboard/galleries/${gallery.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{gallery.name}</h4>
                  <p className="text-sm text-gray-600">
                    {gallery.shoot.package.client.name} • {gallery.shoot.package.eventType}
                  </p>
                </div>
                <Badge variant={statusVariant(gallery.status)} size="sm">
                  <span className="flex items-center gap-1">
                    {statusIcon(gallery.status)}
                    {gallery.status}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{gallery.selectedPhotos} / {gallery.totalPhotos} photos</span>
                {gallery.aiCurated && (
                  <Badge variant="info" size="sm">AI Curated</Badge>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  )
}
