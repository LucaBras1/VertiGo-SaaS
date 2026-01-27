import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateProfitLoss, type TaxPeriod } from '@/lib/reports/tax-calculator'

// GET /api/reports/profit-loss - Get profit/loss report
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')!) : undefined
    const isVatPayer = searchParams.get('isVatPayer') === 'true'

    // Determine date range
    let startDate: Date
    let endDate: Date

    if (month) {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else if (quarter) {
      startDate = new Date(year, (quarter - 1) * 3, 1)
      endDate = new Date(year, quarter * 3, 0, 23, 59, 59)
    } else {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    }

    // Fetch revenue data
    const [sessionsRevenue, classesRevenue, ordersRevenue, invoicesRevenue, expenses] = await Promise.all([
      // Sessions revenue
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
        _count: true,
      }),

      // Classes revenue (from bookings)
      prisma.class.aggregate({
        where: {
          tenantId: session.user.tenantId,
          status: 'completed',
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          price: true,
        },
        _count: true,
      }),

      // Package orders revenue
      prisma.order.aggregate({
        where: {
          tenantId: session.user.tenantId,
          paymentStatus: 'paid',
          paidDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          total: true,
        },
        _count: true,
      }),

      // Other invoices revenue (not from orders)
      prisma.invoice.aggregate({
        where: {
          tenantId: session.user.tenantId,
          status: 'paid',
          orderId: null, // Invoices not linked to orders
          paidDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          total: true,
        },
        _count: true,
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

    // Calculate revenue totals
    const revenue = {
      sessions: sessionsRevenue._sum.price || 0,
      classes: classesRevenue._sum.price || 0,
      packages: ordersRevenue._sum.total || 0,
      other: invoicesRevenue._sum.total || 0,
      total: 0,
    }
    revenue.total = revenue.sessions + revenue.classes + revenue.packages + revenue.other

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      const categoryName = exp.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = { categoryName, amount: 0 }
      }
      acc[categoryName].amount += Number(exp.amount)
      return acc
    }, {} as Record<string, { categoryName: string; amount: number }>)

    const expensesData = {
      byCategory: Object.values(expensesByCategory),
      total: expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
    }

    // Calculate profit/loss
    const period: TaxPeriod = { year, month, quarter }
    const profitLoss = calculateProfitLoss(revenue, expensesData, period, isVatPayer)

    // Monthly trend data (for charts)
    const monthlyTrend = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const monthStart = new Date(year, i, 1)
        const monthEnd = new Date(year, i + 1, 0, 23, 59, 59)

        const [monthSessions, monthOrders, monthExpenses] = await Promise.all([
          prisma.session.aggregate({
            where: {
              tenantId: session.user.tenantId,
              paid: true,
              scheduledAt: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
            _sum: { price: true },
          }),
          prisma.order.aggregate({
            where: {
              tenantId: session.user.tenantId,
              paymentStatus: 'paid',
              paidDate: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
            _sum: { total: true },
          }),
          prisma.expense.aggregate({
            where: {
              tenantId: session.user.tenantId,
              date: {
                gte: monthStart,
                lte: monthEnd,
              },
              status: 'APPROVED',
            },
            _sum: { amount: true },
          }),
        ])

        const monthRevenue =
          (monthSessions._sum.price || 0) + (monthOrders._sum.total || 0)
        const monthExpenseTotal = Number(monthExpenses._sum.amount || 0)

        return {
          month: i + 1,
          revenue: monthRevenue,
          expenses: monthExpenseTotal,
          profit: monthRevenue - monthExpenseTotal,
        }
      })
    )

    // Revenue breakdown for pie chart
    const revenueBreakdown = [
      { name: 'Tréninky', value: revenue.sessions, color: '#10B981' },
      { name: 'Lekce', value: revenue.classes, color: '#3B82F6' },
      { name: 'Balíčky', value: revenue.packages, color: '#8B5CF6' },
      { name: 'Ostatní', value: revenue.other, color: '#F59E0B' },
    ].filter((item) => item.value > 0)

    return NextResponse.json({
      period,
      profitLoss,
      revenueBreakdown,
      monthlyTrend,
      counts: {
        sessions: sessionsRevenue._count,
        classes: classesRevenue._count,
        orders: ordersRevenue._count,
        invoices: invoicesRevenue._count,
        expenses: expenses.length,
      },
    })
  } catch (error) {
    console.error('Error generating profit/loss report:', error)
    return NextResponse.json(
      { error: 'Chyba při generování výkazu zisku a ztráty' },
      { status: 500 }
    )
  }
}
