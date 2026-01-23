'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from './TiptapEditor'
import { ImageUpload } from './ImageUpload'

interface ServiceFormProps {
  service?: any
}

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(service?.title || '')
  const [slug, setSlug] = useState(service?.slug || '')
  const [category, setCategory] = useState(service?.category || 'workshop')
  const [status, setStatus] = useState(service?.status || 'active')
  const [order, setOrder] = useState(service?.order || 100)
  const [excerpt, setExcerpt] = useState(service?.excerpt || '')
  const [description, setDescription] = useState(service?.description || null)
  const [priceFrom, setPriceFrom] = useState(service?.priceFrom || '')
  const [priceUnit, setPriceUnit] = useState(service?.priceUnit || 'per_hour')
  const [featuredImageUrl, setFeaturedImageUrl] = useState(service?.featuredImageUrl || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(service?.featuredImageAlt || '')

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!service) {
      const newSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(newSlug)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = {
        title,
        slug,
        category,
        status,
        order,
        excerpt: excerpt || null,
        description,
        priceFrom: priceFrom ? parseInt(priceFrom as string) : null,
        priceUnit: priceUnit || null,
        featuredImageUrl: featuredImageUrl || null,
        featuredImageAlt: featuredImageAlt || null,
      }

      const url = service ? `/api/admin/services/${service.id}` : '/api/admin/services'
      const method = service ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save service')
      }

      router.push('/admin/services')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Základní informace</h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Název <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL (slug) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="[a-z0-9-]+"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Kategorie <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="workshop">🎓 Workshop</option>
                <option value="consultation">💬 Konzultace</option>
                <option value="rental">🎭 Pronájem</option>
                <option value="other">📦 Ostatní</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Stav
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="active">Aktivní</option>
                  <option value="draft">Koncept</option>
                  <option value="archived">Archivováno</option>
                </select>
              </div>

              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                  Pořadí
                </label>
                <input
                  type="number"
                  id="order"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Obsah</h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Krátký popis
              </label>
              <textarea
                id="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailní popis
              </label>
              <TiptapEditor content={description} onChange={setDescription} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Cena</h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="priceFrom" className="block text-sm font-medium text-gray-700">
                Cena od (Kč)
              </label>
              <input
                type="number"
                id="priceFrom"
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>

            <div>
              <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-700">
                Jednotka
              </label>
              <select
                id="priceUnit"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="per_hour">za hodinu</option>
                <option value="per_day">za den</option>
                <option value="per_person">za osobu</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Obrázek (volitelný)</h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <ImageUpload
                label="Hlavní obrázek"
                value={featuredImageUrl}
                onChange={setFeaturedImageUrl}
              />
            </div>

            {featuredImageUrl && (
              <div>
                <label htmlFor="featuredImageAlt" className="block text-sm font-medium text-gray-700">
                  Alt text obrázku
                </label>
                <input
                  type="text"
                  id="featuredImageAlt"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                  placeholder={title}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Ukládám...' : service ? 'Uložit změny' : 'Vytvořit službu'}
        </button>
      </div>
    </form>
  )
}
