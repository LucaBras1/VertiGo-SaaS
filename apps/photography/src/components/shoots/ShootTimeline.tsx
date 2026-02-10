'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Edit2, Check, X, Clock } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle } from '@vertigo/ui'
export interface TimelineEvent {
  id: string
  time: string
  endTime?: string
  title: string
  location?: string
  notes?: string
  color: string
}

interface ShootTimelineProps {
  events: TimelineEvent[]
  onChange?: (events: TimelineEvent[]) => void
  readonly?: boolean
}

const colorOptions = [
  { value: 'bg-pink-500', label: 'Růžová' },
  { value: 'bg-purple-500', label: 'Fialová' },
  { value: 'bg-blue-500', label: 'Modrá' },
  { value: 'bg-green-500', label: 'Zelená' },
  { value: 'bg-amber-500', label: 'Žlutá' },
  { value: 'bg-red-500', label: 'Červená' },
  { value: 'bg-gray-500', label: 'Šedá' }
]

const defaultTemplates: Omit<TimelineEvent, 'id'>[] = [
  { time: '08:00', endTime: '10:00', title: 'Přípravy nevěsty', color: 'bg-pink-500' },
  { time: '09:00', endTime: '10:00', title: 'Přípravy ženicha', color: 'bg-blue-500' },
  { time: '10:30', endTime: '11:00', title: 'First Look', color: 'bg-purple-500' },
  { time: '11:00', endTime: '12:00', title: 'Párové portréty', color: 'bg-amber-500' },
  { time: '14:00', endTime: '15:00', title: 'Obřad', color: 'bg-green-500' },
  { time: '15:00', endTime: '16:00', title: 'Skupinové fotky', color: 'bg-blue-500' },
  { time: '17:00', title: 'Hostina - začátek', color: 'bg-amber-500' },
  { time: '19:00', title: 'První tanec', color: 'bg-pink-500' },
  { time: '20:00', title: 'Krájení dortu', color: 'bg-purple-500' }
]

export function ShootTimeline({ events, onChange, readonly = false }: ShootTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<TimelineEvent>>({})

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.time.replace(':', '')
    const timeB = b.time.replace(':', '')
    return timeA.localeCompare(timeB)
  })

  const addEvent = () => {
    if (!onChange) return
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      time: '12:00',
      title: '',
      color: 'bg-gray-500'
    }
    onChange([...events, newEvent])
    setEditingId(newEvent.id)
    setEditData(newEvent)
  }

  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    if (!onChange) return
    onChange(events.map(e => (e.id === id ? { ...e, ...updates } : e)))
  }

  const deleteEvent = (id: string) => {
    if (!onChange) return
    onChange(events.filter(e => e.id !== id))
  }

  const startEditing = (event: TimelineEvent) => {
    setEditingId(event.id)
    setEditData(event)
  }

  const saveEditing = () => {
    if (editingId && editData.title) {
      updateEvent(editingId, editData)
    }
    setEditingId(null)
    setEditData({})
  }

  const cancelEditing = () => {
    // If it's a new event without title, delete it
    const event = events.find(e => e.id === editingId)
    if (event && !event.title) {
      deleteEvent(editingId!)
    }
    setEditingId(null)
    setEditData({})
  }

  const loadTemplate = () => {
    if (!onChange) return
    const templateEvents = defaultTemplates.map((t, i) => ({
      ...t,
      id: `event-${Date.now()}-${i}`
    }))
    onChange(templateEvents)
  }

  // Calculate timeline hours (from earliest to latest event)
  const hours: string[] = []
  if (sortedEvents.length > 0) {
    const startHour = Math.max(6, parseInt(sortedEvents[0].time.split(':')[0]) - 1)
    const endHour = Math.min(23, parseInt(sortedEvents[sortedEvents.length - 1].time.split(':')[0]) + 2)
    for (let h = startHour; h <= endHour; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`)
    }
  } else {
    for (let h = 8; h <= 20; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Časová osa</CardTitle>
          {!readonly && (
            <div className="flex gap-2">
              {events.length === 0 && (
                <Button variant="outline" size="sm" onClick={loadTemplate}>
                  Načíst šablonu
                </Button>
              )}
              <Button size="sm" onClick={addEvent}>
                <Plus className="w-4 h-4 mr-1" />
                Přidat
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <div className="relative">
        {/* Timeline axis */}
        <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Events */}
        <div className="space-y-4 pb-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Zatím nejsou přidány žádné události</p>
            </div>
          ) : (
            sortedEvents.map((event, index) => {
              const isEditing = editingId === event.id

              return (
                <div key={event.id} className="flex items-start gap-4">
                  {/* Time */}
                  <div className="w-12 text-right text-sm text-gray-500 pt-1 shrink-0">
                    {isEditing ? (
                      <input
                        type="time"
                        value={editData.time || event.time}
                        onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                        className="w-20 px-1 py-0.5 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <span className="font-medium">{event.time}</span>
                    )}
                    {event.endTime && !isEditing && (
                      <span className="block text-xs text-gray-400">
                        - {event.endTime}
                      </span>
                    )}
                    {isEditing && (
                      <input
                        type="time"
                        value={editData.endTime || event.endTime || ''}
                        onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                        className="w-20 px-1 py-0.5 border border-gray-300 rounded text-sm mt-1"
                        placeholder="Konec"
                      />
                    )}
                  </div>

                  {/* Dot */}
                  <div className={`w-4 h-4 rounded-full ${event.color} border-2 border-white shadow shrink-0 mt-1`} />

                  {/* Content */}
                  <div className={`
                    flex-1 p-3 rounded-lg border transition-colors
                    ${isEditing ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}
                  `}>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editData.title || ''}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          placeholder="Název události..."
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editData.location || ''}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          placeholder="Místo..."
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 text-sm"
                        />
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                          placeholder="Poznámky..."
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 text-sm resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {colorOptions.map(color => (
                              <button
                                key={color.value}
                                onClick={() => setEditData({ ...editData, color: color.value })}
                                className={`w-6 h-6 rounded ${color.value} ${
                                  (editData.color || event.color) === color.value
                                    ? 'ring-2 ring-offset-1 ring-gray-400'
                                    : ''
                                }`}
                                title={color.label}
                              />
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={saveEditing}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          {event.location && (
                            <p className="text-sm text-gray-500">{event.location}</p>
                          )}
                          {event.notes && (
                            <p className="text-sm text-gray-400 mt-1">{event.notes}</p>
                          )}
                        </div>
                        {!readonly && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditing(event)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Card>
  )
}
