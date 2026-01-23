'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, User } from 'lucide-react'
import { TiptapEditor } from './TiptapEditor'
import { ImageUpload } from './ImageUpload'
import { SEOSection, SEOData } from './shared/SEOSection'

const AVAILABLE_CATEGORIES = [
  { value: 'news', label: 'Aktuality' },
  { value: 'events', label: 'Události' },
  { value: 'performances', label: 'Inscenace' },
  { value: 'backstage', label: 'Zákulisí' },
  { value: 'reviews', label: 'Recenze' },
  { value: 'interviews', label: 'Rozhovory' },
]

interface PostFormProps {
  post?: any
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [featured, setFeatured] = useState(post?.featured || false)
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [content, setContent] = useState(post?.content || null)
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featuredImageUrl || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt || '')
  const [author, setAuthor] = useState(post?.author || '')
  const [categories, setCategories] = useState<string[]>(post?.categories || [])

  // SEO
  const [seo, setSeo] = useState<SEOData>({
    metaTitle: post?.seo?.metaTitle || '',
    metaDescription: post?.seo?.metaDescription || '',
    ogImageUrl: post?.seo?.ogImageUrl || '',
  })

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!post) {
      const newSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(newSlug)
    }
  }

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category))
    } else {
      setCategories([...categories, category])
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
        featured,
        excerpt: excerpt || null,
        content,
        featuredImageUrl: featuredImageUrl || null,
        featuredImageAlt: featuredImageAlt || null,
        author: author || null,
        categories: categories.length > 0 ? categories : null,
        seo: seo.metaTitle || seo.metaDescription || seo.ogImageUrl ? seo : null,
      }

      const url = post ? `/api/admin/posts/${post.id}` : '/api/admin/posts'
      const method = post ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save post')
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post')
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
                  <option value="draft">Koncept</option>
                  <option value="published">Publikováno</option>
                </select>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="featured" className="font-medium text-gray-700">
                  Zvýrazněný příspěvek
                </label>
              </div>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Autor
              </label>
              <div className="mt-1 flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Jméno autora"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => toggleCategory(cat.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      categories.includes(cat.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Kliknutím vyberte nebo odeberte kategorie
              </p>
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
                Perex
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
                Obsah příspěvku
              </label>
              <TiptapEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Titulní obrázek</h3>
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

      {/* SEO */}
      <SEOSection
        seo={seo}
        onChange={setSeo}
        defaultTitle={title}
        defaultDescription={excerpt}
      />

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
          {loading ? 'Ukládám...' : post ? 'Uložit změny' : 'Vytvořit příspěvek'}
        </button>
      </div>
    </form>
  )
}
