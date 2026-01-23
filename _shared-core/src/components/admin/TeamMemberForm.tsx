'use client'

/**
 * Team Member Form Component
 *
 * Comprehensive form for creating and editing team members
 * Includes personal info, bio, photo, contact details, and social links
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from './TiptapEditor'
import { ImageUpload } from './ImageUpload'

interface TeamMemberFormProps {
  teamMember?: any
}

export function TeamMemberForm({ teamMember }: TeamMemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Basic info
  const [firstName, setFirstName] = useState(teamMember?.firstName || '')
  const [lastName, setLastName] = useState(teamMember?.lastName || '')
  const [role, setRole] = useState(teamMember?.role || '')
  const [order, setOrder] = useState(teamMember?.order || 100)
  const [isActive, setIsActive] = useState(teamMember?.isActive !== undefined ? teamMember.isActive : true)

  // Bio
  const [bio, setBio] = useState(teamMember?.bio || null)

  // Photo
  const [photoUrl, setPhotoUrl] = useState(teamMember?.photoUrl || '')
  const [photoAlt, setPhotoAlt] = useState(teamMember?.photoAlt || '')

  // Contact
  const [email, setEmail] = useState(teamMember?.email || '')
  const [phone, setPhone] = useState(teamMember?.phone || '')

  // Social links
  const [facebook, setFacebook] = useState(teamMember?.socialLinks?.facebook || '')
  const [instagram, setInstagram] = useState(teamMember?.socialLinks?.instagram || '')
  const [website, setWebsite] = useState(teamMember?.socialLinks?.website || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Build social links object
      const socialLinks: any = {}
      if (facebook) socialLinks.facebook = facebook
      if (instagram) socialLinks.instagram = instagram
      if (website) socialLinks.website = website

      const data = {
        firstName,
        lastName,
        role,
        order,
        isActive,
        bio,
        photoUrl: photoUrl || null,
        photoAlt: photoAlt || `${firstName} ${lastName}`,
        email: email || null,
        phone: phone || null,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
      }

      const url = teamMember ? `/api/admin/team/${teamMember.id}` : '/api/admin/team'
      const method = teamMember ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save team member')
      }

      router.push('/admin/team')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team member')
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
            <p className="mt-1 text-sm text-gray-500">Jméno, role a pořadí zobrazení</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Křestní jméno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Příjmení <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Pozice / role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="např. Režisér, Herec, Produkční..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Order & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                  Pořadí
                </label>
                <input
                  type="number"
                  id="order"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value))}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Nižší číslo = vyšší pozice</p>
              </div>

              <div className="flex items-end">
                <div className="flex items-start h-11">
                  <div className="flex items-center h-5">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isActive" className="font-medium text-gray-700">
                      Aktivní člen
                    </label>
                    <p className="text-gray-500">Zobrazit na webu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Biografie</h3>
            <p className="mt-1 text-sm text-gray-500">Popis osoby a její kariéry</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Životopis / O mně
              </label>
              <TiptapEditor content={bio} onChange={setBio} placeholder="Napište něco o sobě..." />
            </div>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Fotografie</h3>
            <p className="mt-1 text-sm text-gray-500">Profilová fotka člena týmu</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <ImageUpload
                label="Profilová fotografie"
                value={photoUrl}
                onChange={setPhotoUrl}
              />
            </div>

            {photoUrl && (
              <div>
                <label htmlFor="photoAlt" className="block text-sm font-medium text-gray-700">
                  Alt text fotografie
                </label>
                <input
                  type="text"
                  id="photoAlt"
                  value={photoAlt}
                  onChange={(e) => setPhotoAlt(e.target.value)}
                  placeholder={`${firstName} ${lastName}`}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Kontaktní údaje</h3>
            <p className="mt-1 text-sm text-gray-500">Email a telefon (volitelné)</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jmeno@divadlo-studna.cz"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+420 123 456 789"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Sociální sítě</h3>
            <p className="mt-1 text-sm text-gray-500">Odkazy na sociální profily (volitelné)</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                Facebook URL
              </label>
              <input
                type="url"
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                Instagram URL
              </label>
              <input
                type="url"
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Osobní web
              </label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
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
          {loading ? 'Ukládám...' : teamMember ? 'Uložit změny' : 'Přidat člena týmu'}
        </button>
      </div>
    </form>
  )
}
