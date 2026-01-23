'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Sparkles } from 'lucide-react'
import { BookSessionModal } from '@/components/sessions/BookSessionModal'
import { ClientFormModal } from '@/components/clients/ClientFormModal'

export function QuickActions() {
  const router = useRouter()
  const [isBookSessionOpen, setIsBookSessionOpen] = useState(false)
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)

  const handleGenerateWorkout = () => {
    // Navigate to sessions page where user can select a session to generate workout
    router.push('/dashboard/sessions?action=generate')
  }

  const handleSessionSaved = () => {
    setIsBookSessionOpen(false)
    // Optionally refresh the page or trigger a refresh of TodaySchedule
    router.refresh()
  }

  const handleClientSaved = () => {
    setIsNewClientOpen(false)
    // Navigate to clients page to see the new client
    router.push('/dashboard/clients')
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerateWorkout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Generate Workout
        </button>
        <button
          onClick={() => setIsBookSessionOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Schedule
        </button>
        <button
          onClick={() => setIsNewClientOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Users className="w-4 h-4" />
          New Client
        </button>
      </div>

      {/* Book Session Modal */}
      <BookSessionModal
        isOpen={isBookSessionOpen}
        onClose={() => setIsBookSessionOpen(false)}
        onSaved={handleSessionSaved}
      />

      {/* New Client Modal */}
      <ClientFormModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSaved={handleClientSaved}
      />
    </>
  )
}
