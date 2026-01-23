import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'
import { CustomerForm } from '@/components/admin/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nový zákazník</h1>
        <p className="mt-2 text-sm text-gray-600">
          Přidejte nového zákazníka do systému
        </p>
      </div>

      <CustomerForm />
    </div>
  )
}
