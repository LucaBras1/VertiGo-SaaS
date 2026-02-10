'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') // 'deposit' | 'invoice'
  const gigId = searchParams.get('gigId')
  const invoiceId = searchParams.get('invoiceId')
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Brief delay to show verification state
    const timer = setTimeout(() => {
      setIsVerifying(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const getReturnLink = () => {
    if (type === 'deposit' && gigId) {
      return `/admin/gigs/${gigId}`
    }
    if (type === 'invoice' && invoiceId) {
      return `/admin/invoices/${invoiceId}`
    }
    return '/admin'
  }

  const getTitle = () => {
    if (type === 'deposit') {
      return 'Záloha zaplacena'
    }
    if (type === 'invoice') {
      return 'Faktura zaplacena'
    }
    return 'Platba dokoncena'
  }

  const getDescription = () => {
    if (type === 'deposit') {
      return 'Vaše záloha za koncert byla úspěšně zpracována. Děkujeme!'
    }
    if (type === 'invoice') {
      return 'Vaše platba faktury byla úspěšně zpracována. Děkujeme!'
    }
    return 'Vaše platba byla úspěšně zpracována. Děkujeme!'
  }

  const getButtonText = () => {
    if (type === 'deposit') {
      return 'Zpět na detail gigu'
    }
    if (type === 'invoice') {
      return 'Zpět na fakturu'
    }
    return 'Zpět na dashboard'
  }

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin" />
            <h1 className="text-xl font-semibold mt-4 text-neutral-900 dark:text-neutral-100">
              Ověřování platby...
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Počkejte prosím, ověřujeme vaši platbu.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mt-6 text-neutral-900 dark:text-neutral-100">
            {getTitle()}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-3">
            {getDescription()}
          </p>
          <div className="mt-8">
            <Link href={getReturnLink()}>
              <Button className="w-full">
                {getButtonText()}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Potvrzení vám bylo zasláno na email.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
