/**
 * New Event Page
 *
 * Create a new event
 */

import { EventForm } from '@/components/admin/EventForm'
import { Breadcrumbs } from '@/components/admin/navigation/Breadcrumbs'

export default function NewEventPage() {
  return (
    <div className="px-4 py-8 sm:px-0">
      <Breadcrumbs className="mb-6" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nová akce</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vytvořte novou veřejnou nebo interní akci
        </p>
      </div>

      <EventForm />
    </div>
  )
}
