import { cn } from '../utils'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, error, required, fullWidth, children, className }: FormFieldProps) {
  return (
    <div className={cn(fullWidth && 'sm:col-span-2', className)}>
      <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {required && <span className="ml-0.5 text-error-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
