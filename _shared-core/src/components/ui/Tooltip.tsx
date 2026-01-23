/**
 * Tooltip Component
 *
 * Simple tooltip for showing help text on hover
 */
'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: string
  children?: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  icon?: boolean
}

export function Tooltip({
  content,
  children,
  position = 'top',
  icon = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent',
  }

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help"
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children || (icon && <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />)}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]}`}
        >
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-lg">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  )
}

/**
 * FormFieldWithTooltip wrapper
 * Adds a tooltip icon next to the label
 */
interface FormLabelWithTooltipProps {
  label: string
  tooltip: string
  required?: boolean
  htmlFor?: string
}

export function FormLabelWithTooltip({
  label,
  tooltip,
  required,
  htmlFor,
}: FormLabelWithTooltipProps) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Tooltip content={tooltip} />
    </div>
  )
}
