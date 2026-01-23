import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  className,
  hover = false,
  padding = 'md',
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-neutral-gray-800 rounded-lg shadow-base border border-neutral-gray-600',
        hover && 'transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 hover:border-primary/40',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
