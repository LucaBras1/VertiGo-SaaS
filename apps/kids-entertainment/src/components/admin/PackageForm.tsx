/**
 * Package Form Component
 * Form for creating/editing packages with age groups, inclusions, pricing, safety
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface PackageFormProps {
  initialData?: any
  packageId?: string
}

export default function PackageForm({ initialData, packageId }: PackageFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || 'full_party',
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    duration: initialData?.duration || 120,
    ageGroupMin: initialData?.ageGroupMin || 3,
    ageGroupMax: initialData?.ageGroupMax || 12,
    ageGroups: initialData?.ageGroups || [],
    maxChildren: initialData?.maxChildren || 15,
    themeName: initialData?.themeName || '',
    includesCharacter: initialData?.includesCharacter || false,
    characterName: initialData?.characterName || '',
    includesCake: initialData?.includesCake || false,
    includesGoodybags: initialData?.includesGoodybags || false,
    includesDecoration: initialData?.includesDecoration || false,
    includesPhotos: initialData?.includesPhotos || false,
    safetyNotes: initialData?.safetyNotes || '',
    allergens: initialData?.allergens || [],
    indoorOutdoor: initialData?.indoorOutdoor || 'both',
    price: initialData?.price || 0,
    pricePerChild: initialData?.pricePerChild || 0,
    featuredImageUrl: initialData?.featuredImageUrl || '',
    featuredImageAlt: initialData?.featuredImageAlt || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = packageId ? `/api/packages/${packageId}` : '/api/packages'
      const method = packageId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/packages')
        router.refresh()
      } else {
        alert('Chyba při ukládání balíčku')
      }
    } catch (error) {
      console.error('Error saving package:', error)
      alert('Chyba při ukládání balíčku')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAgeGroup = (age: string) => {
    const current = formData.ageGroups
    if (current.includes(age)) {
      updateField(
        'ageGroups',
        current.filter((a: string) => a !== age)
      )
    } else {
      updateField('ageGroups', [...current, age])
    }
  }

  const toggleAllergen = (allergen: string) => {
    const current = formData.allergens
    if (current.includes(allergen)) {
      updateField(
        'allergens',
        current.filter((a: string) => a !== allergen)
      )
    } else {
      updateField('allergens', [...current, allergen])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Základní informace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Název balíčku *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Podtitulek
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Krátký popis
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => updateField('excerpt', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              >
                <option value="full_party">Kompletní oslava</option>
                <option value="entertainment">Zábava</option>
                <option value="workshop">Workshop</option>
                <option value="show">Představení</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stav
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              >
                <option value="draft">Koncept</option>
                <option value="published">Publikováno</option>
                <option value="archived">Archivováno</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 mt-8">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Doporučený balíček
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Age Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Věkové skupiny</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min. věk (roky)
              </label>
              <input
                type="number"
                value={formData.ageGroupMin}
                onChange={(e) =>
                  updateField('ageGroupMin', parseInt(e.target.value))
                }
                min="0"
                max="18"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max. věk (roky)
              </label>
              <input
                type="number"
                value={formData.ageGroupMax}
                onChange={(e) =>
                  updateField('ageGroupMax', parseInt(e.target.value))
                }
                min="0"
                max="18"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Věkové kategorie
            </label>
            <div className="flex flex-wrap gap-2">
              {['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'].map(
                (age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => toggleAgeGroup(age)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      formData.ageGroups.includes(age)
                        ? 'bg-partypal-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {age.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inclusions */}
      <Card>
        <CardHeader>
          <CardTitle>Co je zahrnuto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includesCharacter}
                onChange={(e) =>
                  updateField('includesCharacter', e.target.checked)
                }
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Zahrnuje postavu/maskota
              </span>
            </label>

            {formData.includesCharacter && (
              <input
                type="text"
                value={formData.characterName}
                onChange={(e) => updateField('characterName', e.target.value)}
                placeholder="Jméno postavy"
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            )}

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includesCake}
                onChange={(e) => updateField('includesCake', e.target.checked)}
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Dort
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includesGoodybags}
                onChange={(e) =>
                  updateField('includesGoodybags', e.target.checked)
                }
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Dárkové tašky
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includesDecoration}
                onChange={(e) =>
                  updateField('includesDecoration', e.target.checked)
                }
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Dekorace
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.includesPhotos}
                onChange={(e) => updateField('includesPhotos', e.target.checked)}
                className="w-5 h-5 text-partypal-pink-600 rounded focus:ring-partypal-pink-400"
              />
              <span className="text-sm font-medium text-gray-700">
                Fotografie
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téma
            </label>
            <input
              type="text"
              value={formData.themeName}
              onChange={(e) => updateField('themeName', e.target.value)}
              placeholder="např. Pirátská oslava, Jednorožci..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Safety */}
      <Card>
        <CardHeader>
          <CardTitle>Bezpečnost</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bezpečnostní poznámky
            </label>
            <textarea
              value={formData.safetyNotes}
              onChange={(e) => updateField('safetyNotes', e.target.value)}
              rows={3}
              placeholder="Důležité informace o bezpečnosti..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alergeny
            </label>
            <div className="flex flex-wrap gap-2">
              {['gluten', 'nuts', 'dairy', 'eggs', 'soy', 'fish'].map(
                (allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      formData.allergens.includes(allergen)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {allergen}
                  </button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Ceny a parametry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trvání (minuty)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  updateField('duration', parseInt(e.target.value))
                }
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max. dětí
              </label>
              <input
                type="number"
                value={formData.maxChildren}
                onChange={(e) =>
                  updateField('maxChildren', parseInt(e.target.value))
                }
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prostředí
              </label>
              <select
                value={formData.indoorOutdoor}
                onChange={(e) => updateField('indoorOutdoor', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              >
                <option value="indoor">Uvnitř</option>
                <option value="outdoor">Venku</option>
                <option value="both">Obojí</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Základní cena (Kč)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cena na dítě (Kč)
              </label>
              <input
                type="number"
                value={formData.pricePerChild}
                onChange={(e) =>
                  updateField('pricePerChild', parseFloat(e.target.value))
                }
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Obrázky</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL hlavního obrázku
            </label>
            <input
              type="url"
              value={formData.featuredImageUrl}
              onChange={(e) => updateField('featuredImageUrl', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alt text obrázku
            </label>
            <input
              type="text"
              value={formData.featuredImageAlt}
              onChange={(e) => updateField('featuredImageAlt', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/packages')}
        >
          Zrušit
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {packageId ? 'Uložit změny' : 'Vytvořit balíček'}
        </Button>
      </div>
    </form>
  )
}
