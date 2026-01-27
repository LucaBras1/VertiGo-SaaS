/**
 * Tax Calculator for Czech tax system
 * Supports calculation of income tax, DPH (VAT), and expense deductions
 */

// Czech VAT rates
export const VAT_RATES = {
  STANDARD: 21, // 21% standard rate
  REDUCED_1: 15, // 15% first reduced rate
  REDUCED_2: 10, // 10% second reduced rate (food, medicine, etc.)
} as const

// Czech income tax rates for self-employed (OSVČ)
export const INCOME_TAX_RATE = 15 // 15% flat rate for income up to threshold
export const INCOME_TAX_RATE_HIGH = 23 // 23% for income above threshold
export const INCOME_TAX_THRESHOLD = 1935552 // CZK (36x average wage 2024)

// Social and health insurance rates for OSVČ
export const SOCIAL_INSURANCE_RATE = 29.2 // % of assessment base
export const HEALTH_INSURANCE_RATE = 13.5 // % of assessment base
export const ASSESSMENT_BASE_PERCENTAGE = 50 // % of profit for assessment base

// Flat-rate expense deductions (paušální výdaje)
export const FLAT_RATE_EXPENSES = {
  PROFESSIONAL_SERVICES: 40, // % for professional services (trainers, consultants)
  CRAFTS: 60, // % for crafts
  AGRICULTURE: 80, // % for agriculture
  OTHER: 60, // % for other activities
}

export interface TaxPeriod {
  year: number
  month?: number // If undefined, calculate for full year
  quarter?: number // 1-4 for quarterly reports
}

export interface IncomeData {
  grossIncome: number // Celkové příjmy
  expenses: number // Skutečné výdaje
  taxDeductibleExpenses: number // Daňově uznatelné výdaje
  vatCollected: number // DPH odvedená
  vatPaid: number // DPH zaplacená (na vstupu)
}

export interface TaxCalculationResult {
  // Income summary
  grossIncome: number
  totalExpenses: number
  taxDeductibleExpenses: number
  profit: number // Zisk

  // Tax calculation options
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

  // Insurance
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

  // VAT
  vat: {
    collected: number
    paid: number
    liability: number // Daňová povinnost
    isVatPayer: boolean
  }

  // Totals
  totalTaxLiability: number
  netIncome: number
}

export interface ExpenseSummary {
  totalExpenses: number
  taxDeductibleExpenses: number
  byCategory: {
    categoryId: string
    categoryName: string
    total: number
    taxDeductible: number
    count: number
  }[]
  byMonth: {
    month: number
    year: number
    total: number
    taxDeductible: number
  }[]
}

