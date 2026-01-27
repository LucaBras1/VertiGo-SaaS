'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Building2, Bell, Shield, Calendar, Loader2, Save } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { NotificationSettings } from '@/components/notifications'
import { CalendarSettings } from '@/components/calendar'

const profileSchema = z.object({
  name: z.string().min(1, 'Jméno je povinné'),
  email: z.string().email('Neplatný email'),
})

const businessSchema = z.object({
  tenantName: z.string().min(1, 'Název firmy je povinný'),
  address: z.string().optional(),
  phone: z.string().optional(),
  ico: z.string().optional(),
  dic: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type BusinessFormData = z.infer<typeof businessSchema>

type Tab = 'profile' | 'business' | 'notifications' | 'calendar' | 'security'

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'business', label: 'Firma', icon: Building2 },
  { id: 'notifications', label: 'Notifikace', icon: Bell },
  { id: 'calendar', label: 'Kalendář', icon: Calendar },
  { id: 'security', label: 'Zabezpečení', icon: Shield },
]

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const businessForm = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      tenantName: '',
      address: '',
      phone: '',
      ico: '',
      dic: '',
    },
  })

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || '',
        email: session.user.email || '',
      })
      businessForm.reset({
        tenantName: session.user.tenantName || '',
        address: '',
        phone: '',
        ico: '',
        dic: '',
      })
    }
  }, [session, profileForm, businessForm])

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Chyba při ukládání')
      }

      await updateSession()
      toast.success('Profil byl uložen')
    } catch {
      toast.error('Chyba při ukládání profilu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBusinessSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Chyba při ukládání')
      }

      await updateSession()
      toast.success('Nastavení firmy bylo uloženo')
    } catch {
      toast.error('Chyba při ukládání nastavení')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nastavení</h1>
              <p className="text-gray-600">Správa účtu a preferencí</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeTab === 'profile' && (
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Osobní údaje</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jméno a příjmení
                        </label>
                        <input
                          {...profileForm.register('name')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {profileForm.formState.errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          {...profileForm.register('email')}
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {profileForm.formState.errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Uložit změny
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'business' && (
                <form onSubmit={businessForm.handleSubmit(handleBusinessSubmit)} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Údaje o firmě</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Název firmy / studia
                        </label>
                        <input
                          {...businessForm.register('tenantName')}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {businessForm.formState.errors.tenantName && (
                          <p className="mt-1 text-sm text-red-600">
                            {businessForm.formState.errors.tenantName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresa
                        </label>
                        <input
                          {...businessForm.register('address')}
                          type="text"
                          placeholder="Ulice, město, PSČ"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          {...businessForm.register('phone')}
                          type="tel"
                          placeholder="+420 xxx xxx xxx"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            IČO
                          </label>
                          <input
                            {...businessForm.register('ico')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            DIČ
                          </label>
                          <input
                            {...businessForm.register('dic')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Uložit změny
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Nastavení notifikací</h2>
                  <NotificationSettings />
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Synchronizace kalendáře</h2>
                  <CalendarSettings />
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Zabezpečení účtu</h2>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Změna hesla</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Pravidelná změna hesla zvyšuje bezpečnost vašeho účtu
                      </p>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Změnit heslo
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Dvoufaktorové ověření</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Přidejte další vrstvu zabezpečení pomocí 2FA
                      </p>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Nastavit 2FA
                      </button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">Aktivní relace</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Zobrazte a spravujte zařízení přihlášená k vašemu účtu
                      </p>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Zobrazit relace
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
