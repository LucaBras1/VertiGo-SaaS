import { GigCardSkeleton } from './GigCardSkeleton'
import { StatsCardSkeleton } from './StatsCardSkeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GigCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
