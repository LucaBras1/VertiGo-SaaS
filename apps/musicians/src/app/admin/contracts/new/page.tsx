'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  User,
  Calendar,
  DollarSign,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface GigData {
  id: string
  title: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  eventDate: string
  venue?: { name?: string; address?: string }
  totalPrice?: number
}

type Step = 'select' | 'performer' | 'client' | 'event' | 'financial' | 'generate' | 'review'

export default function NewContractPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gigId = searchParams.get('gigId')

  const [step, setStep] = useState<Step>('select')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [gig, setGig] = useState<GigData | null>(null)

  // Form data
  const [language, setLanguage] = useState<'CS' | 'EN'>('CS')
  const [performerInfo, setPerformerInfo] = useState({
    name: '',
    address: '',
    ico: '',
    dic: '',
    phone: '',
    email: '',
  })
  const [clientInfo, setClientInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    company: '',
  })
  const [eventDetails, setEventDetails] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    duration: 0,
    description: '',
  })
  const [financialTerms, setFinancialTerms] = useState({
    totalPrice: 0,
    deposit: 0,
    depositDue: '',
    paymentDue: '',
    currency: 'CZK',
  })
  const [customInstructions, setCustomInstructions] = useState('')

  // Generated contract data
  const [generatedContract, setGeneratedContract] = useState<{
    title: string
    sections: any[]
    clauses: any[]
  } | null>(null)

  // Load gig data if gigId is provided
  useEffect(() => {
    if (gigId) {
      loadGig(gigId)
    }
    loadTenantSettings()
  }, [gigId])

  async function loadGig(id: string) {
    try {
      const res = await fetch(`/api/gigs/${id}`)
      const data = await res.json()

      if (data.id) {
        setGig(data)
        // Pre-fill form data from gig
        setClientInfo({
          name: data.clientName || '',
          address: '',
          phone: data.clientPhone || '',
          email: data.clientEmail || '',
          company: '',
        })
        setEventDetails({
          title: data.title || '',
          date: data.eventDate ? data.eventDate.split('T')[0] : '',
          time: data.eventDate ? new Date(data.eventDate).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) : '',
          venue: data.venue?.name || '',
          duration: data.eventDuration ? Math.round(data.eventDuration / 60) : 0,
          description: '',
        })
        setFinancialTerms(prev => ({
          ...prev,
          totalPrice: data.totalPrice ? data.totalPrice / 100 : 0,
          deposit: data.deposit ? data.deposit / 100 : 0,
        }))
      }
    } catch (error) {
      console.error('Failed to load gig:', error)
    }
  }

  async function loadTenantSettings() {
    try {
      const res = await fetch('/api/tenant/settings')
      const data = await res.json()

      if (data.success && data.data) {
        setPerformerInfo(prev => ({
          ...prev,
          name: data.data.bandName || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
        }))
      }

      // Load billing info
      const billingRes = await fetch('/api/tenant/billing')
      const billingData = await billingRes.json()

      if (billingData.success && billingData.data?.billing) {
        const b = billingData.data.billing
        setPerformerInfo(prev => ({
          ...prev,
          address: [b.address, b.city, b.postalCode].filter(Boolean).join(', '),
          ico: b.ico || '',
          dic: b.dic || '',
        }))
      }
    } catch (error) {
      console.error('Failed to load tenant settings:', error)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/contract/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          performerInfo,
          clientInfo,
          eventDetails,
          financialTerms,
          eventType: gig?.title?.split(' - ')?.[0] || 'koncert',
          customInstructions,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedContract(data.data)
        setStep('review')
      } else {
        toast.error(data.error || 'Nepodařilo se vygenerovat smlouvu')
      }
    } catch (error) {
      toast.error('Nepodařilo se vygenerovat smlouvu')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCreate() {
    if (!generatedContract) return

    setLoading(true)
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId: gigId || undefined,
          language,
          title: generatedContract.title,
          performerInfo,
          clientInfo,
          eventDetails,
          financialTerms,
          sections: generatedContract.sections,
          clauses: generatedContract.clauses,
          aiGenerated: true,
          aiPrompt: customInstructions || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Smlouva vytvořena')
        router.push(`/admin/contracts/${data.data.id}`)
      } else {
        toast.error(data.error || 'Nepodařilo se vytvořit smlouvu')
      }
    } catch (error) {
      toast.error('Nepodařilo se vytvořit smlouvu')
    } finally {
      setLoading(false)
    }
  }

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'select', label: 'Jazyk', icon: <FileText className="w-4 h-4" /> },
    { key: 'performer', label: 'Poskytovatel', icon: <User className="w-4 h-4" /> },
    { key: 'client', label: 'Klient', icon: <User className="w-4 h-4" /> },
    { key: 'event', label: 'Akce', icon: <Calendar className="w-4 h-4" /> },
    { key: 'financial', label: 'Finance', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'generate', label: 'Generovat', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'review', label: 'Kontrola', icon: <FileText className="w-4 h-4" /> },
  ]

  const currentStepIndex = steps.findIndex(s => s.key === step)

  function nextStep() {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].key)
    }
  }

  function prevStep() {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].key)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/contracts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nová smlouva</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {gig ? `Smlouva pro gig: ${gig.title}` : 'Vytvořte novou smlouvu s pomocí AI'}
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => i <= currentStepIndex && setStep(s.key)}
              disabled={i > currentStepIndex}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                s.key === step
                  ? 'bg-primary-100 text-primary-700'
                  : i < currentStepIndex
                  ? 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer'
                  : 'text-neutral-400 cursor-not-allowed'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="p-6">
          {/* Language selection */}
          {step === 'select' && (
            <div className="space-y-4">
              <div>
                <Label>Jazyk smlouvy</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    onClick={() => setLanguage('CS')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      language === 'CS' ? 'border-primary-500 bg-primary-50' : 'hover:border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    <p className="font-semibold">Čeština</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Smlouva v českém jazyce</p>
                  </button>
                  <button
                    onClick={() => setLanguage('EN')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      language === 'EN' ? 'border-primary-500 bg-primary-50' : 'hover:border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    <p className="font-semibold">English</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Contract in English</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Performer info */}
          {step === 'performer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Název kapely / umělce *</Label>
                  <Input
                    value={performerInfo.name}
                    onChange={(e) => setPerformerInfo({ ...performerInfo, name: e.target.value })}
                    placeholder="Vaše kapela"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Adresa</Label>
                  <Input
                    value={performerInfo.address}
                    onChange={(e) => setPerformerInfo({ ...performerInfo, address: e.target.value })}
                    placeholder="Ulice, Město, PSČ"
                  />
                </div>
                <div>
                  <Label>IČO</Label>
                  <Input
                    value={performerInfo.ico}
                    onChange={(e) => setPerformerInfo({ ...performerInfo, ico: e.target.value })}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label>DIČ</Label>
                  <Input
                    value={performerInfo.dic}
                    onChange={(e) => setPerformerInfo({ ...performerInfo, dic: e.target.value })}
                    placeholder="CZ12345678"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={performerInfo.email}
                    onChange={(e) => setPerformerInfo({ ...performerInfo, email: e.target.value })}
                    placeholder="booking@kapela.cz"
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input
                    value={performerInfo.phone}
                    onChange={(e) => setPerformerInfo({ ...performerInfo, phone: e.target.value })}
                    placeholder="+420 123 456 789"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Client info */}
          {step === 'client' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Jméno klienta *</Label>
                  <Input
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    placeholder="Jan Novák"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Společnost</Label>
                  <Input
                    value={clientInfo.company}
                    onChange={(e) => setClientInfo({ ...clientInfo, company: e.target.value })}
                    placeholder="Firma s.r.o."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Adresa</Label>
                  <Input
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                    placeholder="Ulice, Město, PSČ"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    placeholder="klient@email.cz"
                  />
                </div>
                <div>
                  <Label>Telefon</Label>
                  <Input
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    placeholder="+420 123 456 789"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Event details */}
          {step === 'event' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Název akce *</Label>
                  <Input
                    value={eventDetails.title}
                    onChange={(e) => setEventDetails({ ...eventDetails, title: e.target.value })}
                    placeholder="Svatba - Jan a Marie"
                  />
                </div>
                <div>
                  <Label>Datum *</Label>
                  <Input
                    type="date"
                    value={eventDetails.date}
                    onChange={(e) => setEventDetails({ ...eventDetails, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Čas</Label>
                  <Input
                    type="time"
                    value={eventDetails.time}
                    onChange={(e) => setEventDetails({ ...eventDetails, time: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Místo konání</Label>
                  <Input
                    value={eventDetails.venue}
                    onChange={(e) => setEventDetails({ ...eventDetails, venue: e.target.value })}
                    placeholder="Hotel XY, Praha"
                  />
                </div>
                <div>
                  <Label>Délka vystoupení (hodiny)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={eventDetails.duration || ''}
                    onChange={(e) => setEventDetails({ ...eventDetails, duration: parseInt(e.target.value) || 0 })}
                    placeholder="4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial terms */}
          {step === 'financial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Celková cena *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={financialTerms.totalPrice || ''}
                    onChange={(e) => setFinancialTerms({ ...financialTerms, totalPrice: parseInt(e.target.value) || 0 })}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label>Měna</Label>
                  <select
                    value={financialTerms.currency}
                    onChange={(e) => setFinancialTerms({ ...financialTerms, currency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="CZK">CZK</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <Label>Záloha</Label>
                  <Input
                    type="number"
                    min={0}
                    value={financialTerms.deposit || ''}
                    onChange={(e) => setFinancialTerms({ ...financialTerms, deposit: parseInt(e.target.value) || 0 })}
                    placeholder="10000"
                  />
                </div>
                <div>
                  <Label>Splatnost zálohy</Label>
                  <Input
                    type="date"
                    value={financialTerms.depositDue}
                    onChange={(e) => setFinancialTerms({ ...financialTerms, depositDue: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Splatnost doplatku</Label>
                  <Input
                    type="date"
                    value={financialTerms.paymentDue}
                    onChange={(e) => setFinancialTerms({ ...financialTerms, paymentDue: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generate */}
          {step === 'generate' && (
            <div className="space-y-4">
              <div>
                <Label>Speciální požadavky (volitelné)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Např. přidejte klauzuli o zákazu alkoholu, speciální technické požadavky..."
                  rows={4}
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  AI vygeneruje profesionální smlouvu na základě vašich údajů
                </p>
              </div>

              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-900">AI Generování smlouvy</p>
                    <p className="text-sm text-primary-700">
                      Smlouva bude vygenerována pomocí GPT-4 s ohledem na české právo
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                isLoading={generating}
                className="w-full"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Vygenerovat smlouvu
              </Button>
            </div>
          )}

          {/* Review */}
          {step === 'review' && generatedContract && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-green-800">Smlouva vygenerována</p>
                <p className="text-sm text-green-700">
                  Zkontrolujte vygenerovaný obsah a upravte podle potřeby
                </p>
              </div>

              <div>
                <Label>Název smlouvy</Label>
                <Input value={generatedContract.title} readOnly className="bg-neutral-50 dark:bg-neutral-950" />
              </div>

              <div>
                <Label>Sekce smlouvy ({generatedContract.sections.length})</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {generatedContract.sections.map((section, i) => (
                    <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Klauzule ({generatedContract.clauses.length})</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {generatedContract.clauses.map((clause, i) => (
                    <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <p className="font-medium text-sm">{clause.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreate}
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                <FileText className="w-4 h-4 mr-2" />
                Vytvořit smlouvu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Zpět
        </Button>
        {step !== 'generate' && step !== 'review' && (
          <Button onClick={nextStep}>
            Další
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
