'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TransactionMatchModal } from '@/components/billing/TransactionMatchModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  RefreshCw,
  Link2,
  Link2Off,
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  Building2,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BankAccount {
  id: string
  accountName: string
  accountNumber: string
  lastSyncAt?: string
}

interface Transaction {
  id: string
  transactionId: string
  date: string
  amount: number
  currency: string
  type: 'CREDIT' | 'DEBIT'
  counterpartyName?: string
  counterpartyAccount?: string
  description?: string
  variableSymbol?: string
  isMatched: boolean
  matchedInvoiceId?: string
  matchConfidence?: number
  matchMethod?: string
  bankAccount: {
    id: string
    accountName: string
    accountNumber: string
  }
}

export default function ReconciliationPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showMatched, setShowMatched] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [selectedAccountId, showMatched])

  const fetchBankAccounts = async () => {
    try {
      // For now, we'll show all accounts - in a real app, you'd have an API endpoint
      // This fetches transactions which include account info
      const response = await fetch('/api/billing/bank-transactions?limit=1')
      if (response.ok) {
        const data = await response.json()
        if (data.transactions.length > 0) {
          const uniqueAccounts = new Map<string, BankAccount>()
          data.transactions.forEach((tx: Transaction) => {
            if (!uniqueAccounts.has(tx.bankAccount.id)) {
              uniqueAccounts.set(tx.bankAccount.id, tx.bankAccount as BankAccount)
            }
          })
          setBankAccounts(Array.from(uniqueAccounts.values()))
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error)
    }
  }

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        type: 'CREDIT', // Only show incoming payments
        isMatched: showMatched ? 'true' : 'false',
        limit: '50',
      })

      if (selectedAccountId) {
        params.set('bankAccountId', selectedAccountId)
      }

      const response = await fetch(`/api/billing/bank-transactions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')

      const data = await response.json()
      setTransactions(data.transactions)
      setTotalTransactions(data.total)

      // Update bank accounts list
      const uniqueAccounts = new Map<string, BankAccount>()
      data.transactions.forEach((tx: Transaction) => {
        if (!uniqueAccounts.has(tx.bankAccount.id)) {
          uniqueAccounts.set(tx.bankAccount.id, tx.bankAccount as BankAccount)
        }
      })
      if (uniqueAccounts.size > 0) {
        setBankAccounts(Array.from(uniqueAccounts.values()))
      }
    } catch (error) {
      toast.error('Nepodařilo se načíst transakce')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!selectedAccountId) {
      toast.error('Vyberte bankovní účet')
      return
    }

    setIsSyncing(true)
    try {
      const response = await fetch(
        `/api/billing/bank-accounts/${selectedAccountId}/sync`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Sync failed')
      }

      const data = await response.json()
      toast.success(
        `Synchronizováno: ${data.transactionsImported} nových, ${data.transactionsMatched} spárovaných`
      )
      fetchTransactions()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Synchronizace selhala'
      )
    } finally {
      setIsSyncing(false)
    }
  }

  const handleUnmatch = async (transactionId: string) => {
    try {
      const response = await fetch(
        `/api/billing/bank-transactions/${transactionId}/match`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Unmatch failed')
      }

      toast.success('Párování zrušeno')
      fetchTransactions()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Nepodařilo se zrušit párování'
      )
    }
  }

  const openMatchModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsMatchModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Párování plateb</h1>
          <p className="text-gray-600 mt-1">
            Spárujte bankovní transakce s fakturami
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Bank Account Selector */}
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedAccountId || ''}
                onChange={(e) => setSelectedAccountId(e.target.value || null)}
              >
                <option value="">Všechny účty</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountName} ({account.accountNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <Button
                variant={!showMatched ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMatched(false)}
              >
                Nespárované
              </Button>
              <Button
                variant={showMatched ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMatched(true)}
              >
                Spárované
              </Button>
            </div>

            {/* Sync Button */}
            <div className="ml-auto">
              <Button
                onClick={handleSync}
                disabled={isSyncing || !selectedAccountId}
                isLoading={isSyncing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchronizovat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ArrowDownCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Celkem transakcí</p>
                <p className="text-xl font-semibold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Link2Off className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nespárované</p>
                <p className="text-xl font-semibold">
                  {!showMatched ? transactions.length : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Link2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Spárované</p>
                <p className="text-xl font-semibold">
                  {showMatched ? transactions.length : '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {showMatched ? 'Spárované transakce' : 'Nespárované transakce'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {showMatched
                ? 'Žádné spárované transakce'
                : 'Všechny transakce jsou spárované'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Datum</th>
                    <th className="pb-3 font-medium">Částka</th>
                    <th className="pb-3 font-medium">Od</th>
                    <th className="pb-3 font-medium">VS</th>
                    <th className="pb-3 font-medium">Popis</th>
                    {showMatched && <th className="pb-3 font-medium">Stav</th>}
                    <th className="pb-3 font-medium text-right">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-4 text-sm">
                        {formatDate(new Date(tx.date))}
                      </td>
                      <td className="py-4">
                        <span className="font-semibold text-green-600">
                          +{formatCurrency(tx.amount)}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">
                          {tx.currency}
                        </span>
                      </td>
                      <td className="py-4 text-sm">
                        {tx.counterpartyName || '-'}
                      </td>
                      <td className="py-4 text-sm font-mono">
                        {tx.variableSymbol || '-'}
                      </td>
                      <td className="py-4 text-sm text-gray-600 max-w-xs truncate">
                        {tx.description || '-'}
                      </td>
                      {showMatched && (
                        <td className="py-4">
                          <Badge variant="success">
                            {tx.matchMethod === 'AUTO_VS'
                              ? 'Auto (VS)'
                              : tx.matchMethod === 'MANUAL'
                              ? 'Manuální'
                              : 'Spárováno'}
                          </Badge>
                        </td>
                      )}
                      <td className="py-4 text-right">
                        {tx.isMatched ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnmatch(tx.id)}
                          >
                            <Link2Off className="h-4 w-4 mr-1" />
                            Zrušit
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openMatchModal(tx)}
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            Spárovat
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Modal */}
      <TransactionMatchModal
        transaction={selectedTransaction}
        isOpen={isMatchModalOpen}
        onClose={() => {
          setIsMatchModalOpen(false)
          setSelectedTransaction(null)
        }}
        onMatched={fetchTransactions}
      />
    </div>
  )
}
