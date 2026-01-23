import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'

interface PackageCardProps {
  id: string
  title: string
  status: string
  eventType: string
  eventDate: string | null
  totalPrice: number | null
  client: {
    name: string
  }
}

export function PackageCard({ id, title, status, eventType, eventDate, totalPrice, client }: PackageCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'INQUIRY': return 'default'
      case 'QUOTE_SENT': return 'info'
      case 'CONFIRMED': return 'success'
      case 'COMPLETED': return 'default'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  return (
    <Link href={`/dashboard/packages/${id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{client.name}</p>
          </div>
          <Badge variant={getStatusVariant(status)} size="sm">
            {status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Event Type</span>
            <span className="font-medium text-gray-900">{eventType || 'N/A'}</span>
          </div>
          {eventDate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">
                {format(new Date(eventDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}
          {totalPrice && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Total</span>
              <span className="text-lg font-bold text-amber-600">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
