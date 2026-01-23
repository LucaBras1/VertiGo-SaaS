/**
 * Expenses API Routes
 *
 * GET /api/admin/invoicing/expenses - List expenses
 * POST /api/admin/invoicing/expenses - Create expense
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  listExpenses,
  createExpense,
  getExpenseSummaryByCategory,
  getTotalExpenses,
} from '@/lib/invoicing/expense-service'
import { ExpenseFilters, CreateExpenseData, ExpenseStatus, ExpenseCategory } from '@/types/invoicing'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    // Handle special queries
    if (type === 'summary') {
      const year = searchParams.get('year')
      const summary = await getExpenseSummaryByCategory(year ? parseInt(year) : undefined)
      return NextResponse.json(summary)
    }

    if (type === 'totals') {
      const dateFrom = searchParams.get('dateFrom')
      const dateTo = searchParams.get('dateTo')
      const totals = await getTotalExpenses(
        dateFrom ? new Date(dateFrom) : undefined,
        dateTo ? new Date(dateTo) : undefined
      )
      return NextResponse.json(totals)
    }

    // Build filters from query params
    const filters: ExpenseFilters = {}

    const search = searchParams.get('search')
    if (search) filters.search = search

    const status = searchParams.get('status')
    if (status) filters.status = status.split(',') as ExpenseStatus[]

    const category = searchParams.get('category')
    if (category) filters.category = category.split(',') as ExpenseCategory[]

    const dateFrom = searchParams.get('dateFrom')
    if (dateFrom) filters.dateFrom = dateFrom

    const dateTo = searchParams.get('dateTo')
    if (dateTo) filters.dateTo = dateTo

    const amountMin = searchParams.get('amountMin')
    if (amountMin) filters.amountMin = parseInt(amountMin)

    const amountMax = searchParams.get('amountMax')
    if (amountMax) filters.amountMax = parseInt(amountMax)

    const invoiceId = searchParams.get('invoiceId')
    if (invoiceId) filters.invoiceId = invoiceId

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '25')

    const result = await listExpenses(filters, page, pageSize)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to list expenses:', error)
    return NextResponse.json(
      { error: 'Failed to list expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json() as CreateExpenseData

    // Validate required fields
    if (!data.description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    if (!data.totalAmount) {
      return NextResponse.json(
        { error: 'Total amount is required' },
        { status: 400 }
      )
    }

    if (!data.expenseDate) {
      return NextResponse.json(
        { error: 'Expense date is required' },
        { status: 400 }
      )
    }

    const expense = await createExpense(data)

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Failed to create expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
