'use client'

/**
 * Performance Form Component
 *
 * Form for creating and editing performances
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { TiptapEditor } from './TiptapEditor'
import { ImageUpload } from './ImageUpload'
import { SEOSection, SEOData } from './shared/SEOSection'

interface CrewMember {
  role: string
  name: string
}

interface TechnicalRequirement {
  requirement: string
  value: string
}

interface PerformanceFormProps {
  performance?: any // Existing performance data for edit mode
}

export function PerformanceForm({ performance }: PerformanceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState(performance?.title || '')
  const [slug, setSlug] = useState(performance?.slug || '')
  const [category, setCategory] = useState(performance?.category || 'theatre')
  const [status, setStatus] = useState(performance?.status || 'active')
  const [featured, setFeatured] = useState(performance?.featured || false)
  const [order, setOrder] = useState(performance?.order || 100)

  const [subtitle, setSubtitle] = useState(performance?.subtitle || '')
  const [excerpt, setExcerpt] = useState(performance?.excerpt || '')
  const [description, setDescription] = useState(performance?.description || null)

  const [duration, setDuration] = useState(performance?.duration || 45)
  const [ageFrom, setAgeFrom] = useState(performance?.ageRange?.from || 3)
  const [ageTo, setAgeTo] = useState(performance?.ageRange?.to || 99)

  const [featuredImageUrl, setFeaturedImageUrl] = useState(performance?.featuredImageUrl || '')
  const [featuredImageAlt, setFeaturedImageAlt] = useState(performance?.featuredImageAlt || '')
  const [videoUrl, setVideoUrl] = useState(performance?.videoUrl || '')
  const [posterUrl, setPosterUrl] = useState(performance?.posterUrl || '')
  const [galleryImages, setGalleryImages] = useState<string[]>(performance?.galleryImages || [])

  // Pricing
  const [price, setPrice] = useState(performance?.price || 0)

  // Production info
  const [premiere, setPremiere] = useState(performance?.premiere ? performance.premiere.split('T')[0] : '')
  const [crew, setCrew] = useState<CrewMember[]>(
    Array.isArray(performance?.crew) ? performance.crew : []
  )
  const [references, setReferences] = useState(performance?.references || '')

  // Technical requirements - handle both old object format and new array format
  const [technicalRequirements, setTechnicalRequirements] = useState<TechnicalRequirement[]>(() => {
    const tr = performance?.technicalRequirements
    if (!tr) return []
    if (Array.isArray(tr)) return tr
    // Convert old object format to new array format
    const result: TechnicalRequirement[] = []
    if (tr.space) result.push({ requirement: 'Prostor', value: tr.space })
    if (tr.electricity) result.push({ requirement: 'Elektřina', value: `${tr.electricity}V` })
    if (tr.water) result.push({ requirement: 'Voda', value: `${tr.water} litrů` })
    if (tr.other) result.push({ requirement: 'Ostatní', value: tr.other })
    return result
  })

  // SEO
  const [seo, setSeo] = useState<SEOData>({
    metaTitle: performance?.seo?.metaTitle || '',
    metaDescription: performance?.seo?.metaDescription || '',
    ogImageUrl: performance?.seo?.ogImageUrl || '',
  })

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!performance) {
      // Only auto-generate slug for new performances
      const newSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(newSlug)
    }
  }

  // Crew management
  const addCrewMember = () => {
    setCrew([...crew, { role: '', name: '' }])
  }

  const updateCrewMember = (index: number, field: keyof CrewMember, value: string) => {
    const newCrew = [...crew]
    newCrew[index] = { ...newCrew[index], [field]: value }
    setCrew(newCrew)
  }

  const removeCrewMember = (index: number) => {
    setCrew(crew.filter((_, i) => i !== index))
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
        featuredImageUrl,
        featuredImageAlt: featuredImageAlt || title,
        videoUrl: videoUrl || null,
        posterUrl: posterUrl || null,
        galleryImages: galleryImages.filter(img => img), // Filter out empty strings
        price: price || null,
        premiere: premiere ? new Date(premiere).toISOString() : null,
        crew: crew.filter(c => c.role && c.name), // Filter out incomplete entries
        references: references || null,
        technicalRequirements: technicalRequirements.filter(r => r.requirement), // Filter out empty
        seo: seo.metaTitle || seo.metaDescription || seo.ogImageUrl ? seo : null,
      }

      const url = performance
        ? `/api/admin/performances/${performance.id}`
        : '/api/admin/performances'

      const method = performance ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save performance')
      }

      router.push('/admin/performances')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save performance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
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
            <p className="mt-1 text-sm text-gray-500">Název, URL a kategorie inscenace</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Title */}
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

            {/* Slug */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Pouze malá písmena, číslice a pomlčky. Příklad: pysna-princezna
              </p>
            </div>

            {/* Category */}
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
                <option value="theatre">🎭 Divadelní představení</option>
                <option value="stilts">🚶 Představení na chůdách</option>
                <option value="music">🎵 Hudební program</option>
                <option value="special">⭐ Speciální program</option>
              </select>
            </div>

            {/* Status & Featured */}
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

            {/* Featured */}
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
                <p className="text-gray-500">Zobrazit na homepage a v doporučených</p>
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
            <p className="mt-1 text-sm text-gray-500">Popis a informace o inscenaci</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Subtitle */}
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

            {/* Excerpt */}
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

            {/* Description */}
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Technické detaily</h3>
            <p className="mt-1 text-sm text-gray-500">Délka, věková kategorie</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Duration */}
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
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Age Range */}
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
                    min="0"
                    max="99"
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
                    min="0"
                    max="99"
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
            <p className="mt-1 text-sm text-gray-500">Fixní cena za inscenaci</p>
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
                Základní cena za představení. Používá se při vytváření objednávek.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Info */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Produkce</h3>
            <p className="mt-1 text-sm text-gray-500">Premiéra a tvůrci</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Premiere */}
            <div>
              <label htmlFor="premiere" className="block text-sm font-medium text-gray-700">
                Datum premiéry
              </label>
              <input
                type="date"
                id="premiere"
                value={premiere}
                onChange={(e) => setPremiere(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Crew */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tvůrčí tým
              </label>
              {crew.map((member, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => updateCrewMember(index, 'role', e.target.value)}
                    placeholder="Role (např. Režie)"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateCrewMember(index, 'name', e.target.value)}
                    placeholder="Jméno"
                    className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeCrewMember(index)}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCrewMember}
                className="mt-2 inline-flex items-center gap-2 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Přidat člena týmu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Média</h3>
            <p className="mt-1 text-sm text-gray-500">Obrázky a video</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Featured Image */}
            <div>
              <ImageUpload
                label="Hlavní obrázek"
                value={featuredImageUrl}
                onChange={setFeaturedImageUrl}
                required
              />
            </div>

            {/* Featured Image Alt */}
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

            {/* Video URL */}
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700">
                Video URL (YouTube, Vimeo)
              </label>
              <input
                type="url"
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Poster URL */}
            <div>
              <ImageUpload
                label="Plakát"
                value={posterUrl}
                onChange={setPosterUrl}
              />
              <p className="mt-1 text-sm text-gray-500">
                Propagační plakát inscenace
              </p>
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

      {/* References */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Reference</h3>
            <p className="mt-1 text-sm text-gray-500">Recenze a ohlasy</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="references" className="block text-sm font-medium text-gray-700">
                Reference a citace
              </label>
              <textarea
                id="references"
                rows={4}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Citace z recenzí, ohlasy diváků..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
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
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ukládám...' : performance ? 'Uložit změny' : 'Vytvořit inscenaci'}
        </button>
      </div>
    </form>
  )
}
