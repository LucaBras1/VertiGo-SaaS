'use client'

import { Clock, Dumbbell, Users, MoreVertical, Edit2, Trash2, Copy } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItems,
  DropdownMenuItem,
} from '@vertigo/ui'

interface Exercise {
  name: string
  sets?: number
  reps?: string
  duration?: number
}

interface WorkoutTemplate {
  id: string
  name: string
  description?: string | null
  category: string
  difficulty: string
  duration: number
  exercises: Exercise[]
  muscleGroups: string[]
  equipment: string[]
  usageCount: number
  isPublic: boolean
}

interface TemplateCardProps {
  template: WorkoutTemplate
  onEdit: (template: WorkoutTemplate) => void
  onDelete: (id: string) => void
  onUse: (template: WorkoutTemplate) => void
  onDuplicate: (template: WorkoutTemplate) => void
}

const categoryLabels: Record<string, { label: string; color: string }> = {
  strength: { label: 'Síla', color: 'bg-red-100 text-red-700' },
  cardio: { label: 'Kardio', color: 'bg-blue-100 text-blue-700' },
  hiit: { label: 'HIIT', color: 'bg-orange-100 text-orange-700' },
  flexibility: { label: 'Flexibilita', color: 'bg-green-100 text-green-700' },
  mixed: { label: 'Mix', color: 'bg-purple-100 text-purple-700' },
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Začátečník', color: 'text-green-600' },
  intermediate: { label: 'Pokročilý', color: 'text-yellow-600' },
  advanced: { label: 'Expert', color: 'text-red-600' },
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onUse,
  onDuplicate,
}: TemplateCardProps) {
  const category = categoryLabels[template.category] || categoryLabels.mixed
  const difficulty = difficultyLabels[template.difficulty] || difficultyLabels.beginner

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${category.color}`}
              >
                {category.label}
              </span>
              <span className={`text-xs font-medium ${difficulty.color}`}>
                {difficulty.label}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            {template.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {template.description}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuItems align="end" className="w-40">
              <DropdownMenuItem>
                {({ active }) => (
                  <button
                    onClick={() => onEdit(template)}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    <Edit2 className="h-4 w-4" />
                    Upravit
                  </button>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {({ active }) => (
                  <button
                    onClick={() => onDuplicate(template)}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                  >
                    <Copy className="h-4 w-4" />
                    Duplikovat
                  </button>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {({ active }) => (
                  <button
                    onClick={() => {
                      if (confirm('Opravdu chcete smazat tuto šablonu?')) {
                        onDelete(template.id)
                      }
                    }}
                    className={`${
                      active ? 'bg-gray-50' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Smazat
                  </button>
                )}
              </DropdownMenuItem>
            </DropdownMenuItems>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 bg-gray-50 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{template.duration} min</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Dumbbell className="h-4 w-4" />
          <span>{template.exercises.length} cviků</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Users className="h-4 w-4" />
          <span>{template.usageCount}x</span>
        </div>
      </div>

      {/* Muscle Groups */}
      {template.muscleGroups.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {template.muscleGroups.slice(0, 4).map((group) => (
              <span
                key={group}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {group}
              </span>
            ))}
            {template.muscleGroups.length > 4 && (
              <span className="text-xs text-gray-400">
                +{template.muscleGroups.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Use Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => onUse(template)}
          className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          Použít šablonu
        </button>
      </div>
    </div>
  )
}
