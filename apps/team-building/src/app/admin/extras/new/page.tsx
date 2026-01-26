/**
 * New Extra Page
 * Create a new extra service
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function NewExtraPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'facilitation',
    status: 'active',
    excerpt: '',
    priceFrom: '',
    priceUnit: 'per_session',
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.slug) {
      toast.error('Vyplňte název služby')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/extras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceFrom: formData.priceFrom ? parseInt(formData.priceFrom) : undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Doplňková služba byla vytvořena')
        router.push('/admin/extras')
      } else {
        toast.error(data.error || 'Nepodařilo se vytvořit službu')
      }
    } catch (error) {
      toast.error('Chyba při vytváření služby')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/extras">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nová doplňková služba</h1>
          <p className="text-gray-600">Vytvořte novou doplňkovou službu</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Základní informace</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Název služby *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="input-field"
                placeholder="např. Profesionální facilitace"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="input-field"
                placeholder="profesionalni-facilitace"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kategorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                  required
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
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
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
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="input-field"
                rows={3}
                placeholder="Stručný popis služby pro zobrazení v přehledu..."
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
                value={formData.priceFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, priceFrom: e.target.value }))}
                className="input-field"
                placeholder="např. 5000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jednotka ceny
              </label>
              <select
                value={formData.priceUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, priceUnit: e.target.value }))}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/extras">
            <Button variant="outline">Zrušit</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Vytvořit službu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
