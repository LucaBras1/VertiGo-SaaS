'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') // 'deposit' | 'invoice'
  const gigId = searchParams.get('gigId')
  const invoiceId = searchParams.get('invoiceId')

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
      return 'Platba zálohy zrušena'
    }
    if (type === 'invoice') {
      return 'Platba faktury zrušena'
    }
    return 'Platba zrušena'
  }

  const getDescription = () => {
    if (type === 'deposit') {
      return 'Platba zálohy za koncert byla zrušena. Můžete to zkusit znovu.'
    }
    if (type === 'invoice') {
      return 'Platba faktury byla zrušena. Můžete to zkusit znovu.'
    }
    return 'Vaše platba byla zrušena. Můžete to zkusit znovu.'
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

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mt-6 text-neutral-900 dark:text-neutral-100">
            {getTitle()}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-3">
            {getDescription()}
          </p>
          <div className="mt-8 space-y-3">
            <Link href={getReturnLink()}>
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Zkusit znovu
              </Button>
            </Link>
            <Link href='/admin'>
              <Button variant="outline" className="w-full">
                Zpět na dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Pokud máte problémy s platbou, kontaktujte nás.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
