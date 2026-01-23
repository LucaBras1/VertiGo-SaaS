'use client'

/**
 * Settings Form Component
 *
 * Comprehensive form for global site settings
 * Sections: Site Info, Contact, Social Links, SEO
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  settings?: any
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Site Information
  const [siteTitle, setSiteTitle] = useState(settings?.siteTitle || '')
  const [siteDescription, setSiteDescription] = useState(settings?.siteDescription || '')

  // Contact Information
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || '')
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || '')
  const [addressStreet, setAddressStreet] = useState(settings?.address?.street || '')
  const [addressCity, setAddressCity] = useState(settings?.address?.city || '')
  const [addressPostalCode, setAddressPostalCode] = useState(settings?.address?.postalCode || '')
  const [addressCountry, setAddressCountry] = useState(settings?.address?.country || 'Česká republika')

  // Social Links
  const [facebook, setFacebook] = useState(settings?.socialLinks?.facebook || '')
  const [instagram, setInstagram] = useState(settings?.socialLinks?.instagram || '')
  const [youtube, setYoutube] = useState(settings?.socialLinks?.youtube || '')

  // SEO Defaults
  const [metaTitle, setMetaTitle] = useState(settings?.defaultSeo?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(settings?.defaultSeo?.metaDescription || '')
  const [metaKeywords, setMetaKeywords] = useState(settings?.defaultSeo?.metaKeywords || '')

  // SMTP Email Configuration
  const [smtpHost, setSmtpHost] = useState(settings?.smtpHost || '')
  const [smtpPort, setSmtpPort] = useState(settings?.smtpPort?.toString() || '587')
  const [smtpSecure, setSmtpSecure] = useState(settings?.smtpSecure || false)
  const [smtpUser, setSmtpUser] = useState(settings?.smtpUser || '')
  const [smtpPassword, setSmtpPassword] = useState(settings?.smtpPassword || '')
  const [emailFrom, setEmailFrom] = useState(settings?.emailFrom || '')
  const [emailTo, setEmailTo] = useState(settings?.emailTo || '')

  // Contact Form Copy Settings
  const [contactFormCopyEnabled, setContactFormCopyEnabled] = useState(settings?.contactFormCopyEnabled ?? true)
  const [contactFormCopyEmail, setContactFormCopyEmail] = useState(settings?.contactFormCopyEmail || '')

  // SMTP Test state
  const [testEmail, setTestEmail] = useState('')
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Email Template Settings
  const [offerEmailSubject, setOfferEmailSubject] = useState(settings?.offerEmailSubject || '')
  const [offerEmailGreeting, setOfferEmailGreeting] = useState(settings?.offerEmailGreeting || '')
  const [offerEmailIntro, setOfferEmailIntro] = useState(settings?.offerEmailIntro || '')
  const [offerEmailFooterNote, setOfferEmailFooterNote] = useState(settings?.offerEmailFooterNote || '')
  const [offerEmailCompanyName, setOfferEmailCompanyName] = useState(settings?.offerEmailCompanyName || '')
  const [offerEmailCompanyEmail, setOfferEmailCompanyEmail] = useState(settings?.offerEmailCompanyEmail || '')
  const [offerEmailCompanyWeb, setOfferEmailCompanyWeb] = useState(settings?.offerEmailCompanyWeb || '')
  const [offerEmailLinkExpiry, setOfferEmailLinkExpiry] = useState(settings?.offerEmailLinkExpiry?.toString() || '7')

  // Event Reminder Settings
  const [enableEventReminders, setEnableEventReminders] = useState(settings?.enableEventReminders || false)
  const [eventReminderDaysBefore, setEventReminderDaysBefore] = useState(settings?.eventReminderDaysBefore?.toString() || '30')
  const [eventReminderEmailSubject, setEventReminderEmailSubject] = useState(settings?.eventReminderEmailSubject || '')
  const [eventReminderEmailIntro, setEventReminderEmailIntro] = useState(settings?.eventReminderEmailIntro || '')

  // Cancellation Fee Settings
  const [cancellationFeeEnabled, setCancellationFeeEnabled] = useState(settings?.cancellationFeeEnabled ?? true)
  const [cancellationFeeDaysBefore, setCancellationFeeDaysBefore] = useState(settings?.cancellationFeeDaysBefore?.toString() || '14')
  const [cancellationFeeType, setCancellationFeeType] = useState(settings?.cancellationFeeType || 'percentage')
  const [cancellationFeeValue, setCancellationFeeValue] = useState(settings?.cancellationFeeValue?.toString() || '50')
  const [cancellationFeeText, setCancellationFeeText] = useState(settings?.cancellationFeeText || '')

  // Company Info (for contracts and documents)
  const [companyIco, setCompanyIco] = useState(settings?.companyIco || '')
  const [companyDic, setCompanyDic] = useState(settings?.companyDic || '')
  const [companyBankAccount, setCompanyBankAccount] = useState(settings?.companyBankAccount || '')
  const [companyAddressStreet, setCompanyAddressStreet] = useState(settings?.companyFullAddress?.street || '')
  const [companyAddressCity, setCompanyAddressCity] = useState(settings?.companyFullAddress?.city || '')
  const [companyAddressPostalCode, setCompanyAddressPostalCode] = useState(settings?.companyFullAddress?.postalCode || '')

  // Handle SMTP test
  const handleSmtpTest = async () => {
    if (!testEmail) {
      setSmtpTestResult({ success: false, message: 'Zadejte email pro test' })
      return
    }

    setTestingSmtp(true)
    setSmtpTestResult(null)

    try {
      const response = await fetch('/api/admin/settings/smtp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail }),
      })

      const result = await response.json()

      setSmtpTestResult({
        success: result.success,
        message: result.success ? result.message : result.error,
      })
    } catch (err) {
      setSmtpTestResult({
        success: false,
        message: 'Chyba při testování SMTP',
      })
    } finally {
      setTestingSmtp(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      // Build address object (only if at least one field is filled)
      const address: any = {}
      if (addressStreet) address.street = addressStreet
      if (addressCity) address.city = addressCity
      if (addressPostalCode) address.postalCode = addressPostalCode
      if (addressCountry) address.country = addressCountry

      // Build social links object (only if at least one field is filled)
      const socialLinks: any = {}
      if (facebook) socialLinks.facebook = facebook
      if (instagram) socialLinks.instagram = instagram
      if (youtube) socialLinks.youtube = youtube

      // Build SEO object (only if at least one field is filled)
      const defaultSeo: any = {}
      if (metaTitle) defaultSeo.metaTitle = metaTitle
      if (metaDescription) defaultSeo.metaDescription = metaDescription
      if (metaKeywords) defaultSeo.metaKeywords = metaKeywords

      const data = {
        siteTitle,
        siteDescription,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        address: Object.keys(address).length > 0 ? address : null,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : null,
        defaultSeo: Object.keys(defaultSeo).length > 0 ? defaultSeo : null,
        // SMTP Configuration
        smtpHost: smtpHost || null,
        smtpPort: smtpPort ? parseInt(smtpPort) : null,
        smtpSecure,
        smtpUser: smtpUser || null,
        smtpPassword: smtpPassword || null,
        emailFrom: emailFrom || null,
        emailTo: emailTo || null,
        // Contact Form Copy Settings
        contactFormCopyEnabled,
        contactFormCopyEmail: contactFormCopyEmail || null,
        // Email Template Settings
        offerEmailSubject: offerEmailSubject || null,
        offerEmailGreeting: offerEmailGreeting || null,
        offerEmailIntro: offerEmailIntro || null,
        offerEmailFooterNote: offerEmailFooterNote || null,
        offerEmailCompanyName: offerEmailCompanyName || null,
        offerEmailCompanyEmail: offerEmailCompanyEmail || null,
        offerEmailCompanyWeb: offerEmailCompanyWeb || null,
        offerEmailLinkExpiry: offerEmailLinkExpiry ? parseInt(offerEmailLinkExpiry) : null,
        // Event Reminder Settings
        enableEventReminders,
        eventReminderDaysBefore: eventReminderDaysBefore ? parseInt(eventReminderDaysBefore) : 30,
        eventReminderEmailSubject: eventReminderEmailSubject || null,
        eventReminderEmailIntro: eventReminderEmailIntro || null,
        // Cancellation Fee Settings
        cancellationFeeEnabled,
        cancellationFeeDaysBefore: cancellationFeeDaysBefore ? parseInt(cancellationFeeDaysBefore) : 14,
        cancellationFeeType,
        cancellationFeeValue: cancellationFeeValue ? parseFloat(cancellationFeeValue) : 50,
        cancellationFeeText: cancellationFeeText || null,
        // Company Info (for contracts and documents)
        companyIco: companyIco || null,
        companyDic: companyDic || null,
        companyBankAccount: companyBankAccount || null,
        companyFullAddress: (companyAddressStreet || companyAddressCity || companyAddressPostalCode) ? {
          street: companyAddressStreet || undefined,
          city: companyAddressCity || undefined,
          postalCode: companyAddressPostalCode || undefined,
        } : null,
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save settings')
      }

      setSuccess(true)
      router.refresh()

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
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

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-medium">✓ Nastavení úspěšně uloženo</p>
        </div>
      )}

      {/* Site Information */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Informace o webu</h3>
            <p className="mt-1 text-sm text-gray-500">Základní informace o vašem webu</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Site Title */}
            <div>
              <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">
                Název webu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="siteTitle"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                required
                placeholder="např. Divadlo Studna"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Site Description */}
            <div>
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                Popis webu
              </label>
              <textarea
                id="siteDescription"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
                placeholder="Stručný popis vašeho divadla nebo organizace"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Info (for contracts and documents) */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Firemní údaje</h3>
            <p className="mt-1 text-sm text-gray-500">
              Údaje o vaší firmě pro smlouvy a dokumenty (dodavatel)
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* IČO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyIco" className="block text-sm font-medium text-gray-700">
                  IČO
                </label>
                <input
                  type="text"
                  id="companyIco"
                  value={companyIco}
                  onChange={(e) => setCompanyIco(e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* DIČ */}
              <div>
                <label htmlFor="companyDic" className="block text-sm font-medium text-gray-700">
                  DIČ
                </label>
                <input
                  type="text"
                  id="companyDic"
                  value={companyDic}
                  onChange={(e) => setCompanyDic(e.target.value)}
                  placeholder="CZ12345678"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  I když nejste plátci DPH
                </p>
              </div>
            </div>

            {/* Bank Account */}
            <div>
              <label htmlFor="companyBankAccount" className="block text-sm font-medium text-gray-700">
                Bankovní účet
              </label>
              <input
                type="text"
                id="companyBankAccount"
                value={companyBankAccount}
                onChange={(e) => setCompanyBankAccount(e.target.value)}
                placeholder="1234567890/0100"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Company Address */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Adresa firmy (pro dokumenty)</h4>
              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label htmlFor="companyAddressStreet" className="block text-sm font-medium text-gray-700">
                    Ulice a číslo popisné
                  </label>
                  <input
                    type="text"
                    id="companyAddressStreet"
                    value={companyAddressStreet}
                    onChange={(e) => setCompanyAddressStreet(e.target.value)}
                    placeholder="Divadelní 123"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label htmlFor="companyAddressCity" className="block text-sm font-medium text-gray-700">
                      Město
                    </label>
                    <input
                      type="text"
                      id="companyAddressCity"
                      value={companyAddressCity}
                      onChange={(e) => setCompanyAddressCity(e.target.value)}
                      placeholder="Praha"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="companyAddressPostalCode" className="block text-sm font-medium text-gray-700">
                      PSČ
                    </label>
                    <input
                      type="text"
                      id="companyAddressPostalCode"
                      value={companyAddressPostalCode}
                      onChange={(e) => setCompanyAddressPostalCode(e.target.value)}
                      placeholder="110 00"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Kontaktní údaje</h3>
            <p className="mt-1 text-sm text-gray-500">Email, telefon a adresa</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Kontaktní e-mail
              </label>
              <input
                type="email"
                id="contactEmail"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="info@divadlostudna.cz"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                Kontaktní telefon
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+420 123 456 789"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Address */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Adresa</h4>
              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label htmlFor="addressStreet" className="block text-sm font-medium text-gray-700">
                    Ulice a číslo popisné
                  </label>
                  <input
                    type="text"
                    id="addressStreet"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="Divadelní 123"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label htmlFor="addressCity" className="block text-sm font-medium text-gray-700">
                      Město
                    </label>
                    <input
                      type="text"
                      id="addressCity"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="Praha"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label htmlFor="addressPostalCode" className="block text-sm font-medium text-gray-700">
                      PSČ
                    </label>
                    <input
                      type="text"
                      id="addressPostalCode"
                      value={addressPostalCode}
                      onChange={(e) => setAddressPostalCode(e.target.value)}
                      placeholder="110 00"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="addressCountry" className="block text-sm font-medium text-gray-700">
                    Země
                  </label>
                  <input
                    type="text"
                    id="addressCountry"
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    placeholder="Česká republika"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Sociální sítě</h3>
            <p className="mt-1 text-sm text-gray-500">Odkazy na profily na sociálních sítích</p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Facebook */}
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="url"
                id="facebook"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://www.facebook.com/divadlostudna"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="url"
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://www.instagram.com/divadlostudna"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* YouTube */}
            <div>
              <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
                YouTube
              </label>
              <input
                type="url"
                id="youtube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://www.youtube.com/@divadlostudna"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO Defaults */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Výchozí SEO</h3>
            <p className="mt-1 text-sm text-gray-500">
              Výchozí metadata pro vyhledávače (použijí se pokud stránka nemá vlastní)
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Meta Title */}
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                Meta titulek
              </label>
              <input
                type="text"
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Divadlo Studna - Divadlo pro děti a mládež"
                maxLength={60}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Doporučená délka: 50-60 znaků (aktuálně: {metaTitle.length})
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                Meta popis
              </label>
              <textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Divadlo Studna nabízí kvalitní divadelní představení pro děti a mládež..."
                maxLength={160}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Doporučená délka: 150-160 znaků (aktuálně: {metaDescription.length})
              </p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
                Klíčová slova
              </label>
              <input
                type="text"
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="divadlo, děti, mládež, představení, kultura"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Oddělte čárkami. Poznámka: Moderní vyhledávače klíčová slova téměř nevyužívají.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Email konfigurace</h3>
            <p className="mt-1 text-sm text-gray-500">
              Nastavení SMTP serveru pro odesílání emailů z kontaktního formuláře
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* SMTP Host */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                  SMTP Server
                </label>
                <input
                  type="text"
                  id="smtpHost"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* SMTP Port */}
              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                  Port
                </label>
                <input
                  type="number"
                  id="smtpPort"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* SMTP Secure */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smtpSecure"
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smtpSecure" className="ml-2 block text-sm text-gray-700">
                Použít SSL/TLS (port 465)
              </label>
            </div>

            {/* SMTP User */}
            <div>
              <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700">
                SMTP Uživatel
              </label>
              <input
                type="text"
                id="smtpUser"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="vas-email@gmail.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* SMTP Password */}
            <div>
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                SMTP Heslo
              </label>

              {/* Gmail App Password Info Box */}
              <div className="mt-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Gmail uživatelé
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  Gmail vyžaduje &quot;App Password&quot; místo běžného hesla:
                </p>
                <ol className="text-sm text-amber-700 mt-2 list-decimal list-inside space-y-1">
                  <li>Přihlaste se na <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">myaccount.google.com/security</a></li>
                  <li>Zapněte dvoufaktorové ověření (2FA)</li>
                  <li>Přejděte na &quot;Hesla aplikací&quot; (App passwords)</li>
                  <li>Vytvořte nové heslo pro &quot;Mail&quot;</li>
                  <li>Použijte vygenerovaný 16-znakový kód jako SMTP heslo</li>
                </ol>
              </div>

              <input
                type="password"
                id="smtpPassword"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* SMTP Test */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Test SMTP</h4>
              <p className="text-sm text-gray-500 mb-4">
                Nejprve uložte nastavení, pak můžete otestovat odesílání emailů.
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="vas-email@example.com"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleSmtpTest}
                  disabled={testingSmtp || !testEmail}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testingSmtp ? 'Odesílám...' : 'Odeslat test'}
                </button>
              </div>
              {smtpTestResult && (
                <div
                  className={`mt-3 px-4 py-3 rounded-md text-sm ${
                    smtpTestResult.success
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {smtpTestResult.success ? '✓ ' : '✗ '}
                  {smtpTestResult.message}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Adresy</h4>

              {/* Email From */}
              <div className="mb-4">
                <label htmlFor="emailFrom" className="block text-sm font-medium text-gray-700">
                  Email odesílatele (From)
                </label>
                <input
                  type="text"
                  id="emailFrom"
                  value={emailFrom}
                  onChange={(e) => setEmailFrom(e.target.value)}
                  placeholder='"Divadlo Studna" <info@divadlo-studna.cz>'
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Email To */}
              <div>
                <label htmlFor="emailTo" className="block text-sm font-medium text-gray-700">
                  Příjemce zpráv z kontaktního formuláře
                </label>
                <input
                  type="email"
                  id="emailTo"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="produkce@divadlo-studna.cz"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Na tuto adresu budou přeposílány zprávy z kontaktního formuláře
                </p>
              </div>
            </div>

            {/* Contact Form Copy Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Kopie zpráv z kontaktního formuláře</h4>

              {/* Enable Copy Toggle */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="contactFormCopyEnabled"
                  checked={contactFormCopyEnabled}
                  onChange={(e) => setContactFormCopyEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="contactFormCopyEnabled" className="ml-2 block text-sm text-gray-900 font-medium">
                  Odesílat kopii zpráv odesílateli
                </label>
              </div>

              {contactFormCopyEnabled && (
                <div className="ml-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 mb-3">
                    Odesílatel kontaktního formuláře dostane kopii své zprávy na email, který vyplnil.
                  </p>
                  <div>
                    <label htmlFor="contactFormCopyEmail" className="block text-sm font-medium text-gray-700">
                      Reply-To adresa v kopii (volitelné)
                    </label>
                    <input
                      type="email"
                      id="contactFormCopyEmail"
                      value={contactFormCopyEmail}
                      onChange={(e) => setContactFormCopyEmail(e.target.value)}
                      placeholder="Ponechte prázdné pro použití kontaktního emailu"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Pokud odesílatel odpoví na kopii, půjde odpověď na tuto adresu
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Template Settings */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Šablony emailu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Texty používané v emailech s nabídkou. Pokud necháte prázdné, použijí se výchozí hodnoty.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Subject */}
            <div>
              <label htmlFor="offerEmailSubject" className="block text-sm font-medium text-gray-700">
                Předmět emailu
              </label>
              <input
                type="text"
                id="offerEmailSubject"
                value={offerEmailSubject}
                onChange={(e) => setOfferEmailSubject(e.target.value)}
                placeholder="Dohoda o umeleckem vykonu - {eventName}"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Použijte {'{eventName}'} pro název akce
              </p>
            </div>

            {/* Greeting */}
            <div>
              <label htmlFor="offerEmailGreeting" className="block text-sm font-medium text-gray-700">
                Pozdrav
              </label>
              <input
                type="text"
                id="offerEmailGreeting"
                value={offerEmailGreeting}
                onChange={(e) => setOfferEmailGreeting(e.target.value)}
                placeholder="Dobry den,"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Intro */}
            <div>
              <label htmlFor="offerEmailIntro" className="block text-sm font-medium text-gray-700">
                Úvodní text
              </label>
              <textarea
                id="offerEmailIntro"
                value={offerEmailIntro}
                onChange={(e) => setOfferEmailIntro(e.target.value)}
                rows={3}
                placeholder="zasilame Vam nabidku na umelecky vykon. Prosim zkontrolujte nize uvedene udaje a pokud s nimi souhlasiste, potvrdte objednavku kliknutim na tlacitko."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Footer Note */}
            <div>
              <label htmlFor="offerEmailFooterNote" className="block text-sm font-medium text-gray-700">
                Poznámka v patičce
              </label>
              <textarea
                id="offerEmailFooterNote"
                value={offerEmailFooterNote}
                onChange={(e) => setOfferEmailFooterNote(e.target.value)}
                rows={2}
                placeholder="Pokud mate nejake dotazy nebo potrebujete upravit objednavku, nevahejte nas kontaktovat."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Kontaktní údaje v emailu</h4>

              {/* Company Name */}
              <div className="mb-4">
                <label htmlFor="offerEmailCompanyName" className="block text-sm font-medium text-gray-700">
                  Název firmy
                </label>
                <input
                  type="text"
                  id="offerEmailCompanyName"
                  value={offerEmailCompanyName}
                  onChange={(e) => setOfferEmailCompanyName(e.target.value)}
                  placeholder="Divadlo Studna"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Company Email */}
                <div>
                  <label htmlFor="offerEmailCompanyEmail" className="block text-sm font-medium text-gray-700">
                    Email firmy
                  </label>
                  <input
                    type="email"
                    id="offerEmailCompanyEmail"
                    value={offerEmailCompanyEmail}
                    onChange={(e) => setOfferEmailCompanyEmail(e.target.value)}
                    placeholder="produkce@divadlo-studna.cz"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Company Web */}
                <div>
                  <label htmlFor="offerEmailCompanyWeb" className="block text-sm font-medium text-gray-700">
                    Webové stránky
                  </label>
                  <input
                    type="text"
                    id="offerEmailCompanyWeb"
                    value={offerEmailCompanyWeb}
                    onChange={(e) => setOfferEmailCompanyWeb(e.target.value)}
                    placeholder="www.divadlo-studna.cz"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Link Expiry */}
              <div>
                <label htmlFor="offerEmailLinkExpiry" className="block text-sm font-medium text-gray-700">
                  Platnost odkazu (dny)
                </label>
                <input
                  type="number"
                  id="offerEmailLinkExpiry"
                  value={offerEmailLinkExpiry}
                  onChange={(e) => setOfferEmailLinkExpiry(e.target.value)}
                  min="1"
                  max="30"
                  placeholder="7"
                  className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Počet dní, po které je platný odkaz pro potvrzení nabídky
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Reminder Settings */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Připomínky před akcí</h3>
            <p className="mt-1 text-sm text-gray-500">
              Automatické připomínky odesílané před potvrzenou akcí zákazníkovi i administrátorovi
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
            {/* Enable Reminders Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableEventReminders"
                checked={enableEventReminders}
                onChange={(e) => setEnableEventReminders(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="enableEventReminders" className="ml-2 block text-sm text-gray-900 font-medium">
                Povolit automatické připomínky
              </label>
            </div>

            {enableEventReminders && (
              <>
                {/* Days Before */}
                <div>
                  <label htmlFor="eventReminderDaysBefore" className="block text-sm font-medium text-gray-700">
                    Počet dní před akcí
                  </label>
                  <input
                    type="number"
                    id="eventReminderDaysBefore"
                    value={eventReminderDaysBefore}
                    onChange={(e) => setEventReminderDaysBefore(e.target.value)}
                    min="1"
                    max="365"
                    placeholder="30"
                    className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email bude odeslán zákazníkovi i administrátorovi
                  </p>
                </div>

                {/* Email Subject */}
                <div>
                  <label htmlFor="eventReminderEmailSubject" className="block text-sm font-medium text-gray-700">
                    Předmět emailu
                  </label>
                  <input
                    type="text"
                    id="eventReminderEmailSubject"
                    value={eventReminderEmailSubject}
                    onChange={(e) => setEventReminderEmailSubject(e.target.value)}
                    placeholder="Pripominka: {eventName} - {date}"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Použijte {'{eventName}'} pro název akce a {'{date}'} pro datum
                  </p>
                </div>

                {/* Email Intro */}
                <div>
                  <label htmlFor="eventReminderEmailIntro" className="block text-sm font-medium text-gray-700">
                    Úvodní text
                  </label>
                  <textarea
                    id="eventReminderEmailIntro"
                    value={eventReminderEmailIntro}
                    onChange={(e) => setEventReminderEmailIntro(e.target.value)}
                    rows={3}
                    placeholder="Dobry den, dovolujeme si Vam pripomenout blizici se akci, na kterou mate potvrzenou objednavku."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* Cancellation Fee Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Storno podmínky (disclaimer v emailu)</h4>

                  {/* Enable Cancellation Fee Disclaimer */}
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="cancellationFeeEnabled"
                      checked={cancellationFeeEnabled}
                      onChange={(e) => setCancellationFeeEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cancellationFeeEnabled" className="ml-2 block text-sm text-gray-700">
                      Zobrazit upozornění na storno poplatek
                    </label>
                  </div>

                  {cancellationFeeEnabled && (
                    <>
                      {/* Days Before for Free Cancellation */}
                      <div className="mb-4">
                        <label htmlFor="cancellationFeeDaysBefore" className="block text-sm font-medium text-gray-700">
                          Lhůta pro storno bez poplatku
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            id="cancellationFeeDaysBefore"
                            value={cancellationFeeDaysBefore}
                            onChange={(e) => setCancellationFeeDaysBefore(e.target.value)}
                            min="1"
                            max="365"
                            placeholder="14"
                            className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <span className="text-sm text-gray-500">dní před akcí</span>
                        </div>
                      </div>

                      {/* Fee Type */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Typ poplatku
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="cancellationFeeType"
                              value="percentage"
                              checked={cancellationFeeType === 'percentage'}
                              onChange={(e) => setCancellationFeeType(e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Procenta z ceny</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="cancellationFeeType"
                              value="fixed"
                              checked={cancellationFeeType === 'fixed'}
                              onChange={(e) => setCancellationFeeType(e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">Pevná částka</span>
                          </label>
                        </div>
                      </div>

                      {/* Fee Value */}
                      <div className="mb-4">
                        <label htmlFor="cancellationFeeValue" className="block text-sm font-medium text-gray-700">
                          Hodnota poplatku
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            id="cancellationFeeValue"
                            value={cancellationFeeValue}
                            onChange={(e) => setCancellationFeeValue(e.target.value)}
                            min="0"
                            step={cancellationFeeType === 'percentage' ? '1' : '100'}
                            placeholder={cancellationFeeType === 'percentage' ? '50' : '1000'}
                            className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <span className="text-sm text-gray-500">
                            {cancellationFeeType === 'percentage' ? '%' : 'Kč'}
                          </span>
                        </div>
                      </div>

                      {/* Custom Disclaimer Text */}
                      <div>
                        <label htmlFor="cancellationFeeText" className="block text-sm font-medium text-gray-700">
                          Vlastní text disclaimeru (volitelné)
                        </label>
                        <textarea
                          id="cancellationFeeText"
                          value={cancellationFeeText}
                          onChange={(e) => setCancellationFeeText(e.target.value)}
                          rows={2}
                          placeholder="Ponechte prázdné pro výchozí text: V případě zrušení akce ve lhůtě kratší než X dní před termínem akce bude účtován storno poplatek ve výši Y."
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Přepíše výchozí text. Použijte {'{days}'} pro počet dní a {'{fee}'} pro hodnotu poplatku.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Info about CRON */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Vyžaduje CRON job</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Pro automatické odesílání připomínek je nutné nastavit CRON job voláním<br />
                        <code className="bg-yellow-100 px-1 rounded">/api/cron/send-event-reminders</code> s hlavičkou <code className="bg-yellow-100 px-1 rounded">CRON_SECRET</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Ukládám...' : 'Uložit nastavení'}
        </button>
      </div>
    </form>
  )
}
