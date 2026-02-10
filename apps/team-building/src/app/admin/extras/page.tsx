/**
 * Extras List Page
 * Admin page for managing extras (services like facilitation, catering, etc.)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, Plus, Search, Edit, Trash2, DollarSign } from 'lucide-react'
import { ListPageHeader, SearchFilterBar, ActionButtons, StatusBadge } from '@vertigo/admin'
import { Button, Card, ConfirmDialog, staggerContainer, staggerItem } from '@vertigo/ui'
import toast from 'react-hot-toast'

interface Extra {
  id: string; title: string; slug: string; category: string; status: string
  priceFrom: number | null; priceUnit: string | null; excerpt: string | null
  _count?: { orderItems: number }
}

const categoryLabels: Record<string, string> = {
  facilitation: 'Facilitace', catering: 'Catering', transport: 'Doprava',
  equipment: 'Vybavení', other: 'Ostatní',
}

const priceUnitLabels: Record<string, string> = {
  per_session: '/ workshop', per_person: '/ osoba', per_hour: '/ hodina', per_day: '/ den',
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
      if (data.success) { setExtras(data.data) }
      else { toast.error('Nepodařilo se načíst doplňkové služby') }
    } catch (error) { toast.error('Chyba při načítání doplňkových služeb') }
    finally { setIsLoading(false) }
  }, [categoryFilter])

  useEffect(() => { fetchExtras() }, [fetchExtras])

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const response = await fetch(`/api/extras/${deleteId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) { toast.success('Doplňková služba byla smazána'); fetchExtras() }
      else { toast.error(data.error || 'Nepodařilo se smazat doplňkovou službu') }
    } catch (error) { toast.error('Chyba při mazání doplňkové služby') }
    finally { setDeleteId(null) }
  }

  const filteredExtras = extras.filter(extra => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return extra.title.toLowerCase().includes(searchLower) ||
      extra.excerpt?.toLowerCase().includes(searchLower)
  })

  if (isLoading) {
    return (<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div></div>)
  }
  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Doplňkové služby"
        description="Facilitace, catering, doprava a další služby"
        actionLabel="Nová služba"
        actionHref="/admin/extras/new"
        actionIcon={Plus}
      />

      <SearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Hledat služby..."
        filters={[{
          label: 'Kategorie', value: categoryFilter,
          options: [
            { label: 'Všechny kategorie', value: '' },
            { label: 'Facilitace', value: 'facilitation' },
            { label: 'Catering', value: 'catering' },
            { label: 'Doprava', value: 'transport' },
            { label: 'Vybavení', value: 'equipment' },
            { label: 'Ostatní', value: 'other' },
          ], onChange: setCategoryFilter,
        }]}
      />

      {filteredExtras.length === 0 ? (
        <Card className="text-center p-12">
          <Package className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Žádné doplňkové služby</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Zatím nemáte žádné doplňkové služby.</p>
          <Link href="/admin/extras/new"><Button><Plus className="w-5 h-5" />Vytvořit službu</Button></Link>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filteredExtras.map((extra) => (
            <motion.div key={extra.id} variants={staggerItem}>
              <Card className="p-5" variant="interactive">
                <div className="flex items-start justify-between mb-3">
                  <StatusBadge status={extra.category} />
                  <StatusBadge status={extra.status === 'active' ? 'active' : 'inactive'} />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">{extra.title}</h3>
                {extra.excerpt && (<p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">{extra.excerpt}</p>)}
                {extra.priceFrom && (
                  <div className="flex items-center gap-1 text-sm text-neutral-700 dark:text-neutral-300 mb-4">
                    <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
                    <span className="font-semibold">od {extra.priceFrom.toLocaleString('cs-CZ')} Kč</span>
                    {extra.priceUnit && (<span className="text-neutral-400">{priceUnitLabels[extra.priceUnit]}</span>)}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <ActionButtons
                    editHref={`/admin/extras/${extra.id}`}
                    onDelete={(!extra._count || extra._count.orderItems === 0) ? () => setDeleteId(extra.id) : undefined}
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Smazat doplňkovou službu"
        description="Opravdu chcete smazat tuto doplňkovou službu? Tato akce je nevratná."
        confirmLabel="Smazat"
        variant="danger"
      />
    </div>
  )
}
