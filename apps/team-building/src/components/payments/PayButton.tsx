'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

interface PayButtonProps {
  orderId?: string
  invoiceId?: string
  amount: number
  currency?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function PayButton({
  orderId,
  invoiceId,
  amount,
  currency = 'CZK',
  disabled = false,
  className = '',
  children,
}: PayButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!orderId && !invoiceId) {
      setError('No order or invoice ID provided')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const endpoint = orderId
        ? '/api/payments/create-order-checkout'
        : '/api/payments/create-invoice-checkout'

      const payload = orderId ? { orderId } : { invoiceId }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsLoading(false)
    }
  }

  const formattedAmount = amount.toLocaleString('cs-CZ')

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePayment}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2
          px-4 py-2 rounded-lg font-medium
          bg-gradient-to-r from-sky-500 to-emerald-500
          hover:from-sky-600 hover:to-emerald-600
          text-white shadow-sm
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            {children || `Pay ${formattedAmount} ${currency}`}
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default PayButton
