'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, ArrowRight, Package, FileText, Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const paymentType = searchParams.get('type') || 'package' // package, invoice, session
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect based on payment type
          if (paymentType === 'invoice') {
            router.push('/admin/invoices')
          } else if (paymentType === 'session') {
            router.push('/admin/sessions')
          } else {
            router.push('/admin/clients')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, paymentType])

  const getPaymentTypeConfig = () => {
    switch (paymentType) {
      case 'invoice':
        return {
          icon: FileText,
          title: 'Faktura byla zaplacena!',
          description: 'Platba faktury byla úspěšně zpracována.',
          redirectLabel: 'Přejít na faktury',
          redirectUrl: '/admin/invoices',
        }
      case 'session':
        return {
          icon: Dumbbell,
          title: 'Trénink byl zaplacen!',
          description: 'Platba za trénink byla úspěšně zpracována.',
          redirectLabel: 'Přejít na tréninky',
          redirectUrl: '/admin/sessions',
        }
      default: // package
        return {
          icon: Package,
          title: 'Platba proběhla úspěšně!',
          description: 'Kredity byly přidány na účet klienta.',
          redirectLabel: 'Přejít na klienty',
          redirectUrl: '/admin/clients',
        }
    }
  }

  const config = getPaymentTypeConfig()
  const Icon = config.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 text-center border border-green-100">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            {config.title}
          </h1>

          {/* Description */}
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            {config.description}
          </p>

          {/* Transaction ID */}
          {sessionId && (
            <div className="bg-neutral-50 dark:bg-neutral-950 rounded-lg p-4 mb-6">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">ID transakce</p>
              <p className="text-sm font-mono text-neutral-700 dark:text-neutral-300 break-all">
                {sessionId.substring(0, 30)}...
              </p>
            </div>
          )}

          {/* Success Checklist */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span>Platba zpracována</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span>Email potvrzení odeslán</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span>Záznam aktualizován</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-3">
            <Link
              href={config.redirectUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {config.redirectLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/payments"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-50 dark:bg-neutral-950 transition-colors border border-neutral-200 dark:border-neutral-700"
            >
              Zobrazit všechny platby
            </Link>

            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
              Automatické přesměrování za {countdown}s
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
          Máte dotaz? Kontaktujte nás na{' '}
          <a href="mailto:podpora@fitadmin.app" className="text-green-600 hover:underline">
            podpora@fitadmin.app
          </a>
        </p>
      </div>
    </div>
  )
}
