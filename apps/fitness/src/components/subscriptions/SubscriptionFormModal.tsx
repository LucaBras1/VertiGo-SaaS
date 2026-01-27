'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
}

interface Package {
  id: string
  name: string
  price: number
  credits: number
}

interface SubscriptionFormModalProps {
  onClose: () => void
  onSave: () => void
}

const frequencies = [
  { value: 'WEEKLY', label: 'Tydenni' },
  { value: 'BIWEEKLY', label: 'Dvoutydne' },
  { value: 'MONTHLY', label: 'Mesicni' },
  { value: 'QUARTERLY', label: 'Ctvrtletni' },
  { value: 'YEARLY', label: 'Rocni' },
]

export function SubscriptionFormModal({ onClose, onSave }: SubscriptionFormModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [clientId, setClientId] = useState('')
  const [packageId, setPackageId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('CZK')
  const [frequency, setFrequency] = useState('MONTHLY')
  const [billingDay, setBillingDay] = useState<number | ''>('')
  const [autoRenew, setAutoRenew] = useState(true)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsRes, packagesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/packages'),
      ])

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData.clients || clientsData)
      }

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        setPackages(packagesData.packages || packagesData)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update amount when package is selected
  useEffect(() => {
    if (packageId) {
      const pkg = packages.find((p) => p.id === packageId)
      if (pkg) {
        setAmount(pkg.price.toString())
      }
    }
  }, [packageId, packages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId) {
      setError('Vyberte klienta')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Zadejte platnou castku')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          packageId: packageId || undefined,
          amount: parseFloat(amount),
          currency,
          frequency,
          billingDay: billingDay ? Number(billingDay) : undefined,
          autoRenew,
          startDate: new Date(startDate).toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create subscription')
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodarilo se vytvorit predplatne')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-secondary-800 rounded-xl shadow-2xl max-w-lg w-full border border-secondary-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-700 sticky top-0 bg-secondary-800">
          <h2 className="text-lg font-semibold text-white">Nove predplatne</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary-700 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Klient *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Vyberte klienta</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Package */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Balicek (volitelne)
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Bez balicku</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {pkg.price} CZK ({pkg.credits} kreditu)
                  </option>
                ))}
              </select>
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Castka *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mena
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="CZK">CZK</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Frekvence
              </label>
              <div className="flex flex-wrap gap-2">
                {frequencies.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrequency(f.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm transition-colors',
                      frequency === f.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-700 text-gray-300 hover:bg-secondary-600'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Day */}
            {['MONTHLY', 'QUARTERLY', 'YEARLY'].includes(frequency) && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Den uctovani (1-31)
                </label>
                <input
                  type="number"
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value ? parseInt(e.target.value) : '')}
                  min="1"
                  max="31"
                  placeholder="Napr. 1 pro prvni den v mesici"
                  className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Datum zahajeni
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Auto Renew */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="w-5 h-5 rounded border-secondary-600 bg-secondary-700 text-primary-500 focus:ring-primary-500"
                />
                <div>
                  <span className="text-white font-medium">Automaticke obnoveni</span>
                  <p className="text-sm text-gray-400">
                    Automaticky generovat faktury v den splatnosti
                  </p>
                </div>
              </label>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-secondary-700 text-gray-300 rounded-lg font-medium hover:bg-secondary-600 transition-colors"
              >
                Zrusit
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Vytvarim...' : 'Vytvorit predplatne'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
