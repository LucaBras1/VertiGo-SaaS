'use client'

import { useState, useCallback } from 'react'
import { TodaySchedule } from './TodaySchedule'
import { SessionDetailModal } from '../sessions/SessionDetailModal'

interface Session {
  id: string
  scheduledAt: string
  duration: number
  status: string
  muscleGroups: string[]
  workoutPlan?: unknown
  trainerNotes?: string
  client: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

export function TodayScheduleWithModal() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStartSession = useCallback((session: Session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }, [])

  const handleViewPlan = useCallback((session: Session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedSession(null)
  }, [])

  const handleSessionUpdated = useCallback(() => {
    // Trigger a refresh of the TodaySchedule component
    setRefreshKey((prev) => prev + 1)
    // Update the local session state if modal is still open
    if (selectedSession) {
      // Fetch updated session data
      fetch(`/api/sessions/${selectedSession.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setSelectedSession(data)
          }
        })
        .catch(() => {
          // Silently fail - the modal will close or user can refresh
        })
    }
  }, [selectedSession])

  return (
    <>
      <TodaySchedule
        key={refreshKey}
        onStartSession={handleStartSession}
        onViewPlan={handleViewPlan}
      />
      <SessionDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        session={selectedSession}
        onSessionUpdated={handleSessionUpdated}
      />
    </>
  )
}
