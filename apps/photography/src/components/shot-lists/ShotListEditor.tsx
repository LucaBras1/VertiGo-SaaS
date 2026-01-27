'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { Plus, Save, FileDown, Sparkles, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { ShotListCategory } from './ShotListCategory'
import { ShotListItem, ShotItem } from './ShotListItem'
import { ShotListTemplates } from './ShotListTemplates'

export interface ShotCategory {
  id: string
  name: string
  color: string
  items: ShotItem[]
}

interface ShotListEditorProps {
  initialCategories?: ShotCategory[]
  packageId?: string
  onSave?: (categories: ShotCategory[]) => Promise<void>
  onGenerateAI?: () => void
}

const defaultCategories: ShotCategory[] = [
  {
    id: 'getting-ready',
    name: 'Přípravy',
    color: 'bg-pink-500',
    items: []
  },
  {
    id: 'ceremony',
    name: 'Obřad',
    color: 'bg-purple-500',
    items: []
  },
  {
    id: 'portraits',
    name: 'Portréty',
    color: 'bg-blue-500',
    items: []
  },
  {
    id: 'reception',
    name: 'Hostina',
    color: 'bg-green-500',
    items: []
  },
  {
    id: 'details',
    name: 'Detaily',
    color: 'bg-amber-500',
    items: []
  }
]

