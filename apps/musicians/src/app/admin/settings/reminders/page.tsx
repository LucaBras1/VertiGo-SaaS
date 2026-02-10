'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ArrowLeft,
  Bell,
  Calendar,
  FileText,
  Mail,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Plus,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ReminderSettings {
  enabled: boolean
  gigReminders: {
    enabled: boolean
    daysBefore: number[]
    sendToClient: boolean
    sendToSelf: boolean
  }
  invoiceReminders: {
    enabled: boolean
    daysBeforeDue: number
    daysAfterDue: number[]
  }
  quoteReminders: {
    enabled: boolean
    daysAfterSent: number[]
  }
  timezone: string
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  gigReminders: {
    enabled: true,
    daysBefore: [7, 1, 0],
    sendToClient: true,
    sendToSelf: true,
  },
  invoiceReminders: {
    enabled: true,
    daysBeforeDue: 3,
    daysAfterDue: [1, 7, 14],
  },
  quoteReminders: {
    enabled: false,
    daysAfterSent: [3, 7],
  },
  timezone: 'Europe/Prague',
}

export default function ReminderSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS)
  const [newGigDay, setNewGigDay] = useState('')
  const [newOverdueDay, setNewOverdueDay] = useState('')
  const [newQuoteDay, setNewQuoteDay] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/tenant/reminders')
      const data = await res.json()

      if (data.success && data.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.data })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/tenant/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Nastavení uloženo')
      } else {
        toast.error(data.error || 'Nepodařilo se uložit nastavení')
      }
    } catch (error) {
      toast.error('Nepodařilo se uložit nastavení')
    } finally {
      setSaving(false)
    }
  }

  function addGigDay() {
    const day = parseInt(newGigDay)
    if (isNaN(day) || day < 0 || day > 30) {
      toast.error('Zadejte číslo 0-30')
      return
    }
    if (settings.gigReminders.daysBefore.includes(day)) {
      toast.error('Tento den již je přidán')
      return
    }
    setSettings(prev => ({
      ...prev,
      gigReminders: {
        ...prev.gigReminders,
        daysBefore: [...prev.gigReminders.daysBefore, day].sort((a, b) => b - a),
      },
    }))
    setNewGigDay('')
  }

  function removeGigDay(day: number) {
    setSettings(prev => ({
      ...prev,
      gigReminders: {
        ...prev.gigReminders,
        daysBefore: prev.gigReminders.daysBefore.filter(d => d !== day),
      },
    }))
  }

  function addOverdueDay() {
    const day = parseInt(newOverdueDay)
    if (isNaN(day) || day < 1 || day > 30) {
      toast.error('Zadejte číslo 1-30')
      return
    }
    if (settings.invoiceReminders.daysAfterDue.includes(day)) {
      toast.error('Tento den již je přidán')
      return
    }
    setSettings(prev => ({
      ...prev,
      invoiceReminders: {
        ...prev.invoiceReminders,
        daysAfterDue: [...prev.invoiceReminders.daysAfterDue, day].sort((a, b) => a - b),
      },
    }))
    setNewOverdueDay('')
  }

  function removeOverdueDay(day: number) {
    setSettings(prev => ({
      ...prev,
      invoiceReminders: {
        ...prev.invoiceReminders,
        daysAfterDue: prev.invoiceReminders.daysAfterDue.filter(d => d !== day),
      },
    }))
  }

  function addQuoteDay() {
    const day = parseInt(newQuoteDay)
    if (isNaN(day) || day < 1 || day > 30) {
      toast.error('Zadejte číslo 1-30')
      return
    }
    if (settings.quoteReminders.daysAfterSent.includes(day)) {
      toast.error('Tento den již je přidán')
      return
    }
    setSettings(prev => ({
      ...prev,
      quoteReminders: {
        ...prev.quoteReminders,
        daysAfterSent: [...prev.quoteReminders.daysAfterSent, day].sort((a, b) => a - b),
      },
    }))
    setNewQuoteDay('')
  }

  function removeQuoteDay(day: number) {
    setSettings(prev => ({
      ...prev,
      quoteReminders: {
        ...prev.quoteReminders,
        daysAfterSent: prev.quoteReminders.daysAfterSent.filter(d => d !== day),
      },
    }))
  }

  function formatDayLabel(day: number, type: 'before' | 'after' | 'overdue'): string {
    if (type === 'before') {
      if (day === 0) return 'V den akce'
      if (day === 1) return '1 den předem'
      if (day >= 2 && day <= 4) return `${day} dny předem`
      return `${day} dní předem`
    }
    if (type === 'after' || type === 'overdue') {
      if (day === 1) return '1 den po'
      if (day >= 2 && day <= 4) return `${day} dny po`
      return `${day} dní po`
    }
    return `${day} dní`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na nastavení
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nastavení připomínek</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Automatické emailové připomínky pro gigy, faktury a nabídky
        </p>
      </div>

      {/* Master toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.enabled ? 'bg-green-50' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                <Bell className={`w-5 h-5 ${settings.enabled ? 'text-green-600' : 'text-neutral-400'}`} />
              </div>
              <div>
                <p className="font-medium">Připomínky aktivní</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {settings.enabled
                    ? 'Systém automaticky posílá připomínky'
                    : 'Žádné připomínky se neposílají'}
                </p>
              </div>
            </div>
            <button onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}>
              {settings.enabled ? (
                <ToggleRight className="w-10 h-10 text-green-600" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-neutral-400" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Gig Reminders */}
      <Card className={!settings.enabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <CardTitle>Připomínky gigů</CardTitle>
                <CardDescription>Email před nadcházejícími akcemi</CardDescription>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings(prev => ({
                  ...prev,
                  gigReminders: { ...prev.gigReminders, enabled: !prev.gigReminders.enabled },
                }))
              }
              disabled={!settings.enabled}
            >
              {settings.gigReminders.enabled ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-neutral-400" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Days before */}
          <div>
            <Label>Připomenout X dní před akcí</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.gigReminders.daysBefore.map(day => (
                <span
                  key={day}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                >
                  {formatDayLabel(day, 'before')}
                  <button
                    onClick={() => removeGigDay(day)}
                    className="hover:text-primary-900 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={newGigDay}
                  onChange={(e) => setNewGigDay(e.target.value)}
                  placeholder="0-30"
                  className="w-20 h-8"
                />
                <Button size="sm" variant="outline" onClick={addGigDay}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Příjemci</Label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded"
                checked={settings.gigReminders.sendToClient}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    gigReminders: { ...prev.gigReminders, sendToClient: e.target.checked },
                  }))
                }
                disabled={!settings.enabled || !settings.gigReminders.enabled}
              />
              <div>
                <p className="font-medium text-sm">Klient</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Odeslat připomínku klientovi</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="rounded"
                checked={settings.gigReminders.sendToSelf}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    gigReminders: { ...prev.gigReminders, sendToSelf: e.target.checked },
                  }))
                }
                disabled={!settings.enabled || !settings.gigReminders.enabled}
              />
              <div>
                <p className="font-medium text-sm">Já (kapela)</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Odeslat připomínku sobě</p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Reminders */}
      <Card className={!settings.enabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <CardTitle>Připomínky faktur</CardTitle>
                <CardDescription>Email před a po splatnosti faktury</CardDescription>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings(prev => ({
                  ...prev,
                  invoiceReminders: { ...prev.invoiceReminders, enabled: !prev.invoiceReminders.enabled },
                }))
              }
              disabled={!settings.enabled}
            >
              {settings.invoiceReminders.enabled ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-neutral-400" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Before due */}
          <div>
            <Label>Připomenout před splatností (dny)</Label>
            <Input
              type="number"
              min={1}
              max={14}
              value={settings.invoiceReminders.daysBeforeDue}
              onChange={(e) =>
                setSettings(prev => ({
                  ...prev,
                  invoiceReminders: {
                    ...prev.invoiceReminders,
                    daysBeforeDue: parseInt(e.target.value) || 3,
                  },
                }))
              }
              className="w-24 mt-1"
              disabled={!settings.enabled || !settings.invoiceReminders.enabled}
            />
          </div>

          {/* After due */}
          <div>
            <Label>Připomenout po splatnosti (upomínky)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.invoiceReminders.daysAfterDue.map(day => (
                <span
                  key={day}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                >
                  {formatDayLabel(day, 'overdue')}
                  <button
                    onClick={() => removeOverdueDay(day)}
                    className="hover:text-red-900 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={newOverdueDay}
                  onChange={(e) => setNewOverdueDay(e.target.value)}
                  placeholder="1-30"
                  className="w-20 h-8"
                  disabled={!settings.enabled || !settings.invoiceReminders.enabled}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addOverdueDay}
                  disabled={!settings.enabled || !settings.invoiceReminders.enabled}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Reminders */}
      <Card className={!settings.enabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-yellow-600" />
              <div>
                <CardTitle>Připomínky nabídek</CardTitle>
                <CardDescription>Email follow-up po odeslání nabídky</CardDescription>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings(prev => ({
                  ...prev,
                  quoteReminders: { ...prev.quoteReminders, enabled: !prev.quoteReminders.enabled },
                }))
              }
              disabled={!settings.enabled}
            >
              {settings.quoteReminders.enabled ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-neutral-400" />
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Připomenout X dní po odeslání nabídky</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.quoteReminders.daysAfterSent.map(day => (
                <span
                  key={day}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm"
                >
                  {formatDayLabel(day, 'after')}
                  <button
                    onClick={() => removeQuoteDay(day)}
                    className="hover:text-yellow-900 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={newQuoteDay}
                  onChange={(e) => setNewQuoteDay(e.target.value)}
                  placeholder="1-30"
                  className="w-20 h-8"
                  disabled={!settings.enabled || !settings.quoteReminders.enabled}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addQuoteDay}
                  disabled={!settings.enabled || !settings.quoteReminders.enabled}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              Automatický follow-up email klientovi, pokud neodpověděl na nabídku
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card className={!settings.enabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <div>
              <CardTitle>Časové pásmo</CardTitle>
              <CardDescription>Pro výpočet kdy poslat připomínky</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
            className="w-full max-w-xs px-3 py-2 border rounded-lg"
            disabled={!settings.enabled}
          >
            <option value="Europe/Prague">Europe/Prague (CET/CEST)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
            <option value="America/New_York">America/New_York (EST/EDT)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
          </select>
        </CardContent>
      </Card>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Jak připomínky fungují</p>
          <ul className="mt-1 space-y-1 list-disc list-inside text-blue-700">
            <li>Připomínky se posílají automaticky jednou denně (ráno)</li>
            <li>Každá připomínka se odešle pouze jednou</li>
            <li>Připomínky se posílají pouze pro potvrzené gigy</li>
            <li>Upomínky faktur se posílají pouze pro neuhrazené faktury</li>
          </ul>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={saving}>
          Uložit nastavení
        </Button>
      </div>
    </div>
  )
}
