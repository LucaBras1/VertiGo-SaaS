'use client'

import { useState, useEffect } from 'react'
import { Loader2, FileBarChart, Calendar, BarChart3, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'
import { TaxSummaryCard } from '@/components/reports/TaxSummaryCard'
import { ProfitLossChart } from '@/components/reports/ProfitLossChart'

type ReportType = 'profit-loss' | 'tax'

interface TaxReportData {
  year: number
  income: {
    sessions: number
    invoices: number
    total: number
  }
  expenses: {
    total: number
    taxDeductible: number
    byCategory: Array<{
      name: string
      total: number
      taxDeductible: number
      count: number
    }>
    byMonth: Array<{
      month: number
      total: number
      taxDeductible: number
      count: number
    }>
  }
  taxCalculation: {
    grossIncome: number
    totalExpenses: number
    taxDeductibleExpenses: number
    profit: number
    actualExpensesMethod: {
      taxBase: number
      incomeTax: number
      effectiveTaxRate: number
    }
    flatRateMethod: {
      flatRatePercentage: number
      flatRateExpenses: number
      taxBase: number
      incomeTax: number
      effectiveTaxRate: number
    }
    recommendedMethod: 'actual' | 'flat_rate'
    taxSavings: number
    socialInsurance: {
      assessmentBase: number
      amount: number
      monthlyAdvance: number
    }
    healthInsurance: {
      assessmentBase: number
      amount: number
      monthlyAdvance: number
    }
    vat: {
      collected: number
      paid: number
      liability: number
      isVatPayer: boolean
    }
    totalTaxLiability: number
    netIncome: number
  }
}

interface ProfitLossData {
  period: {
    year: number
    month?: number
    quarter?: number
  }
  profitLoss: {
    revenue: {
      sessions: number
      classes: number
      packages: number
      other: number
      total: number
    }
    expenses: {
      byCategory: Array<{
        categoryName: string
        amount: number
      }>
      total: number
    }
    grossProfit: number
    taxes: {
      estimatedIncomeTax: number
      estimatedVat: number
      estimatedSocialInsurance: number
      estimatedHealthInsurance: number
      total: number
    }
    netProfit: number
    profitMargin: number
  }
  revenueBreakdown: Array<{
    name: string
    value: number
    color: string
  }>
  monthlyTrend: Array<{
    month: number
    revenue: number
    expenses: number
    profit: number
  }>
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('profit-loss')
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState<number | undefined>(undefined)
  const [quarter, setQuarter] = useState<number | undefined>(undefined)
  const [isVatPayer, setIsVatPayer] = useState(false)
  const [loading, setLoading] = useState(true)

  const [taxData, setTaxData] = useState<TaxReportData | null>(null)
  const [profitLossData, setProfitLossData] = useState<ProfitLossData | null>(null)

  // Fetch report data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (reportType === 'tax') {
          const params = new URLSearchParams({
            year: year.toString(),
            isVatPayer: isVatPayer.toString(),
          })
          const response = await fetch(`/api/reports/tax?${params}`)
          if (!response.ok) throw new Error('Failed to fetch tax report')
          const data = await response.json()
          setTaxData(data)
        } else {
          const params = new URLSearchParams({
            year: year.toString(),
            isVatPayer: isVatPayer.toString(),
            ...(month && { month: month.toString() }),
            ...(quarter && { quarter: quarter.toString() }),
          })
          const response = await fetch(`/api/reports/profit-loss?${params}`)
          if (!response.ok) throw new Error('Failed to fetch profit/loss report')
          const data = await response.json()
          setProfitLossData(data)
        }
      } catch (error) {
        console.error('Error fetching report:', error)
        toast.error('Chyba při načítání reportu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [reportType, year, month, quarter, isVatPayer])

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = [
    { value: undefined, label: 'Celý rok' },
    { value: 1, label: 'Leden' },
    { value: 2, label: 'Únor' },
    { value: 3, label: 'Březen' },
    { value: 4, label: 'Duben' },
    { value: 5, label: 'Květen' },
    { value: 6, label: 'Červen' },
    { value: 7, label: 'Červenec' },
    { value: 8, label: 'Srpen' },
    { value: 9, label: 'Září' },
    { value: 10, label: 'Říjen' },
    { value: 11, label: 'Listopad' },
    { value: 12, label: 'Prosinec' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Reporty</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Finanční přehledy a daňové kalkulace pro vaše podnikání
        </p>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-1 inline-flex">
        <button
          onClick={() => setReportType('profit-loss')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            reportType === 'profit-loss'
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Zisk a ztráta
        </button>
        <button
          onClick={() => setReportType('tax')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            reportType === 'tax'
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Calculator className="h-4 w-4" />
          Daňový přehled
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-4 border border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-4">
          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month/Quarter Selector (only for profit-loss) */}
          {reportType === 'profit-loss' && (
            <>
              <select
                value={month ?? ''}
                onChange={(e) => {
                  setMonth(e.target.value ? parseInt(e.target.value) : undefined)
                  setQuarter(undefined)
                }}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {months.map((m) => (
                  <option key={m.label} value={m.value ?? ''}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={quarter ?? ''}
                onChange={(e) => {
                  setQuarter(e.target.value ? parseInt(e.target.value) : undefined)
                  setMonth(undefined)
                }}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Žádné čtvrtletí</option>
                <option value="1">Q1 (Led-Bře)</option>
                <option value="2">Q2 (Dub-Čvn)</option>
                <option value="3">Q3 (Čvc-Zář)</option>
                <option value="4">Q4 (Říj-Pro)</option>
              </select>
            </>
          )}

          {/* VAT Payer Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVatPayer}
                onChange={(e) => setIsVatPayer(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-neutral-300 dark:border-neutral-600 rounded"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Plátce DPH</span>
            </label>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">Generuji report...</p>
          </div>
        </div>
      ) : reportType === 'tax' && taxData ? (
        <TaxSummaryCard
          year={year}
          taxCalculation={taxData.taxCalculation}
          income={taxData.income}
        />
      ) : reportType === 'profit-loss' && profitLossData ? (
        <ProfitLossChart
          monthlyTrend={profitLossData.monthlyTrend}
          revenueBreakdown={profitLossData.revenueBreakdown}
          expensesByCategory={profitLossData.profitLoss.expenses.byCategory}
          profitLoss={profitLossData.profitLoss}
        />
      ) : (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-12 border border-neutral-100 dark:border-neutral-800 text-center">
          <FileBarChart className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">
            Žádná data pro zobrazení
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            Pro vybranou periodu nejsou dostupná žádná finanční data.
          </p>
        </div>
      )}
    </div>
  )
}
