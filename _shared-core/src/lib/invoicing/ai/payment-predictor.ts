/**
 * Payment Predictor
 *
 * AI modul pro predikci plateb na základě historie zákazníka.
 * Analyzuje historické platební vzorce a predikuje pravděpodobnost a timing platby.
 */

import prisma from '@/lib/prisma'

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentPrediction {
  /** Pravděpodobnost včasné platby (0-1) */
  onTimePaymentProbability: number
  /** Predikovaný počet dní do platby od splatnosti */
  predictedDaysToPayment: number
  /** Skóre rizika (0-100, vyšší = vyšší riziko) */
  riskScore: number
  /** Doporučení pro akci */
  recommendation: PaymentRecommendation
  /** Důvody pro predikci */
  factors: PaymentFactor[]
  /** Historická statistika zákazníka */
  customerStats: CustomerPaymentStats
}

export type PaymentRecommendation =
  | 'STANDARD' // Standardní splatnost
  | 'REQUIRE_ADVANCE' // Vyžadovat zálohu
  | 'SHORTEN_DUE' // Zkrátit splatnost
  | 'EXTEND_DUE' // Prodloužit splatnost (dobrý plátce)
  | 'CASH_ONLY' // Pouze hotovost/předem
  | 'MONITOR' // Sledovat platbu

export interface PaymentFactor {
  type: FactorType
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
  description: string
}

export type FactorType =
  | 'PAYMENT_HISTORY'
  | 'AVERAGE_DELAY'
  | 'INVOICE_AMOUNT'
  | 'CUSTOMER_AGE'
  | 'RECENT_BEHAVIOR'
  | 'TOTAL_REVENUE'
  | 'OUTSTANDING_AMOUNT'

