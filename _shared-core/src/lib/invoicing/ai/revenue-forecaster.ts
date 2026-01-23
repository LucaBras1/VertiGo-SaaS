/**
 * Revenue Forecaster
 *
 * AI modul pro predikci tržeb a cash flow.
 * Používá historická data a statistické metody pro forecasting.
 */

import prisma from '@/lib/prisma'

// ============================================================================
// TYPES
// ============================================================================

export interface RevenueForecast {
  /** Období predikce */
  period: ForecastPeriod
  /** Predikované tržby */
  predictedRevenue: number
  /** Spodní hranice intervalu spolehlivosti */
  lowerBound: number
  /** Horní hranice intervalu spolehlivosti */
  upperBound: number
  /** Úroveň spolehlivosti (0-1) */
  confidence: number
  /** Trend */
  trend: 'growing' | 'stable' | 'declining'
  /** Procentuální změna oproti předchozímu období */
  changePercent: number
}

export interface ForecastPeriod {
  year: number
  month: number
  label: string
}

export interface CashFlowPrediction {
  /** Období */
  period: ForecastPeriod
  /** Očekávané příjmy */
  expectedIncome: number
  /** Očekávané výdaje */
  expectedExpenses: number
  /** Čistý cash flow */
  netCashFlow: number
  /** Kumulativní balance */
  cumulativeBalance: number
  /** Neuhrazené faktury očekávané k platbě */
  expectedPayments: ExpectedPayment[]
}

export interface ExpectedPayment {
  invoiceId: string
  invoiceNumber: string
  amount: number
  dueDate: Date
  expectedPaymentDate: Date
  probability: number
}

export interface SeasonalityAnalysis {
  /** Měsíční sezónní indexy (1 = průměr) */
  monthlyIndexes: Record<number, number>
  /** Nejvýkonnější měsíce */
  peakMonths: number[]
  /** Nejslabší měsíce */
  lowMonths: number[]
  /** Týdenní vzorce */
  weekdayPatterns: Record<number, number>
}

