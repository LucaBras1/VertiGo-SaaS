import Link from 'next/link'
import { Images, Clock, CheckCircle } from 'lucide-react'
import { Badge, Card } from '@vertigo/ui'

interface GalleryCardProps {
  id: string
  name: string
  status: string
  totalPhotos: number
  selectedPhotos: number
  aiCurated: boolean
  shoot: {
    package: {
      client: {
        name: string
      }
      eventType: string
    }
  }
}

export function GalleryCard({ id, name, status, totalPhotos, selectedPhotos, aiCurated, shoot }: GalleryCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PROCESSING': return 'warning'
      case 'READY': return 'success'
      case 'DELIVERED': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSING': return <Clock className="w-4 h-4" />
      case 'READY': return <CheckCircle className="w-4 h-4" />
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <Link href={`/dashboard/galleries/${id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-600">
              {shoot.package.client.name} • {shoot.package.eventType}
            </p>
          </div>
          <Badge variant={getStatusVariant(status)} size="sm">
            <span className="flex items-center gap-1">
              {getStatusIcon(status)}
              {status}
            </span>
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Photos</span>
            <span className="font-medium text-gray-900">
              {selectedPhotos} / {totalPhotos}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all"
              style={{ width: `${totalPhotos > 0 ? (selectedPhotos / totalPhotos) * 100 : 0}%` }}
            />
          </div>

          {aiCurated && (
            <div className="pt-2">
              <Badge variant="info" size="sm">
                <Images className="w-3 h-3 mr-1" />
                AI Curated
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
