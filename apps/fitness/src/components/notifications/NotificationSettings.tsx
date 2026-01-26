'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, Clock, Users, Receipt, CreditCard, AlertTriangle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface NotificationPreferences {
  sessionReminders: boolean
  classReminders: boolean
  invoiceNotifications: boolean
  paymentNotifications: boolean
  atRiskAlerts: boolean
  reminderMinutesBefore: number
  emailEnabled: boolean
  pushEnabled: boolean
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    sessionReminders: true,
    classReminders: true,
    invoiceNotifications: true,
    paymentNotifications: true,
    atRiskAlerts: true,
    reminderMinutesBefore: 60,
    emailEnabled: true,
    pushEnabled: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    loadPreferences()
    checkPushStatus()
  }, [])

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data.preferences)
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      toast.error('Nepodařilo se načíst nastavení')
    } finally {
      setIsLoading(false)
    }
  }

  const checkPushStatus = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return
    }

    setPushPermission(Notification.permission)

    if (Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error('Failed to check push subscription:', error)
      }
    }
  }

  const savePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      })

      if (!response.ok) {
        throw new Error('Failed to save')
      }

      const data = await response.json()
      setPreferences(data.preferences)
      toast.success('Nastavení uloženo')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Nepodařilo se uložit nastavení')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key]
    setPreferences(prev => ({ ...prev, [key]: newValue }))
    savePreferences({ [key]: newValue })
  }

  const handleReminderChange = (minutes: number) => {
    setPreferences(prev => ({ ...prev, reminderMinutesBefore: minutes }))
    savePreferences({ reminderMinutesBefore: minutes })
  }

  const enablePushNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)

      if (permission !== 'granted') {
        toast.error('Notifikace byly zamítnuty')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const response = await fetch('/api/notifications/subscribe')
      if (!response.ok) throw new Error('Failed to get VAPID key')

      const { vapidPublicKey } = await response.json()

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      })

      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (!subscribeResponse.ok) throw new Error('Failed to register')

      setIsSubscribed(true)
      toast.success('Push notifikace povoleny')
    } catch (error) {
      console.error('Error enabling push:', error)
      toast.error('Nepodařilo se povolit notifikace')
    }
  }

  const disablePushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        await subscription.unsubscribe()
      }

      setIsSubscribed(false)
      toast.success('Push notifikace zakázány')
    } catch (error) {
      console.error('Error disabling push:', error)
      toast.error('Nepodařilo se zakázat notifikace')
    }
  }

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', { method: 'POST' })
      const data = await response.json()

      if (data.push) {
        toast.success('Test notifikace odeslána')
      } else {
        toast.error(data.message || 'Notifikace nebyla odeslána')
      }
    } catch (error) {
      console.error('Test notification error:', error)
      toast.error('Nepodařilo se odeslat test')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-green-600" />
          Push notifikace
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {pushPermission === 'denied'
                ? 'Push notifikace jsou v prohlížeči zakázány'
                : isSubscribed
                  ? 'Push notifikace jsou aktivní'
                  : 'Push notifikace nejsou aktivní'}
            </p>
          </div>

          <div className="flex gap-2">
            {isSubscribed ? (
              <>
                <button
                  onClick={sendTestNotification}
                  className="px-3 py-2 text-sm text-green-600 hover:text-green-700"
                >
                  Test
                </button>
                <button
                  onClick={disablePushNotifications}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Zakázat
                </button>
              </>
            ) : pushPermission !== 'denied' ? (
              <button
                onClick={enablePushNotifications}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                Povolit
              </button>
            ) : (
              <span className="text-sm text-gray-500">
                Povolte v nastavení prohlížeče
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kanály notifikací</h3>

        <div className="space-y-4">
          <ToggleRow
            icon={<Bell className="w-5 h-5" />}
            label="Push notifikace"
            description="Notifikace přímo do prohlížeče"
            checked={preferences.pushEnabled}
            onChange={() => handleToggle('pushEnabled')}
            disabled={isSaving}
          />

          <ToggleRow
            icon={<Mail className="w-5 h-5" />}
            label="E-mailové notifikace"
            description="Notifikace na e-mail"
            checked={preferences.emailEnabled}
            onChange={() => handleToggle('emailEnabled')}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typy notifikací</h3>

        <div className="space-y-4">
          <ToggleRow
            icon={<Clock className="w-5 h-5" />}
            label="Připomínky tréninků"
            description="Upozornění na nadcházející tréninky"
            checked={preferences.sessionReminders}
            onChange={() => handleToggle('sessionReminders')}
            disabled={isSaving}
          />

          <ToggleRow
            icon={<Users className="w-5 h-5" />}
            label="Připomínky lekcí"
            description="Upozornění na skupinové lekce"
            checked={preferences.classReminders}
            onChange={() => handleToggle('classReminders')}
            disabled={isSaving}
          />

          <ToggleRow
            icon={<Receipt className="w-5 h-5" />}
            label="Nové faktury"
            description="Upozornění na vystavené faktury"
            checked={preferences.invoiceNotifications}
            onChange={() => handleToggle('invoiceNotifications')}
            disabled={isSaving}
          />

          <ToggleRow
            icon={<CreditCard className="w-5 h-5" />}
            label="Přijaté platby"
            description="Upozornění na přijaté platby"
            checked={preferences.paymentNotifications}
            onChange={() => handleToggle('paymentNotifications')}
            disabled={isSaving}
          />

          <ToggleRow
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Klienti v ohrožení"
            description="Upozornění na klienty s rizikem odchodu"
            checked={preferences.atRiskAlerts}
            onChange={() => handleToggle('atRiskAlerts')}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Reminder Timing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Čas připomínky</h3>

        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Připomenout před tréninkem:</label>
          <select
            value={preferences.reminderMinutesBefore}
            onChange={(e) => handleReminderChange(parseInt(e.target.value))}
            disabled={isSaving}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value={15}>15 minut</option>
            <option value={30}>30 minut</option>
            <option value={60}>1 hodina</option>
            <option value={120}>2 hodiny</option>
            <option value={1440}>1 den</option>
          </select>
        </div>
      </div>
    </div>
  )
}

interface ToggleRowProps {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

function ToggleRow({ icon, label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-green-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
