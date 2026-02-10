/**
 * New Package Page
 * Create new party package
 */

import PackageForm from '@/components/admin/PackageForm'

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Nový balíček</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Vytvořte nový party balíček
        </p>
      </div>

      <PackageForm />
    </div>
  )
}
