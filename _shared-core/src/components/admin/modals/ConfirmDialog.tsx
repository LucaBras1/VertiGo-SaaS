/**
 * ConfirmDialog Component
 *
 * A reusable confirmation dialog to replace native browser confirm()
 * Supports customizable title, message, and button text
 */
'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
  isLoading?: boolean
}

const variantStyles: Record<ConfirmDialogVariant, {
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  confirmButton: string
}> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  info: {
    icon: AlertTriangle,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Potvrzení akce',
  message,
  confirmText = 'Potvrdit',
  cancelText = 'Zrušit',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    },
    [onClose, isLoading]
  )

  // Handle click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isLoading) {
        onClose()
      }
    },
    [onClose, isLoading]
  )

  // Add/remove event listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const styles = variantStyles[variant]
  const Icon = styles.icon

  const dialogContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`rounded-full p-3 ${styles.iconBg}`}>
              <Icon className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h3
            id="confirm-dialog-title"
            className="text-lg font-semibold text-gray-900 text-center mb-2"
          >
            {title}
          </h3>

          {/* Message */}
          <p
            id="confirm-dialog-description"
            className="text-sm text-gray-600 text-center mb-6"
          >
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${styles.confirmButton}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Probíhá...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render via portal to document.body
  if (typeof window !== 'undefined') {
    return createPortal(dialogContent, document.body)
  }

  return null
}

/**
 * Hook for easy usage of ConfirmDialog
 *
 * Usage:
 * const { ConfirmDialogComponent, confirm } = useConfirmDialog()
 *
 * // In component:
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Smazat položku?',
 *     message: 'Tato akce je nevratná.',
 *     confirmText: 'Smazat',
 *   })
 *   if (confirmed) {
 *     // delete...
 *   }
 * }
 *
 * // In JSX:
 * return <>{ConfirmDialogComponent}</>
 */
import { useState } from 'react'

interface UseConfirmDialogOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmDialogVariant
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<UseConfirmDialogOptions>({
    message: '',
  })
  const [resolveRef, setResolveRef] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  const confirm = (opts: UseConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)

    return new Promise<boolean>((resolve) => {
      setResolveRef({ resolve })
    })
  }

  const handleClose = () => {
    if (resolveRef) {
      resolveRef.resolve(false)
    }
    setIsOpen(false)
    setIsLoading(false)
    setResolveRef(null)
  }

  const handleConfirm = async () => {
    if (resolveRef) {
      resolveRef.resolve(true)
    }
    setIsOpen(false)
    setIsLoading(false)
    setResolveRef(null)
  }

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      variant={options.variant}
      isLoading={isLoading}
    />
  )

  return {
    ConfirmDialogComponent,
    confirm,
    setLoading: setIsLoading,
  }
}
