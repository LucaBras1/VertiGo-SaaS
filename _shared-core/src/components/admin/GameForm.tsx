'use client'

/**
 * Game Form Component
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { TiptapEditor } from './TiptapEditor'
import { ImageUpload } from './ImageUpload'
import { SEOSection, SEOData } from './shared/SEOSection'
import { validateGameForm } from '@/lib/validations/game'

interface TechnicalRequirement {
  requirement: string
  value: string
}

interface GameFormProps {
  game?: any
}

export function GameForm({ game }: GameFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [title, setTitle] = useState(game?.title || '')
  const [slug, setSlug] = useState(game?.slug || '')
  const [category, setCategory] = useState(game?.category || 'skill')
  const [status, setStatus] = useState(game?.status || 'active')
  const [featured, setFeatured] = useState(game?.featured || false)
  const [order, setOrder] = useState(game?.order || 100)

  const [subtitle, setSubtitle] = useState(game?.subtitle || '')
  const [excerpt, setExcerpt] = useState(game?.excerpt || '')
  const [description, setDescription] = useState(game?.description || null)

  const [duration, setDuration] = useState(game?.duration || 30)
  const [ageFrom, setAgeFrom] = useState(game?.ageRange?.from || 3)
  const [ageTo, setAgeTo] = useState(game?.ageRange?.to || 99)
  const [minPlayers, setMinPlayers] = useState(game?.minPlayers || 1)
  const [maxPlayers, setMaxPlayers] = useState(game?.maxPlayers || 30)

  const [featuredImageUrl, setFeaturedImageUrl] = useState(game?.featuredImageUrl || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(game?.featuredImageAlt || '')
  const [galleryImages, setGalleryImages] = useState<string[]>(game?.galleryImages || [])

  // Pricing
  const [price, setPrice] = useState(game?.price || 0)

  // Technical requirements
  const [technicalRequirements, setTechnicalRequirements] = useState<TechnicalRequirement[]>(
    game?.technicalRequirements || []
  )

  // SEO
  const [seo, setSeo] = useState<SEOData>({
    metaTitle: game?.seo?.metaTitle || '',
    metaDescription: game?.seo?.metaDescription || '',
    ogImageUrl: game?.seo?.ogImageUrl || '',
  })

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!game) {
      const newSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(newSlug)
    }
  }

  // Technical requirements management
  const addTechnicalRequirement = () => {
    setTechnicalRequirements([...technicalRequirements, { requirement: '', value: '' }])
  }

  const updateTechnicalRequirement = (index: number, field: keyof TechnicalRequirement, value: string) => {
    const newReqs = [...technicalRequirements]
    newReqs[index] = { ...newReqs[index], [field]: value }
    setTechnicalRequirements(newReqs)
  }

  const removeTechnicalRequirement = (index: number) => {
    setTechnicalRequirements(technicalRequirements.filter((_, i) => i !== index))
  }

  // Gallery management
  const addGalleryImage = () => {
    setGalleryImages([...galleryImages, ''])
  }

  const updateGalleryImage = (index: number, value: string) => {
    const newImages = [...galleryImages]
    newImages[index] = value
    setGalleryImages(newImages)
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validate form data
    const validationErrors = validateGameForm({
      title,
      slug,
      category: category as 'skill' | 'team' | 'creative' | 'active',
      status: status as 'active' | 'draft' | 'archived',
      duration,
      ageFrom,
      ageTo,
      minPlayers,
      maxPlayers,
      featuredImageUrl,
      excerpt,
      price,
    })

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setError('Opravte prosím chyby ve formuláři')
      return
    }

    setLoading(true)

    try {
      const data = {
        title,
        slug,
        category,
        status,
        featured,
        order,
        subtitle: subtitle || null,
        excerpt: excerpt || null,
        description,
        duration,
        ageRange: { from: ageFrom, to: ageTo },
        minPlayers: minPlayers || null,
        maxPlayers: maxPlayers || null,
        featuredImageUrl,
        featuredImageAlt: featuredImageAlt || title,
        galleryImages: galleryImages.filter(img => img),
        price: price || null,
        technicalRequirements: technicalRequirements.filter(r => r.requirement),
        seo: seo.metaTitle || seo.metaDescription || seo.ogImageUrl ? seo : null,
      }

      const url = game ? `/api/admin/games/${game.id}` : '/api/admin/games'
      const method = game ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save game')
      }

      router.push('/admin/games')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game')
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

      {/* Basic Info */}
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
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.title && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.title}
                </p>
              )}
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
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                  fieldErrors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.slug && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.slug}
                </p>
              )}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="skill">🎯 Dovednostní hry</option>
                <option value="team">👥 Týmové hry</option>
                <option value="creative">🎨 Tvořivé aktivity</option>
                <option value="active">🏃 Pohybové hry</option>
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
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
                  Doporučujeme
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Obsah</h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
                Podtitul
              </label>
              <input
                type="text"
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                Krátký popis
              </label>
              <textarea
                id="excerpt"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

      {/* Technical Details */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Parametry hry</h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Délka (minuty) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                required
                min="1"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.duration && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.duration}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Věková kategorie
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ageFrom" className="block text-xs text-gray-500">
                    Od (let)
                  </label>
                  <input
                    type="number"
                    id="ageFrom"
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="ageTo" className="block text-xs text-gray-500">
                    Do (let)
                  </label>
                  <input
                    type="number"
                    id="ageTo"
                    value={ageTo}
                    onChange={(e) => setAgeTo(parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Počet hráčů
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minPlayers" className="block text-xs text-gray-500">
                    Minimálně
                  </label>
                  <input
                    type="number"
                    id="minPlayers"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="maxPlayers" className="block text-xs text-gray-500">
                    Maximálně
                  </label>
                  <input
                    type="number"
                    id="maxPlayers"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Cena</h3>
            <p className="mt-1 text-sm text-gray-500">Fixní cena za hru</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Cena (Kč)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Základní cena za hru. Používá se při vytváření objednávek.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Média</h3>
            <p className="mt-1 text-sm text-gray-500">Obrázky</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <ImageUpload
                label="Hlavní obrázek"
                value={featuredImageUrl}
                onChange={setFeaturedImageUrl}
                required
              />
              {fieldErrors.featuredImageUrl && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.featuredImageUrl}
                </p>
              )}
            </div>

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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Galerie obrázků
              </label>
              {galleryImages.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateGalleryImage(index, e.target.value)}
                    placeholder="URL obrázku"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGalleryImage}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Přidat obrázek
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Technické požadavky</h3>
            <p className="mt-1 text-sm text-gray-500">Požadavky na prostor a vybavení</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {technicalRequirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req.requirement}
                  onChange={(e) => updateTechnicalRequirement(index, 'requirement', e.target.value)}
                  placeholder="Požadavek (např. Prostor)"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <input
                  type="text"
                  value={req.value}
                  onChange={(e) => updateTechnicalRequirement(index, 'value', e.target.value)}
                  placeholder="Hodnota (např. min. 4x4m)"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeTechnicalRequirement(index)}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTechnicalRequirement}
              className="mt-2 inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Přidat požadavek
            </button>
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

      {/* Submit */}
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
          {loading ? 'Ukládám...' : game ? 'Uložit změny' : 'Vytvořit hru'}
        </button>
      </div>
    </form>
  )
}
