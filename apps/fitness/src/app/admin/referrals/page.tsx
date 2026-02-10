'use client'

import { useState, useEffect } from 'react'
import { Gift, Users, Check, Clock, Award, Settings, Send, RefreshCw } from 'lucide-react'
import { ReferralSettingsForm } from '@/components/referrals/ReferralSettingsForm'
import { InviteModal } from '@/components/referrals/InviteModal'
import { ReferralList } from '@/components/referrals/ReferralList'

interface ReferralStats {
  total: number
  pending: number
  signedUp: number
  qualified: number
  rewarded: number
  expired: number
  totalReferrers: number
  conversionRate: number
}

interface ReferralSettings {
  id: string
  isActive: boolean
  referrerRewardType: string
  referrerRewardValue: number
  referredRewardType: string
  referredRewardValue: number
  qualificationCriteria: string
  maxReferralsPerClient: number | null
  referralCodeExpiry: number | null
  sendReferralEmails: boolean
}

interface Client {
  id: string
  name: string
  email: string
  referralCode: string | null
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [settings, setSettings] = useState<ReferralSettings | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [selectedReferrer, setSelectedReferrer] = useState<Client | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [referralsRes, settingsRes, clientsRes] = await Promise.all([
        fetch('/api/referrals'),
        fetch('/api/referrals/settings'),
        fetch('/api/clients?limit=100'),
      ])

      if (referralsRes.ok) {
        const data = await referralsRes.json()
        if (data.stats) {
          setStats(data.stats)
        }
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data)
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setClients(data.clients || data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = (client: Client) => {
    setSelectedReferrer(client)
    setShowInvite(true)
  }

  const getRewardLabel = (type: string, value: number) => {
    switch (type) {
      case 'credits':
        return `${value} kreditu`
      case 'discount':
        return `${value}% sleva`
      case 'cash':
        return `${value} Kc`
      default:
        return `${value}`
    }
  }

  const getQualificationLabel = (criteria: string) => {
    switch (criteria) {
      case 'signup':
        return 'Registrace'
      case 'first_session':
        return 'Prvni lekce'
      case 'first_payment':
        return 'Prvni platba'
      default:
        return criteria
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Doporuceni</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Odmenovaci program pro klienty
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:bg-neutral-950 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Nastaveni
          </button>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Send className="h-4 w-4" />
            Odeslat pozvanku
          </button>
        </div>
      </div>

      {settings && !settings.isActive && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Gift className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Program je neaktivni</p>
              <p className="text-sm text-yellow-700">
                Aktivujte referral program v nastaveni pro spusteni.
              </p>
            </div>
          </div>
        </div>
      )}

      {settings && settings.isActive && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Aktivni odmeny</h2>
              <div className="space-y-1">
                <p className="text-green-100">
                  <span className="text-white font-medium">Doporucujici:</span>{' '}
                  {getRewardLabel(settings.referrerRewardType, settings.referrerRewardValue)}
                </p>
                <p className="text-green-100">
                  <span className="text-white font-medium">Doporuceny:</span>{' '}
                  {getRewardLabel(settings.referredRewardType, settings.referredRewardValue)}
                </p>
                <p className="text-green-100">
                  <span className="text-white font-medium">Kvalifikace:</span>{' '}
                  {getQualificationLabel(settings.qualificationCriteria)}
                </p>
              </div>
            </div>
            <Gift className="h-12 w-12 text-white/30" />
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkem</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Cekajici</p>
                <p className="text-xl font-semibold">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Kvalifikovane</p>
                <p className="text-xl font-semibold">{stats.qualified}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Odmeneno</p>
                <p className="text-xl font-semibold">{stats.rewarded}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReferralList onSendInvite={handleSendInvite} />

      {showSettings && settings && (
        <ReferralSettingsForm
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSuccess={() => {
            setShowSettings(false)
            fetchData()
          }}
        />
      )}

      {showInvite && (
        <InviteModal
          clients={clients}
          selectedClient={selectedReferrer}
          onClose={() => {
            setShowInvite(false)
            setSelectedReferrer(null)
          }}
          onSuccess={() => {
            setShowInvite(false)
            setSelectedReferrer(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
