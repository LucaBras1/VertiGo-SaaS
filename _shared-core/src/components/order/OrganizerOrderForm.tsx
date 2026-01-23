'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  organizerOrderSchema,
  OrganizerOrderFormData,
  OrganizerOrderResponse,
  VENUE_TYPES,
  ITEM_TYPES,
  ELECTRICITY_OPTIONS,
} from '@/lib/validations/organizer-order'

interface CatalogItem {
  id: string
  title: string
  category: string
  slug: string
}

interface CatalogData {
  performances: CatalogItem[]
  games: CatalogItem[]
  services: CatalogItem[]
}

export function OrganizerOrderForm() {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<{ orderNumber: string } | null>(null)
  const [catalog, setCatalog] = useState<CatalogData | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [showTechnical, setShowTechnical] = useState(false)
  const [urlParamsApplied, setUrlParamsApplied] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrganizerOrderFormData>({
    resolver: zodResolver(organizerOrderSchema),
    defaultValues: {
      items: [{ type: 'performance', itemId: '', note: '' }],
      parking: false,
      electricityVoltage: 'none',
      sound: false,
      lighting: false,
      accommodation: false,
      gdprConsent: false,
      website: '',
    },
  })

  const { fields: itemFields, append: addItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchAccommodation = watch('accommodation')

  // Fetch catalog on mount
  useEffect(() => {
    fetch('/api/public/catalog')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCatalog(data.data)
        }
      })
      .catch(err => console.error('Failed to load catalog:', err))
      .finally(() => setCatalogLoading(false))
  }, [])

  // Pre-fill form from URL parameters (e.g., when coming from performance page)
  useEffect(() => {
    if (catalog && !urlParamsApplied) {
      const performanceId = searchParams.get('performance')
      const performanceTitle = searchParams.get('title')

      if (performanceId) {
        // Check if the performance exists in catalog
        const exists = catalog.performances.some(p => p.id === performanceId)
        if (exists) {
          setValue('items.0.type', 'performance')
          setValue('items.0.itemId', performanceId)
          setValue('items.0.itemTitle', performanceTitle || '')
        }
      }
      setUrlParamsApplied(true)
    }
  }, [catalog, searchParams, setValue, urlParamsApplied])

  // Get items for dropdown based on type
  const getItemsForType = (type: string): CatalogItem[] => {
    if (!catalog) return []
    switch (type) {
      case 'performance':
        return catalog.performances
      case 'game':
        return catalog.games
      case 'service':
        return catalog.services
      default:
        return []
    }
  }

  // Update item title when selection changes
  const handleItemChange = (index: number, itemId: string, type: string) => {
    const items = getItemsForType(type)
    const selected = items.find(item => item.id === itemId)
    if (selected) {
      setValue(`items.${index}.itemTitle`, selected.title)
    }
  }

  const onSubmit = async (data: OrganizerOrderFormData) => {
    if (data.website && data.website.length > 0) {
      setSubmitSuccess({ orderNumber: 'PROCESSED' })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/public/organizer-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result: OrganizerOrderResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Něco se pokazilo. Zkuste to prosím znovu.')
      }

      setSubmitSuccess({ orderNumber: result.orderNumber! })
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Něco se pokazilo. Zkuste to prosím znovu.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses = 'w-full px-4 py-3 bg-neutral-gray-800 border border-neutral-gray-600 rounded-lg text-white placeholder-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors'
  const labelClasses = 'block text-sm font-medium text-neutral-gray-200 mb-1'
  const errorClasses = 'text-red-400 text-sm mt-1'
  const sectionClasses = 'mb-8'

  if (submitSuccess) {
    return (
      <div className="bg-neutral-gray-800 rounded-xl p-8 md:p-12 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Poptávka odeslána!
        </h3>
        <p className="text-neutral-gray-200 mb-2">
          Číslo vaší poptávky: <strong className="text-primary">{submitSuccess.orderNumber}</strong>
        </p>
        <p className="text-neutral-gray-300">
          Do 24 hodin vám zašleme cenovou nabídku na váš email.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-neutral-gray-800/50 rounded-xl p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
        Nezávazná poptávka
      </h2>
      <p className="text-neutral-gray-300 mb-8">
        Vyplňte formulář a do 24 hodin vám připravíme cenovou nabídku na míru.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Error message */}
        {submitError && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
            {submitError}
          </div>
        )}

        {/* Section 1: Contact Information */}
        <div className={sectionClasses}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
            Kdo jste?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClasses}>
                Jméno <span className="text-red-400">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                {...register('firstName')}
                placeholder="Jan"
                className={inputClasses}
              />
              {errors.firstName && <p className={errorClasses}>{errors.firstName.message}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className={labelClasses}>
                Příjmení <span className="text-red-400">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                {...register('lastName')}
                placeholder="Novák"
                className={inputClasses}
              />
              {errors.lastName && <p className={errorClasses}>{errors.lastName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className={labelClasses}>
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="jan.novak@example.com"
                className={inputClasses}
              />
              {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className={labelClasses}>
                Telefon <span className="text-red-400">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+420 123 456 789"
                className={inputClasses}
              />
              {errors.phone && <p className={errorClasses}>{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="organization" className={labelClasses}>
                Organizace
              </label>
              <input
                id="organization"
                type="text"
                {...register('organization')}
                placeholder="ZŠ a MŠ Příklad"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="ico" className={labelClasses}>
                IČO
              </label>
              <input
                id="ico"
                type="text"
                {...register('ico')}
                placeholder="12345678"
                maxLength={8}
                className={inputClasses}
              />
              {errors.ico && <p className={errorClasses}>{errors.ico.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Order Items */}
        <div className={sectionClasses}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm">2</span>
            Co si přejete objednat? <span className="text-red-400">*</span>
          </h3>

          {catalogLoading ? (
            <div className="text-neutral-gray-400 py-4">Načítám katalog...</div>
          ) : (
            <div className="space-y-4">
              {itemFields.map((field, index) => (
                <div key={field.id} className="bg-neutral-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClasses}>Typ</label>
                        <select
                          {...register(`items.${index}.type` as const)}
                          onChange={(e) => {
                            setValue(`items.${index}.itemId`, '')
                            setValue(`items.${index}.itemTitle`, '')
                          }}
                          className={inputClasses}
                        >
                          {Object.entries(ITEM_TYPES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClasses}>Vyberte položku</label>
                        <select
                          {...register(`items.${index}.itemId` as const)}
                          onChange={(e) => handleItemChange(index, e.target.value, watchedItems[index]?.type || 'performance')}
                          className={inputClasses}
                        >
                          <option value="">-- Vyberte --</option>
                          {getItemsForType(watchedItems[index]?.type || 'performance').map((item) => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                          ))}
                        </select>
                        {errors.items?.[index]?.itemId && (
                          <p className={errorClasses}>{errors.items[index]?.itemId?.message}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className={labelClasses}>Poznámka (nepovinné)</label>
                        <input
                          type="text"
                          {...register(`items.${index}.note` as const)}
                          placeholder="Speciální požadavky..."
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    {itemFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-6 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Odebrat položku"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <input type="hidden" {...register(`items.${index}.itemTitle` as const)} />
                </div>
              ))}

              {errors.items && typeof errors.items.message === 'string' && (
                <p className={errorClasses}>{errors.items.message}</p>
              )}

              <button
                type="button"
                onClick={() => addItem({ type: 'performance', itemId: '', note: '' })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-gray-700 hover:bg-neutral-gray-600 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Přidat další položku
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Venue and Dates */}
        <div className={sectionClasses}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm">3</span>
            Kdy a kde?
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="venueType" className={labelClasses}>
                  Typ akce <span className="text-red-400">*</span>
                </label>
                <select id="venueType" {...register('venueType')} className={inputClasses}>
                  <option value="">Vyberte typ akce</option>
                  {Object.entries(VENUE_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.venueType && <p className={errorClasses}>{errors.venueType.message}</p>}
              </div>

              <div>
                <label htmlFor="venueName" className={labelClasses}>
                  Název místa / organizace
                </label>
                <input
                  id="venueName"
                  type="text"
                  {...register('venueName')}
                  placeholder="ZŠ Jiřího z Poděbrad"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="venueStreet" className={labelClasses}>
                  Ulice a číslo
                </label>
                <input
                  id="venueStreet"
                  type="text"
                  {...register('venueStreet')}
                  placeholder="Náměstí 123"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="venueCity" className={labelClasses}>
                  Město <span className="text-red-400">*</span>
                </label>
                <input
                  id="venueCity"
                  type="text"
                  {...register('venueCity')}
                  placeholder="Praha"
                  className={inputClasses}
                />
                {errors.venueCity && <p className={errorClasses}>{errors.venueCity.message}</p>}
              </div>

              <div>
                <label htmlFor="venuePostalCode" className={labelClasses}>
                  PSČ
                </label>
                <input
                  id="venuePostalCode"
                  type="text"
                  {...register('venuePostalCode')}
                  placeholder="110 00"
                  className={inputClasses}
                />
                {errors.venuePostalCode && <p className={errorClasses}>{errors.venuePostalCode.message}</p>}
              </div>

              <div>
                <label htmlFor="audienceCount" className={labelClasses}>
                  Počet diváků
                </label>
                <input
                  id="audienceCount"
                  type="number"
                  {...register('audienceCount', { valueAsNumber: true })}
                  placeholder="50"
                  min={1}
                  className={inputClasses}
                />
                {errors.audienceCount && <p className={errorClasses}>{errors.audienceCount.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="preferredDate" className={labelClasses}>
                  Preferovaný termín <span className="text-red-400">*</span>
                </label>
                <input
                  id="preferredDate"
                  type="date"
                  {...register('preferredDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClasses}
                />
                {errors.preferredDate && <p className={errorClasses}>{errors.preferredDate.message}</p>}
              </div>

              <div>
                <label htmlFor="alternativeDate1" className={labelClasses}>
                  Alternativní termín 1
                </label>
                <input
                  id="alternativeDate1"
                  type="date"
                  {...register('alternativeDate1')}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="alternativeDate2" className={labelClasses}>
                  Alternativní termín 2
                </label>
                <input
                  id="alternativeDate2"
                  type="date"
                  {...register('alternativeDate2')}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Technical Requirements (Collapsible) */}
        <div className={sectionClasses}>
          <button
            type="button"
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full flex items-center justify-between text-lg font-semibold text-white mb-4"
          >
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 bg-neutral-gray-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Technické požadavky
              <span className="text-sm font-normal text-neutral-gray-400">(nepovinné)</span>
            </span>
            <svg
              className={`w-5 h-5 text-neutral-gray-400 transition-transform ${showTechnical ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTechnical && (
            <div className="bg-neutral-gray-700/30 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('parking')}
                    className="w-5 h-5 rounded border-neutral-gray-500 text-primary focus:ring-primary focus:ring-offset-0 bg-neutral-gray-800"
                  />
                  <span className="text-neutral-gray-200">Parkování pro nákladní auto</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('sound')}
                    className="w-5 h-5 rounded border-neutral-gray-500 text-primary focus:ring-primary focus:ring-offset-0 bg-neutral-gray-800"
                  />
                  <span className="text-neutral-gray-200">Potřebujeme ozvučení</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('lighting')}
                    className="w-5 h-5 rounded border-neutral-gray-500 text-primary focus:ring-primary focus:ring-offset-0 bg-neutral-gray-800"
                  />
                  <span className="text-neutral-gray-200">Potřebujeme osvětlení</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('accommodation')}
                    className="w-5 h-5 rounded border-neutral-gray-500 text-primary focus:ring-primary focus:ring-offset-0 bg-neutral-gray-800"
                  />
                  <span className="text-neutral-gray-200">Možnost ubytování</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="electricityVoltage" className={labelClasses}>
                    Elektrická přípojka
                  </label>
                  <select id="electricityVoltage" {...register('electricityVoltage')} className={inputClasses}>
                    {Object.entries(ELECTRICITY_OPTIONS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {watchAccommodation && (
                  <div>
                    <label htmlFor="accommodationPersons" className={labelClasses}>
                      Počet osob k ubytování
                    </label>
                    <input
                      id="accommodationPersons"
                      type="number"
                      {...register('accommodationPersons', { valueAsNumber: true })}
                      placeholder="2"
                      min={1}
                      max={20}
                      className={inputClasses}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="otherRequirements" className={labelClasses}>
                  Další požadavky
                </label>
                <textarea
                  id="otherRequirements"
                  {...register('otherRequirements')}
                  rows={3}
                  placeholder="Máte další speciální požadavky? Napište nám..."
                  className={inputClasses}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Message */}
        <div className={sectionClasses}>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-neutral-gray-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
            Chcete nám něco vzkázat?
            <span className="text-sm font-normal text-neutral-gray-400">(nepovinné)</span>
          </h3>
          <textarea
            id="message"
            {...register('message')}
            rows={4}
            placeholder="Máte otázky nebo speciální přání? Napište nám..."
            className={inputClasses}
          />
        </div>

        {/* Honeypot */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <input type="text" {...register('website')} tabIndex={-1} autoComplete="off" />
        </div>

        {/* GDPR Consent */}
        <div className="border-t border-neutral-gray-700 pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('gdprConsent')}
              className="mt-1 w-5 h-5 rounded border-neutral-gray-500 text-primary focus:ring-primary focus:ring-offset-0 bg-neutral-gray-800"
            />
            <span className="text-sm text-neutral-gray-300">
              Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.{' '}
              <a href="/gdpr" className="text-primary hover:underline">
                Více informací
              </a>
            </span>
          </label>
          {errors.gdprConsent && <p className={errorClasses}>{errors.gdprConsent.message}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || catalogLoading}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Odesílám...
              </>
            ) : (
              'Odeslat poptávku'
            )}
          </button>

          <p className="text-center text-sm text-neutral-gray-400 mt-3">
            Nezávazně. Do 24 hodin vám pošleme cenovou nabídku.
          </p>
        </div>
      </form>
    </div>
  )
}
