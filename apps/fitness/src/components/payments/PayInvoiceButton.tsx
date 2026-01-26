'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PayInvoiceButtonProps {
  invoiceId: string
  className?: string
  children?: React.ReactNode
}

export function PayInvoiceButton({
  invoiceId,
  className = '',
  children,
}: PayInvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/create-invoice-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {children || 'Zaplatit fakturu'}
    </button>
  )
}