export interface GrowthMetrics {
  /** Meziroční růst */
  yearOverYearGrowth: number
  /** Měsíční průměrný růst */
  monthOverMonthGrowth: number
  /** Compound Annual Growth Rate */
  cagr: number
  /** Trend koeficient */
  trendCoefficient: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTHS_CZ = [
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

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Predikuje tržby na příštích N měsíců
 */
export async function forecastRevenue(
  monthsAhead: number = 6
): Promise<RevenueForecast[]> {
  // Získat historická data (posledních 24 měsíců)
  const historicalData = await getMonthlyRevenue(24)

  if (historicalData.length < 3) {
    // Nedostatek dat pro predikci
    return generateDefaultForecast(monthsAhead)
  }

  // Analyzovat sezónnost
  const seasonality = analyzeSeasonality(historicalData)

  // Vypočítat růstové metriky
  const growth = calculateGrowthMetrics(historicalData)

  // Generovat predikce
  const forecasts: RevenueForecast[] = []
  const today = new Date()

  for (let i = 1; i <= monthsAhead; i++) {
    const forecastDate = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const month = forecastDate.getMonth() + 1
    const year = forecastDate.getFullYear()

    // Základní predikce z trendu
    const lastValue = historicalData[historicalData.length - 1]?.revenue || 0
    const avgValue =
      historicalData.reduce((sum, d) => sum + d.revenue, 0) / historicalData.length

    // Aplikovat trend
    const trendAdjustment = 1 + growth.monthOverMonthGrowth * i

    // Aplikovat sezónnost
    const seasonalIndex = seasonality.monthlyIndexes[month] || 1

    // Výsledná predikce
    const baselinePrediction = avgValue * trendAdjustment * seasonalIndex

    // Váženě kombinovat s posledním obdobím
    const predictedRevenue = Math.round(baselinePrediction * 0.7 + lastValue * 0.3)

    // Interval spolehlivosti (rozšiřuje se do budoucnosti)
    const uncertainty = 0.15 + i * 0.03 // Zvyšující se nejistota
    const lowerBound = Math.round(predictedRevenue * (1 - uncertainty))
    const upperBound = Math.round(predictedRevenue * (1 + uncertainty))

    // Confidence klesá s časem
    const confidence = Math.max(0.5, 0.95 - i * 0.07)

    // Určit trend
    let trend: 'growing' | 'stable' | 'declining' = 'stable'
    if (growth.monthOverMonthGrowth > 0.02) trend = 'growing'
    else if (growth.monthOverMonthGrowth < -0.02) trend = 'declining'

    // Změna oproti stejnému období minulého roku
    const sameMonthLastYear = historicalData.find(
      (d) => d.month === month && d.year === year - 1
    )
    const changePercent = sameMonthLastYear
      ? ((predictedRevenue - sameMonthLastYear.revenue) / sameMonthLastYear.revenue) *
        100
      : growth.yearOverYearGrowth * 100

    forecasts.push({
      period: {
        year,
        month,
        label: `${MONTHS_CZ[month - 1]} ${year}`,
      },
      predictedRevenue,
      lowerBound,
      upperBound,
      confidence,
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
    })
  }

  return forecasts
}

/**
 * Predikuje cash flow
 */
export async function forecastCashFlow(
  monthsAhead: number = 3,
  currentBalance: number = 0
): Promise<CashFlowPrediction[]> {
  const predictions: CashFlowPrediction[] = []
  const today = new Date()
  let cumulativeBalance = currentBalance

  for (let i = 0; i <= monthsAhead; i++) {
    const periodStart = new Date(today.getFullYear(), today.getMonth() + i, 1)
    const periodEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0)

    // Očekávané příjmy z faktur
    const expectedPayments = await getExpectedPayments(periodStart, periodEnd)
    const expectedIncome = expectedPayments.reduce(
      (sum, p) => sum + p.amount * p.probability,
      0
    )

    // Očekávané výdaje
    const expectedExpenses = await getExpectedExpenses(periodStart, periodEnd)

    // Čistý cash flow
    const netCashFlow = expectedIncome - expectedExpenses

    // Kumulativní balance
    cumulativeBalance += netCashFlow

    predictions.push({
      period: {
        year: periodStart.getFullYear(),
        month: periodStart.getMonth() + 1,
        label: `${MONTHS_CZ[periodStart.getMonth()]} ${periodStart.getFullYear()}`,
      },
      expectedIncome: Math.round(expectedIncome),
      expectedExpenses: Math.round(expectedExpenses),
      netCashFlow: Math.round(netCashFlow),
      cumulativeBalance: Math.round(cumulativeBalance),
      expectedPayments,
    })
  }

  return predictions
}

/**
 * Analyzuje sezónnost v datech
 */
export async function getSeasonalityAnalysis(): Promise<SeasonalityAnalysis> {
  const historicalData = await getMonthlyRevenue(36) // 3 roky
  return analyzeSeasonality(historicalData)
}

/**
 * Získá růstové metriky
 */
export async function getGrowthMetrics(): Promise<GrowthMetrics> {
  const historicalData = await getMonthlyRevenue(24)
  return calculateGrowthMetrics(historicalData)
}

/**
 * Predikuje roční obrat (pro sledování VAT limitu)
 */
export async function predictAnnualTurnover(year: number): Promise<{
  currentTurnover: number
  predictedYearEnd: number
  monthlyPredictions: { month: number; predicted: number; cumulative: number }[]
  willExceedLimit: boolean
  limitAmount: number
  exceedMonth: number | null
}> {
  const limitAmount = 2000000 // 2M CZK VAT limit

  // Aktuální obrat za rok
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const ytdRevenue = await getYearToDateRevenue(year)

  // Predikce zbývajících měsíců
  const monthlyPredictions: {
    month: number
    predicted: number
    cumulative: number
  }[] = []
  let cumulative = ytdRevenue

  if (year === currentYear) {
    // Predikovat zbývající měsíce
    const forecasts = await forecastRevenue(12 - currentMonth)

    for (let month = 1; month <= 12; month++) {
      if (month < currentMonth) {
        // Historická data
        const monthRevenue = await getMonthRevenue(year, month)
        monthlyPredictions.push({
          month,
          predicted: monthRevenue,
          cumulative: monthlyPredictions[month - 2]?.cumulative + monthRevenue || monthRevenue,
        })
      } else if (month === currentMonth) {
        // Aktuální měsíc - částečná data
        const monthRevenue = await getMonthRevenue(year, month)
        cumulative = (monthlyPredictions[month - 2]?.cumulative || 0) + monthRevenue
        monthlyPredictions.push({
          month,
          predicted: monthRevenue,
          cumulative,
        })
      } else {
        // Budoucí měsíce - predikce
        const forecast = forecasts[month - currentMonth - 1]
        const predicted = forecast?.predictedRevenue || 0
        cumulative += predicted
        monthlyPredictions.push({
          month,
          predicted,
          cumulative,
        })
      }
    }
  } else if (year > currentYear) {
    // Budoucí rok - plná predikce
    const forecasts = await forecastRevenue(12)

    for (let month = 1; month <= 12; month++) {
      const predicted = forecasts[month - 1]?.predictedRevenue || 0
      cumulative += predicted
      monthlyPredictions.push({
        month,
        predicted,
        cumulative,
      })
    }
  } else {
    // Minulý rok - historická data
    for (let month = 1; month <= 12; month++) {
      const monthRevenue = await getMonthRevenue(year, month)
      cumulative += monthRevenue
      monthlyPredictions.push({
        month,
        predicted: monthRevenue,
        cumulative,
      })
    }
  }

  const predictedYearEnd = monthlyPredictions[11]?.cumulative || 0
  const willExceedLimit = predictedYearEnd > limitAmount

  // Najít měsíc překročení
  let exceedMonth: number | null = null
  for (const mp of monthlyPredictions) {
    if (mp.cumulative > limitAmount) {
      exceedMonth = mp.month
      break
    }
  }

  return {
    currentTurnover: ytdRevenue,
    predictedYearEnd,
    monthlyPredictions,
    willExceedLimit,
    limitAmount,
    exceedMonth,
  }
}

// ============================================================================
// DATA FETCHING
// ============================================================================

interface MonthlyData {
  year: number
  month: number
  revenue: number
}

async function getMonthlyRevenue(months: number): Promise<MonthlyData[]> {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['PAID', 'PARTIALLY_PAID', 'SENT', 'OVERDUE'] },
      issueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      issueDate: true,
      totalAmount: true,
      paidAmount: true,
      status: true,
    },
  })

  // Agregovat po měsících
  const monthlyMap = new Map<string, number>()

  for (const inv of invoices) {
    const date = new Date(inv.issueDate)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`

    const amount = inv.status === 'PAID' ? inv.totalAmount : (inv.paidAmount || 0)
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + amount)
  }

  // Převést na pole
  const result: MonthlyData[] = []

  for (let i = months; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const key = `${year}-${month}`

    result.push({
      year,
      month,
      revenue: monthlyMap.get(key) || 0,
    })
  }

  return result
}

async function getYearToDateRevenue(year: number): Promise<number> {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31, 23, 59, 59)

  const result = await prisma.invoice.aggregate({
    where: {
      status: { in: ['PAID', 'PARTIALLY_PAID'] },
      issueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      paidAmount: true,
    },
  })

  return result._sum.paidAmount || 0
}

async function getMonthRevenue(year: number, month: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const result = await prisma.invoice.aggregate({
    where: {
      status: { in: ['PAID', 'PARTIALLY_PAID'] },
      issueDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      paidAmount: true,
    },
  })

  return result._sum.paidAmount || 0
}

async function getExpectedPayments(
  periodStart: Date,
  periodEnd: Date
): Promise<ExpectedPayment[]> {
  // Získat neuhrazené faktury se splatností v období
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] },
      dueDate: {
        lte: periodEnd,
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      totalAmount: true,
      paidAmount: true,
      dueDate: true,
      reminderLevel: true,
      customer: {
        select: {
          avgPaymentDays: true,
        },
      },
    },
  })

  return invoices.map((inv) => {
    const remainingAmount = inv.totalAmount - (inv.paidAmount || 0)
    const avgPaymentDays = inv.customer?.avgPaymentDays || 14

    // Odhadovaný datum platby
    const dueDate = new Date(inv.dueDate)
    const expectedPaymentDate = new Date(dueDate)
    expectedPaymentDate.setDate(expectedPaymentDate.getDate() + avgPaymentDays)

    // Pravděpodobnost platby (klesá s upomínkami)
    let probability = 0.9
    if (inv.reminderLevel === 1) probability = 0.7
    else if (inv.reminderLevel === 2) probability = 0.5
    else if (inv.reminderLevel === 3) probability = 0.3

    // Pokud je platba očekávána v období
    if (expectedPaymentDate >= periodStart && expectedPaymentDate <= periodEnd) {
      return {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber || 'N/A',
        amount: remainingAmount,
        dueDate: inv.dueDate,
        expectedPaymentDate,
        probability,
      }
    }

    return {
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber || 'N/A',
      amount: 0,
      dueDate: inv.dueDate,
      expectedPaymentDate,
      probability: 0,
    }
  }).filter((p) => p.amount > 0)
}

async function getExpectedExpenses(
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  // Získat pravidelné náklady
  const expenses = await prisma.expense.aggregate({
    where: {
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    _sum: {
      amount: true,
    },
  })

  // Pokud máme historická data, použít průměr
  const avgExpenses = await prisma.expense.aggregate({
    where: {
      date: {
        gte: new Date(periodStart.getFullYear() - 1, periodStart.getMonth(), 1),
        lte: new Date(periodStart.getFullYear() - 1, periodStart.getMonth() + 1, 0),
      },
    },
    _sum: {
      amount: true,
    },
  })

  return expenses._sum.amount || avgExpenses._sum.amount || 0
}

// ============================================================================
// ANALYSIS HELPERS
// ============================================================================

function analyzeSeasonality(data: MonthlyData[]): SeasonalityAnalysis {
  // Vypočítat průměr pro každý měsíc
  const monthlyTotals: Record<number, number[]> = {}

  for (const d of data) {
    if (!monthlyTotals[d.month]) {
      monthlyTotals[d.month] = []
    }
    monthlyTotals[d.month].push(d.revenue)
  }

  // Celkový průměr
  const overallAvg = data.reduce((sum, d) => sum + d.revenue, 0) / data.length

  // Sezónní indexy
  const monthlyIndexes: Record<number, number> = {}

  for (let month = 1; month <= 12; month++) {
    const values = monthlyTotals[month] || []
    if (values.length > 0) {
      const monthAvg = values.reduce((a, b) => a + b, 0) / values.length
      monthlyIndexes[month] = overallAvg > 0 ? monthAvg / overallAvg : 1
    } else {
      monthlyIndexes[month] = 1
    }
  }

  // Najít peak a low měsíce
  const sortedMonths = Object.entries(monthlyIndexes).sort(
    ([, a], [, b]) => b - a
  )
  const peakMonths = sortedMonths.slice(0, 3).map(([m]) => parseInt(m))
  const lowMonths = sortedMonths.slice(-3).map(([m]) => parseInt(m))

  return {
    monthlyIndexes,
    peakMonths,
    lowMonths,
    weekdayPatterns: {}, // Zjednodušeno - nepočítáme týdenní vzorce
  }
}

function calculateGrowthMetrics(data: MonthlyData[]): GrowthMetrics {
  if (data.length < 2) {
    return {
      yearOverYearGrowth: 0,
      monthOverMonthGrowth: 0,
      cagr: 0,
      trendCoefficient: 0,
    }
  }

  // MoM growth (průměr)
  let momGrowthSum = 0
  let momCount = 0

  for (let i = 1; i < data.length; i++) {
    if (data[i - 1].revenue > 0) {
      const growth = (data[i].revenue - data[i - 1].revenue) / data[i - 1].revenue
      momGrowthSum += growth
      momCount++
    }
  }

  const monthOverMonthGrowth = momCount > 0 ? momGrowthSum / momCount : 0

  // YoY growth
  let yoyGrowthSum = 0
  let yoyCount = 0

  for (const d of data) {
    const sameMonthLastYear = data.find(
      (prev) => prev.month === d.month && prev.year === d.year - 1
    )
    if (sameMonthLastYear && sameMonthLastYear.revenue > 0) {
      const growth = (d.revenue - sameMonthLastYear.revenue) / sameMonthLastYear.revenue
      yoyGrowthSum += growth
      yoyCount++
    }
  }

  const yearOverYearGrowth = yoyCount > 0 ? yoyGrowthSum / yoyCount : 0

  // CAGR
  const firstValue = data[0].revenue
  const lastValue = data[data.length - 1].revenue
  const years = data.length / 12

  const cagr =
    firstValue > 0 && years > 0 ? Math.pow(lastValue / firstValue, 1 / years) - 1 : 0

  // Trend koeficient (lineární regrese)
  const n = data.length
  const sumX = (n * (n - 1)) / 2
  const sumY = data.reduce((sum, d) => sum + d.revenue, 0)
  const sumXY = data.reduce((sum, d, i) => sum + i * d.revenue, 0)
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6

  const trendCoefficient =
    n * sumX2 - sumX * sumX > 0
      ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      : 0

  return {
    yearOverYearGrowth,
    monthOverMonthGrowth,
    cagr,
    trendCoefficient,
  }
}

function generateDefaultForecast(months: number): RevenueForecast[] {
  const forecasts: RevenueForecast[] = []
  const today = new Date()

  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date(today.getFullYear(), today.getMonth() + i, 1)

    forecasts.push({
      period: {
        year: forecastDate.getFullYear(),
        month: forecastDate.getMonth() + 1,
        label: `${MONTHS_CZ[forecastDate.getMonth()]} ${forecastDate.getFullYear()}`,
      },
      predictedRevenue: 0,
      lowerBound: 0,
      upperBound: 0,
      confidence: 0,
      trend: 'stable',
      changePercent: 0,
    })
  }

  return forecasts
}
