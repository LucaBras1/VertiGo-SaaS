'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Tabs, TabList, TabTrigger, TabPanels, TabPanel } from '@vertigo/ui'
import { User, Building, CreditCard, Bell, Calendar, Globe, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import CalendarSettings from '@/components/calendar/CalendarSettings'
import toast from 'react-hot-toast'
import { Button, Input, Textarea, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vertigo/ui'

interface BillingData {
  billingName: string
  ico: string
  dic: string
  address: string
  city: string
  postalCode: string
  bankAccount: string
}

interface NotificationsData {
  enableInquiries: boolean
  enableConfirmations: boolean
  enablePayments: boolean
  enableReminders: boolean
}

interface TenantData {
  bandName: string
  bandBio: string
  email: string
  phone: string
  website: string
}

export default function SettingsPage() {
  const { data: session } = useSession()

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingTenant, setIsLoadingTenant] = useState(false)
  const [isLoadingBilling, setIsLoadingBilling] = useState(false)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)

  // Profile state
  const [profileName, setProfileName] = useState('')

  // Tenant state
  const [tenant, setTenant] = useState<TenantData>({
    bandName: '',
    bandBio: '',
    email: '',
    phone: '',
    website: '',
  })

  // Billing state
  const [billing, setBilling] = useState<BillingData>({
    billingName: '',
    ico: '',
    dic: '',
    address: '',
    city: '',
    postalCode: '',
    bankAccount: '',
  })

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationsData>({
    enableInquiries: true,
    enableConfirmations: true,
    enablePayments: true,
    enableReminders: false,
  })

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Track if data has been loaded
  const dataLoaded = useRef(false)

  // Load initial data
  useEffect(() => {
    if (session?.user && !dataLoaded.current) {
      dataLoaded.current = true
      setProfileName(session.user.name || '')

      // Load tenant settings
      fetch('/api/tenant/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setTenant({
              bandName: data.data.bandName || '',
              bandBio: data.data.bandBio || '',
              email: data.data.email || '',
              phone: data.data.phone || '',
              website: data.data.website || '',
            })
          }
        })
        .catch(console.error)

      // Load billing settings
      fetch('/api/tenant/billing')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.billing) {
            setBilling({
              billingName: data.data.billing.billingName || '',
              ico: data.data.billing.ico || '',
              dic: data.data.billing.dic || '',
              address: data.data.billing.address || '',
              city: data.data.billing.city || '',
              postalCode: data.data.billing.postalCode || '',
              bankAccount: data.data.billing.bankAccount || '',
            })
          }
        })
        .catch(console.error)

      // Load notification settings
      fetch('/api/tenant/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.notifications) {
            setNotifications(data.data.notifications)
          }
        })
        .catch(console.error)
    }
  }, [session])

  // Save profile
  const handleSaveProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profil uložen')
      } else {
        toast.error(data.error || 'Nepodařilo se uložit profil')
      }
    } catch {
      toast.error('Nepodařilo se uložit profil')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Save tenant settings
  const handleSaveTenant = async () => {
    setIsLoadingTenant(true)
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Nastavení kapely uloženo')
      } else {
        toast.error(data.error || 'Nepodařilo se uložit nastavení')
      }
    } catch {
      toast.error('Nepodařilo se uložit nastavení')
    } finally {
      setIsLoadingTenant(false)
    }
  }

  // Save billing settings
  const handleSaveBilling = async () => {
    setIsLoadingBilling(true)
    try {
      const res = await fetch('/api/tenant/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billing),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Fakturační údaje uloženy')
      } else {
        toast.error(data.error || 'Nepodařilo se uložit fakturační údaje')
      }
    } catch {
      toast.error('Nepodařilo se uložit fakturační údaje')
    } finally {
      setIsLoadingBilling(false)
    }
  }

  // Save notification settings
  const handleSaveNotifications = async () => {
    setIsLoadingNotifications(true)
    try {
      const res = await fetch('/api/tenant/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Nastavení notifikací uloženo')
      } else {
        toast.error(data.error || 'Nepodařilo se uložit nastavení notifikací')
      }
    } catch {
      toast.error('Nepodařilo se uložit nastavení notifikací')
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Hesla se neshodují')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Nové heslo musí mít alespoň 8 znaků')
      return
    }

    setIsLoadingPassword(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Heslo úspěšně změněno')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.error || 'Nepodařilo se změnit heslo')
      }
    } catch {
      toast.error('Nepodařilo se změnit heslo')
    } finally {
      setIsLoadingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nastavení</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa vašeho účtu a preferencí</p>
      </div>

      <Tabs>
        <TabList>
          <TabTrigger>
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabTrigger>
          <TabTrigger>
            <Building className="h-4 w-4 mr-2" />
            Kapela
          </TabTrigger>
          <TabTrigger>
            <CreditCard className="h-4 w-4 mr-2" />
            Fakturace
          </TabTrigger>
          <TabTrigger>
            <Bell className="h-4 w-4 mr-2" />
            Notifikace
          </TabTrigger>
          <TabTrigger>
            <Calendar className="h-4 w-4 mr-2" />
            Kalendář
          </TabTrigger>
          <TabTrigger>
            <Globe className="h-4 w-4 mr-2" />
            Widget
          </TabTrigger>
        </TabList>

        <TabPanels>
          {/* Profile */}
          <TabPanel>
            <Card>
              <CardHeader>
                <CardTitle>Osobní údaje</CardTitle>
                <CardDescription>Aktualizujte své osobní informace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Jméno</Label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={session?.user?.email || ''} disabled />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} loading={isLoadingProfile}>
                    Uložit změny
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Změna hesla</CardTitle>
                <CardDescription>Aktualizujte své heslo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Současné heslo</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nové heslo</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Potvrzení hesla</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    loading={isLoadingPassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Změnit heslo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Band */}
          <TabPanel>
            <Card>
              <CardHeader>
                <CardTitle>Informace o kapele</CardTitle>
                <CardDescription>Údaje zobrazené na fakturách a komunikaci</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Název kapely / umělce</Label>
                  <Input
                    value={tenant.bandName}
                    onChange={(e) => setTenant({ ...tenant, bandName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    placeholder="Krátký popis vaší kapely..."
                    className="min-h-[100px]"
                    value={tenant.bandBio}
                    onChange={(e) => setTenant({ ...tenant, bandBio: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Kontaktní email</Label>
                    <Input
                      type="email"
                      placeholder="booking@kapela.cz"
                      value={tenant.email}
                      onChange={(e) => setTenant({ ...tenant, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      placeholder="+420 123 456 789"
                      value={tenant.phone}
                      onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Web</Label>
                  <Input
                    placeholder="https://www.kapela.cz"
                    value={tenant.website}
                    onChange={(e) => setTenant({ ...tenant, website: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveTenant} loading={isLoadingTenant}>
                    Uložit změny
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Billing */}
          <TabPanel>
            <Card>
              <CardHeader>
                <CardTitle>Fakturační údaje</CardTitle>
                <CardDescription>Údaje pro vystavování faktur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Fakturační jméno / firma</Label>
                    <Input
                      placeholder="Jan Novák / Kapela s.r.o."
                      value={billing.billingName}
                      onChange={(e) => setBilling({ ...billing, billingName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>IČO</Label>
                    <Input
                      placeholder="12345678"
                      value={billing.ico}
                      onChange={(e) => setBilling({ ...billing, ico: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>DIČ</Label>
                  <Input
                    placeholder="CZ12345678"
                    value={billing.dic}
                    onChange={(e) => setBilling({ ...billing, dic: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Adresa</Label>
                  <Input
                    placeholder="Ulice 123"
                    value={billing.address}
                    onChange={(e) => setBilling({ ...billing, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Město</Label>
                    <Input
                      placeholder="Praha"
                      value={billing.city}
                      onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>PSČ</Label>
                    <Input
                      placeholder="110 00"
                      value={billing.postalCode}
                      onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Bankovní účet</Label>
                  <Input
                    placeholder="123456789/0100"
                    value={billing.bankAccount}
                    onChange={(e) => setBilling({ ...billing, bankAccount: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveBilling} loading={isLoadingBilling}>
                    Uložit změny
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Notifications */}
          <TabPanel>
            <Card>
              <CardHeader>
                <CardTitle>Nastavení notifikací</CardTitle>
                <CardDescription>Zvolte, o čem chcete být informováni</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notifications.enableInquiries}
                      onChange={(e) => setNotifications({ ...notifications, enableInquiries: e.target.checked })}
                    />
                    <div>
                      <p className="font-medium">Nové poptávky</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Email při nové poptávce</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notifications.enableConfirmations}
                      onChange={(e) => setNotifications({ ...notifications, enableConfirmations: e.target.checked })}
                    />
                    <div>
                      <p className="font-medium">Potvrzení gigu</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Email při potvrzení zakázky</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notifications.enablePayments}
                      onChange={(e) => setNotifications({ ...notifications, enablePayments: e.target.checked })}
                    />
                    <div>
                      <p className="font-medium">Platba faktury</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Email při přijetí platby</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={notifications.enableReminders}
                      onChange={(e) => setNotifications({ ...notifications, enableReminders: e.target.checked })}
                    />
                    <div>
                      <p className="font-medium">Připomínka gigu</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Připomínka den před akcí</p>
                    </div>
                  </label>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications} loading={isLoadingNotifications}>
                    Uložit změny
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Automatické připomínky</CardTitle>
                <CardDescription>
                  Pokročilé nastavení automatických emailových připomínek
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Nastavte si automatické připomínky před gigy, upomínky faktur
                  a follow-up emaily pro nepotrvzené nabídky.
                </p>
                <Link href="/admin/settings/reminders">
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Nastavit připomínky
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Calendar */}
          <TabPanel>
            <CalendarSettings />
          </TabPanel>

          {/* Widget */}
          <TabPanel>
            <Card>
              <CardHeader>
                <CardTitle>Rezervační widget</CardTitle>
                <CardDescription>
                  Embeddable formulář pro přijímání poptávek na vašem webu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Vytvořte si vlastní rezervační formulář, který můžete vložit na svůj web
                  nebo sdílet jako samostatnou stránku. Klienti vám mohou posílat poptávky
                  přímo a vy je uvidíte jako nové gigy v dashboardu.
                </p>
                <Link href="/admin/settings/widget">
                  <Button>
                    <Globe className="h-4 w-4 mr-2" />
                    Nastavit widget
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}
