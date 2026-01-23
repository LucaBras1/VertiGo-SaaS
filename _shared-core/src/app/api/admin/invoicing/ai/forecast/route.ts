/**
 * Revenue Forecast API
 *
 * Predikuje tržby a cash flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  forecastRevenue,
  forecastCashFlow,
  getSeasonalityAnalysis,
  getGrowthMetrics,
  predictAnnualTurnover,
} from '@/lib/invoicing/ai'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'revenue'
    const months = parseInt(searchParams.get('months') || '6')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const currentBalance = parseFloat(searchParams.get('currentBalance') || '0')

    switch (type) {
      case 'revenue': {
        const forecasts = await forecastRevenue(months)
        return NextResponse.json({ forecasts })
      }

      case 'cashflow': {
        const predictions = await forecastCashFlow(months, currentBalance)
        return NextResponse.json({ predictions })
      }

      case 'seasonality': {
        const seasonality = await getSeasonalityAnalysis()
        return NextResponse.json(seasonality)
      }

      case 'growth': {
        const metrics = await getGrowthMetrics()
        return NextResponse.json(metrics)
      }

      case 'turnover': {
        const turnover = await predictAnnualTurnover(year)
        return NextResponse.json(turnover)
      }

      case 'all': {
        // Vrátit všechna data najednou
        const [forecasts, cashflow, seasonality, growth, turnover] =
          await Promise.all([
            forecastRevenue(months),
            forecastCashFlow(months, currentBalance),
            getSeasonalityAnalysis(),
            getGrowthMetrics(),
            predictAnnualTurnover(year),
          ])

        return NextResponse.json({
          forecasts,
          cashflow,
          seasonality,
          growth,
          turnover,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error forecasting:', error)
    return NextResponse.json(
      { error: 'Failed to generate forecast' },
      { status: 500 }
    )
  }
}
