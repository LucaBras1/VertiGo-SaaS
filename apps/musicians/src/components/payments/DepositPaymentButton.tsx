'use client'

import { useState } from 'react'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface DepositPaymentButtonProps {
  gigId: string
  depositAmount: number
  depositPaid: boolean
  gigStatus: string
  className?: string
}

export default function DepositPaymentButton({
  gigId,
  depositAmount,
  depositPaid,
  gigStatus,
  className,
}: DepositPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Only show for confirmed gigs with unpaid deposits
  if (gigStatus !== 'CONFIRMED' || depositPaid || !depositAmount || depositAmount <= 0) {
    if (depositPaid && depositAmount > 0) {
      return (
        <Button variant="outline" disabled className={className}>
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Záloha zaplacena
        </Button>
      )
    }
    return null
  }

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/payments/create-deposit-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Nepodařilo se vytvořit platbu'
      )
      setIsLoading(false)
    }
  }

  const formattedAmount = (depositAmount / 100).toLocaleString('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Zaplatit zálohu ({formattedAmount})
    </Button>
  )
}
