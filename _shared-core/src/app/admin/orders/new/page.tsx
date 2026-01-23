import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'
import { OrderForm } from '@/components/admin/OrderForm'

export default function NewOrderPage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nová objednávka</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vytvořte novou objednávku od zákazníka
        </p>
      </div>

      <OrderForm />
    </div>
  )
}
