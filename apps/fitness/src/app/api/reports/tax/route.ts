import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateTaxes,
  FLAT_RATE_EXPENSES,
  type IncomeData,
} from '@/lib/reports/tax-calculator'

// GET /api/reports/tax - Get tax summary for a period
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const isVatPayer = searchParams.get('isVatPayer') === 'true'

    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59) // December 31st

    // Fetch all income data for the year
    const [sessionsIncome, invoicesIncome, expenses] = await Promise.all([
      // Sessions income (paid sessions)
      prisma.session.aggregate({
        where: {
          tenantId: session.user.tenantId,
          paid: true,
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          price: true,
        },
      }),

      // Invoices income (paid invoices)
      prisma.invoice.aggregate({
        where: {
          tenantId: session.user.tenantId,
          status: 'paid',
          paidDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          total: true,
        },
      }),

      // Expenses
      prisma.expense.findMany({
        where: {
          tenantId: session.user.tenantId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'APPROVED',
        },
        include: {
          category: true,
        },
      }),
    ])

    // Calculate totals
    const grossIncome =
      (sessionsIncome._sum.price || 0) + (invoicesIncome._sum.total || 0)

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0
    )

    const taxDeductibleExpenses = expenses
      .filter((exp) => exp.isTaxDeductible)
      .reduce((sum, exp) => sum + Number(exp.amount), 0)

    // Estimate VAT (simplified - assuming all income is 21% VAT)
    const vatCollected = isVatPayer ? Math.round(grossIncome * 0.1736) : 0 // VAT from gross (21/121)
    const vatPaid = isVatPayer
      ? expenses
          .filter((exp) => exp.isTaxDeductible)
          .reduce((sum, exp) => sum + Number(exp.taxAmount || 0), 0)
      : 0

    const incomeData: IncomeData = {
      grossIncome,
      expenses: totalExpenses,
      taxDeductibleExpenses,
      vatCollected,
      vatPaid,
    }

    // Calculate taxes
    const taxCalculation = calculateTaxes(
      incomeData,
      isVatPayer,
      FLAT_RATE_EXPENSES.PROFESSIONAL_SERVICES
    )

    // Expense breakdown by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      const categoryName = exp.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          total: 0,
          taxDeductible: 0,
          count: 0,
        }
      }
      acc[categoryName].total += Number(exp.amount)
      if (exp.isTaxDeductible) {
        acc[categoryName].taxDeductible += Number(exp.amount)
      }
      acc[categoryName].count++
      return acc
    }, {} as Record<string, { name: string; total: number; taxDeductible: number; count: number }>)

    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const monthStart = new Date(year, i, 1)
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59)

      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date)
        return expDate >= monthStart && expDate <= monthEnd
      })

      return {
        month,
        total: monthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
        taxDeductible: monthExpenses
          .filter((exp) => exp.isTaxDeductible)
          .reduce((sum, exp) => sum + Number(exp.amount), 0),
        count: monthExpenses.length,
      }
    })

    return NextResponse.json({
      year,
      income: {
        sessions: sessionsIncome._sum.price || 0,
        invoices: invoicesIncome._sum.total || 0,
        total: grossIncome,
      },
      expenses: {
        total: totalExpenses,
        taxDeductible: taxDeductibleExpenses,
        byCategory: Object.values(expensesByCategory),
        byMonth: monthlyData,
      },
      taxCalculation,
      summary: {
        grossIncome,
        totalExpenses,
        profit: grossIncome - taxDeductibleExpenses,
        estimatedTaxLiability: taxCalculation.totalTaxLiability,
        netIncome: taxCalculation.netIncome,
        recommendedMethod: taxCalculation.recommendedMethod,
        potentialSavings: taxCalculation.taxSavings,
      },
    })
  } catch (error) {
    console.error('Error generating tax report:', error)
    return NextResponse.json(
      { error: 'Chyba při generování daňového přehledu' },
      { status: 500 }
    )
  }
}
