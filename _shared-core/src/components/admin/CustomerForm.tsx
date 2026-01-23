'use client'

/**
 * Customer Form Component
 *
 * Form for creating and editing customers
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building, MapPin, FileText, Shield, Tag, Plus, X } from 'lucide-react'
import { IcoLookupButton } from './IcoLookupButton'

interface CustomerFormProps {
  customer?: any
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Basic Info
  const [email, setEmail] = useState(customer?.email || '')
  const [firstName, setFirstName] = useState(customer?.firstName || '')
  const [lastName, setLastName] = useState(customer?.lastName || '')
  const [phone, setPhone] = useState(customer?.phone || '')

  // Organization
  const [organization, setOrganization] = useState(customer?.organization || '')
  const [organizationType, setOrganizationType] = useState(customer?.organizationType || '')

  // Address
  const [addressStreet, setAddressStreet] = useState(customer?.address?.street || '')
  const [addressCity, setAddressCity] = useState(customer?.address?.city || '')
  const [addressPostalCode, setAddressPostalCode] = useState(customer?.address?.postalCode || '')
  const [addressCountry, setAddressCountry] = useState(customer?.address?.country || 'Česká republika')

  // Billing Info
  const [billingCompanyName, setBillingCompanyName] = useState(customer?.billingInfo?.companyName || '')
  const [billingIco, setBillingIco] = useState(customer?.billingInfo?.ico || '')
  const [billingDic, setBillingDic] = useState(customer?.billingInfo?.dic || '')
  const [billingAddressStreet, setBillingAddressStreet] = useState(customer?.billingInfo?.billingAddress?.street || '')
  const [billingAddressCity, setBillingAddressCity] = useState(customer?.billingInfo?.billingAddress?.city || '')
  const [billingAddressPostalCode, setBillingAddressPostalCode] = useState(customer?.billingInfo?.billingAddress?.postalCode || '')

  // CRM
  const [notes, setNotes] = useState(customer?.notes || '')
  const [tags, setTags] = useState<string[]>(customer?.tags || [])
  const [newTag, setNewTag] = useState('')
  const [source, setSource] = useState(customer?.source || 'manual')

  // GDPR
  const [gdprMarketing, setGdprMarketing] = useState(customer?.gdprConsent?.marketing || false)
  const [gdprDataProcessing, setGdprDataProcessing] = useState(customer?.gdprConsent?.dataProcessing || false)

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Handle ARES data fetch
  const handleAresDataFetched = (data: {
    companyName: string
    dic?: string
    address?: {
      street?: string
      city?: string
      postalCode?: string
      country?: string
    }
  }) => {
    // Auto-fill company name
    if (data.companyName && !billingCompanyName) {
      setBillingCompanyName(data.companyName)
    }

    // Auto-fill DIČ
    if (data.dic && !billingDic) {
      setBillingDic(data.dic)
    }

    // Auto-fill billing address
    if (data.address) {
      if (data.address.street && !billingAddressStreet) {
        setBillingAddressStreet(data.address.street)
      }
      if (data.address.city && !billingAddressCity) {
        setBillingAddressCity(data.address.city)
      }
      if (data.address.postalCode && !billingAddressPostalCode) {
        setBillingAddressPostalCode(data.address.postalCode)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!email) {
        throw new Error('Email je povinný')
      }
      if (!firstName || !lastName) {
        throw new Error('Jméno a příjmení jsou povinné')
      }

      // Build address object
      const address = addressStreet || addressCity || addressPostalCode
        ? {
            street: addressStreet || undefined,
            city: addressCity || undefined,
            postalCode: addressPostalCode || undefined,
            country: addressCountry || undefined,
          }
        : null

      // Build billing info object
      const billingInfo = billingCompanyName || billingIco || billingDic
        ? {
            companyName: billingCompanyName || undefined,
            ico: billingIco || undefined,
            dic: billingDic || undefined,
            billingAddress:
              billingAddressStreet || billingAddressCity || billingAddressPostalCode
                ? {
                    street: billingAddressStreet || undefined,
                    city: billingAddressCity || undefined,
                    postalCode: billingAddressPostalCode || undefined,
                  }
                : undefined,
          }
        : null

      // Build GDPR consent object
      const gdprConsent = {
        marketing: gdprMarketing,
        dataProcessing: gdprDataProcessing,
        consentDate: new Date().toISOString(),
      }

      const data = {
        email,
        firstName,
        lastName,
        phone: phone || null,
        organization: organization || null,
        organizationType: organizationType || null,
        address,
        billingInfo,
        notes: notes || null,
        tags: tags.length > 0 ? tags : null,
        source,
        gdprConsent,
      }

      const url = customer ? `/api/admin/customers/${customer.id || customer._id}` : '/api/admin/customers'
      const method = customer ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Chyba při ukládání zákazníka')
      }

      router.push('/admin/customers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání zákazníka')
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

      {/* Basic Info */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Základní informace
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Kontaktní údaje zákazníka
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Jméno *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Příjmení *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                required
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="+420 123 456 789"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Organization */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organizace
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Informace o organizaci zákazníka
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Název organizace
              </label>
              <input
                type="text"
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="např. Základní škola Jiřího z Poděbrad"
              />
            </div>

            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700">
                Typ organizace
              </label>
              <select
                id="organizationType"
                value={organizationType}
                onChange={(e) => setOrganizationType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Vyberte typ...</option>
                <option value="elementary_school">Základní škola</option>
                <option value="kindergarten">Mateřská škola</option>
                <option value="high_school">Střední škola</option>
                <option value="cultural_center">Kulturní dům</option>
                <option value="municipality">Obec/Město</option>
                <option value="company">Firma</option>
                <option value="ngo">Nezisková organizace</option>
                <option value="other">Jiné</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresa
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Kontaktní adresa
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="addressStreet" className="block text-sm font-medium text-gray-700">
                Ulice a číslo
              </label>
              <input
                type="text"
                id="addressStreet"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="např. Náměstí 123"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700">
                  Město
                </label>
                <input
                  type="text"
                  id="addressCity"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="např. Praha"
                />
              </div>

              <div>
                <label htmlFor="addressPostalCode" className="block text-sm font-medium text-gray-700">
                  PSČ
                </label>
                <input
                  type="text"
                  id="addressPostalCode"
                  value={addressPostalCode}
                  onChange={(e) => setAddressPostalCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="110 00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="addressCountry" className="block text-sm font-medium text-gray-700">
                Země
              </label>
              <input
                type="text"
                id="addressCountry"
                value={addressCountry}
                onChange={(e) => setAddressCountry(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing Info */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fakturační údaje
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              IČO, DIČ a fakturační adresa
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div>
              <label htmlFor="billingCompanyName" className="block text-sm font-medium text-gray-700">
                Název firmy
              </label>
              <input
                type="text"
                id="billingCompanyName"
                value={billingCompanyName}
                onChange={(e) => setBillingCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="billingIco" className="block text-sm font-medium text-gray-700 mb-1">
                  IČO
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="billingIco"
                    value={billingIco}
                    onChange={(e) => setBillingIco(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    placeholder="12345678"
                  />
                  <IcoLookupButton
                    ico={billingIco}
                    onDataFetched={handleAresDataFetched}
                    disabled={loading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Zadejte IČO a klikněte na "Doplnit z ARES" pro automatické vyplnění údajů
                </p>
              </div>

              <div>
                <label htmlFor="billingDic" className="block text-sm font-medium text-gray-700">
                  DIČ
                </label>
                <input
                  type="text"
                  id="billingDic"
                  value={billingDic}
                  onChange={(e) => setBillingDic(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="CZ12345678"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Fakturační adresa (pokud se liší)</h4>

              <div className="space-y-3">
                <div>
                  <label htmlFor="billingAddressStreet" className="block text-sm font-medium text-gray-700">
                    Ulice a číslo
                  </label>
                  <input
                    type="text"
                    id="billingAddressStreet"
                    value={billingAddressStreet}
                    onChange={(e) => setBillingAddressStreet(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billingAddressCity" className="block text-sm font-medium text-gray-700">
                      Město
                    </label>
                    <input
                      type="text"
                      id="billingAddressCity"
                      value={billingAddressCity}
                      onChange={(e) => setBillingAddressCity(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="billingAddressPostalCode" className="block text-sm font-medium text-gray-700">
                      PSČ
                    </label>
                    <input
                      type="text"
                      id="billingAddressPostalCode"
                      value={billingAddressPostalCode}
                      onChange={(e) => setBillingAddressPostalCode(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags & CRM */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tagy a CRM
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Kategorizace a zdroj zákazníka
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            {/* Source */}
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Zdroj zákazníka
              </label>
              <select
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="manual">Manuální zadání</option>
                <option value="contact_form">Kontaktní formulář</option>
                <option value="phone">Telefon</option>
                <option value="email">Email</option>
                <option value="recommendation">Doporučení</option>
                <option value="repeat_customer">Opakovaný zákazník</option>
                <option value="other">Jiné</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagy
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Nový tag..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Přidat
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Např.: VIP, Opakovaný, Škola, Praha
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GDPR & Notes */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              GDPR a poznámky
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Souhlasy a interní poznámky
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gdprMarketing"
                  checked={gdprMarketing}
                  onChange={(e) => setGdprMarketing(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="gdprMarketing" className="ml-2 text-sm text-gray-700">
                  Souhlas s marketingovou komunikací
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gdprDataProcessing"
                  checked={gdprDataProcessing}
                  onChange={(e) => setGdprDataProcessing(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="gdprDataProcessing" className="ml-2 text-sm text-gray-700">
                  Souhlas se zpracováním osobních údajů
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Interní poznámky
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                placeholder="Interní poznámky o zákazníkovi..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Ukládám...' : customer ? 'Uložit změny' : 'Vytvořit zákazníka'}
        </button>
      </div>
    </form>
  )
}
