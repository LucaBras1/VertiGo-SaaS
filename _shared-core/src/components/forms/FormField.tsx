/**
 * FormField Component
 * Reusable form field wrapper with label and error display
 */
'use client'

import { forwardRef, type ReactNode, type InputHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
  hint?: string
}

/**
 * Wrapper component for form fields with label and error display
 */
export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-neutral-gray-100">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-neutral-gray-400">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-400" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Base input styles for dark theme
 */
export const inputBaseStyles =
  'w-full px-4 py-3 min-h-[48px] bg-neutral-gray-700 border rounded-lg text-white placeholder-neutral-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/50 focus:border-primary transition-all'

export const inputStyles = {
  default: `${inputBaseStyles} border-neutral-gray-600`,
  error: `${inputBaseStyles} border-red-500 focus:ring-red-500`,
}

/**
 * Get input classes based on error state
 */
export function getInputClassName(hasError: boolean): string {
  return hasError ? inputStyles.error : inputStyles.default
}

/**
 * Input component with forwardRef for React Hook Form
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${getInputClassName(hasError || false)} ${className || ''}`}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

/**
 * Textarea component with forwardRef for React Hook Form
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`${getInputClassName(hasError || false)} ${className || ''}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

/**
 * Select component with forwardRef for React Hook Form
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ hasError, className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`${getInputClassName(hasError || false)} ${className || ''}`}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'
