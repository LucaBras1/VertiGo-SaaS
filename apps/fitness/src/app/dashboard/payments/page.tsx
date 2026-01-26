'use client'

import { useEffect, useState } from 'react'
import { CreditCard, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { PaymentMethodsCard } from '@/components/payments/PaymentMethodsCard'
import { RecentPaymentsTable } from '@/components/payments/RecentPaymentsTable'
import { formatCurrency } from '@/lib/stripe-client'

interface PaymentStats {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayments: number
  transactionCount: number
}

export default function PaymentsPage() {
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    transactionCount: 0,
  })
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    try {
      const response = await fetch('/api/payments/history?limit=10')
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments || [])

        // Calculate stats
        const totalRevenue = data.payments.reduce(
          (sum: number, p: any) => sum + p.amount,
          0
        )

        // Get current month payments
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthlyRevenue = data.payments
          .filter((p: any) => new Date(p.createdAt) >= monthStart)
          .reduce((sum: number, p: any) => sum + p.amount, 0)

        setStats({
          totalRevenue,
          monthlyRevenue,
          pendingPayments: 0, // TODO: Calculate from unpaid invoices
          transactionCount: data.payments.length,
        })
      }
    } catch (error) {
      console.error('Failed to load payment data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platby</h1>
        <p className="mt-2 text-gray-600">
          Správa plateb, faktur a předplatných
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Celkové příjmy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tento měsíc</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Čekající platby</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : formatCurrency(stats.pendingPayments)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Počet transakcí</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : stats.transactionCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payments */}
        <div className="lg:col-span-2">
          <RecentPaymentsTable payments={payments} loading={loading} />
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-1">
          <PaymentMethodsCard />
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Nastavení Stripe webhooků
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>Pro správné fungování plateb je potřeba nastavit Stripe webhook:</p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Přejděte do Stripe Dashboard {'>'} Developers {'>'} Webhooks</li>
            <li>Klikněte na "Add endpoint"</li>
            <li>URL: <code className="bg-blue-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api/payments/webhook</code></li>
            <li>Vyberte události: <code className="bg-blue-100 px-1 rounded">checkout.session.completed</code>, <code className="bg-blue-100 px-1 rounded">payment_intent.payment_failed</code></li>
            <li>Zkopírujte webhook secret a přidejte do .env jako <code className="bg-blue-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
