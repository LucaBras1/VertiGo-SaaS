/**
 * Settings Page
 * Application settings and configuration
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, Card, fadeIn, staggerContainer, staggerItem } from '@vertigo/ui'
import { Save, Settings as SettingsIcon, Mail, Globe, Loader2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { CalendarSettings } from '@/components/calendar'

const inputClassName =
  'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500'

const textareaClassName =
  'w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500'

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    companyAddress: '',
    companyIco: '',
    companyDic: '',
    companyBankAccount: '',
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Nepodařilo se načíst nastavení')
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Nastavení byla úspěšně uložena')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Nastala chyba při ukládání nastavení')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div>
      <motion.div className="mb-6" {...fadeIn}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nastavení</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">Konfigurace aplikace a firemní údaje</p>
      </motion.div>

      <motion.div className="space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Site Settings */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Nastavení webu</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Název webu
                </label>
                <input
                  value={settings.siteTitle}
                  onChange={(e) => handleChange('siteTitle', e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Popis webu
                </label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleChange('siteDescription', e.target.value)}
                  rows={3}
                  className={textareaClassName}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Kontaktní informace</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Kontaktní email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Kontaktní telefon
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Company Information */}
        <motion.div variants={staggerItem}>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Firemní údaje</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Název společnosti
                </label>
                <input
                  value={settings.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Adresa
                </label>
                <input
                  value={settings.companyAddress}
                  onChange={(e) => handleChange('companyAddress', e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    IČO
                  </label>
                  <input
                    value={settings.companyIco}
                    onChange={(e) => handleChange('companyIco', e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    DIČ
                  </label>
                  <input
                    value={settings.companyDic}
                    onChange={(e) => handleChange('companyDic', e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Číslo bankovního účtu
                </label>
                <input
                  value={settings.companyBankAccount}
                  onChange={(e) => handleChange('companyBankAccount', e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Calendar Integration */}
        <motion.div variants={staggerItem} id="calendar">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Integrace kalendáře</h3>
            </div>
            <CalendarSettings />
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={staggerItem} className="flex justify-end">
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="w-5 h-5 mr-2" />
            Uložit nastavení
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