export interface ProfitLossReport {
  period: TaxPeriod
  revenue: {
    sessions: number
    classes: number
    packages: number
    other: number
    total: number
  }
  expenses: {
    byCategory: {
      categoryName: string
      amount: number
    }[]
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
  profitMargin: number // percentage
}

/**
 * Calculate income tax using actual expenses method
 */
export function calculateIncomeTaxActual(profit: number): number {
  if (profit <= 0) return 0

  if (profit <= INCOME_TAX_THRESHOLD) {
    return Math.round(profit * (INCOME_TAX_RATE / 100))
  }

  // Progressive taxation
  const baseTax = INCOME_TAX_THRESHOLD * (INCOME_TAX_RATE / 100)
  const additionalTax = (profit - INCOME_TAX_THRESHOLD) * (INCOME_TAX_RATE_HIGH / 100)
  return Math.round(baseTax + additionalTax)
}

/**
 * Calculate income tax using flat-rate expenses method
 */
export function calculateIncomeTaxFlatRate(
  grossIncome: number,
  flatRatePercentage: number = FLAT_RATE_EXPENSES.PROFESSIONAL_SERVICES
): { taxBase: number; tax: number; flatRateExpenses: number } {
  const flatRateExpenses = Math.round(grossIncome * (flatRatePercentage / 100))
  const taxBase = grossIncome - flatRateExpenses

  return {
    flatRateExpenses,
    taxBase,
    tax: calculateIncomeTaxActual(taxBase),
  }
}

/**
 * Calculate social insurance for OSVČ
 */
export function calculateSocialInsurance(profit: number): {
  assessmentBase: number
  annualAmount: number
  monthlyAdvance: number
} {
  if (profit <= 0) {
    return {
      assessmentBase: 0,
      annualAmount: 0,
      monthlyAdvance: 0,
    }
  }

  const assessmentBase = Math.round(profit * (ASSESSMENT_BASE_PERCENTAGE / 100))
  const annualAmount = Math.round(assessmentBase * (SOCIAL_INSURANCE_RATE / 100))
  const monthlyAdvance = Math.round(annualAmount / 12)

  return {
    assessmentBase,
    annualAmount,
    monthlyAdvance,
  }
}

/**
 * Calculate health insurance for OSVČ
 */
export function calculateHealthInsurance(profit: number): {
  assessmentBase: number
  annualAmount: number
  monthlyAdvance: number
} {
  if (profit <= 0) {
    return {
      assessmentBase: 0,
      annualAmount: 0,
      monthlyAdvance: 0,
    }
  }

  const assessmentBase = Math.round(profit * (ASSESSMENT_BASE_PERCENTAGE / 100))
  const annualAmount = Math.round(assessmentBase * (HEALTH_INSURANCE_RATE / 100))
  const monthlyAdvance = Math.round(annualAmount / 12)

  return {
    assessmentBase,
    annualAmount,
    monthlyAdvance,
  }
}

/**
 * Calculate VAT liability
 */
export function calculateVatLiability(
  vatCollected: number,
  vatPaid: number
): {
  liability: number
  isRefund: boolean
} {
  const liability = vatCollected - vatPaid
  return {
    liability,
    isRefund: liability < 0,
  }
}

/**
 * Full tax calculation with comparison of methods
 */
export function calculateTaxes(
  data: IncomeData,
  isVatPayer: boolean = false,
  flatRatePercentage: number = FLAT_RATE_EXPENSES.PROFESSIONAL_SERVICES
): TaxCalculationResult {
  const profit = data.grossIncome - data.taxDeductibleExpenses

  // Actual expenses method
  const actualTax = calculateIncomeTaxActual(profit)
  const actualEffectiveRate = data.grossIncome > 0 ? (actualTax / data.grossIncome) * 100 : 0

  // Flat rate method
  const flatRate = calculateIncomeTaxFlatRate(data.grossIncome, flatRatePercentage)
  const flatRateEffectiveRate =
    data.grossIncome > 0 ? (flatRate.tax / data.grossIncome) * 100 : 0

  // Determine recommended method
  const recommendedMethod = flatRate.tax < actualTax ? 'flat_rate' : 'actual'
  const taxSavings = Math.abs(actualTax - flatRate.tax)

  // Insurance calculations (based on recommended method's profit)
  const profitForInsurance = recommendedMethod === 'flat_rate' ? flatRate.taxBase : profit
  const socialInsurance = calculateSocialInsurance(profitForInsurance)
  const healthInsurance = calculateHealthInsurance(profitForInsurance)

  // VAT
  const vatLiability = calculateVatLiability(data.vatCollected, data.vatPaid)

  // Selected tax amount
  const selectedTax = recommendedMethod === 'flat_rate' ? flatRate.tax : actualTax

  // Total tax liability
  const totalTaxLiability =
    selectedTax +
    socialInsurance.annualAmount +
    healthInsurance.annualAmount +
    (isVatPayer ? Math.max(0, vatLiability.liability) : 0)

  // Net income
  const netIncome = data.grossIncome - data.expenses - totalTaxLiability

  return {
    grossIncome: data.grossIncome,
    totalExpenses: data.expenses,
    taxDeductibleExpenses: data.taxDeductibleExpenses,
    profit,

    actualExpensesMethod: {
      taxBase: profit,
      incomeTax: actualTax,
      effectiveTaxRate: actualEffectiveRate,
    },

    flatRateMethod: {
      flatRatePercentage,
      flatRateExpenses: flatRate.flatRateExpenses,
      taxBase: flatRate.taxBase,
      incomeTax: flatRate.tax,
      effectiveTaxRate: flatRateEffectiveRate,
    },

    recommendedMethod,
    taxSavings,

    socialInsurance: {
      assessmentBase: socialInsurance.assessmentBase,
      amount: socialInsurance.annualAmount,
      monthlyAdvance: socialInsurance.monthlyAdvance,
    },

    healthInsurance: {
      assessmentBase: healthInsurance.assessmentBase,
      amount: healthInsurance.annualAmount,
      monthlyAdvance: healthInsurance.monthlyAdvance,
    },

    vat: {
      collected: data.vatCollected,
      paid: data.vatPaid,
      liability: vatLiability.liability,
      isVatPayer,
    },

    totalTaxLiability,
    netIncome,
  }
}

/**
 * Calculate profit/loss for a period
 */
export function calculateProfitLoss(
  revenue: ProfitLossReport['revenue'],
  expenses: ProfitLossReport['expenses'],
  period: TaxPeriod,
  isVatPayer: boolean = false
): ProfitLossReport {
  const grossProfit = revenue.total - expenses.total

  // Estimate taxes based on annual projection
  const monthsInPeriod = period.month ? 1 : period.quarter ? 3 : 12
  const annualizedProfit = grossProfit * (12 / monthsInPeriod)

  const estimatedIncomeTax = Math.round(
    calculateIncomeTaxActual(annualizedProfit) * (monthsInPeriod / 12)
  )
  const socialIns = calculateSocialInsurance(annualizedProfit)
  const healthIns = calculateHealthInsurance(annualizedProfit)

  const estimatedSocialInsurance = Math.round(socialIns.annualAmount * (monthsInPeriod / 12))
  const estimatedHealthInsurance = Math.round(healthIns.annualAmount * (monthsInPeriod / 12))

  // Estimate VAT (assuming 21% on all revenue)
  const estimatedVat = isVatPayer ? Math.round(revenue.total * (VAT_RATES.STANDARD / 100)) : 0

  const totalTaxes =
    estimatedIncomeTax + estimatedVat + estimatedSocialInsurance + estimatedHealthInsurance

  const netProfit = grossProfit - totalTaxes
  const profitMargin = revenue.total > 0 ? (netProfit / revenue.total) * 100 : 0

  return {
    period,
    revenue,
    expenses,
    grossProfit,
    taxes: {
      estimatedIncomeTax,
      estimatedVat,
      estimatedSocialInsurance,
      estimatedHealthInsurance,
      total: totalTaxes,
    },
    netProfit,
    profitMargin,
  }
}

/**
 * Format currency for Czech locale
 */
export function formatCurrencyCZ(amount: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get month name in Czech
 */
export function getMonthNameCZ(month: number): string {
  const months = [
    'Leden',
    'Únor',
    'Březen',
    'Duben',
    'Květen',
    'Červen',
    'Červenec',
    'Srpen',
    'Září',
    'Říjen',
    'Listopad',
    'Prosinec',
  ]
  return months[month - 1] || ''
}

/**
 * Get quarter name in Czech
 */
export function getQuarterNameCZ(quarter: number): string {
  const quarters = ['Q1 (Leden-Březen)', 'Q2 (Duben-Červen)', 'Q3 (Červenec-Září)', 'Q4 (Říjen-Prosinec)']
  return quarters[quarter - 1] || ''
}
