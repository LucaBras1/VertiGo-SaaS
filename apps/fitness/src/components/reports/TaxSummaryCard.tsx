'use client'

import { TrendingUp, TrendingDown, Calculator, Lightbulb, Receipt, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TaxCalculation {
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

interface TaxSummaryCardProps {
  year: number
  taxCalculation: TaxCalculation
  income: {
    sessions: number
    invoices: number
    total: number
  }
}

export function TaxSummaryCard({ year, taxCalculation, income }: TaxSummaryCardProps) {
  const {
    recommendedMethod,
    taxSavings,
    actualExpensesMethod,
    flatRateMethod,
    socialInsurance,
    healthInsurance,
    totalTaxLiability,
    netIncome,
    grossIncome,
    totalExpenses,
  } = taxCalculation

  const profitMargin = grossIncome > 0 ? ((netIncome / grossIncome) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hrubé příjmy</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(grossIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Celkové výdaje</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Calculator className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Daňová povinnost</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalTaxLiability)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Čistý příjem</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(netIncome)}
              </p>
              <p className="text-xs text-gray-500">{profitMargin}% marže</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Method Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-600" />
            Porovnání metod zdanění
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Rok {year} - Doporučujeme metodu s nižší daňovou povinností
          </p>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Actual Expenses Method */}
          <div
            className={`p-6 ${
              recommendedMethod === 'actual' ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Skutečné výdaje</h4>
              {recommendedMethod === 'actual' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Doporučeno
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daňový základ</span>
                <span className="font-medium">
                  {formatCurrency(actualExpensesMethod.taxBase)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daň z příjmu</span>
                <span className="font-medium">
                  {formatCurrency(actualExpensesMethod.incomeTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Efektivní sazba</span>
                <span className="font-medium">
                  {actualExpensesMethod.effectiveTaxRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Flat Rate Method */}
          <div
            className={`p-6 ${
              recommendedMethod === 'flat_rate' ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                Paušální výdaje ({flatRateMethod.flatRatePercentage}%)
              </h4>
              {recommendedMethod === 'flat_rate' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Doporučeno
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paušální výdaje</span>
                <span className="font-medium">
                  {formatCurrency(flatRateMethod.flatRateExpenses)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daňový základ</span>
                <span className="font-medium">
                  {formatCurrency(flatRateMethod.taxBase)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daň z příjmu</span>
                <span className="font-medium">
                  {formatCurrency(flatRateMethod.incomeTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Efektivní sazba</span>
                <span className="font-medium">
                  {flatRateMethod.effectiveTaxRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Tip */}
        {taxSavings > 0 && (
          <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Použitím {recommendedMethod === 'flat_rate' ? 'paušálních výdajů' : 'skutečných výdajů'} můžete ušetřit {formatCurrency(taxSavings)} ročně na daních.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Insurance Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Social Insurance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-blue-600" />
            Sociální pojištění
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vyměřovací základ</span>
              <span className="font-medium">
                {formatCurrency(socialInsurance.assessmentBase)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Roční pojistné</span>
              <span className="font-medium">
                {formatCurrency(socialInsurance.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Měsíční záloha</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(socialInsurance.monthlyAdvance)}
              </span>
            </div>
          </div>
        </div>

        {/* Health Insurance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-emerald-600" />
            Zdravotní pojištění
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vyměřovací základ</span>
              <span className="font-medium">
                {formatCurrency(healthInsurance.assessmentBase)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Roční pojistné</span>
              <span className="font-medium">
                {formatCurrency(healthInsurance.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Měsíční záloha</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(healthInsurance.monthlyAdvance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-4">Přehled příjmů</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Tréninky</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(income.sessions)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Faktury</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(income.invoices)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
