'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  publicOrderSchema,
  PublicOrderFormData,
  VENUE_TYPES,
  type PublicOrderResponse,
} from '@/lib/validations/public-order'

interface OrderFormProps {
  performanceId?: string
  performanceTitle?: string
  onSuccess: (orderNumber: string, email: string) => void
}

/**
 * Public order form component
 */
export function OrderForm({ performanceId, performanceTitle, onSuccess }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PublicOrderFormData>({
    resolver: zodResolver(publicOrderSchema),
    defaultValues: {
      performanceId: performanceId || '',
      performanceTitle: performanceTitle || '',
      gdprConsent: false,
      website: '', // honeypot
    },
  })

  const onSubmit = async (data: PublicOrderFormData) => {
    // Check honeypot
    if (data.website && data.website.length > 0) {
      // Silently fail for bots
      onSuccess('BOT-DETECTED', data.email)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result: PublicOrderResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Něco se pokazilo. Zkuste to prosím znovu.')
      }

      onSuccess(result.orderNumber!, data.email)
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Performance info (if provided) */}
      {performanceTitle && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-gray-300">Poptávka pro představení:</p>
          <p className="font-semibold text-white">{performanceTitle}</p>
          <input type="hidden" {...register('performanceId')} />
          <input type="hidden" {...register('performanceTitle')} />
        </div>
      )}

      {/* Error message */}
      {submitError && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Contact Information */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
          Kdo jste?
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
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
            {errors.firstName && (
              <p className={errorClasses}>{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
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
            {errors.lastName && (
              <p className={errorClasses}>{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
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
            {errors.email && (
              <p className={errorClasses}>{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
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
            {errors.phone && (
              <p className={errorClasses}>{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Organization (optional) */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-neutral-gray-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
          Pro fakturu <span className="text-neutral-gray-400 text-sm font-normal">(nepovinné)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Organization */}
          <div>
            <label htmlFor="organization" className={labelClasses}>
              Název organizace
            </label>
            <input
              id="organization"
              type="text"
              {...register('organization')}
              placeholder="ZŠ a MŠ Příklad"
              className={inputClasses}
            />
            {errors.organization && (
              <p className={errorClasses}>{errors.organization.message}</p>
            )}
          </div>

          {/* ICO */}
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
            {errors.ico && (
              <p className={errorClasses}>{errors.ico.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm">3</span>
          Kam a kdy?
        </h4>
        <div className="space-y-4">
          {/* Venue Type */}
          <div>
            <label htmlFor="venueType" className={labelClasses}>
              Typ akce <span className="text-red-400">*</span>
            </label>
            <select
              id="venueType"
              {...register('venueType')}
              className={inputClasses}
            >
              <option value="">Vyberte typ akce</option>
              {Object.entries(VENUE_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.venueType && (
              <p className={errorClasses}>{errors.venueType.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label htmlFor="venueCity" className={labelClasses}>
              Město/obec <span className="text-red-400">*</span>
            </label>
            <input
              id="venueCity"
              type="text"
              {...register('venueCity')}
              placeholder="Praha"
              className={inputClasses}
            />
            {errors.venueCity && (
              <p className={errorClasses}>{errors.venueCity.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {errors.preferredDate && (
                <p className={errorClasses}>{errors.preferredDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="alternativeDate" className={labelClasses}>
                Alternativní termín
              </label>
              <input
                id="alternativeDate"
                type="date"
                {...register('alternativeDate')}
                min={new Date().toISOString().split('T')[0]}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Audience Count */}
          <div>
            <label htmlFor="audienceCount" className={labelClasses}>
              Odhadovaný počet diváků
            </label>
            <input
              id="audienceCount"
              type="number"
              {...register('audienceCount', { valueAsNumber: true })}
              placeholder="50"
              min={1}
              className={inputClasses}
            />
            {errors.audienceCount && (
              <p className={errorClasses}>{errors.audienceCount.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-neutral-gray-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
          Chcete nám něco vzkázat? <span className="text-neutral-gray-400 text-sm font-normal">(nepovinné)</span>
        </h4>
        <textarea
          id="message"
          {...register('message')}
          rows={3}
          placeholder="Máte speciální požadavky nebo dotazy? Napište nám..."
          className={inputClasses}
        />
        {errors.message && (
          <p className={errorClasses}>{errors.message.message}</p>
        )}
      </div>

      {/* Honeypot (hidden) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          {...register('website')}
          tabIndex={-1}
          autoComplete="off"
        />
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
        {errors.gdprConsent && (
          <p className={errorClasses}>{errors.gdprConsent.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
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
  )
}
