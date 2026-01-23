import { Camera, CheckSquare, Clock } from 'lucide-react'

interface ShotListCardProps {
  shotList: {
    id: string
    name: string
    eventType: string
    status: 'DRAFT' | 'FINALIZED' | 'COMPLETED'
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number
    createdAt: string
  }
  onClick?: () => void
}

export function ShotListCard({ shotList, onClick }: ShotListCardProps) {
  const statusColors = {
    DRAFT: 'bg-charcoal-100 text-charcoal-700',
    FINALIZED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-teal-100 text-teal-700',
  }

  const statusLabels = {
    DRAFT: 'Draft',
    FINALIZED: 'Finalized',
    COMPLETED: 'Completed',
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border border-charcoal-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">{shotList.name}</h3>
            <p className="text-sm text-charcoal-500 capitalize">{shotList.eventType}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[shotList.status]
          }`}
        >
          {statusLabels[shotList.status]}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-charcoal-400" />
          <div>
            <p className="text-xs text-charcoal-500">Total Shots</p>
            <p className="text-sm font-semibold text-charcoal-900">
              {shotList.totalShots}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-charcoal-400" />
          <div>
            <p className="text-xs text-charcoal-500">Must-Have</p>
            <p className="text-sm font-semibold text-charcoal-900">
              {shotList.mustHaveCount}
            </p>
          </div>
        </div>
      </div>

      {shotList.estimatedTime && (
        <div className="flex items-center gap-2 mt-3">
          <Clock className="w-4 h-4 text-charcoal-400" />
          <p className="text-xs text-charcoal-500">
            Est. time: {Math.floor(shotList.estimatedTime / 60)}h{' '}
            {shotList.estimatedTime % 60}m
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-charcoal-100">
        <p className="text-xs text-charcoal-500">
          Created {new Date(shotList.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
