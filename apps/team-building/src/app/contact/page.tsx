/**
 * Contact Page
 * Contact form and company information
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Mail, Phone, MapPin, Send, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const inquiryTypes = [
    { value: 'general', label: 'Obecný dotaz' },
    { value: 'sales', label: 'Prodej a ceny' },
    { value: 'support', label: 'Technická podpora' },
    { value: 'partnership', label: 'Partnerství' },
    { value: 'other', label: 'Jiné' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Jméno je povinné'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Zpráva je povinná'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Zpráva musí mít alespoň 10 znaků'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          icon: '📧',
          duration: 4000
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: 'general',
          message: ''
        })
      } else {
        toast.error(data.error || 'Něco se pokazilo')
      }
    } catch (error) {
      toast.error('Nepodařilo se odeslat zprávu. Zkuste to znovu.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-600 dark:text-brand-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TeamForge
              </span>
            </Link>
            <Link href="/login" className="btn-primary">
              Přihlásit se
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Kontaktujte nás
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Máte dotaz nebo potřebujete pomoc? Jsme tu pro vás.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Napište nám</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Jméno a příjmení
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Jan Novák"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="jan@firma.cz"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Telefon (nepovinné)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+420 123 456 789"
                    disabled={isLoading}
                  />
                </div>

                {/* Inquiry Type */}
                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Typ dotazu
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isLoading}
                  >
                    {inquiryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Vaše zpráva
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className={`input-field ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Popište váš dotaz nebo požadavek..."
                    disabled={isLoading}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Odesílám...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Odeslat zprávu
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6">Kontaktní údaje</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Email</div>
                    <a href="mailto:info@teamforge.cz" className="text-brand-600 dark:text-brand-400 hover:underline">
                      info@teamforge.cz
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Telefon</div>
                    <a href="tel:+420123456789" className="text-brand-600 dark:text-brand-400 hover:underline">
                      +420 123 456 789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Adresa</div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      VertiGo SaaS<br />
                      Václavské náměstí 1<br />
                      110 00 Praha 1<br />
                      Česká republika
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Pracovní doba</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Pondělí - Pátek</span>
                  <span className="font-semibold">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Sobota - Neděle</span>
                  <span className="font-semibold">Zavřeno</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
              <h3 className="text-xl font-bold mb-4">Rychlé odkazy</h3>
              <div className="space-y-3">
                <Link href="/demo" className="block hover:underline">
                  → Požádat o demo
                </Link>
                <Link href="/signup" className="block hover:underline">
                  → Vyzkoušet zdarma
                </Link>
                <a href="/#pricing" className="block hover:underline">
                  → Zobrazit ceny
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
