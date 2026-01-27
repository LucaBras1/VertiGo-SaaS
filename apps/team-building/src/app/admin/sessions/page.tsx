/**
 * Admin - Sessions List Page
 */

// Force dynamic rendering - database queries at runtime
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { SessionsList } from '@/components/admin/SessionsList'

export default async function SessionsPage() {
  // Fetch sessions from database
  const sessions = await prisma.session.findMany({
    orderBy: { date: 'desc' },
    include: {
      program: {
        select: {
          title: true,
        },
      },
    },
    take: 50, // Limit to recent sessions
  })

  // Fetch programs for filter dropdown
  const programs = await prisma.program.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: 'asc' },
  })

  // Transform data for client component
  const sessionsData = sessions.map((s) => ({
    id: s.id,
    companyName: s.companyName,
    teamName: s.teamName,
    date: s.date,
    endDate: s.endDate,
    status: s.status,
    teamSize: s.teamSize,
    debriefCompleted: s.debriefCompleted,
    venue: s.venue,
    program: s.program,
    programId: s.programId,
  }))

  return <SessionsList initialSessions={sessionsData} programs={programs} />
}
