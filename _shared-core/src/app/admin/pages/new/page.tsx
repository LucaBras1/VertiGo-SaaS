/**
 * New Page Page
 *
 * Create a new static page
 */

import { PageForm } from '@/components/admin/PageForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

export default function NewPagePage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nová stránka</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vytvořte novou statickou stránku webu
        </p>
      </div>

      <PageForm />
    </div>
  )
}
