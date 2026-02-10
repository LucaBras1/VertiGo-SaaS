'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Send,
  Copy,
  Trash2,
  Edit,
  FileText,
  User,
  Calendar,
  DollarSign,
  Clock,
  Loader2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@vertigo/ui'

interface Contract {
  id: string
  contractNumber: string
  title: string
  status: string
  language: string
  version: number
  createdAt: string
  sentAt?: string
  signedAt?: string
  performerInfo: {
    name: string
    address?: string
    ico?: string
    dic?: string
    phone?: string
    email?: string
  }
  clientInfo: {
    name: string
    address?: string
    phone?: string
    email?: string
    company?: string
  }
  eventDetails: {
    title: string
    date: string
    time?: string
    venue?: string
    duration?: number
    description?: string
  }
  financialTerms: {
    totalPrice: number
    deposit?: number
    depositDue?: string
    paymentDue?: string
    currency: string
  }
  sections: Array<{
    id: string
    title: string
    content: string
    order: number
  }>
  clauses: Array<{
    clauseId: string
    title: string
    content: string
    order: number
  }>
  gig?: {
    id: string
    title: string
  }
  template?: {
    id: string
    name: string
  }
  versions?: Array<{
    id: string
    version: number
    createdAt: string
  }>
  aiGenerated: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string; nextStatus?: string; nextLabel?: string }> = {
  DRAFT: { label: 'Koncept', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300', nextStatus: 'SENT', nextLabel: 'Odeslat klientovi' },
  SENT: { label: 'Odesláno', color: 'bg-blue-100 text-blue-700', nextStatus: 'SIGNED', nextLabel: 'Označit jako podepsané' },
  SIGNED: { label: 'Podepsáno', color: 'bg-green-100 text-green-700', nextStatus: 'ACTIVE', nextLabel: 'Aktivovat' },
  ACTIVE: { label: 'Aktivní', color: 'bg-purple-100 text-purple-700', nextStatus: 'COMPLETED', nextLabel: 'Dokončit' },
  COMPLETED: { label: 'Dokončeno', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Zrušeno', color: 'bg-red-100 text-red-700' },
}

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [duplicating, setDuplicating] = useState(false)

  useEffect(() => {
    async function loadContract() {
      try {
        const res = await fetch(`/api/contracts/${id}`)
        const data = await res.json()

        if (data.success) {
          setContract(data.data)
        } else {
          toast.error('Smlouva nenalezena')
          router.push('/admin/contracts')
        }
      } catch (error) {
        console.error('Failed to load contract:', error)
        toast.error('Nepodařilo se načíst smlouvu')
      } finally {
        setLoading(false)
      }
    }
    loadContract()
  }, [id, router])

  async function handleStatusChange(newStatus: string) {
    if (!contract) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await res.json()

      if (data.success) {
        setContract(data.data)
        toast.success('Status aktualizován')
      } else {
        toast.error(data.error || 'Nepodařilo se změnit status')
      }
    } catch (error) {
      toast.error('Nepodařilo se změnit status')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/contracts/${id}/duplicate`, {
        method: 'POST',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Smlouva zkopírována')
        router.push(`/admin/contracts/${data.data.id}`)
      } else {
        toast.error(data.error || 'Nepodařilo se zkopírovat smlouvu')
      }
    } catch (error) {
      toast.error('Nepodařilo se zkopírovat smlouvu')
    } finally {
      setDuplicating(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Opravdu chcete smazat tuto smlouvu?')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Smlouva smazána')
        router.push('/admin/contracts')
      } else {
        toast.error(data.error || 'Nepodařilo se smazat smlouvu')
      }
    } catch (error) {
      toast.error('Nepodařilo se smazat smlouvu')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!contract) {
    return null
  }

  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.DRAFT

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/contracts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na smlouvy
          </Button>
        </Link>
      </div>

      {/* Title + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{contract.title}</h1>
            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            {contract.aiGenerated && (
              <Badge className="bg-purple-100 text-purple-700">AI</Badge>
            )}
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {contract.contractNumber} | Verze {contract.version} | {contract.language === 'CS' ? 'Čeština' : 'English'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/api/contracts/${id}/pdf`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Stáhnout PDF
            </Button>
          </a>
          <Button variant="outline" onClick={handleDuplicate} loading={duplicating}>
            <Copy className="w-4 h-4 mr-2" />
            Duplikovat
          </Button>
          {statusConfig.nextStatus && (
            <Button onClick={() => handleStatusChange(statusConfig.nextStatus!)} loading={updating}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {statusConfig.nextLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Klient</p>
                <p className="font-medium">{contract.clientInfo.name}</p>
                {contract.clientInfo.company && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{contract.clientInfo.company}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Datum akce</p>
                <p className="font-medium">
                  {new Date(contract.eventDetails.date).toLocaleDateString('cs-CZ')}
                </p>
                {contract.eventDetails.time && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{contract.eventDetails.time}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Celková cena</p>
                <p className="font-medium">
                  {contract.financialTerms.totalPrice.toLocaleString('cs-CZ')} {contract.financialTerms.currency}
                </p>
                {contract.financialTerms.deposit && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Záloha: {contract.financialTerms.deposit.toLocaleString('cs-CZ')} {contract.financialTerms.currency}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Vytvořeno</p>
                <p className="font-medium">
                  {new Date(contract.createdAt).toLocaleDateString('cs-CZ')}
                </p>
                {contract.sentAt && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Odesláno: {new Date(contract.sentAt).toLocaleDateString('cs-CZ')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Obsah smlouvy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contract.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{section.title}</h3>
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap text-sm">{section.content}</p>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Clauses */}
          {contract.clauses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dodatečná ustanovení</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contract.clauses
                  .sort((a, b) => a.order - b.order)
                  .map((clause) => (
                    <div key={clause.clauseId} className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">{clause.title}</h4>
                      <p className="text-neutral-700 dark:text-neutral-300 text-sm">{clause.content}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performer info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Poskytovatel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{contract.performerInfo.name}</p>
              {contract.performerInfo.address && <p className="text-neutral-600 dark:text-neutral-400">{contract.performerInfo.address}</p>}
              {contract.performerInfo.ico && <p className="text-neutral-600 dark:text-neutral-400">IČO: {contract.performerInfo.ico}</p>}
              {contract.performerInfo.dic && <p className="text-neutral-600 dark:text-neutral-400">DIČ: {contract.performerInfo.dic}</p>}
              {contract.performerInfo.email && <p className="text-neutral-600 dark:text-neutral-400">{contract.performerInfo.email}</p>}
              {contract.performerInfo.phone && <p className="text-neutral-600 dark:text-neutral-400">{contract.performerInfo.phone}</p>}
            </CardContent>
          </Card>

          {/* Client info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Objednatel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{contract.clientInfo.name}</p>
              {contract.clientInfo.company && <p className="text-neutral-600 dark:text-neutral-400">{contract.clientInfo.company}</p>}
              {contract.clientInfo.address && <p className="text-neutral-600 dark:text-neutral-400">{contract.clientInfo.address}</p>}
              {contract.clientInfo.email && <p className="text-neutral-600 dark:text-neutral-400">{contract.clientInfo.email}</p>}
              {contract.clientInfo.phone && <p className="text-neutral-600 dark:text-neutral-400">{contract.clientInfo.phone}</p>}
            </CardContent>
          </Card>

          {/* Linked gig */}
          {contract.gig && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Propojený gig</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/admin/gigs/${contract.gig.id}`} className="flex items-center gap-2 text-primary-600 hover:underline">
                  <FileText className="w-4 h-4" />
                  {contract.gig.title}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Versions */}
          {contract.versions && contract.versions.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historie verzí</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contract.versions.map((v) => (
                  <Link
                    key={v.id}
                    href={`/admin/contracts/${v.id}`}
                    className={`block p-2 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800 ${v.id === contract.id ? 'bg-primary-50' : ''}`}
                  >
                    <p className="text-sm font-medium">Verze {v.version}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(v.createdAt).toLocaleDateString('cs-CZ')}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Danger zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-base text-red-700">Nebezpečná zóna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contract.status !== 'CANCELLED' && (
                <Button
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => handleStatusChange('CANCELLED')}
                  loading={updating}
                >
                  Zrušit smlouvu
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Smazat smlouvu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
