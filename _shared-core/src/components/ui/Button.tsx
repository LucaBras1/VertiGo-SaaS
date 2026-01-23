import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]'

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-dark hover:shadow-primary/30 focus:ring-4 focus:ring-primary-light/50',
    secondary:
      'bg-secondary text-neutral-black hover:bg-secondary/90 hover:shadow-secondary/30 focus:ring-4 focus:ring-secondary/50',
    outline:
      'border-2 border-white/80 text-white hover:bg-white hover:text-neutral-black focus:ring-4 focus:ring-white/30 hover:border-white transition-all',
    ghost:
      'text-primary hover:bg-primary-light/10 focus:ring-4 focus:ring-primary-light/50',
  }

  const sizes = {
    sm: 'px-4 py-2.5 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  }

  const classes = cn(baseStyles, variants[variant], sizes[size], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  )
}
