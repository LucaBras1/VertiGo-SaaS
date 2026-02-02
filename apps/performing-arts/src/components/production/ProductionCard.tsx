import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, Clock, ChevronRight } from 'lucide-react'
import { formatDate, getProductionStatusColor, formatEnumValue } from '@/lib/utils'

interface ProductionCardProps {
  production: {
    id: string
    name: string
    type: string
    status: string
    openingDate: Date | null
    closingDate: Date | null
    posterUrl: string | null
    duration: number | null
    _count: {
      performances: number
      castMembers: number
      crewMembers: number
      rehearsals: number
    }
  }
}

export function ProductionCard({ production }: ProductionCardProps) {
  return (
    <Link
      href={`/dashboard/productions/${production.id}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary-300 hover:shadow-md transition-all"
    >
      {/* Poster/Header */}
      <div className="relative h-40 bg-gradient-to-br from-backstage-700 to-backstage-800">
        {production.posterUrl ? (
          <Image
            src={production.posterUrl}
            alt={production.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-backstage-600">
              {production.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getProductionStatusColor(
              production.status
            )}`}
          >
            {formatEnumValue(production.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {production.name}
            </h3>
            <p className="text-sm text-gray-500">{formatEnumValue(production.type)}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Calendar className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {production._count.performances}
            </p>
            <p className="text-xs text-gray-500">Shows</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {production._count.castMembers + production._count.crewMembers}
            </p>
            <p className="text-xs text-gray-500">Team</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {production.duration ? `${production.duration}m` : '-'}
            </p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>
        </div>

        {/* Dates */}
        {(production.openingDate || production.closingDate) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {production.openingDate && (
                <>Opens: {formatDate(production.openingDate, 'MMM d, yyyy')}</>
              )}
              {production.openingDate && production.closingDate && ' - '}
              {production.closingDate && (
                <>Closes: {formatDate(production.closingDate, 'MMM d, yyyy')}</>
              )}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
