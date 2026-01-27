'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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

interface ReferralSettingsFormProps {
  settings: ReferralSettings
  onClose: () => void
  onSuccess: () => void
}

const REWARD_TYPES = [
  { value: 'credits', label: 'Kredity' },
  { value: 'discount', label: 'Sleva (%)' },
  { value: 'cash', label: 'Hotovost (Kc)' },
]

const QUALIFICATION_CRITERIA = [
  { value: 'signup', label: 'Registrace', description: 'Okamzite po registraci' },
  { value: 'first_session', label: 'Prvni lekce', description: 'Po dokonceni prvni lekce' },
  { value: 'first_payment', label: 'Prvni platba', description: 'Po prvni platbe' },
]

export function ReferralSettingsForm({ settings, onClose, onSuccess }: ReferralSettingsFormProps) {
  const [formData, setFormData] = useState({
    isActive: settings.isActive,
    referrerRewardType: settings.referrerRewardType,
    referrerRewardValue: settings.referrerRewardValue,
    referredRewardType: settings.referredRewardType,
    referredRewardValue: settings.referredRewardValue,
    qualificationCriteria: settings.qualificationCriteria,
    maxReferralsPerClient: settings.maxReferralsPerClient,
    referralCodeExpiry: settings.referralCodeExpiry,
    sendReferralEmails: settings.sendReferralEmails,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/referrals/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo se ulozit nastaveni')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo se ulozit nastaveni')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nastaveni programu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Program aktivni</p>
              <p className="text-sm text-gray-500">Povoluje referral program</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odmena pro doporucujiciho
              </label>
              <select
                value={formData.referrerRewardType}
                onChange={(e) => setFormData({ ...formData, referrerRewardType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {REWARD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hodnota</label>
              <input
                type="number"
                value={formData.referrerRewardValue}
                onChange={(e) => setFormData({ ...formData, referrerRewardValue: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odmena pro doporuceneho
              </label>
              <select
                value={formData.referredRewardType}
                onChange={(e) => setFormData({ ...formData, referredRewardType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {REWARD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hodnota</label>
              <input
                type="number"
                value={formData.referredRewardValue}
                onChange={(e) => setFormData({ ...formData, referredRewardValue: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kriteria kvalifikace
            </label>
            <div className="space-y-2">
              {QUALIFICATION_CRITERIA.map((criteria) => (
                <label
                  key={criteria.value}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.qualificationCriteria === criteria.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="qualificationCriteria"
                    value={criteria.value}
                    checked={formData.qualificationCriteria === criteria.value}
                    onChange={(e) => setFormData({ ...formData, qualificationCriteria: e.target.value })}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{criteria.label}</p>
                    <p className="text-sm text-gray-500">{criteria.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. doporuceni na klienta
              </label>
              <input
                type="number"
                value={formData.maxReferralsPerClient || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  maxReferralsPerClient: e.target.value ? parseInt(e.target.value) : null
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Neomezeno"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expirace kodu (dni)
              </label>
              <input
                type="number"
                value={formData.referralCodeExpiry || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  referralCodeExpiry: e.target.value ? parseInt(e.target.value) : null
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Bez expirace"
                min={1}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sendReferralEmails"
              checked={formData.sendReferralEmails}
              onChange={(e) => setFormData({ ...formData, sendReferralEmails: e.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="sendReferralEmails" className="text-sm text-gray-700">
              Odesilat email pozvanky automaticky
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Zrusit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ukladam...' : 'Ulozit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
