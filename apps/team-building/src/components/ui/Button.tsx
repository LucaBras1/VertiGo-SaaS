'use client'

import * as React from 'react'
import { Button as VertigoButton, buttonVariants } from '@vertigo/ui'
import type { ButtonProps as VertigoButtonProps } from '@vertigo/ui'

interface ButtonProps extends Omit<VertigoButtonProps, 'variant'> {
  variant?: VertigoButtonProps['variant'] | 'primary' | 'danger'
  isLoading?: boolean
}

const variantMap: Record<string, VertigoButtonProps['variant']> = {
  primary: 'default',
  danger: 'destructive',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, isLoading, loading, ...props }, ref) => {
    const mappedVariant = variant && variantMap[variant] ? variantMap[variant] : variant as VertigoButtonProps['variant']
    return (
      <VertigoButton
        ref={ref}
        variant={mappedVariant}
        loading={loading || isLoading}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
