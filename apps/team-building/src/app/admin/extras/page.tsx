/**
 * Extras List Page
 * Admin page for managing extras (services like facilitation, catering, etc.)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

interface Extra {
  id: string
  title: string
  slug: string
  category: string
  status: string
  priceFrom: number | null
  priceUnit: string | null
  excerpt: string | null
  _count?: {
    orderItems: number
  }
}

const categoryColors: Record<string, string> = {
  facilitation: 'bg-blue-100 text-blue-700',
  catering: 'bg-orange-100 text-orange-700',
  transport: 'bg-purple-100 text-purple-700',
  equipment: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-700',
}

const categoryLabels: Record<string, string> = {
  facilitation: 'Facilitace',
  catering: 'Catering',
  transport: 'Doprava',
  equipment: 'Vybavení',
  other: 'Ostatní',
}

const priceUnitLabels: Record<string, string> = {
  per_session: '/ workshop',
  per_person: '/ osoba',
  per_hour: '/ hodina',
  per_day: '/ den',
}

export default function ExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchExtras = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/extras?${params}`)
      const data = await response.json()

      if (data.success) {
        setExtras(data.data)
      } else {
        toast.error('Nepodařilo se načíst doplňkové služby')
      }
    } catch (error) {
      toast.error('Chyba při načítání doplňkových služeb')
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    fetchExtras()
  }, [fetchExtras])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/extras/${deleteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Doplňková služba byla smazána')
        fetchExtras()
      } else {
        toast.error(data.error || 'Nepodařilo se smazat doplňkovou službu')
      }
    } catch (error) {
      toast.error('Chyba při mazání doplňkové služby')
    } finally {
      setDeleteId(null)
    }
  }

  const filteredExtras = extras.filter(extra => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      extra.title.toLowerCase().includes(searchLower) ||
      extra.excerpt?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doplňkové služby</h1>
          <p className="text-gray-600 mt-2">
            Facilitace, catering, doprava a další služby
          </p>
        </div>
        <Link href="/admin/extras/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Nová služba
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Hledat služby..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Všechny kategorie</option>
              <option value="facilitation">Facilitace</option>
              <option value="catering">Catering</option>
              <option value="transport">Doprava</option>
              <option value="equipment">Vybavení</option>
              <option value="other">Ostatní</option>
            </select>
          </div>
        </div>
      </div>

      {/* Extras List */}
      {filteredExtras.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Žádné doplňkové služby
          </h3>
          <p className="text-gray-600 mb-6">
            Zatím nemáte žádné doplňkové služby. Vytvořte první!
          </p>
          <Link href="/admin/extras/new">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Vytvořit službu
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExtras.map((extra) => (
            <div
              key={extra.id}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    categoryColors[extra.category]
                  }`}
                >
                  {categoryLabels[extra.category]}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    extra.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {extra.status === 'active' ? 'Aktivní' : 'Neaktivní'}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{extra.title}</h3>

              {extra.excerpt && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {extra.excerpt}
                </p>
              )}

              {extra.priceFrom && (
                <div className="flex items-center gap-1 text-sm text-gray-700 mb-4">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">
                    od {extra.priceFrom.toLocaleString('cs-CZ')} Kč
                  </span>
                  {extra.priceUnit && (
                    <span className="text-gray-500">
                      {priceUnitLabels[extra.priceUnit]}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Link href={`/admin/extras/${extra.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Upravit
                  </Button>
                </Link>
                {(!extra._count || extra._count.orderItems === 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(extra.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Smazat doplňkovou službu"
        message="Opravdu chcete smazat tuto doplňkovou službu? Tato akce je nevratná."
        confirmText="Smazat"
        variant="danger"
      />
    </div>
  )
}
