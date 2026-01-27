/**
 * Admin - Programs List Page
 */

// Force dynamic rendering - database queries at runtime
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { ProgramsList } from '@/components/admin/ProgramsList'

export default async function ProgramsPage() {
  // Fetch programs from database
  const programs = await prisma.program.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    include: {
      activityLinks: {
        include: {
          activity: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          sessions: true,
          orderItems: true,
        },
      },
    },
  })

  // Transform data for client component
  const programsData = programs.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    status: p.status,
    featured: p.featured,
    duration: p.duration,
    minTeamSize: p.minTeamSize,
    maxTeamSize: p.maxTeamSize,
    teamSize: p.teamSize,
    objectives: p.objectives as string[] | null,
    activityLinks: p.activityLinks.map((al) => ({ activity: { title: al.activity.title } })),
    _count: p._count,
  }))

  return <ProgramsList initialPrograms={programsData} />
}
