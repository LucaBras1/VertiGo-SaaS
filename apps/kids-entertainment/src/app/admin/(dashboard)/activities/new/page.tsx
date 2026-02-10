/**
 * New Activity Page
 */

import ActivityForm from '@/components/admin/ActivityForm'

export default function NewActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Nová aktivita</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Vytvořte novou party aktivitu</p>
      </div>

      <ActivityForm />
    </div>
  )
}
