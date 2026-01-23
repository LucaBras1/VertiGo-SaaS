import Link from 'next/link'
import Card from '@/components/ui/Card'
import { EVENT_STATUS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface EventCardProps {
  date: string
  endDate?: string
  venue: {
    name: string
    city: string
    address?: string
  }
  status: 'confirmed' | 'tentative' | 'cancelled'
  ticketUrl?: string
  performance?: {
    id: string
    title: string
    slug: string
    category: string
    featuredImageUrl?: string
    featuredImageAlt?: string
  }
}

export default function EventCard({
  date,
  endDate,
  venue,
  status,
  ticketUrl,
  performance,
}: EventCardProps) {
  const dateObj = new Date(date)
  const dayOfMonth = dateObj.getDate()
  const month = formatDate(date, { month: 'short' })
  const time = formatDate(date, { hour: '2-digit', minute: '2-digit' })

  const statusColors = {
    confirmed: 'bg-green-900/30 text-green-400 border-green-700',
    tentative: 'bg-yellow-900/30 text-yellow-400 border-yellow-700',
    cancelled: 'bg-red-900/30 text-red-400 border-red-700',
  }

  return (
    <Card hover padding="none" className="overflow-hidden">
      <div className="flex">
        {/* Date Badge */}
        <div className="flex-shrink-0 w-20 bg-primary text-white flex flex-col items-center justify-center p-4">
          <div className="text-3xl font-bold leading-none">{dayOfMonth}</div>
          <div className="text-sm uppercase mt-1">{month}</div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Status Badge */}
          <div className="flex items-start justify-between mb-2">
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${statusColors[status]}`}
            >
              {EVENT_STATUS[status]}
            </span>
            {time !== '00:00' && (
              <span className="text-sm text-neutral-gray-200">{time}</span>
            )}
          </div>

          {/* Performance Title */}
          {performance && (
            <Link
              href={`/repertoar/${performance.slug}`}
              className="block mb-2 group"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                {performance.title}
              </h3>
            </Link>
          )}

          {/* Venue */}
          <div className="flex items-start gap-2 text-sm text-neutral-gray-200 mb-3">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <div className="font-medium text-white">{venue.name}</div>
              <div>{venue.city}</div>
            </div>
          </div>

          {/* Ticket Link */}
          {ticketUrl && status !== 'cancelled' && (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Vstupenky
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}
