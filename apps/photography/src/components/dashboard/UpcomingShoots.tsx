import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export async function UpcomingShoots({ tenantId }: { tenantId: string }) {
  const shoots = await prisma.shoot.findMany({
    where: {
      tenantId,
      date: {
        gte: new Date()
      }
    },
    include: {
      package: {
        include: {
          client: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    },
    take: 5
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Shoots</CardTitle>
          <Link href="/dashboard/shoots" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all
          </Link>
        </div>
      </CardHeader>

      <div className="space-y-3">
        {shoots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No upcoming shoots scheduled</p>
            <Link href="/dashboard/shoots/new" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
              Schedule your first shoot
            </Link>
          </div>
        ) : (
          shoots.map((shoot) => (
            <Link
              key={shoot.id}
              href={`/dashboard/shoots/${shoot.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {shoot.package.client.name}
                  </h4>
                  <p className="text-sm text-gray-600">{shoot.package.eventType}</p>
                </div>
                <Badge variant="info" size="sm">
                  {format(new Date(shoot.date), 'MMM d')}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{shoot.startTime} - {shoot.endTime}</span>
                </div>
                {shoot.venueName && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{shoot.venueName}</span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  )
}
