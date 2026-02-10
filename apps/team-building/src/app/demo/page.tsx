/**
 * Demo Request Page
 * Schedule a demo and learn about TeamForge benefits
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Calendar, Video, CheckCircle, ArrowRight, AlertCircle, Sparkles, Target, TrendingUp, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '10-50',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const teamSizes = [
    { value: '1-10', label: '1-10 zaměstnanců' },
    { value: '10-50', label: '10-50 zaměstnanců' },
    { value: '50-200', label: '50-200 zaměstnanců' },
    { value: '200-1000', label: '200-1000 zaměstnanců' },
    { value: '1000+', label: '1000+ zaměstnanců' }
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

    if (!formData.company.trim()) {
      newErrors.company = 'Název společnosti je povinný'
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
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message, {
          icon: '🎯',
          duration: 4000
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          teamSize: '10-50',
          message: ''
        })
      } else {
        toast.error(data.error || 'Něco se pokazilo')
      }
    } catch (error) {
      toast.error('Nepodařilo se odeslat požadavek. Zkuste to znovu.')
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
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-neutral-700 dark:text-neutral-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                Přihlásit se
              </Link>
              <Link href="/signup" className="btn-primary">
                Vyzkoušet zdarma
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-brand-600 dark:text-brand-400 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">30minutová personalizovaná prezentace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Naplánovat demo
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Uvidíte, jak TeamForge AI může transformovat váš team building business
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Demo Request Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Požádat o demo</h2>
              </div>

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
                    Pracovní email
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

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Název společnosti
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={formData.company}
                    onChange={handleChange}
                    className={`input-field ${errors.company ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Vaše firma s.r.o."
                    disabled={isLoading}
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.company}
                    </p>
                  )}
                </div>

                {/* Team Size */}
                <div>
                  <label htmlFor="teamSize" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Velikost týmu
                  </label>
                  <select
                    id="teamSize"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="input-field"
                    disabled={isLoading}
                  >
                    {teamSizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Dodatečné poznámky (nepovinné)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Řekněte nám o vašich potřebách a cílech..."
                    disabled={isLoading}
                  />
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
                      <Calendar className="w-5 h-5" />
                      Naplánovat demo
                    </>
                  )}
                </button>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                  Ozveme se vám do 24 hodin pro domluvení termínu
                </p>
              </form>
            </div>
          </div>

          {/* What to Expect */}
          <div className="space-y-6">
            {/* Demo Benefits */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Video className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                <h3 className="text-xl font-bold">Co uvidíte</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Live AI Demo</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Živá ukázka všech 4 AI modulů v akci
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Personalizovaná ukázka</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Přizpůsobeno vašemu businessu a cílům
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Q&A Session</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Prostor pro vaše otázky a konzultaci
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">ROI kalkulace</div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Analýza návratnosti investice pro váš případ
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features Preview */}
            <div className="card bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
              <h3 className="text-xl font-bold mb-6">AI Moduly v demo</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">TeamDynamicsAI</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">ObjectiveMatcherAI</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">DifficultyCalibratorAI</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">DebriefGeneratorAI</span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="card border-2 border-brand-primary">
              <h3 className="text-lg font-bold mb-3">Raději vyzkoušet rovnou?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Začněte s 14denní zkušební verzí zdarma a prozkoumejte všechny funkce sami.
              </p>
              <Link href="/signup" className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm">
                Vyzkoušet zdarma
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
