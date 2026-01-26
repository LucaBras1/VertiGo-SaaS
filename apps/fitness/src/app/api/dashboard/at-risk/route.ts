import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { detectChurnRisk } from '@/lib/ai/churn-detector'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active clients for this tenant
    const clients = await prisma.client.findMany({
      where: {
        tenantId: session.user.tenantId,
        status: 'active',
      },
      include: {
        sessions: {
          orderBy: { scheduledAt: 'desc' },
          take: 20,
        },
        invoices: {
          where: { status: { in: ['sent', 'overdue'] } },
        },
      },
    })

    // Calculate risk for each client
    const atRiskClients = []

    for (const client of clients) {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculate attendance data
      const recentSessions = client.sessions.filter(
        (s) => new Date(s.scheduledAt) >= thirtyDaysAgo
      )
      const completedSessions = recentSessions.filter((s) => s.status === 'completed')
      const cancelledSessions = recentSessions.filter((s) => s.status === 'cancelled')
      const noShowSessions = recentSessions.filter((s) => s.status === 'no_show')

      const lastSession = client.sessions[0]
      const daysSinceLastSession = lastSession
        ? Math.floor((now.getTime() - new Date(lastSession.scheduledAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      const totalBooked = recentSessions.length
      const totalAttended = completedSessions.length

      // Calculate average sessions per week in last 30 days
      const weeksSpan = 4.3 // ~30 days / 7
      const avgSessionsPerWeek = totalAttended / weeksSpan

      // Determine trend
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      const firstHalf = client.sessions.filter(
        (s) => new Date(s.scheduledAt) >= thirtyDaysAgo && new Date(s.scheduledAt) < twoWeeksAgo
      ).filter((s) => s.status === 'completed').length
      const secondHalf = client.sessions.filter(
        (s) => new Date(s.scheduledAt) >= twoWeeksAgo
      ).filter((s) => s.status === 'completed').length

      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
      if (secondHalf > firstHalf) trend = 'increasing'
      else if (secondHalf < firstHalf) trend = 'decreasing'

      // Calculate outstanding balance
      const outstandingBalance = client.invoices.reduce((sum, inv) => sum + inv.total, 0)

      // Build input for churn detector
      const churnInput = {
        client: {
          id: client.id,
          name: client.name,
          startDate: client.createdAt.toISOString(),
          membershipType: client.membershipType || undefined,
        },
        attendanceData: {
          totalSessionsBooked: totalBooked,
          totalSessionsAttended: totalAttended,
          totalSessionsCancelled: cancelledSessions.length,
          totalNoShows: noShowSessions.length,
          lastSessionDate: lastSession?.scheduledAt.toISOString(),
          daysSinceLastSession,
          averageSessionsPerWeek: Math.round(avgSessionsPerWeek * 10) / 10,
          trendLastMonth: trend,
        },
        engagementData: {
          responsiveness: 'medium' as const, // Default, could be enhanced with messaging data
          appUsage: 'moderate' as const,
        },
        progressData: {
          goalProgress: 50, // Could be calculated from measurements
          plateauWeeks: 0,
        },
        financialData: {
          outstandingBalance,
          paymentIssues: client.invoices.filter((i) => i.status === 'overdue').length,
          packageCreditsRemaining: client.creditsRemaining,
        },
      }

      try {
        const prediction = await detectChurnRisk(churnInput, { tenantId: session.user.tenantId })

        // Only include medium risk or higher
        if (prediction.riskAssessment.riskScore >= 45) {
          atRiskClients.push({
            id: client.id,
            name: client.name,
            email: client.email,
            avatar: client.avatar,
            riskScore: prediction.riskAssessment.riskScore,
            riskLevel: prediction.riskAssessment.riskLevel,
            daysSinceLastSession,
            topRiskFactors: prediction.riskFactors.slice(0, 2).map((f) => f.factor),
            suggestedAction: prediction.retentionStrategies[0]?.action || 'Personal outreach',
            urgency: prediction.riskAssessment.urgency,
          })
        }
      } catch (error) {
        console.error(`[AtRisk] Error calculating risk for client ${client.id}:`, error)
      }
    }

    // Sort by risk score (highest first)
    atRiskClients.sort((a, b) => b.riskScore - a.riskScore)

    return NextResponse.json({
      clients: atRiskClients.slice(0, 10), // Top 10 at-risk clients
      totalAtRisk: atRiskClients.length,
      summary: {
        critical: atRiskClients.filter((c) => c.riskLevel === 'critical').length,
        high: atRiskClients.filter((c) => c.riskLevel === 'high').length,
        medium: atRiskClients.filter((c) => c.riskLevel === 'medium').length,
      },
    })
  } catch (error) {
    console.error('[AtRisk] Error fetching at-risk clients:', error)
    return NextResponse.json({ error: 'Chyba pri nacitani ohrozenych klientu' }, { status: 500 })
  }
}
