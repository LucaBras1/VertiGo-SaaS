'use client'

/**
 * Migration Page
 *
 * Stránka pro migraci dat z Vyfakturuj.cz do nového systému.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Users,
  AlertTriangle,
  Play,
  Shield,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface MigrationStatus {
  isConfigured: boolean
  totalInvoices: number
  migratedInvoices: number
  totalCustomers: number
  migratedCustomers: number
  lastMigrationAt: string | null
}

interface MigrationResult {
  success: boolean
  message: string
  stats: {
    invoicesTotal: number
    invoicesMigrated: number
    invoicesSkipped: number
    contactsTotal: number
    contactsMigrated: number
    contactsSkipped: number
    errors: number
  }
  errors: Array<{
    type: string
    id: number | string
    identifier?: string
    error: string
  }>
}

interface VerificationResult {
  success: boolean
  issues: string[]
  stats: {
    invoicesWithoutCustomer: number
    duplicateInvoiceNumbers: number
    orphanedItems: number
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MigrationPage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null)
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/invoicing/migration')
      if (!res.ok) throw new Error('Failed to load status')

      const data = await res.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status')
    } finally {
      setLoading(false)
    }
  }

  const runMigration = async () => {
    if (!confirm('Opravdu chcete spustit migraci? Tento proces může trvat několik minut.')) {
      return
    }

    setMigrating(true)
    setError(null)
    setMigrationResult(null)

    try {
      const res = await fetch('/api/admin/invoicing/migration', {
        method: 'POST',
      })

      const data = await res.json()
      setMigrationResult(data)

      // Reload status after migration
      await loadStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed')
    } finally {
      setMigrating(false)
    }
  }

  const runVerification = async () => {
    setVerifying(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/invoicing/migration?action=verify')
      if (!res.ok) throw new Error('Verification failed')

      const data = await res.json()
      setVerification(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nikdy'
    return new Date(dateStr).toLocaleString('cs-CZ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/invoicing/settings"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Migrace z Vyfakturuj.cz
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Import historických dat do nového fakturačního systému
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Configuration Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${
              status?.isConfigured
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <Database className={`h-5 w-5 ${
                status?.isConfigured ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Připojení
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status?.isConfigured ? 'Nakonfigurováno' : 'Nenakonfigurováno'}
              </p>
            </div>
          </div>
          {!status?.isConfigured && (
            <Link
              href="/admin/invoicing/settings"
              className="text-sm text-blue-600 hover:underline"
            >
              Nastavit připojení →
            </Link>
          )}
        </div>

        {/* Invoices Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Faktury
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status?.migratedInvoices || 0} z {status?.totalInvoices || 0} migrováno
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${status?.totalInvoices
                  ? (status.migratedInvoices / status.totalInvoices) * 100
                  : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Customers Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Zákazníci
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status?.migratedCustomers || 0} z {status?.totalCustomers || 0} propojeno
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{
                width: `${status?.totalCustomers
                  ? (status.migratedCustomers / status.totalCustomers) * 100
                  : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Last Migration Info */}
      {status?.lastMigrationAt && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Poslední migrace: <strong>{formatDate(status.lastMigrationAt)}</strong>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Akce
        </h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={runMigration}
            disabled={!status?.isConfigured || migrating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {migrating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {migrating ? 'Migrování...' : 'Spustit migraci'}
          </button>

          <button
            onClick={runVerification}
            disabled={verifying}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {verifying ? 'Ověřování...' : 'Ověřit integritu'}
          </button>

          <button
            onClick={loadStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>
        </div>
      </div>

      {/* Migration Result */}
      {migrationResult && (
        <div className={`rounded-xl border p-6 ${
          migrationResult.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {migrationResult.success ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                migrationResult.success
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {migrationResult.success ? 'Migrace dokončena' : 'Migrace dokončena s chybami'}
              </h3>
              <p className={`text-sm mt-1 ${
                migrationResult.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {migrationResult.message}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Faktury migrovány</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {migrationResult.stats.invoicesMigrated} / {migrationResult.stats.invoicesTotal}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kontakty migrovány</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {migrationResult.stats.contactsMigrated} / {migrationResult.stats.contactsTotal}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Přeskočeno</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {migrationResult.stats.invoicesSkipped + migrationResult.stats.contactsSkipped}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Chyby</p>
                  <p className="font-semibold text-red-600">
                    {migrationResult.stats.errors}
                  </p>
                </div>
              </div>

              {/* Errors */}
              {migrationResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chyby ({migrationResult.errors.length}):
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {migrationResult.errors.slice(0, 20).map((err, i) => (
                      <div
                        key={i}
                        className="text-xs p-2 bg-red-100 dark:bg-red-900/30 rounded"
                      >
                        <span className="font-medium">[{err.type}]</span>{' '}
                        {err.identifier || err.id}: {err.error}
                      </div>
                    ))}
                    {migrationResult.errors.length > 20 && (
                      <p className="text-xs text-gray-500">
                        ... a dalších {migrationResult.errors.length - 20} chyb
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Result */}
      {verification && (
        <div className={`rounded-xl border p-6 ${
          verification.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-start gap-3">
            {verification.success ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`font-semibold ${
                verification.success
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-yellow-900 dark:text-yellow-100'
              }`}>
                {verification.success ? 'Data jsou v pořádku' : 'Nalezeny problémy'}
              </h3>

              {verification.issues.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {verification.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-yellow-700 dark:text-yellow-300">
                      • {issue}
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Faktury bez zákazníka
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {verification.stats.invoicesWithoutCustomer}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Duplicitní čísla
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {verification.stats.duplicateInvoiceNumbers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Osiřelé položky
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {verification.stats.orphanedItems}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Postup migrace
        </h2>

        <ol className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              1
            </span>
            <div>
              <strong>Ověřte připojení</strong> - Zkontrolujte, že je Vyfakturuj.cz správně nakonfigurován v nastavení.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              2
            </span>
            <div>
              <strong>Spusťte migraci</strong> - Klikněte na tlačítko &quot;Spustit migraci&quot;. Proces importuje všechny kontakty a faktury z Vyfakturuj.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              3
            </span>
            <div>
              <strong>Ověřte integritu</strong> - Po migraci spusťte ověření pro kontrolu správnosti dat.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              4
            </span>
            <div>
              <strong>Paralelní provoz</strong> - Doporučujeme 1-2 týdny testovat nový systém paralelně s Vyfakturuj.
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
              5
            </span>
            <div>
              <strong>Přechod na nový systém</strong> - Po ověření přejděte kompletně na nový fakturační systém.
            </div>
          </li>
        </ol>
      </div>
    </div>
  )
}
