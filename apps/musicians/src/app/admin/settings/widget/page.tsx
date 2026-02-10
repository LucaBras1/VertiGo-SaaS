'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ArrowLeft,
  Globe,
  Palette,
  Settings,
  Copy,
  RefreshCw,
  ExternalLink,
  Code,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface WidgetData {
  id: string
  token: string
  isActive: boolean
  displayName: string | null
  displayBio: string | null
  displayPhoto: string | null
  primaryColor: string
  backgroundColor: string
  allowedEventTypes: string[]
  minNoticeHours: number
  maxSubmissionsPerDay: number
  successMessage: string | null
  _count: { inquiries: number }
}

const EVENT_TYPE_OPTIONS = [
  { value: 'wedding', label: 'Svatba' },
  { value: 'corporate', label: 'Firemní akce' },
  { value: 'party', label: 'Soukromá oslava' },
  { value: 'concert', label: 'Koncert' },
  { value: 'festival', label: 'Festival' },
  { value: 'birthday', label: 'Narozeniny' },
  { value: 'graduation', label: 'Promoce' },
  { value: 'other', label: 'Jiná akce' },
]

export default function WidgetSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [widget, setWidget] = useState<WidgetData | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    displayBio: '',
    displayPhoto: '',
    primaryColor: '#2563eb',
    backgroundColor: '#ffffff',
    allowedEventTypes: ['wedding', 'corporate', 'party'],
    minNoticeHours: 48,
    maxSubmissionsPerDay: 50,
    successMessage: '',
    isActive: true,
  })

  // Load widget data
  useEffect(() => {
    async function loadWidget() {
      try {
        const res = await fetch('/api/widget')
        const data = await res.json()

        if (data.success && data.data) {
          setWidget(data.data)
          setFormData({
            displayName: data.data.displayName || '',
            displayBio: data.data.displayBio || '',
            displayPhoto: data.data.displayPhoto || '',
            primaryColor: data.data.primaryColor,
            backgroundColor: data.data.backgroundColor,
            allowedEventTypes: data.data.allowedEventTypes,
            minNoticeHours: data.data.minNoticeHours,
            maxSubmissionsPerDay: data.data.maxSubmissionsPerDay,
            successMessage: data.data.successMessage || '',
            isActive: data.data.isActive,
          })
        }
      } catch {
        toast.error('Nepodařilo se načíst widget')
      } finally {
        setLoading(false)
      }
    }

    loadWidget()
  }, [])

  // Create widget
  async function handleCreate() {
    setSaving(true)
    try {
      const res = await fetch('/api/widget', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setWidget(data.data)
        setFormData({
          displayName: data.data.displayName || '',
          displayBio: data.data.displayBio || '',
          displayPhoto: data.data.displayPhoto || '',
          primaryColor: data.data.primaryColor,
          backgroundColor: data.data.backgroundColor,
          allowedEventTypes: data.data.allowedEventTypes,
          minNoticeHours: data.data.minNoticeHours,
          maxSubmissionsPerDay: data.data.maxSubmissionsPerDay,
          successMessage: data.data.successMessage || '',
          isActive: data.data.isActive,
        })
        toast.success('Widget vytvořen')
      } else {
        toast.error(data.error || 'Nepodařilo se vytvořit widget')
      }
    } catch {
      toast.error('Nepodařilo se vytvořit widget')
    } finally {
      setSaving(false)
    }
  }

  // Save widget
  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/widget', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          displayPhoto: formData.displayPhoto || undefined,
          successMessage: formData.successMessage || undefined,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setWidget(data.data)
        toast.success('Nastavení uloženo')
      } else {
        toast.error(data.error || 'Nepodařilo se uložit nastavení')
      }
    } catch {
      toast.error('Nepodařilo se uložit nastavení')
    } finally {
      setSaving(false)
    }
  }

  // Regenerate token
  async function handleRegenerateToken() {
    if (!confirm('Opravdu chcete vygenerovat nový token? Starý přestane fungovat.')) return

    setRegenerating(true)
    try {
      const res = await fetch('/api/widget/regenerate-token', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setWidget(data.data)
        toast.success('Nový token vygenerován')
      } else {
        toast.error(data.error || 'Nepodařilo se vygenerovat token')
      }
    } catch {
      toast.error('Nepodařilo se vygenerovat token')
    } finally {
      setRegenerating(false)
    }
  }

  // Copy URL to clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Zkopírováno do schránky')
  }

  // Toggle event type
  function toggleEventType(type: string) {
    setFormData(prev => ({
      ...prev,
      allowedEventTypes: prev.allowedEventTypes.includes(type)
        ? prev.allowedEventTypes.filter(t => t !== type)
        : [...prev.allowedEventTypes, type],
    }))
  }

  const widgetUrl = widget ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${widget.token}` : ''
  const embedCode = widget ? `<iframe src="${widgetUrl}" width="100%" height="800" frameborder="0"></iframe>` : ''
  const scriptCode = widget ? `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-token="${widget.token}"></script>` : ''

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Rezervační widget</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Embeddable formulář pro přijímání poptávek na vašem webu
        </p>
      </div>

      {/* No widget - Create button */}
      {!widget && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Globe className="w-12 h-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Zatím nemáte rezervační widget
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-center max-w-md">
              Vytvořte si vlastní rezervační formulář, který můžete vložit na svůj web nebo sdílet jako samostatnou stránku.
            </p>
            <Button onClick={handleCreate} isLoading={saving}>
              <Globe className="w-4 h-4 mr-2" />
              Vytvořit widget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Widget exists */}
      {widget && (
        <>
          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Odkazy a vložení
              </CardTitle>
              <CardDescription>
                Použijte tyto odkazy pro sdílení nebo vložení widgetu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Direct URL */}
              <div>
                <Label>Přímý odkaz na formulář</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={widgetUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copyToClipboard(widgetUrl)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Embed code */}
              <div>
                <Label>iFrame kód pro vložení</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={embedCode} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copyToClipboard(embedCode)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Script code */}
              <div>
                <Label>JavaScript snippet</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={scriptCode} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copyToClipboard(scriptCode)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Regenerate token */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={handleRegenerateToken}
                  isLoading={regenerating}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Vygenerovat nový token
                </Button>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Starý odkaz přestane fungovat. Používejte pouze v případě kompromitace.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Vzhled a branding
              </CardTitle>
              <CardDescription>
                Přizpůsobte vzhled formuláře vaší značce
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Zobrazované jméno</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Vaše kapela"
                  />
                </div>

                <div>
                  <Label>URL profilové fotky</Label>
                  <Input
                    value={formData.displayPhoto}
                    onChange={(e) => setFormData({ ...formData, displayPhoto: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label>Krátký popis</Label>
                <Textarea
                  value={formData.displayBio}
                  onChange={(e) => setFormData({ ...formData, displayBio: e.target.value })}
                  placeholder="Pár slov o vaší kapele..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Primární barva</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label>Barva pozadí</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Zpráva po odeslání</Label>
                <Textarea
                  value={formData.successMessage}
                  onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                  placeholder="Děkujeme za vaši poptávku! Ozveme se vám co nejdříve."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Nastavení formuláře
              </CardTitle>
              <CardDescription>
                Konfigurujte co a jak mohou klienti rezervovat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                <div>
                  <p className="font-medium">Widget aktivní</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Když je vypnutý, formulář zobrazí chybovou hlášku</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className="text-primary-600"
                >
                  {formData.isActive ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-neutral-400" />
                  )}
                </button>
              </div>

              {/* Event types */}
              <div>
                <Label>Povolené typy akcí</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => toggleEventType(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.allowedEventTypes.includes(option.value)
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:bg-neutral-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimální předstih (hodiny)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={720}
                    value={formData.minNoticeHours}
                    onChange={(e) => setFormData({ ...formData, minNoticeHours: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Kolik hodin předem musí klient rezervovat
                  </p>
                </div>

                <div>
                  <Label>Max poptávek za den</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    value={formData.maxSubmissionsPerDay}
                    onChange={(e) => setFormData({ ...formData, maxSubmissionsPerDay: parseInt(e.target.value) || 50 })}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Ochrana proti spam útokům
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              Uložit změny
            </Button>
          </div>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiky</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{widget._count.inquiries}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Celkem poptávek</p>
                </div>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                Podrobné statistiky najdete v sekci{' '}
                <Link href="/admin/gigs" className="text-primary-600 hover:underline">
                  Gigs
                </Link>
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
