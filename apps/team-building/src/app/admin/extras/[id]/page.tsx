/**
 * Extra Detail Page
 * View and edit extra service details
 */

'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

interface Extra {
  id: string
  title: string
  slug: string
  category: string
  status: string
  order: number
  excerpt: string | null
  description: any
  priceFrom: number | null
  priceUnit: string | null
  featuredImageUrl: string | null
  _count?: {
    orderItems: number
  }
}

export default function ExtraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [extra, setExtra] = useState<Extra | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editData, setEditData] = useState({
    title: '',
    slug: '',
    category: 'facilitation',
    status: 'active',
    excerpt: '',
    priceFrom: '',
    priceUnit: 'per_session',
  })

  const fetchExtra = useCallback(async () => {
    try {
      const response = await fetch(`/api/extras/${id}`)
      const data = await response.json()

      if (data.success) {
        setExtra(data.data)
        setEditData({
          title: data.data.title,
          slug: data.data.slug,
          category: data.data.category,
          status: data.data.status,
          excerpt: data.data.excerpt || '',
          priceFrom: data.data.priceFrom?.toString() || '',
          priceUnit: data.data.priceUnit || 'per_session',
        })
      } else {
        toast.error('Služba nebyla nalezena')
        router.push('/admin/extras')
      }
    } catch (error) {
      toast.error('Chyba při načítání služby')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchExtra()
  }, [fetchExtra])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/extras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          priceFrom: editData.priceFrom ? parseInt(editData.priceFrom) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Služba byla uložena')
        fetchExtra()
      } else {
        toast.error(data.error || 'Nepodařilo se uložit službu')
      }
    } catch (error) {
      toast.error('Chyba při ukládání')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/extras/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Služba byla smazána')
        router.push('/admin/extras')
      } else {
        toast.error(data.error || 'Nepodařilo se smazat službu')
      }
    } catch (error) {
      toast.error('Chyba při mazání')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!extra) {
    return null
  }

  const canDelete = !extra._count || extra._count.orderItems === 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/extras">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{extra.title}</h1>
            <p className="text-gray-600">Úprava doplňkové služby</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Smazat
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Uložit změny
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Základní informace</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Název služby
              </label>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL slug
              </label>
              <input
                type="text"
                value={editData.slug}
                onChange={(e) => setEditData(prev => ({ ...prev, slug: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategorie
                </label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                >
                  <option value="facilitation">Facilitace</option>
                  <option value="catering">Catering</option>
                  <option value="transport">Doprava</option>
                  <option value="equipment">Vybavení</option>
                  <option value="other">Ostatní</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stav
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="active">Aktivní</option>
                  <option value="inactive">Neaktivní</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Krátký popis
              </label>
              <textarea
                value={editData.excerpt}
                onChange={(e) => setEditData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="input-field"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Cena</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cena od (Kč)
              </label>
              <input
                type="number"
                value={editData.priceFrom}
                onChange={(e) => setEditData(prev => ({ ...prev, priceFrom: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jednotka ceny
              </label>
              <select
                value={editData.priceUnit}
                onChange={(e) => setEditData(prev => ({ ...prev, priceUnit: e.target.value }))}
                className="input-field"
              >
                <option value="per_session">Za workshop</option>
                <option value="per_person">Za osobu</option>
                <option value="per_hour">Za hodinu</option>
                <option value="per_day">Za den</option>
              </select>
            </div>
          </div>
        </div>

        {extra._count && extra._count.orderItems > 0 && (
          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              Tato služba je použita v {extra._count.orderItems} objednávkách a nelze ji smazat.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Smazat doplňkovou službu"
        message="Opravdu chcete smazat tuto doplňkovou službu? Tato akce je nevratná."
        confirmText="Smazat"
        variant="danger"
      />
    </div>
  )
}
