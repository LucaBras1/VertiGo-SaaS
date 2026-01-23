/**
 * Edit Team Member Page
 *
 * Edit an existing team member
 */

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TeamMemberForm } from '@/components/admin/TeamMemberForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

async function getTeamMember(id: string) {
  try {
    return await prisma.teamMember.findUnique({ where: { id } })
  } catch (error) {
    console.error('Error fetching team member:', error)
    return null
  }
}

export default async function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const teamMember = await getTeamMember(params.id)

  if (!teamMember) {
    notFound()
  }

  const teamMemberData = {
    ...teamMember,
    createdAt: teamMember.createdAt.toISOString(),
    updatedAt: teamMember.updatedAt.toISOString(),
  }

  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs
        entityTitle={`${teamMember.firstName} ${teamMember.lastName}`}
        className="mb-6"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upravit člena týmu</h1>
        <p className="mt-2 text-sm text-gray-600">
          {teamMember.firstName} {teamMember.lastName}
        </p>
      </div>

      <TeamMemberForm teamMember={teamMemberData} />
    </div>
  )
}
