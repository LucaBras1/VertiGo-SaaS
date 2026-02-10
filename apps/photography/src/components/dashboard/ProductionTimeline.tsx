'use client'

import { Clock, Camera, Check, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Badge, Card, CardDescription, CardHeader, CardTitle } from '@vertigo/ui'

interface TimelineItem {
  id: string
  title: string
  clientName: string
  status: string
  shootDate: string
  createdAt: string
  estimatedDelivery: string | null
}

interface ProductionTimelineProps {
  items: TimelineItem[]
}

export function ProductionTimeline({ items }: ProductionTimelineProps) {
  const now = new Date()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return <Badge variant="warning">Ve zpracování</Badge>
      case 'READY':
        return <Badge variant="success">Připraveno</Badge>
      case 'DELIVERED':
        return <Badge variant="secondary">Doručeno</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getDaysRemaining = (deliveryDate: string | null) => {
    if (!deliveryDate) return null
    const delivery = new Date(deliveryDate)
    const diffTime = delivery.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyIcon = (daysRemaining: number | null) => {
    if (daysRemaining === null) return null
    if (daysRemaining < 0) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
    if (daysRemaining <= 3) {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />
    }
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Production Timeline</CardTitle>
          <CardDescription>Galleries in production</CardDescription>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Camera className="w-12 h-12 mb-3 text-gray-300" />
          <p>No galleries in production</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Production Timeline</CardTitle>
            <CardDescription>{items.length} galleries in pipeline</CardDescription>
          </div>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {items.map((item, index) => {
          const daysRemaining = getDaysRemaining(item.estimatedDelivery)
          const isOverdue = daysRemaining !== null && daysRemaining < 0

          return (
            <Link
              key={item.id}
              href={`/dashboard/galleries/${item.id}`}
              className="block"
            >
              <div className={`
                flex items-start gap-4 p-3 rounded-lg border transition-colors
                ${isOverdue ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-gray-200 hover:bg-gray-50'}
              `}>
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${item.status === 'READY' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}
                  `}>
                    {item.status === 'READY' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </div>
                  {index < items.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 truncate">
                      {item.title}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {item.clientName}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Foceno: {new Date(item.shootDate).toLocaleDateString('cs-CZ')}
                    </span>
                    {item.estimatedDelivery && (
                      <span className="flex items-center gap-1">
                        {getUrgencyIcon(daysRemaining)}
                        {daysRemaining !== null && (
                          isOverdue ? (
                            <span className="text-red-600 font-medium">
                              {Math.abs(daysRemaining)} dní po termínu
                            </span>
                          ) : daysRemaining === 0 ? (
                            <span className="text-amber-600 font-medium">Dnes</span>
                          ) : (
                            <span>
                              Termín: {new Date(item.estimatedDelivery).toLocaleDateString('cs-CZ')}
                              ({daysRemaining} dní)
                            </span>
                          )
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
