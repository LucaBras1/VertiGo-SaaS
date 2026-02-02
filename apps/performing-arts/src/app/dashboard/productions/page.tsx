import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, Filter, Clapperboard } from 'lucide-react'
import { ProductionCard } from '@/components/production/ProductionCard'
import type { Production } from '@/types'

export default async function ProductionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.tenantId) {
    return null
  }

  const productions = await prisma.production.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          performances: true,
          castMembers: true,
          crewMembers: true,
          rehearsals: true,
        },
      },
    },
  }) as Production[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productions</h1>
          <p className="text-gray-500 mt-1">Manage all your theater productions</p>
        </div>
        <Link
          href="/dashboard/productions/new"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Production
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search productions..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Productions grid */}
      {productions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productions.map((production: Production) => (
            <ProductionCard key={production.id} production={production} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clapperboard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No productions yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first production to get started with StageManager.
          </p>
          <Link
            href="/dashboard/productions/new"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Production
          </Link>
        </div>
      )}
    </div>
  )
}
