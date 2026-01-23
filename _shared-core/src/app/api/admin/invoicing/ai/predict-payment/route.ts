/**
 * Payment Prediction API
 *
 * Predikuje platební chování zákazníka.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { predictPayment, identifyRiskyCustomers } from '@/lib/invoicing/ai'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const amount = parseFloat(searchParams.get('amount') || '0')
    const listRisky = searchParams.get('listRisky') === 'true'
    const minRisk = parseInt(searchParams.get('minRisk') || '50')

    // Pokud chceme seznam rizikových zákazníků
    if (listRisky) {
      const riskyCustomers = await identifyRiskyCustomers(minRisk)
      return NextResponse.json({ customers: riskyCustomers })
    }

    // Predikce pro konkrétního zákazníka
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const prediction = await predictPayment(customerId, amount)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Error predicting payment:', error)
    return NextResponse.json(
      { error: 'Failed to predict payment' },
      { status: 500 }
    )
  }
}