export function ShotListEditor({
  initialCategories = defaultCategories,
  packageId,
  onSave,
  onGenerateAI
}: ShotListEditorProps) {
  const [categories, setCategories] = useState<ShotCategory[]>(initialCategories)
  const [activeItem, setActiveItem] = useState<ShotItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string

    // Find the item being dragged
    for (const category of categories) {
      const item = category.items.find(i => i.id === activeId)
      if (item) {
        setActiveItem(item)
        setActiveCategory(category.id)
        break
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveItem(null)
      setActiveCategory(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find source category and item
    let sourceCategory: ShotCategory | null = null
    let sourceIndex = -1

    for (const cat of categories) {
      const idx = cat.items.findIndex(i => i.id === activeId)
      if (idx !== -1) {
        sourceCategory = cat
        sourceIndex = idx
        break
      }
    }

    if (!sourceCategory) {
      setActiveItem(null)
      setActiveCategory(null)
      return
    }

    // Check if dropping on a category
    const targetCategory = categories.find(c => c.id === overId)
    if (targetCategory) {
      // Move item to new category
      if (sourceCategory.id !== targetCategory.id) {
        setCategories(prev => {
          const newCategories = [...prev]
          const srcCatIdx = newCategories.findIndex(c => c.id === sourceCategory!.id)
          const tgtCatIdx = newCategories.findIndex(c => c.id === targetCategory.id)

          const [movedItem] = newCategories[srcCatIdx].items.splice(sourceIndex, 1)
          newCategories[tgtCatIdx].items.push(movedItem)

          return newCategories
        })
        setHasChanges(true)
      }
    } else {
      // Find target item's category
      let targetCat: ShotCategory | null = null
      let targetIndex = -1

      for (const cat of categories) {
        const idx = cat.items.findIndex(i => i.id === overId)
        if (idx !== -1) {
          targetCat = cat
          targetIndex = idx
          break
        }
      }

      if (targetCat && sourceCategory.id === targetCat.id) {
        // Reorder within same category
        setCategories(prev => {
          const newCategories = [...prev]
          const catIdx = newCategories.findIndex(c => c.id === sourceCategory!.id)
          newCategories[catIdx].items = arrayMove(
            newCategories[catIdx].items,
            sourceIndex,
            targetIndex
          )
          return newCategories
        })
        setHasChanges(true)
      } else if (targetCat) {
        // Move to different category at specific position
        setCategories(prev => {
          const newCategories = [...prev]
          const srcCatIdx = newCategories.findIndex(c => c.id === sourceCategory!.id)
          const tgtCatIdx = newCategories.findIndex(c => c.id === targetCat!.id)

          const [movedItem] = newCategories[srcCatIdx].items.splice(sourceIndex, 1)
          newCategories[tgtCatIdx].items.splice(targetIndex, 0, movedItem)

          return newCategories
        })
        setHasChanges(true)
      }
    }

    setActiveItem(null)
    setActiveCategory(null)
  }

  const addItem = (categoryId: string) => {
    const newItem: ShotItem = {
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      priority: 'nice-to-have',
      timeSlot: '',
      notes: ''
    }

    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      )
    )
    setHasChanges(true)
  }

  const updateItem = (categoryId: string, itemId: string, updates: Partial<ShotItem>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : cat
      )
    )
    setHasChanges(true)
  }

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      )
    )
    setHasChanges(true)
  }

  const addCategory = () => {
    const newCategory: ShotCategory = {
      id: `category-${Date.now()}`,
      name: 'Nová kategorie',
      color: 'bg-gray-500',
      items: []
    }
    setCategories(prev => [...prev, newCategory])
    setHasChanges(true)
  }

  const updateCategory = (categoryId: string, updates: Partial<ShotCategory>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === categoryId ? { ...cat, ...updates } : cat))
    )
    setHasChanges(true)
  }

  const deleteCategory = (categoryId: string) => {
    if (!confirm('Smazat kategorii včetně všech záběrů?')) return
    setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(categories)
      setHasChanges(false)
    } catch (err) {
      alert('Nepodařilo se uložit shot list')
    } finally {
      setSaving(false)
    }
  }

  const loadTemplate = (template: ShotCategory[]) => {
    setCategories(template)
    setShowTemplates(false)
    setHasChanges(true)
  }

  const exportToPDF = () => {
    // Create printable view
    const printContent = categories
      .map(cat => {
        const itemsList = cat.items
          .map((item, idx) => {
            const priority = item.priority === 'must-have' ? '★' : item.priority === 'nice-to-have' ? '○' : '◇'
            return `${idx + 1}. ${priority} ${item.title}${item.timeSlot ? ` (${item.timeSlot})` : ''}${item.notes ? `\n   Poznámka: ${item.notes}` : ''}`
          })
          .join('\n')
        return `\n=== ${cat.name.toUpperCase()} ===\n${itemsList || '(žádné záběry)'}`
      })
      .join('\n\n')

    const blob = new Blob([`SHOT LIST\n${'='.repeat(50)}${printContent}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shot-list.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalShots = categories.reduce((sum, cat) => sum + cat.items.length, 0)
  const mustHaveCount = categories.reduce(
    (sum, cat) => sum + cat.items.filter(i => i.priority === 'must-have').length,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Shot List Editor</h2>
          <p className="text-sm text-gray-600">
            {totalShots} záběrů ({mustHaveCount} povinných)
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            Šablony
          </Button>
          {onGenerateAI && (
            <Button variant="outline" onClick={onGenerateAI}>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generování
            </Button>
          )}
          <Button variant="outline" onClick={exportToPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Ukládání...' : 'Uložit'}
          </Button>
        </div>
      </div>

      {/* Categories with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map(category => (
            <ShotListCategory
              key={category.id}
              category={category}
              onAddItem={() => addItem(category.id)}
              onUpdateCategory={(updates) => updateCategory(category.id, updates)}
              onDeleteCategory={() => deleteCategory(category.id)}
              onUpdateItem={(itemId, updates) => updateItem(category.id, itemId, updates)}
              onDeleteItem={(itemId) => deleteItem(category.id, itemId)}
            />
          ))}

          {/* Add Category Button */}
          <button
            onClick={addCategory}
            className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-colors"
          >
            <Plus className="w-6 h-6 mr-2" />
            Přidat kategorii
          </button>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg opacity-90">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{activeItem.title || 'Nový záběr'}</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Templates Modal */}
      {showTemplates && (
        <ShotListTemplates
          onSelect={loadTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}
