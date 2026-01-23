'use client'

/**
 * Page Form Component
 *
 * Simple form for creating and editing static pages
 * Only title, slug, status, and content with Tiptap editor
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from './TiptapEditor'

interface PageFormProps {
  page?: any
}

export function PageForm({ page }: PageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(page?.title || '')
  const [slug, setSlug] = useState(page?.slug || '')
  const [status, setStatus] = useState(page?.status || 'draft')
  const [content, setContent] = useState(page?.content || null)

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!page) {
      // Auto-generate slug from title for new pages
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
        status,
        content,
      }

      const url = page ? `/api/admin/pages/${page.id}` : '/api/admin/pages'
      const method = page ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save page')
      }

      router.push('/admin/pages')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="font-medium">Chyba při ukládání</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Základní informace</h3>
            <p className="mt-1 text-sm text-gray-500">Název a URL stránky</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Název stránky <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="např. O nás, Kontakt, ..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL adresa (slug) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  /
                </span>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  placeholder="o-nas"
                  className="flex-1 min-w-0 block w-full border border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Pouze malá písmena, číslice a pomlčky. Příklad: nas-pribeh, o-nas, kontakt
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Stav publikace
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="draft">📝 Koncept (neuveřejněno)</option>
                <option value="published">✓ Publikováno (veřejné)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Obsah stránky</h3>
            <p className="mt-1 text-sm text-gray-500">Hlavní obsah a text stránky</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div>
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="Napište obsah stránky..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Můžete používat formátování textu, nadpisy, seznamy a odkazy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Ukládám...' : page ? 'Uložit změny' : 'Vytvořit stránku'}
        </button>
      </div>
    </form>
  )
}
