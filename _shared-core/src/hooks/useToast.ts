import { useState, useCallback } from 'react'

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast message interface
 */
export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

/**
 * Toast options for object-style calls
 */
interface ToastOptions {
  type: ToastType
  message: string
  duration?: number
}

/**
 * Custom hook for displaying toast notifications
 * Provides a simple interface for showing success, error, warning, and info messages
 *
 * @returns Object with toast method and active toasts
 *
 * @example
 * const { toast } = useToast()
 *
 * // Object-style call
 * toast({ type: 'success', message: 'Item saved successfully!' })
 *
 * // Simple call with message and type
 * toast('Item saved successfully!', 'success')
 *
 * // Show error message
 * toast('Failed to save item', 'error')
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((id: string, type: ToastType, message: string, duration: number = 3000) => {
    const newToast: Toast = { id, type, message, duration }
    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  // Overloaded toast function that accepts both styles
  const toast = useCallback(
    (messageOrOptions: string | ToastOptions, type?: ToastType, duration: number = 3000) => {
      const id = Math.random().toString(36).substring(7)

      // Object-style call: toast({ type: 'success', message: 'Hello' })
      if (typeof messageOrOptions === 'object') {
        return showToast(
          id,
          messageOrOptions.type,
          messageOrOptions.message,
          messageOrOptions.duration ?? 3000
        )
      }

      // Simple call: toast('Hello', 'success')
      return showToast(id, type || 'info', messageOrOptions, duration)
    },
    [showToast]
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toast,
    toasts,
    removeToast,
  }
}
