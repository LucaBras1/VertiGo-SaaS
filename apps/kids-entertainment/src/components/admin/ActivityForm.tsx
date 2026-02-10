/**
 * Activity Form Component
 * Form for creating/editing activities with safety rating, materials, energy level
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

interface ActivityFormProps {
  initialData?: any
  activityId?: string
}

export default function ActivityForm({ initialData, activityId }: ActivityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [materials, setMaterials] = useState<string[]>(
    initialData?.materials || []
  )
  const [skillsDeveloped, setSkillsDeveloped] = useState<string[]>(
    initialData?.skillsDeveloped || []
  )
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    excerpt: initialData?.excerpt || '',
    category: initialData?.category || 'skill_game',
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    duration: initialData?.duration || 30,
    ageAppropriate: initialData?.ageAppropriate || [],
    minChildren: initialData?.minChildren || 1,
    maxChildren: initialData?.maxChildren || 20,
    safetyRating: initialData?.safetyRating || 'SAFE',
    safetyNotes: initialData?.safetyNotes || '',
    allergensInvolved: initialData?.allergensInvolved || [],
    choking_hazard: initialData?.choking_hazard || false,
    energyLevel: initialData?.energyLevel || 'MODERATE',
    indoorOutdoor: initialData?.indoorOutdoor || 'both',
    setupTime: initialData?.setupTime || 10,
    educationalValue: initialData?.educationalValue || '',
    price: initialData?.price || 0,
    featuredImageUrl: initialData?.featuredImageUrl || '',
    featuredImageAlt: initialData?.featuredImageAlt || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = activityId ? `/api/activities/${activityId}` : '/api/activities'
      const method = activityId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          materials,
          skillsDeveloped,
        }),
      })

      if (response.ok) {
        router.push('/admin/activities')
        router.refresh()
      } else {
        alert('Chyba při ukládání aktivity')
      }
    } catch (error) {
      console.error('Error saving activity:', error)
      alert('Chyba při ukládání aktivity')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleAgeGroup = (age: string) => {
    const current = formData.ageAppropriate
    if (current.includes(age)) {
      updateField(
        'ageAppropriate',
        current.filter((a: string) => a !== age)
      )
    } else {
      updateField('ageAppropriate', [...current, age])
    }
  }

  const addMaterial = () => {
    const material = prompt('Zadejte materiál:')
    if (material) {
      setMaterials([...materials, material])
    }
  }

  const addSkill = () => {
    const skill = prompt('Zadejte dovednost:')
    if (skill) {
      setSkillsDeveloped([...skillsDeveloped, skill])
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
              Název aktivity *
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
                <option value="skill_game">Dovednostní hra</option>
                <option value="creative">Kreativní</option>
                <option value="active">Aktivní</option>
                <option value="educational">Vzdělávací</option>
                <option value="performance">Vystoupení</option>
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
                  Doporučená aktivita
                </span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety & Energy */}
      <Card>
        <CardHeader>
          <CardTitle>Bezpečnost a energie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hodnocení bezpečnosti
              </label>
              <select
                value={formData.safetyRating}
                onChange={(e) => updateField('safetyRating', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              >
                <option value="VERY_SAFE">Velmi bezpečné</option>
                <option value="SAFE">Bezpečné</option>
                <option value="REQUIRES_SUPERVISION">Vyžaduje dohled</option>
                <option value="ADULT_ONLY">Pouze dospělí</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Úroveň energie
              </label>
              <select
                value={formData.energyLevel}
                onChange={(e) => updateField('energyLevel', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              >
                <option value="CALM">Klidná</option>
                <option value="MODERATE">Střední</option>
                <option value="HIGH">Vysoká</option>
                <option value="VERY_HIGH">Velmi vysoká</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bezpečnostní poznámky
            </label>
            <textarea
              value={formData.safetyNotes}
              onChange={(e) => updateField('safetyNotes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.choking_hazard}
              onChange={(e) => updateField('choking_hazard', e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-400"
            />
            <span className="text-sm font-medium text-gray-700">
              Riziko udušení
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Age Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Věkové skupiny</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'].map(
              (age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => toggleAgeGroup(age)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    formData.ageAppropriate.includes(age)
                      ? 'bg-partypal-pink-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {age.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Materiály</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {materials.map((material, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-sky-100 text-sky-800 rounded-lg text-sm font-medium"
              >
                {material}
              </span>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              className="px-4 py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-partypal-pink-400 hover:text-partypal-pink-600"
            >
              + Přidat materiál
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Rozvíjené dovednosti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skillsDeveloped.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-1.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-partypal-pink-400 hover:text-partypal-pink-600"
            >
              + Přidat dovednost
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vzdělávací hodnota
            </label>
            <textarea
              value={formData.educationalValue}
              onChange={(e) => updateField('educationalValue', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Duration & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Časové a kapacitní údaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trvání (min)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => updateField('duration', parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Příprava (min)
              </label>
              <input
                type="number"
                value={formData.setupTime}
                onChange={(e) => updateField('setupTime', parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Min. dětí
              </label>
              <input
                type="number"
                value={formData.minChildren}
                onChange={(e) => updateField('minChildren', parseInt(e.target.value))}
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
                onChange={(e) => updateField('maxChildren', parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-partypal-pink-400 focus:ring-2 focus:ring-partypal-pink-100 outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/activities')}
        >
          Zrušit
        </Button>
        <Button type="submit" loading={isLoading}>
          {activityId ? 'Uložit změny' : 'Vytvořit aktivitu'}
        </Button>
      </div>
    </form>
  )
}
