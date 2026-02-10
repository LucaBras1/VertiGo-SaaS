'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Mail, FileText, Music, Calendar, MapPin, Users, DollarSign, Download, Loader2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import EnergyFlowChart from '@/components/charts/EnergyFlowChart'
import { DepositPaymentButton } from '@/components/payments'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Gig {
  id: string
  title: string
  slug: string
  status: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  eventType?: string
  eventDate?: string
  eventDuration?: number
  venue?: { name?: string; address?: string; city?: string; type?: string }
  audienceSize?: number
  bandMembers?: number
  numberOfSets?: number
  setDuration?: number
  basePrice?: number
  travelCosts?: number
  totalPrice?: number
  deposit?: number
  depositPaid?: boolean
  internalNotes?: string
  createdAt: string
  setlists: any[]
  invoices: any[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'danger' | 'info' }> = {
  INQUIRY: { label: 'Poptávka', variant: 'info' },
  QUOTE_SENT: { label: 'Nabídka odeslána', variant: 'warning' },
  CONFIRMED: { label: 'Potvrzeno', variant: 'success' },
  COMPLETED: { label: 'Dokončeno', variant: 'default' },
  CANCELLED: { label: 'Zrušeno', variant: 'danger' },
}

export default function GigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [gig, setGig] = useState<Gig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloadingRider, setIsDownloadingRider] = useState(false)

  useEffect(() => {
    fetchGig()
  }, [params.id])

  const fetchGig = async () => {
    try {
      const response = await fetch(`/api/gigs/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/admin/gigs')
          return
        }
        throw new Error('Failed to fetch gig')
      }
      const data = await response.json()
      setGig(data)
    } catch (error) {
      toast.error('Nepodařilo se načíst gig')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/gigs/${params.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete')
      toast.success('Gig smazán')
      router.push('/admin/gigs')
    } catch (error) {
      toast.error('Nepodařilo se smazat gig')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/gigs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update')
      const updated = await response.json()
      setGig(updated)
      toast.success('Status aktualizován')
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat status')
    }
  }

  const handleDownloadStageRider = async () => {
    setIsDownloadingRider(true)
    try {
      const response = await fetch(`/api/gigs/${params.id}/stage-rider/pdf`)
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stage-rider-${gig?.title || 'gig'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Stage rider stazen')
    } catch (error) {
      toast.error('Nepodařilo se vygenerovat stage rider')
    } finally {
      setIsDownloadingRider(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!gig) {
    return null
  }

  const status = statusConfig[gig.status] || statusConfig.INQUIRY

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/gigs"
            className="inline-flex items-center text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zpět na seznam
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{gig.title}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          {gig.eventDate && (
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              <Calendar className="inline h-4 w-4 mr-1" />
              {formatDate(new Date(gig.eventDate))}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/gigs/${gig.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Upravit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Smazat
          </Button>
        </div>
      </div>

      {/* Status Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Změnit status:</span>
            {Object.entries(statusConfig).map(([key, config]) => (
              <Button
                key={key}
                variant={gig.status === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(key)}
                disabled={gig.status === key}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detaily akce</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Typ akce</p>
                <p className="font-medium">{gig.eventType || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Délka</p>
                <p className="font-medium">{gig.eventDuration ? `${gig.eventDuration} min` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Počet setů</p>
                <p className="font-medium">{gig.numberOfSets || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Délka setu</p>
                <p className="font-medium">{gig.setDuration ? `${gig.setDuration} min` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Počet hostů</p>
                <p className="font-medium">{gig.audienceSize || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Počet členů</p>
                <p className="font-medium">{gig.bandMembers || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Venue */}
          {gig.venue && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Místo konání
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{gig.venue.name || '-'}</p>
                {gig.venue.city && <p className="text-neutral-600 dark:text-neutral-400">{gig.venue.city}</p>}
                {gig.venue.type && (
                  <Badge variant="secondary" className="mt-2">
                    {gig.venue.type === 'indoor' ? 'Interiér' : 'Exteriér'}
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {gig.internalNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Interní poznámky</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{gig.internalNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Klient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{gig.clientName || 'Neuvedeno'}</p>
              {gig.clientEmail && (
                <a href={`mailto:${gig.clientEmail}`} className="text-primary-600 hover:underline flex items-center gap-1 text-sm">
                  <Mail className="h-4 w-4" />
                  {gig.clientEmail}
                </a>
              )}
              {gig.clientPhone && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{gig.clientPhone}</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cena
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Základní cena:</span>
                <span>{gig.basePrice ? formatCurrency(gig.basePrice / 100) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Cestovné:</span>
                <span>{gig.travelCosts ? formatCurrency(gig.travelCosts / 100) : '-'}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Celkem:</span>
                <span>{gig.totalPrice ? formatCurrency(gig.totalPrice / 100) : '-'}</span>
              </div>
              {gig.deposit && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">Záloha:</span>
                  <span className={gig.depositPaid ? 'text-green-600' : ''}>
                    {formatCurrency(gig.deposit / 100)} {gig.depositPaid && '(zaplaceno)'}
                  </span>
                </div>
              )}
              {gig.deposit && gig.deposit > 0 && (
                <div className="pt-3 border-t">
                  <DepositPaymentButton
                    gigId={gig.id}
                    depositAmount={gig.deposit}
                    depositPaid={gig.depositPaid || false}
                    gigStatus={gig.status}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Akce</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/admin/setlists/new?gigId=${gig.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Music className="h-4 w-4 mr-2" />
                  Vytvořit setlist
                </Button>
              </Link>
              <Link href={`/admin/invoices/new?gigId=${gig.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Vytvořit fakturu
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleDownloadStageRider}
                disabled={isDownloadingRider}
              >
                {isDownloadingRider ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Stáhnout stage rider
              </Button>
            </CardContent>
          </Card>

          {/* Related Setlists */}
          {gig.setlists.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Setlisty ({gig.setlists.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {gig.setlists.map((setlist: any) => (
                    <li key={setlist.id}>
                      <Link
                        href={`/admin/setlists/${setlist.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {setlist.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Combined Energy Flow Chart for all setlists */}
      {gig.setlists.length > 0 && (() => {
        // Combine all songs from all setlists
        const allSongs = gig.setlists.flatMap((setlist: any, setlistIndex: number) => {
          const songs = setlist.songs || []
          let offset = 0
          // Calculate offset based on previous setlists
          for (let i = 0; i < setlistIndex; i++) {
            offset += (gig.setlists[i].songs?.length || 0)
          }
          return songs.map((song: any, idx: number) => ({
            ...song,
            order: offset + idx + 1,
          }))
        })

        if (allSongs.length === 0) return null

        return (
          <EnergyFlowChart
            songs={allSongs}
            title={`Průběh energie (${gig.setlists.length > 1 ? 'kombinovaný' : gig.setlists[0].name})`}
            showAnalysis={true}
          />
        )
      })()}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogHeader>
          <DialogTitle>Smazat gig?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p>Opravdu chcete smazat gig &quot;{gig.title}&quot;? Tato akce je nevratná.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Zrušit
          </Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>
            Smazat
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
