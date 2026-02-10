'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Building, CreditCard, Bell, Calendar, Loader2, Check, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface NotificationSettings {
  upcomingShoots: boolean
  newInquiries: boolean
  galleryReady: boolean
  paymentReminders: boolean
}

interface BusinessSettings {
  name: string
  website: string
  phone: string
  address: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  // Profile state
  const [profileName, setProfileName] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Business state
  const [business, setBusiness] = useState<BusinessSettings>({
    name: '',
    website: '',
    phone: '',
    address: ''
  })
  const [isSavingBusiness, setIsSavingBusiness] = useState(false)

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    upcomingShoots: true,
    newInquiries: true,
    galleryReady: true,
    paymentReminders: true
  })
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      setProfileName(session.user.name || '')
      loadBusinessSettings()
      loadNotificationSettings()
    }
  }, [session])

  const loadBusinessSettings = async () => {
    setIsLoadingBusiness(true)
    try {
      const response = await fetch('/api/settings/business')
      if (response.ok) {
        const data = await response.json()
        setBusiness(data)
      }
    } catch (error) {
      console.error('Failed to load business settings:', error)
    } finally {
      setIsLoadingBusiness(false)
    }
  }

  const loadNotificationSettings = async () => {
    setIsLoadingNotifications(true)
    try {
      const response = await fetch('/api/settings/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName })
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to save profile changes')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveBusiness = async () => {
    setIsSavingBusiness(true)
    try {
      const response = await fetch('/api/settings/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
      })

      if (response.ok) {
        toast.success('Business settings updated successfully')
      } else {
        throw new Error('Failed to update business settings')
      }
    } catch (error) {
      toast.error('Failed to save business changes')
    } finally {
      setIsSavingBusiness(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications)
      })

      if (response.ok) {
        toast.success('Notification preferences saved')
      } else {
        throw new Error('Failed to update notifications')
      }
    } catch (error) {
      toast.error('Failed to save notification preferences')
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    )
    if (!confirmed) return

    const doubleConfirmed = window.confirm(
      'This is your FINAL warning. All your packages, clients, galleries, and invoices will be permanently deleted. Type "DELETE" to confirm.'
    )
    if (!doubleConfirmed) return

    toast.error('Account deletion is not yet implemented')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your account and business preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <Input
            label="Full Name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            value={session?.user?.email || ''}
            placeholder="your@email.com"
            disabled
            helperText="Email cannot be changed"
          />
          <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
            {isSavingProfile ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Configure your studio details</CardDescription>
            </div>
          </div>
        </CardHeader>

        {isLoadingBusiness ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Business Name"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              placeholder="Your Photography Studio"
            />
            <Input
              label="Website"
              type="url"
              value={business.website}
              onChange={(e) => setBusiness({ ...business, website: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
            <Input
              label="Phone"
              type="tel"
              value={business.phone}
              onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Business Address</label>
              <textarea
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
                value={business.address}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
            <Button onClick={handleSaveBusiness} disabled={isSavingBusiness}>
              {isSavingBusiness ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>

        {isLoadingNotifications ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400 dark:text-neutral-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Upcoming Shoots</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Get notified 24 hours before a shoot</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.upcomingShoots}
                onChange={(e) => setNotifications({ ...notifications, upcomingShoots: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">New Inquiries</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Email me when a new package inquiry comes in</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.newInquiries}
                onChange={(e) => setNotifications({ ...notifications, newInquiries: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Gallery Ready</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Notify when gallery processing is complete</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.galleryReady}
                onChange={(e) => setNotifications({ ...notifications, galleryReady: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">Payment Reminders</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Remind me about overdue invoices</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.paymentReminders}
                onChange={(e) => setNotifications({ ...notifications, paymentReminders: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
              {isSavingNotifications ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>Sync your shoots with Google Calendar</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <Link href="/admin/settings/calendar" className="block">
            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Google Calendar</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Automatically sync shoots to your calendar</p>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            </div>
          </Link>
        </div>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>Manage your plan and payment methods</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">Free Plan</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">5 packages per month | Basic features</p>
            </div>
            <Button variant="primary">Upgrade to Pro</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">5</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Packages this month</p>
            </div>
            <div className="text-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">12</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Total packages</p>
            </div>
            <div className="text-center p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">3</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Galleries created</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">Delete Account</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" onClick={handleDeleteAccount}>Delete Account</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