export interface CustomerPaymentStats {
  totalInvoices: number
  paidOnTime: number
  paidLate: number
  unpaid: number
  averagePaymentDays: number
  totalRevenue: number
  outstandingAmount: number
  longestDelay: number
  lastPaymentDaysAgo: number | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WEIGHTS = {
  PAYMENT_HISTORY: 0.3,
  AVERAGE_DELAY: 0.25,
  RECENT_BEHAVIOR: 0.2,
  INVOICE_AMOUNT: 0.1,
  OUTSTANDING_AMOUNT: 0.1,
  CUSTOMER_AGE: 0.05,
}

const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Predikuje platební chování pro daného zákazníka a částku
 */
export async function predictPayment(
  customerId: string,
  invoiceAmount: number
): Promise<PaymentPrediction> {
  // Získat historii zákazníka
  const stats = await getCustomerPaymentStats(customerId)
  const factors: PaymentFactor[] = []

  // Analyzovat jednotlivé faktory
  const historyScore = analyzePaymentHistory(stats, factors)
  const delayScore = analyzeAverageDelay(stats, factors)
  const recentScore = await analyzeRecentBehavior(customerId, factors)
  const amountScore = analyzeInvoiceAmount(invoiceAmount, stats, factors)
  const outstandingScore = analyzeOutstandingAmount(stats, factors)
  const ageScore = analyzeCustomerAge(stats, factors)

  // Vypočítat celkové rizikové skóre
  const riskScore = Math.round(
    historyScore * WEIGHTS.PAYMENT_HISTORY +
      delayScore * WEIGHTS.AVERAGE_DELAY +
      recentScore * WEIGHTS.RECENT_BEHAVIOR +
      amountScore * WEIGHTS.INVOICE_AMOUNT +
      outstandingScore * WEIGHTS.OUTSTANDING_AMOUNT +
      ageScore * WEIGHTS.CUSTOMER_AGE
  )

  // Pravděpodobnost včasné platby
  const onTimePaymentProbability = Math.max(0, Math.min(1, (100 - riskScore) / 100))

  // Predikovaný počet dní
  const predictedDaysToPayment = predictPaymentTiming(stats, riskScore)

  // Doporučení
  const recommendation = generateRecommendation(riskScore, stats, invoiceAmount)

  return {
    onTimePaymentProbability,
    predictedDaysToPayment,
    riskScore,
    recommendation,
    factors,
    customerStats: stats,
  }
}

/**
 * Získá platební statistiky zákazníka
 */
export async function getCustomerPaymentStats(
  customerId: string
): Promise<CustomerPaymentStats> {
  const invoices = await prisma.invoice.findMany({
    where: {
      customerId,
      status: { in: ['PAID', 'PARTIALLY_PAID', 'OVERDUE', 'SENT'] },
    },
    include: {
      payments: true,
    },
    orderBy: { issueDate: 'desc' },
  })

  let paidOnTime = 0
  let paidLate = 0
  let unpaid = 0
  let totalPaymentDays = 0
  let paymentCount = 0
  let longestDelay = 0
  let lastPaymentDaysAgo: number | null = null
  let totalRevenue = 0
  let outstandingAmount = 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const invoice of invoices) {
    totalRevenue += invoice.totalAmount

    if (invoice.status === 'PAID') {
      // Najít datum platby
      const lastPayment = invoice.payments.sort(
        (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
      )[0]

      if (lastPayment) {
        const paymentDate = new Date(lastPayment.paidAt)
        const dueDate = new Date(invoice.dueDate)
        const daysToPayment = Math.floor(
          (paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysToPayment <= 0) {
          paidOnTime++
        } else {
          paidLate++
          longestDelay = Math.max(longestDelay, daysToPayment)
        }

        totalPaymentDays += Math.max(0, daysToPayment)
        paymentCount++

        // Datum poslední platby
        if (lastPaymentDaysAgo === null) {
          lastPaymentDaysAgo = Math.floor(
            (today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        }
      }
    } else if (invoice.status === 'OVERDUE' || invoice.status === 'SENT') {
      unpaid++
      outstandingAmount += invoice.totalAmount - (invoice.paidAmount || 0)
    } else if (invoice.status === 'PARTIALLY_PAID') {
      outstandingAmount += invoice.totalAmount - (invoice.paidAmount || 0)
    }
  }

  return {
    totalInvoices: invoices.length,
    paidOnTime,
    paidLate,
    unpaid,
    averagePaymentDays: paymentCount > 0 ? Math.round(totalPaymentDays / paymentCount) : 0,
    totalRevenue,
    outstandingAmount,
    longestDelay,
    lastPaymentDaysAgo,
  }
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function analyzePaymentHistory(stats: CustomerPaymentStats, factors: PaymentFactor[]): number {
  const totalPaid = stats.paidOnTime + stats.paidLate

  if (totalPaid === 0) {
    factors.push({
      type: 'PAYMENT_HISTORY',
      impact: 'neutral',
      weight: WEIGHTS.PAYMENT_HISTORY,
      description: 'Nový zákazník bez historie',
    })
    return 50 // Neutrální pro nové zákazníky
  }

  const onTimeRate = stats.paidOnTime / totalPaid
  const score = (1 - onTimeRate) * 100

  if (onTimeRate >= 0.9) {
    factors.push({
      type: 'PAYMENT_HISTORY',
      impact: 'positive',
      weight: WEIGHTS.PAYMENT_HISTORY,
      description: `Vynikající platební morálka (${Math.round(onTimeRate * 100)}% včas)`,
    })
  } else if (onTimeRate >= 0.7) {
    factors.push({
      type: 'PAYMENT_HISTORY',
      impact: 'neutral',
      weight: WEIGHTS.PAYMENT_HISTORY,
      description: `Průměrná platební morálka (${Math.round(onTimeRate * 100)}% včas)`,
    })
  } else {
    factors.push({
      type: 'PAYMENT_HISTORY',
      impact: 'negative',
      weight: WEIGHTS.PAYMENT_HISTORY,
      description: `Špatná platební morálka (pouze ${Math.round(onTimeRate * 100)}% včas)`,
    })
  }

  return score
}

function analyzeAverageDelay(stats: CustomerPaymentStats, factors: PaymentFactor[]): number {
  const avgDays = stats.averagePaymentDays

  if (avgDays <= 0) {
    factors.push({
      type: 'AVERAGE_DELAY',
      impact: 'positive',
      weight: WEIGHTS.AVERAGE_DELAY,
      description: 'Platby obvykle před splatností',
    })
    return 0
  }

  if (avgDays <= 7) {
    factors.push({
      type: 'AVERAGE_DELAY',
      impact: 'neutral',
      weight: WEIGHTS.AVERAGE_DELAY,
      description: `Průměrné zpoždění ${avgDays} dní`,
    })
    return 25
  }

  if (avgDays <= 14) {
    factors.push({
      type: 'AVERAGE_DELAY',
      impact: 'negative',
      weight: WEIGHTS.AVERAGE_DELAY,
      description: `Průměrné zpoždění ${avgDays} dní`,
    })
    return 50
  }

  factors.push({
    type: 'AVERAGE_DELAY',
    impact: 'negative',
    weight: WEIGHTS.AVERAGE_DELAY,
    description: `Vysoké průměrné zpoždění ${avgDays} dní`,
  })
  return Math.min(100, avgDays * 3)
}

async function analyzeRecentBehavior(
  customerId: string,
  factors: PaymentFactor[]
): Promise<number> {
  // Analyzovat posledních 6 měsíců
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const recentInvoices = await prisma.invoice.findMany({
    where: {
      customerId,
      issueDate: { gte: sixMonthsAgo },
      status: { in: ['PAID', 'OVERDUE'] },
    },
    include: { payments: true },
  })

  if (recentInvoices.length === 0) {
    factors.push({
      type: 'RECENT_BEHAVIOR',
      impact: 'neutral',
      weight: WEIGHTS.RECENT_BEHAVIOR,
      description: 'Žádná nedávná aktivita',
    })
    return 50
  }

  const paidRecent = recentInvoices.filter((i) => i.status === 'PAID')
  const overdueRecent = recentInvoices.filter((i) => i.status === 'OVERDUE')

  if (overdueRecent.length > 0) {
    factors.push({
      type: 'RECENT_BEHAVIOR',
      impact: 'negative',
      weight: WEIGHTS.RECENT_BEHAVIOR,
      description: `${overdueRecent.length} neuhrazených faktur za posledních 6 měsíců`,
    })
    return 80
  }

  if (paidRecent.length >= 3) {
    factors.push({
      type: 'RECENT_BEHAVIOR',
      impact: 'positive',
      weight: WEIGHTS.RECENT_BEHAVIOR,
      description: `${paidRecent.length} uhrazených faktur za posledních 6 měsíců`,
    })
    return 10
  }

  factors.push({
    type: 'RECENT_BEHAVIOR',
    impact: 'neutral',
    weight: WEIGHTS.RECENT_BEHAVIOR,
    description: `${paidRecent.length} uhrazených faktur za posledních 6 měsíců`,
  })
  return 30
}

function analyzeInvoiceAmount(
  amount: number,
  stats: CustomerPaymentStats,
  factors: PaymentFactor[]
): number {
  // Porovnat s průměrnou fakturou zákazníka
  const avgInvoice =
    stats.totalInvoices > 0 ? stats.totalRevenue / stats.totalInvoices : amount

  const ratio = amount / avgInvoice

  if (ratio <= 1) {
    factors.push({
      type: 'INVOICE_AMOUNT',
      impact: 'positive',
      weight: WEIGHTS.INVOICE_AMOUNT,
      description: 'Částka v obvyklém rozsahu',
    })
    return 10
  }

  if (ratio <= 2) {
    factors.push({
      type: 'INVOICE_AMOUNT',
      impact: 'neutral',
      weight: WEIGHTS.INVOICE_AMOUNT,
      description: 'Částka mírně nad průměrem',
    })
    return 40
  }

  factors.push({
    type: 'INVOICE_AMOUNT',
    impact: 'negative',
    weight: WEIGHTS.INVOICE_AMOUNT,
    description: `Částka ${ratio.toFixed(1)}x vyšší než obvykle`,
  })
  return Math.min(100, ratio * 25)
}

function analyzeOutstandingAmount(
  stats: CustomerPaymentStats,
  factors: PaymentFactor[]
): number {
  if (stats.outstandingAmount <= 0) {
    factors.push({
      type: 'OUTSTANDING_AMOUNT',
      impact: 'positive',
      weight: WEIGHTS.OUTSTANDING_AMOUNT,
      description: 'Žádné neuhrazené faktury',
    })
    return 0
  }

  const ratio = stats.outstandingAmount / Math.max(stats.totalRevenue, 1)

  if (ratio <= 0.1) {
    factors.push({
      type: 'OUTSTANDING_AMOUNT',
      impact: 'neutral',
      weight: WEIGHTS.OUTSTANDING_AMOUNT,
      description: `Neuhrazeno ${(ratio * 100).toFixed(0)}% z celkového obratu`,
    })
    return 30
  }

  factors.push({
    type: 'OUTSTANDING_AMOUNT',
    impact: 'negative',
    weight: WEIGHTS.OUTSTANDING_AMOUNT,
    description: `Neuhrazeno ${(ratio * 100).toFixed(0)}% z celkového obratu`,
  })
  return Math.min(100, ratio * 200)
}

function analyzeCustomerAge(stats: CustomerPaymentStats, factors: PaymentFactor[]): number {
  if (stats.totalInvoices === 0) {
    factors.push({
      type: 'CUSTOMER_AGE',
      impact: 'neutral',
      weight: WEIGHTS.CUSTOMER_AGE,
      description: 'Nový zákazník',
    })
    return 50
  }

  if (stats.totalInvoices >= 10) {
    factors.push({
      type: 'CUSTOMER_AGE',
      impact: 'positive',
      weight: WEIGHTS.CUSTOMER_AGE,
      description: 'Dlouhodobý zákazník',
    })
    return 10
  }

  factors.push({
    type: 'CUSTOMER_AGE',
    impact: 'neutral',
    weight: WEIGHTS.CUSTOMER_AGE,
    description: `Zákazník s ${stats.totalInvoices} fakturami`,
  })
  return 30
}

// ============================================================================
// PREDICTION HELPERS
// ============================================================================

function predictPaymentTiming(stats: CustomerPaymentStats, riskScore: number): number {
  // Základní predikce na základě průměrného zpoždění
  let baseDays = stats.averagePaymentDays

  // Upravit na základě rizikového skóre
  if (riskScore < RISK_THRESHOLDS.LOW) {
    baseDays = Math.max(-3, baseDays - 3) // Dobrý plátce - možná i dříve
  } else if (riskScore > RISK_THRESHOLDS.HIGH) {
    baseDays = baseDays + Math.round(riskScore / 10) // Špatný plátce - větší zpoždění
  }

  return baseDays
}

function generateRecommendation(
  riskScore: number,
  stats: CustomerPaymentStats,
  invoiceAmount: number
): PaymentRecommendation {
  // Vysoké riziko
  if (riskScore >= RISK_THRESHOLDS.HIGH) {
    if (stats.unpaid > 0) {
      return 'REQUIRE_ADVANCE'
    }
    if (invoiceAmount > 50000) {
      return 'REQUIRE_ADVANCE'
    }
    return 'SHORTEN_DUE'
  }

  // Střední riziko
  if (riskScore >= RISK_THRESHOLDS.MEDIUM) {
    if (stats.outstandingAmount > 0) {
      return 'MONITOR'
    }
    return 'SHORTEN_DUE'
  }

  // Nízké riziko
  if (riskScore < RISK_THRESHOLDS.LOW) {
    if (stats.totalInvoices >= 5 && stats.paidLate === 0) {
      return 'EXTEND_DUE'
    }
    return 'STANDARD'
  }

  return 'STANDARD'
}

// ============================================================================
// BATCH PREDICTIONS
// ============================================================================

/**
 * Získá predikce pro více zákazníků najednou
 */
export async function getPredictionsForCustomers(
  customerIds: string[]
): Promise<Map<string, PaymentPrediction>> {
  const predictions = new Map<string, PaymentPrediction>()

  for (const customerId of customerIds) {
    try {
      const prediction = await predictPayment(customerId, 0)
      predictions.set(customerId, prediction)
    } catch (error) {
      console.error(`Failed to predict for customer ${customerId}:`, error)
    }
  }

  return predictions
}

/**
 * Identifikuje rizikové zákazníky
 */
export async function identifyRiskyCustomers(
  minRiskScore: number = RISK_THRESHOLDS.MEDIUM
): Promise<Array<{ customerId: string; prediction: PaymentPrediction }>> {
  const customers = await prisma.customer.findMany({
    where: {
      invoices: {
        some: {},
      },
    },
    select: { id: true },
  })

  const riskyCustomers: Array<{ customerId: string; prediction: PaymentPrediction }> = []

  for (const customer of customers) {
    const prediction = await predictPayment(customer.id, 0)
    if (prediction.riskScore >= minRiskScore) {
      riskyCustomers.push({
        customerId: customer.id,
        prediction,
      })
    }
  }

  return riskyCustomers.sort((a, b) => b.prediction.riskScore - a.prediction.riskScore)
}
