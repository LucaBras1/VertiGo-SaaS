import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export async function RecentClients({ tenantId }: { tenantId: string }) {
  const clients = await prisma.client.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      packages: {
        select: { id: true }
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Clients</CardTitle>
          <Link href="/dashboard/clients" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            View all
          </Link>
        </div>
      </CardHeader>

      <div className="space-y-3">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No clients yet</p>
            <Link href="/dashboard/clients/new" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
              Add your first client
            </Link>
          </div>
        ) : (
          clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{client.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{client.phone}</span>
                    </div>
                  )}
                </div>
                <Badge variant="default" size="sm">
                  {client.packages.length} {client.packages.length === 1 ? 'package' : 'packages'}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  )
}
