'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  transactionId: string
  date: string
  amount: number
  currency: string
  counterpartyName?: string
  counterpartyAccount?: string
  description?: string
  variableSymbol?: string
}

interface MatchSuggestion {
  invoiceId: string
  invoiceNumber: string
  confidence: number
  reason: string
  matchFactors: {
    amountMatch: boolean
    dateProximity: number
    vsMatch: boolean
    nameMatch: boolean
    textSimilarity: number
  }
}

interface TransactionMatchModalProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onMatched: () => void
}

export function TransactionMatchModal({
  transaction,
  isOpen,
  onClose,
  onMatched,
}: TransactionMatchModalProps) {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMatching, setIsMatching] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && transaction) {
      fetchSuggestions()
    }
  }, [isOpen, transaction])

  const fetchSuggestions = async () => {
    if (!transaction) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/billing/bank-transactions/${transaction.id}/suggestions`
      )
      if (!response.ok) throw new Error('Failed to fetch suggestions')
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      toast.error('Nepodařilo se načíst návrhy párování')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMatch = async (invoiceId: string) => {
    if (!transaction) return

    setIsMatching(invoiceId)
    try {
      const response = await fetch(
        `/api/billing/bank-transactions/${transaction.id}/match`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Match failed')
      }

      toast.success('Transakce spárována')
      onMatched()
      onClose()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Nepodařilo se spárovat transakci'
      )
    } finally {
      setIsMatching(null)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge variant="success">Vysoká ({Math.round(confidence * 100)}%)</Badge>
    }
    if (confidence >= 0.7) {
      return <Badge variant="warning">Střední ({Math.round(confidence * 100)}%)</Badge>
    }
    return <Badge variant="secondary">Nízká ({Math.round(confidence * 100)}%)</Badge>
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Párování transakce</DialogTitle>
      </DialogHeader>
      <DialogContent className="max-w-2xl">
        {/* Transaction details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Detail transakce</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Datum:</span>{' '}
              <span className="font-medium">{formatDate(new Date(transaction.date))}</span>
            </div>
            <div>
              <span className="text-gray-500">Částka:</span>{' '}
              <span className="font-medium text-green-600">
                {formatCurrency(transaction.amount)} {transaction.currency}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Od:</span>{' '}
              <span className="font-medium">{transaction.counterpartyName || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">VS:</span>{' '}
              <span className="font-medium">{transaction.variableSymbol || '-'}</span>
            </div>
            {transaction.description && (
              <div className="col-span-2">
                <span className="text-gray-500">Popis:</span>{' '}
                <span className="font-medium">{transaction.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        <h3 className="font-semibold text-gray-900 mb-3">Návrhy párování</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
            <span className="text-gray-500">Hledám faktury...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            Nebyly nalezeny žádné odpovídající faktury
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.invoiceId}
                className="border rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        Faktura {suggestion.invoiceNumber}
                      </span>
                      {getConfidenceBadge(suggestion.confidence)}
                    </div>
                    <p className="text-sm text-gray-600">{suggestion.reason}</p>
                    <div className="flex gap-2 mt-2">
                      {suggestion.matchFactors.amountMatch && (
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Částka
                        </Badge>
                      )}
                      {suggestion.matchFactors.vsMatch && (
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          VS
                        </Badge>
                      )}
                      {suggestion.matchFactors.nameMatch && (
                        <Badge variant="outline" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Jméno
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleMatch(suggestion.invoiceId)}
                    disabled={isMatching !== null}
                    isLoading={isMatching === suggestion.invoiceId}
                  >
                    Spárovat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Zavřít
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
