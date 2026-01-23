import Link from 'next/link'

interface OrderButtonProps {
  performanceId?: string
  performanceTitle?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

/**
 * Reusable Order Button component
 * Links to the main order form on /pro-poradatele with pre-filled performance
 */
export function OrderButton({
  performanceId,
  performanceTitle,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: OrderButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary',
    secondary: 'bg-white hover:bg-neutral-100 text-primary focus:ring-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  // Build URL with query params if performance is provided
  const buildHref = () => {
    const baseUrl = '/pro-poradatele'
    const params = new URLSearchParams()

    if (performanceId) {
      params.set('performance', performanceId)
    }
    if (performanceTitle) {
      params.set('title', performanceTitle)
    }

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}#formular` : `${baseUrl}#formular`
  }

  return (
    <Link
      href={buildHref()}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children || 'Pozvěte nás k vám'}
    </Link>
  )
}
