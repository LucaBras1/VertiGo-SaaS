'use client'

/**
 * Vyfakturuj Sync Panel Component
 *
 * Displays sync status and provides sync actions for Vyfakturuj.cz integration
 */

import { useState, useEffect } from 'react'
import { RefreshCw, Upload, Download, Link2, AlertCircle } from 'lucide-react'

interface SyncStatus {
  isConfigured: boolean
  lastSyncAt: string | null
  linkedCustomers: number
  unlinkedCustomers: number
}

interface SyncResult {
  success: boolean
  message: string
  stats?: {
    imported: number
    exported: number
    updated: number
    skipped: number
    errors: number
  }
  errors?: Array<{
    type: string
    id: string | number
    name?: string
    error: string
  }>
}

interface VyfakturujSyncPanelProps {
  onSyncComplete?: () => void
}

export function VyfakturujSyncPanel({ onSyncComplete }: VyfakturujSyncPanelProps) {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<'full' | 'import' | 'export' | null>(null)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/vyfakturuj/sync')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (type: 'full' | 'import' | 'export') => {
    setSyncing(type)
    setResult(null)

    try {
      let url = '/api/admin/vyfakturuj/sync'
      if (type === 'import') url += '/import'
      if (type === 'export') url += '/export'

      const response = await fetch(url, { method: 'POST' })
      const data = await response.json()

      setResult(data)
      await fetchStatus()
      if (onSyncComplete) onSyncComplete()
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Synchronizace selhala',
      })
    } finally {
      setSyncing(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (!status?.isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Vyfakturuj.cz není nakonfigurován</p>
            <p className="text-sm mt-1">
              Pro synchronizaci zákazníků přejděte do{' '}
              <a href="/admin/settings/vyfakturuj" className="underline">
                nastavení Vyfakturuj.cz
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Synchronizace s Vyfakturuj.cz</h3>
          </div>
          <div className="text-sm text-gray-500">
            {status.lastSyncAt
              ? `Poslední sync: ${new Date(status.lastSyncAt).toLocaleString('cs-CZ')}`
              : 'Zatím nesynchronizováno'}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-700">
              {status.linkedCustomers}
            </div>
            <div className="text-sm text-green-600">Propojených zákazníků</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-700">
              {status.unlinkedCustomers}
            </div>
            <div className="text-sm text-gray-600">Nepropojených zákazníků</div>
          </div>
        </div>

        {/* Sync Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSync('full')}
            disabled={syncing !== null}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${syncing === 'full' ? 'animate-spin' : ''}`}
            />
            {syncing === 'full' ? 'Synchronizuji...' : 'Plná synchronizace'}
          </button>

          <button
            onClick={() => handleSync('import')}
            disabled={syncing !== null}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download
              className={`w-4 h-4 mr-2 ${syncing === 'import' ? 'animate-spin' : ''}`}
            />
            {syncing === 'import' ? 'Importuji...' : 'Import z Vyfakturuj'}
          </button>

          <button
            onClick={() => handleSync('export')}
            disabled={syncing !== null}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload
              className={`w-4 h-4 mr-2 ${syncing === 'export' ? 'animate-spin' : ''}`}
            />
            {syncing === 'export' ? 'Exportuji...' : 'Export do Vyfakturuj'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`mt-4 rounded-lg p-3 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div
              className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}
            >
              {result.message}
            </div>

            {result.stats && (
              <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="font-medium">{result.stats.imported}</span> importováno
                </div>
                <div>
                  <span className="font-medium">{result.stats.exported}</span> exportováno
                </div>
                <div>
                  <span className="font-medium">{result.stats.updated}</span> aktualizováno
                </div>
                <div>
                  <span className="font-medium text-red-600">{result.stats.errors}</span>{' '}
                  chyb
                </div>
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-gray-600 underline"
                >
                  {showDetails ? 'Skrýt detaily' : 'Zobrazit detaily chyb'}
                </button>

                {showDetails && (
                  <div className="mt-2 space-y-1 text-sm text-red-700">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="bg-red-100 rounded px-2 py-1">
                        [{err.type}] {err.name || err.id}: {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
