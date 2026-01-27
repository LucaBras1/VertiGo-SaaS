'use client'

import { useState, useEffect } from 'react'
import { X, Search, Send, User, Copy, Check } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  referralCode: string | null
}

interface InviteModalProps {
  clients: Client[]
  selectedClient: Client | null
  onClose: () => void
  onSuccess: () => void
}

export function InviteModal({ clients, selectedClient, onClose, onSuccess }: InviteModalProps) {
  const [referrer, setReferrer] = useState<Client | null>(selectedClient)
  const [search, setSearch] = useState('')
  const [referredEmail, setReferredEmail] = useState('')
  const [referredName, setReferredName] = useState('')
  const [referredPhone, setReferredPhone] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    if (referrer && !referrer.referralCode) {
      fetchReferralCode(referrer.id)
    } else if (referrer) {
      setReferralCode(referrer.referralCode)
    }
  }, [referrer])

  const fetchReferralCode = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/referral-code`)
      if (response.ok) {
        const data = await response.json()
        setReferralCode(data.referralCode)
      }
    } catch (error) {
      console.error('Failed to fetch referral code:', error)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referrer) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrerId: referrer.id,
          referredEmail: referredEmail || undefined,
          referredName: referredName || undefined,
          referredPhone: referredPhone || undefined,
          sendEmail,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo se odeslat pozvanku')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo se odeslat pozvanku')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Odeslat pozvanku</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!referrer ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte doporucujiciho klienta
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Hledat klienta..."
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setReferrer(client)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <p className="p-4 text-center text-gray-500">Zadni klienti</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{referrer.name}</p>
                    <p className="text-sm text-gray-500">{referrer.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReferrer(null)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Zmenit
                </button>
              </div>

              {referralCode && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Referral kod:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-lg">
                      {referralCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Kontakt doporucovane osoby (volitelne)
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={referredEmail}
                      onChange={(e) => setReferredEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="email@priklad.cz"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Jmeno</label>
                    <input
                      type="text"
                      value={referredName}
                      onChange={(e) => setReferredName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Jan Novak"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={referredPhone}
                      onChange={(e) => setReferredPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+420 123 456 789"
                    />
                  </div>
                </div>
              </div>

              {referredEmail && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="sendEmail" className="text-sm text-gray-700">
                    Odeslat email s pozvankou
                  </label>
                </div>
              )}
            </>
          )}

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
              disabled={loading || !referrer}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Odesilam...' : 'Odeslat pozvanku'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
