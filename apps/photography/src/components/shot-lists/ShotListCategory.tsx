'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Edit2, Trash2, Check, X, Palette } from 'lucide-react'
import { ShotListItem, ShotItem } from './ShotListItem'
import { ShotCategory } from './ShotListEditor'

interface ShotListCategoryProps {
  category: ShotCategory
  onAddItem: () => void
  onUpdateCategory: (updates: Partial<ShotCategory>) => void
  onDeleteCategory: () => void
  onUpdateItem: (itemId: string, updates: Partial<ShotItem>) => void
  onDeleteItem: (itemId: string) => void
}

const colorOptions = [
  { value: 'bg-red-500', label: 'Červená' },
  { value: 'bg-orange-500', label: 'Oranžová' },
  { value: 'bg-amber-500', label: 'Žlutá' },
  { value: 'bg-green-500', label: 'Zelená' },
  { value: 'bg-teal-500', label: 'Tyrkysová' },
  { value: 'bg-blue-500', label: 'Modrá' },
  { value: 'bg-purple-500', label: 'Fialová' },
  { value: 'bg-pink-500', label: 'Růžová' },
  { value: 'bg-gray-500', label: 'Šedá' }
]

export function ShotListCategory({
  category,
  onAddItem,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateItem,
  onDeleteItem
}: ShotListCategoryProps) {
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState(category.name)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const { setNodeRef, isOver } = useDroppable({
    id: category.id
  })

  const handleSave = () => {
    onUpdateCategory({ name: editedName })
    setEditing(false)
  }

  const handleCancel = () => {
    setEditedName(category.name)
    setEditing(false)
  }

  const itemIds = category.items.map(item => item.id)

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-white rounded-lg border border-gray-200 overflow-hidden
        transition-colors
        ${isOver ? 'ring-2 ring-amber-500 ring-opacity-50' : ''}
      `}
    >
      {/* Header */}
      <div className={`${category.color} px-4 py-3`}>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="flex-1 px-2 py-1 text-sm bg-white/90 rounded border-0 focus:ring-2 focus:ring-white"
              autoFocus
            />
            <button
              onClick={handleCancel}
              className="p-1 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-white/80 hover:text-white"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{category.name}</h3>
              <span className="text-white/70 text-sm">
                ({category.items.length})
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Color Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-1 text-white/80 hover:text-white"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute right-0 top-8 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                    <div className="grid grid-cols-3 gap-1">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          onClick={() => {
                            onUpdateCategory({ color: color.value })
                            setShowColorPicker(false)
                          }}
                          className={`w-6 h-6 rounded ${color.value} ${
                            category.color === color.value
                              ? 'ring-2 ring-offset-2 ring-gray-400'
                              : ''
                          }`}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="p-1 text-white/80 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={onDeleteCategory}
                className="p-1 text-white/80 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-3 space-y-2 min-h-[100px]">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {category.items.map(item => (
            <ShotListItem
              key={item.id}
              item={item}
              onUpdate={(updates) => onUpdateItem(item.id, updates)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </SortableContext>

        {category.items.length === 0 && (
          <div className="text-center py-6 text-gray-400 text-sm">
            Přetáhněte sem záběry nebo přidejte nový
          </div>
        )}

        {/* Add Item Button */}
        <button
          onClick={onAddItem}
          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat záběr
        </button>
      </div>
    </div>
  )
}
