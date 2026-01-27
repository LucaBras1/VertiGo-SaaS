'use client'

import { useState, useEffect } from 'react'
import { Gift, User, Clock, Check, Award, Send, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'

interface Referral {
  id: string
  referralCode: string
  referredEmail: string | null
  referredName: string | null
  status: string
  createdAt: string
  signedUpAt: string | null
  qualifiedAt: string | null
  rewardedAt: string | null
  expiresAt: string | null
  referrer: {
    id: string
    name: string
    email: string
  }
  referred: {
    id: string
    name: string
    email: string
  } | null
}

interface Client {
  id: string
  name: string
  email: string
}

interface ReferralListProps {
  onSendInvite: (client: Client) => void
}

export function ReferralList({ onSendInvite }: ReferralListProps) {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchReferrals()
  }, [filter])

  const fetchReferrals = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await fetch(`/api/referrals${params}`)
      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals || data)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQualify = async (referralId: string) => {
    setActionLoading(referralId)
    try {
      const response = await fetch(`/api/referrals/${referralId}/qualify`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchReferrals()
      }
    } catch (error) {
      console.error('Failed to qualify referral:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReward = async (referralId: string) => {
    setActionLoading(referralId)
    try {
      const response = await fetch(`/api/referrals/${referralId}/reward`, {
        method: 'POST',
      })
      if (response.ok) {
        fetchReferrals()
      }
    } catch (error) {
      console.error('Failed to reward referral:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Ceka
          </span>
        )
      case 'signed_up':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <User className="w-3 h-3 mr-1" />
            Registrovan
          </span>
        )
      case 'qualified':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Kvalifikovan
          </span>
        )
      case 'rewarded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Award className="w-3 h-3 mr-1" />
            Odmeneno
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expiroval
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Doporuceni</h3>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">Vsechny</option>
            <option value="pending">Cekajici</option>
            <option value="signed_up">Registrovane</option>
            <option value="qualified">Kvalifikovane</option>
            <option value="rewarded">Odmenene</option>
            <option value="expired">Expirovane</option>
          </select>
          <button
            onClick={fetchReferrals}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Obnovit"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {referrals.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Zadna doporuceni</p>
          <p className="text-sm">Zatim nebyla vytvorena zadna doporuceni</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Doporucujici
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Doporuceny
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kod
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stav
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Datum
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {referrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{referral.referrer.name}</p>
                        <p className="text-sm text-gray-500">{referral.referrer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {referral.referred ? (
                      <div>
                        <p className="font-medium text-gray-900">{referral.referred.name}</p>
                        <p className="text-sm text-gray-500">{referral.referred.email}</p>
                      </div>
                    ) : referral.referredName || referral.referredEmail ? (
                      <div>
                        <p className="font-medium text-gray-900">
                          {referral.referredName || 'Neznamy'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {referral.referredEmail || '-'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {referral.referralCode}
                    </code>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(referral.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(referral.createdAt).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {referral.status === 'signed_up' && (
                        <button
                          onClick={() => handleQualify(referral.id)}
                          disabled={actionLoading === referral.id}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Kvalifikovat
                        </button>
                      )}
                      {referral.status === 'qualified' && (
                        <button
                          onClick={() => handleReward(referral.id)}
                          disabled={actionLoading === referral.id}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Award className="h-3.5 w-3.5" />
                          Odmenit
                        </button>
                      )}
                      {referral.status === 'pending' && (
                        <button
                          onClick={() => onSendInvite(referral.referrer)}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Preposlat
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
