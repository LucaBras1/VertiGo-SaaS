'use client'

import {
  Trophy,
  CalendarCheck,
  Flame,
  Crown,
  Sunrise,
  Swords,
  Target,
  Ruler,
  Star,
  Award,
  Medal,
  Sparkles,
} from 'lucide-react'

const ICON_MAP: Record<string, typeof Trophy> = {
  trophy: Trophy,
  'calendar-check': CalendarCheck,
  flame: Flame,
  crown: Crown,
  sunrise: Sunrise,
  swords: Swords,
  target: Target,
  ruler: Ruler,
  star: Star,
  award: Award,
  medal: Medal,
  sparkles: Sparkles,
}

interface BadgeDisplayProps {
  name: string
  description: string
  icon: string
  color: string
  earned?: boolean
  earnedAt?: string | Date
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export function BadgeDisplay({
  name,
  description,
  icon,
  color,
  earned = true,
  earnedAt,
  size = 'md',
  showDescription = true,
  className = '',
}: BadgeDisplayProps) {
  const IconComponent = ICON_MAP[icon] || Trophy

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  }

  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      className={`flex flex-col items-center text-center ${className}`}
      title={description}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
          earned
            ? 'shadow-lg'
            : 'grayscale opacity-40'
        }`}
        style={{
          backgroundColor: earned ? `${color}20` : '#E5E7EB',
          border: `2px solid ${earned ? color : '#D1D5DB'}`,
        }}
      >
        <IconComponent
          className={iconSizeClasses[size]}
          style={{ color: earned ? color : '#9CA3AF' }}
        />
      </div>
      <p
        className={`mt-2 font-medium ${textSizeClasses[size]} ${
          earned ? 'text-gray-900' : 'text-gray-400'
        }`}
      >
        {name}
      </p>
      {showDescription && (
        <p className={`${textSizeClasses[size]} text-gray-500 mt-0.5 max-w-[120px]`}>
          {description}
        </p>
      )}
      {earnedAt && earned && (
        <p className="text-xs text-gray-400 mt-1">
          {new Date(earnedAt).toLocaleDateString('cs-CZ')}
        </p>
      )}
    </div>
  )
}
