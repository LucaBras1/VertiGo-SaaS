import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all min-h-[100px] resize-y',
          'focus:ring-2 focus:ring-brand-500/20',
          'dark:bg-neutral-900 dark:text-neutral-100',
          error
            ? 'border-error-300 focus:border-error-500 dark:border-error-700'
            : 'border-neutral-200 focus:border-brand-500 dark:border-neutral-700',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
