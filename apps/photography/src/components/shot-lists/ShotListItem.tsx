'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Star, Circle, Diamond, Trash2, Edit2, Check, X, Clock } from 'lucide-react'

export interface ShotItem {
  id: string
  title: string
  description?: string
  priority: 'must-have' | 'nice-to-have' | 'creative'
  timeSlot?: string
  notes?: string
}

interface ShotListItemProps {
  item: ShotItem
  onUpdate: (updates: Partial<ShotItem>) => void
  onDelete: () => void
}

const priorityConfig = {
  'must-have': {
    label: 'Povinný',
    icon: Star,
    className: 'text-amber-500 bg-amber-100',
    borderColor: 'border-l-amber-500'
  },
  'nice-to-have': {
    label: 'Volitelný',
    icon: Circle,
    className: 'text-blue-500 bg-blue-100',
    borderColor: 'border-l-blue-500'
  },
  'creative': {
    label: 'Kreativní',
    icon: Diamond,
    className: 'text-purple-500 bg-purple-100',
    borderColor: 'border-l-purple-500'
  }
}

export function ShotListItem({ item, onUpdate, onDelete }: ShotListItemProps) {
  const [editing, setEditing] = useState(!item.title)
  const [editedTitle, setEditedTitle] = useState(item.title)
  const [editedNotes, setEditedNotes] = useState(item.notes || '')
  const [editedTimeSlot, setEditedTimeSlot] = useState(item.timeSlot || '')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const config = priorityConfig[item.priority]
  const PriorityIcon = config.icon

  const handleSave = () => {
    onUpdate({
      title: editedTitle,
      notes: editedNotes,
      timeSlot: editedTimeSlot
    })
    setEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(item.title)
    setEditedNotes(item.notes || '')
    setEditedTimeSlot(item.timeSlot || '')
    setEditing(false)
  }

  const cyclePriority = () => {
    const priorities: ShotItem['priority'][] = ['must-have', 'nice-to-have', 'creative']
    const currentIndex = priorities.indexOf(item.priority)
    const nextPriority = priorities[(currentIndex + 1) % priorities.length]
    onUpdate({ priority: nextPriority })
  }

  if (editing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white border border-gray-200 rounded-lg p-3 border-l-4 ${config.borderColor}`}
      >
        <div className="space-y-3">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Název záběru..."
            className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={editedTimeSlot}
              onChange={(e) => setEditedTimeSlot(e.target.value)}
              placeholder="Čas (např. 14:00)"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            placeholder="Poznámky..."
            rows={2}
            className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(Object.keys(priorityConfig) as ShotItem['priority'][]).map(priority => {
                const pConfig = priorityConfig[priority]
                const Icon = pConfig.icon
                return (
                  <button
                    key={priority}
                    onClick={() => onUpdate({ priority })}
                    className={`
                      p-1.5 rounded transition-colors
                      ${item.priority === priority
                        ? pConfig.className
                        : 'text-gray-400 hover:bg-gray-100'}
                    `}
                    title={pConfig.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>

            <div className="flex gap-1">
              <button
                onClick={handleCancel}
                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-white border border-gray-200 rounded-lg p-3
        border-l-4 ${config.borderColor}
        hover:shadow-sm transition-shadow
      `}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Priority Icon */}
        <button
          onClick={cyclePriority}
          className={`p-1 rounded ${config.className}`}
          title={`${config.label} - klikni pro změnu`}
        >
          <PriorityIcon className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {item.title || 'Nepojmenovaný záběr'}
            </span>
            {item.timeSlot && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {item.timeSlot}
              </span>
            )}
          </div>
          {item.notes && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">
              {item.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
