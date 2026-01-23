/**
 * New Performance Page
 *
 * Create a new performance
 */

import { PerformanceForm } from '@/components/admin/PerformanceForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

export default function NewPerformancePage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nová inscenace</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vytvořte nové divadelní představení, program na chůdách nebo hudební program
        </p>
      </div>

      <PerformanceForm />
    </div>
  )
}
