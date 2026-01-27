'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Loader2, Search, TrendingUp, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'
import { SubscriptionCard } from '@/components/subscriptions/SubscriptionCard'
import { SubscriptionFormModal } from '@/components/subscriptions/SubscriptionFormModal'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Subscription {
  id: string
  status: string
  amount: number | { toString: () => string }
  currency: string
  frequency: string
  nextBillingDate: string
  startDate: string
  endDate?: string | null
  pausedAt?: string | null
  autoRenew: boolean
  retryCount: number
  client: {
    id: string
    name: string
    email: string
  }
  package?: {
    id: string
    name: string
    credits: number
  } | null
  _count?: {
    generatedInvoices: number
  }
}

interface Stats {
  active: number
  paused: number
  cancelled: number
  mrr: number
  upcomingRenewals: number
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        includeStats: 'true',
      })
      if (statusFilter) {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/subscriptions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast.error('Nepodarilo se nacist predplatna')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  const handlePause = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}/pause`, {
        method: 'POST',
      })
      if (response.ok) {
        toast.success('Predplatne pozastaveno')
        fetchSubscriptions()
      } else {
        throw new Error('Failed to pause')
      }
    } catch (error) {
      toast.error('Nepodarilo se pozastavit predplatne')
    }
  }

  const handleResume = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}/resume`, {
        method: 'POST',
      })
      if (response.ok) {
        toast.success('Predplatne obnoveno')
        fetchSubscriptions()
      } else {
        throw new Error('Failed to resume')
      }
    } catch (error) {
      toast.error('Nepodarilo se obnovit predplatne')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Opravdu chcete zrusit toto predplatne?')) return

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success('Predplatne zruseno')
        fetchSubscriptions()
      } else {
        throw new Error('Failed to cancel')
      }
    } catch (error) {
      toast.error('Nepodarilo se zrusit predplatne')
    }
  }

  const handleRetry = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}/retry`, {
        method: 'POST',
      })
      if (response.ok) {
        toast.success('Platba byla opakovana')
        fetchSubscriptions()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to retry')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepodarilo se opakovat platbu')
    }
  }

  // Filter subscriptions by search
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      sub.client.name.toLowerCase().includes(query) ||
      sub.client.email.toLowerCase().includes(query) ||
      sub.package?.name.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Predplatna</h1>
          <p className="text-gray-400">Spravujte pravidelne platby a predplatna klientu</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchSubscriptions()}
            className="p-2 rounded-lg bg-secondary-700 text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <RefreshCw className={cn('h-5 w-5', loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nove predplatne
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Aktivni</p>
                <p className="text-xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">MRR</p>
                <p className="text-xl font-bold text-white">
                  {stats.mrr.toLocaleString('cs-CZ')} CZK
                </p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Obnoveni (7 dni)</p>
                <p className="text-xl font-bold text-white">{stats.upcomingRenewals}</p>
              </div>
            </div>
          </div>

          <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pozastaveno</p>
                <p className="text-xl font-bold text-white">{stats.paused}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat podle jmena nebo emailu..."
            className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {['', 'active', 'paused', 'cancelled', 'past_due'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm transition-colors',
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
              )}
            >
              {status === '' && 'Vse'}
              {status === 'active' && 'Aktivni'}
              {status === 'paused' && 'Pozastaveno'}
              {status === 'cancelled' && 'Zruseno'}
              {status === 'past_due' && 'Po splatnosti'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12 bg-secondary-800/50 rounded-xl border border-secondary-700">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-2">Zadna predplatna</p>
          <p className="text-sm text-gray-500 mb-4">
            Vytvorte prvni predplatne pro pravidelne uctovani klientum.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="text-primary-400 hover:text-primary-300"
          >
            Pridat predplatne
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onRetry={handleRetry}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SubscriptionFormModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchSubscriptions()
            toast.success('Predplatne vytvoreno')
          }}
        />
      )}
    </div>
  )
}
