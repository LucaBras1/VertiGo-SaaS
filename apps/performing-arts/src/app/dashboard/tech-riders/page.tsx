import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FileText, Sparkles, Download, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { TechRider } from '@/types'

export default async function TechRidersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.tenantId) {
    return null
  }

  const techRiders = await prisma.techRider.findMany({
    where: {
      production: { tenantId: session.user.tenantId },
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      production: {
        select: { id: true, name: true, type: true, status: true },
      },
    },
  }) as TechRider[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tech Riders</h1>
          <p className="text-gray-500 mt-1">Technical requirements for your productions</p>
        </div>
        <Link
          href="/dashboard/tech-riders/generate"
          className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          Generate with AI
        </Link>
      </div>

      {/* Tech riders list */}
      {techRiders.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techRiders.map((rider: TechRider) => (
            <Link
              key={rider.id}
              href={`/dashboard/tech-riders/${rider.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">v{rider.version}</span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {rider.production?.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Technical Rider</p>

              <div className="space-y-2 text-sm">
                {rider.stageMinWidth && rider.stageMinDepth && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stage</span>
                    <span className="text-gray-900">
                      {rider.stageMinWidth}m x {rider.stageMinDepth}m
                    </span>
                  </div>
                )}
                {rider.microphoneCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Microphones</span>
                    <span className="text-gray-900">{rider.microphoneCount}</span>
                  </div>
                )}
                {rider.dressingRooms && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dressing Rooms</span>
                    <span className="text-gray-900">{rider.dressingRooms}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Updated {formatDate(rider.updatedAt, 'MMM d')}
                </span>
                {rider.pdfUrl && (
                  <span className="flex items-center gap-1 text-primary-600">
                    <Download className="w-3 h-3" />
                    PDF
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tech riders yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Generate professional technical riders using AI. Include stage requirements, sound,
            lighting, and hospitality needs.
          </p>
          <Link
            href="/dashboard/tech-riders/generate"
            className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Generate Tech Rider
          </Link>
        </div>
      )}
    </div>
  )
}
