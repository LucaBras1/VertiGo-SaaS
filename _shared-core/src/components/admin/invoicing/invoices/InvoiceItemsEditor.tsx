'use client'

/**
 * Invoice Items Editor Component
 *
 * Dynamic editor for invoice line items
 */

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Package } from 'lucide-react'
import { UNIT_LABELS, VAT_RATES, calculateItemTotals } from '@/types/invoicing'

export interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  vatRate: number
  discount: number
  discountType: 'PERCENTAGE' | 'FIXED'
  totalWithoutVat: number
  vatAmount: number
  totalWithVat: number
}

interface InvoiceItemsEditorProps {
  items: InvoiceItem[]
  onChange: (items: InvoiceItem[]) => void
  currency?: string
  disabled?: boolean
}

const DEFAULT_ITEM: Omit<InvoiceItem, 'totalWithoutVat' | 'vatAmount' | 'totalWithVat'> = {
  description: '',
  quantity: 1,
  unit: 'ks',
  unitPrice: 0,
  vatRate: 0,
  discount: 0,
  discountType: 'PERCENTAGE',
}

export function InvoiceItemsEditor({
  items,
  onChange,
  currency = 'CZK',
  disabled = false,
}: InvoiceItemsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Calculate item totals
  const calculateTotals = (item: Partial<InvoiceItem>): InvoiceItem => {
    const quantity = item.quantity || 0
    const unitPrice = item.unitPrice || 0
    const vatRate = item.vatRate || 0
    const discount = item.discount || 0
    const discountType = item.discountType || 'PERCENTAGE'

    let subtotal = quantity * unitPrice

    // Apply discount
    if (discount > 0) {
      if (discountType === 'PERCENTAGE') {
        subtotal = subtotal * (1 - discount / 100)
      } else {
        subtotal = subtotal - discount
      }
    }

    const vatAmount = subtotal * (vatRate / 100)
    const totalWithVat = subtotal + vatAmount

    return {
      ...DEFAULT_ITEM,
      ...item,
      totalWithoutVat: Math.round(subtotal * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalWithVat: Math.round(totalWithVat * 100) / 100,
    } as InvoiceItem
  }

  // Add new item
  const addItem = () => {
    const newItem = calculateTotals(DEFAULT_ITEM)
    onChange([...items, newItem])
  }

  // Update item
  const updateItem = (index: number, field: keyof InvoiceItem, value: unknown) => {
    const updatedItems = [...items]
    updatedItems[index] = calculateTotals({
      ...updatedItems[index],
      [field]: value,
    })
    onChange(updatedItems)
  }

  // Remove item
  const removeItem = (index: number) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== index))
  }

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const [draggedItem] = newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    onChange(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Calculate totals
  const totals = items.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.totalWithoutVat,
      vat: acc.vat + item.vatAmount,
      total: acc.total + item.totalWithVat,
    }),
    { subtotal: 0, vat: 0, total: 0 }
  )

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Items List */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              {!disabled && (
                <div className="cursor-move pt-2 text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 space-y-3">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Popis položky
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    disabled={disabled}
                    placeholder="Název služby nebo produktu"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>

                {/* Row 2: Quantity, Unit, Price, VAT */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Množství
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Jednotka
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      {Object.entries(UNIT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cena za jednotku
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      min={0}
                      step={0.01}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  {/* VAT Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      DPH
                    </label>
                    <select
                      value={item.vatRate}
                      onChange={(e) => updateItem(index, 'vatRate', parseFloat(e.target.value))}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      {VAT_RATES.map((rate) => (
                        <option key={rate.value} value={rate.value}>
                          {rate.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Discount (optional) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sleva
                      </label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        disabled={disabled}
                        min={0}
                        step={0.01}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                    <select
                      value={item.discountType}
                      onChange={(e) => updateItem(index, 'discountType', e.target.value)}
                      disabled={disabled}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="PERCENTAGE">%</option>
                      <option value="FIXED">{currency}</option>
                    </select>
                  </div>

                  {/* Totals Display */}
                  <div className="col-span-2 flex items-end justify-end gap-4 text-sm">
                    <div className="text-right">
                      <span className="text-gray-500 dark:text-gray-400">Bez DPH:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.totalWithoutVat)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 dark:text-gray-400">S DPH:</span>
                      <span className="ml-2 font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.totalWithVat)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              {!disabled && items.length > 1 && (
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Odstranit položku"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      {!disabled && (
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Přidat položku
        </button>
      )}

      {/* Totals Summary */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center justify-between w-full max-w-xs">
            <span className="text-gray-600 dark:text-gray-400">Základ:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between w-full max-w-xs">
            <span className="text-gray-600 dark:text-gray-400">DPH:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totals.vat)}
            </span>
          </div>
          <div className="flex items-center justify-between w-full max-w-xs pt-2 border-t border-gray-300 dark:border-gray-600">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Celkem:</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totals.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
