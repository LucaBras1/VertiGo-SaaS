'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Loader2,
  Brain,
  Target,
  Calendar,
  Users,
  RefreshCw,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface RevenueForecast {
  period: {
    year: number
    month: number
    label: string
  }
  predictedRevenue: number
  lowerBound: number
  upperBound: number
  confidence: number
  trend: 'growing' | 'stable' | 'declining'
  changePercent: number
}

interface GrowthMetrics {
  yearOverYearGrowth: number
  monthOverMonthGrowth: number
  cagr: number
  trendCoefficient: number
}

interface TurnoverPrediction {
  currentTurnover: number
  predictedYearEnd: number
  willExceedLimit: boolean
  limitAmount: number
  exceedMonth: number | null
  monthlyPredictions: Array<{
    month: number
    predicted: number
    cumulative: number
  }>
}

interface RiskyCustomer {
  customerId: string
  prediction: {
    riskScore: number
    recommendation: string
    customerStats: {
      totalInvoices: number
      unpaid: number
      outstandingAmount: number
    }
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AIInsightsPanel() {
  const [loading, setLoading] = useState(true)
  const [forecasts, setForecasts] = useState<RevenueForecast[]>([])
  const [growth, setGrowth] = useState<GrowthMetrics | null>(null)
  const [turnover, setTurnover] = useState<TurnoverPrediction | null>(null)
  const [riskyCustomers, setRiskyCustomers] = useState<RiskyCustomer[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Načíst data paralelně
      const [forecastRes, riskyRes] = await Promise.all([
        fetch('/api/admin/invoicing/ai/forecast?type=all&months=6'),
        fetch('/api/admin/invoicing/ai/predict-payment?listRisky=true&minRisk=50'),
      ])

      if (!forecastRes.ok) throw new Error('Failed to load forecasts')

      const forecastData = await forecastRes.json()
      setForecasts(forecastData.forecasts || [])
      setGrowth(forecastData.growth || null)
      setTurnover(forecastData.turnover || null)

      if (riskyRes.ok) {
        const riskyData = await riskyRes.json()
        setRiskyCustomers(riskyData.customers?.slice(0, 5) || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${(value * 100).toFixed(1)}%`
  }

  const getTrendIcon = (trend: 'growing' | 'stable' | 'declining') => {
    switch (trend) {
      case 'growing':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'REQUIRE_ADVANCE':
      case 'CASH_ONLY':
        return 'text-red-600 bg-red-50 dark:bg-red-900/30'
      case 'SHORTEN_DUE':
      case 'MONITOR':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
      case 'EXTEND_DUE':
        return 'text-green-600 bg-green-50 dark:bg-green-900/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800'
    }
  }

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case 'REQUIRE_ADVANCE':
        return 'Vyžadovat zálohu'
      case 'CASH_ONLY':
        return 'Pouze hotovost'
      case 'SHORTEN_DUE':
        return 'Zkrátit splatnost'
      case 'MONITOR':
        return 'Sledovat'
      case 'EXTEND_DUE':
        return 'Prodloužit splatnost'
      default:
        return 'Standardní'
    }
  }

  const MONTHS_CZ = [
    'Led',
    'Úno',
    'Bře',
    'Dub',
    'Kvě',
    'Čer',
    'Čec',
    'Srp',
    'Zář',
    'Říj',
    'Lis',
    'Pro',
  ]

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">
            Načítám AI analýzu...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={loadData}
            className="ml-4 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Insights
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Predikce a doporučení na základě vašich dat
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Growth Metrics */}
      {growth && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Meziroční růst</span>
            </div>
            <p
              className={`text-xl font-bold ${
                growth.yearOverYearGrowth >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {formatPercent(growth.yearOverYearGrowth)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Měsíční růst</span>
            </div>
            <p
              className={`text-xl font-bold ${
                growth.monthOverMonthGrowth >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {formatPercent(growth.monthOverMonthGrowth)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">CAGR</span>
            </div>
            <p
              className={`text-xl font-bold ${
                growth.cagr >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercent(growth.cagr)}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Trend</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {growth.trendCoefficient > 1000
                ? '++'
                : growth.trendCoefficient > 0
                ? '+'
                : growth.trendCoefficient < -1000
                ? '--'
                : '-'}
            </p>
          </div>
        </div>
      )}

      {/* VAT Limit Warning */}
      {turnover && (
        <div
          className={`rounded-xl border p-4 ${
            turnover.willExceedLimit
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-lg ${
                turnover.willExceedLimit
                  ? 'bg-red-100 dark:bg-red-900/50'
                  : 'bg-green-100 dark:bg-green-900/50'
              }`}
            >
              <DollarSign
                className={`h-5 w-5 ${
                  turnover.willExceedLimit ? 'text-red-600' : 'text-green-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`font-semibold ${
                  turnover.willExceedLimit
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-green-900 dark:text-green-100'
                }`}
              >
                Sledování obratu pro DPH
              </h3>
              <p
                className={`text-sm mt-1 ${
                  turnover.willExceedLimit
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-green-700 dark:text-green-300'
                }`}
              >
                Aktuální obrat:{' '}
                <strong>{formatCurrency(turnover.currentTurnover)}</strong> /{' '}
                {formatCurrency(turnover.limitAmount)}
                {' ('}
                {Math.round(
                  (turnover.currentTurnover / turnover.limitAmount) * 100
                )}
                %)
              </p>
              {turnover.willExceedLimit && turnover.exceedMonth && (
                <p className="text-sm mt-2 text-red-700 dark:text-red-300">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Predikce překročení limitu v{' '}
                  <strong>{MONTHS_CZ[turnover.exceedMonth - 1]}</strong>!
                </p>
              )}
              <div className="mt-3">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      turnover.willExceedLimit ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (turnover.currentTurnover / turnover.limitAmount) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Forecast */}
      {forecasts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Predikce tržeb (6 měsíců)
          </h3>
          <div className="space-y-3">
            {forecasts.map((forecast) => (
              <div
                key={`${forecast.period.year}-${forecast.period.month}`}
                className="flex items-center gap-4"
              >
                <span className="w-24 text-sm text-gray-600 dark:text-gray-400">
                  {forecast.period.label}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                      {/* Range bar */}
                      <div
                        className="absolute top-0 bottom-0 bg-blue-100 dark:bg-blue-900/50"
                        style={{
                          left: `${
                            (forecast.lowerBound /
                              (forecasts[0]?.upperBound || 1)) *
                            100
                          }%`,
                          width: `${
                            ((forecast.upperBound - forecast.lowerBound) /
                              (forecasts[0]?.upperBound || 1)) *
                            100
                          }%`,
                        }}
                      />
                      {/* Predicted value marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-blue-600"
                        style={{
                          left: `${
                            (forecast.predictedRevenue /
                              (forecasts[0]?.upperBound || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                    {getTrendIcon(forecast.trend)}
                  </div>
                </div>
                <span className="w-28 text-right text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(forecast.predictedRevenue)}
                </span>
                <span
                  className={`w-16 text-right text-xs ${
                    forecast.changePercent >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {forecast.changePercent >= 0 ? '+' : ''}
                  {forecast.changePercent.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            * Predikce vychází z historických dat a sezónních vzorců
          </p>
        </div>
      )}

      {/* Risky Customers */}
      {riskyCustomers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Rizikoví zákazníci
            </h3>
          </div>
          <div className="space-y-3">
            {riskyCustomers.map((customer) => (
              <div
                key={customer.customerId}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Zákazník {customer.customerId.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {customer.prediction.customerStats.unpaid} neuhrazených /{' '}
                    {formatCurrency(
                      customer.prediction.customerStats.outstandingAmount
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      Riziko: {customer.prediction.riskScore}%
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getRecommendationColor(
                      customer.prediction.recommendation
                    )}`}
                  >
                    {getRecommendationLabel(customer.prediction.recommendation)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIInsightsPanel
