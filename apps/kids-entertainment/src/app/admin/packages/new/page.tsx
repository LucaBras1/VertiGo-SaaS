/**
 * New Package Page
 * Create new party package
 */

import PackageForm from '@/components/admin/PackageForm'

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nový balíček</h1>
        <p className="text-gray-600 mt-1">
          Vytvořte nový party balíček
        </p>
      </div>

      <PackageForm />
    </div>
  )
}
