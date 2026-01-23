/**
 * New Team Member Page
 *
 * Create a new team member
 */

import { TeamMemberForm } from '@/components/admin/TeamMemberForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

export default function NewTeamMemberPage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nový člen týmu</h1>
        <p className="mt-2 text-sm text-gray-600">
          Přidejte nového člena do týmu divadla
        </p>
      </div>

      <TeamMemberForm />
    </div>
  )
}
