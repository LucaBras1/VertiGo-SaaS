'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaySessionButtonProps {
  sessionId: string
  className?: string
  children?: React.ReactNode
}

export function PaySessionButton({
  sessionId,
  className = '',
  children,
}: PaySessionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/create-session-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.error || 'Chyba při vytváření platby')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Chyba při vytváření platby')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CreditCard className="w-3 h-3" />
      )}
      {children || 'Zaplatit'}
    </button>
  )
}
