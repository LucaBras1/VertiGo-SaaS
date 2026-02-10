'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Inbox,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ArrowRight,
  Check,
  X,
  Eye,
  Loader2,
  TrendingUp,
  Clock,
  FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Inquiry {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  eventType: string
  eventDate: string
  venue: {
    name?: string
    address?: string
    city?: string
  } | null
  message: string | null
  status: 'NEW' | 'REVIEWED' | 'CONVERTED' | 'REJECTED'
  createdAt: string
  gig: {
    id: string
    title: string
    status: string
  } | null
}

interface WidgetStats {
  total: number
  new: number
  converted: number
  thisMonth: number
  conversionRate: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nová', color: 'bg-blue-100 text-blue-700' },
  REVIEWED: { label: 'Zkontrolováno', color: 'bg-yellow-100 text-yellow-700' },
  CONVERTED: { label: 'Převedeno', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Zamítnuto', color: 'bg-red-100 text-red-700' },
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: 'Svatba',
  corporate: 'Firemní akce',
  party: 'Soukromá oslava',
  concert: 'Koncert',
  festival: 'Festival',
  birthday: 'Narozeniny',
  graduation: 'Promoce',
  other: 'Jiná akce',
}

export default function InquiriesPage() {
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [stats, setStats] = useState<WidgetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [converting, setConverting] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)

      const [inquiriesRes, statsRes] = await Promise.all([
        fetch(`/api/inquiries?${params}`),
        fetch('/api/inquiries?stats=true'),
      ])

      const inquiriesData = await inquiriesRes.json()
      const statsData = await statsRes.json()

      if (inquiriesData.success) {
        setInquiries(inquiriesData.data.inquiries)
      }
      if (statsData.success && statsData.data) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error('Failed to load inquiries:', error)
      toast.error('Nepodařilo se načíst poptávky')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleConvert(id: string) {
    setConverting(id)
    try {
      const res = await fetch(`/api/inquiries/${id}/convert`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Poptávka převedena na gig')
        router.push(`/admin/gigs/${data.data.id}`)
      } else {
        toast.error(data.error || 'Nepodařilo se převést poptávku')
      }
    } catch (error) {
      toast.error('Nepodařilo se převést poptávku')
    } finally {
      setConverting(null)
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()

      if (data.success) {
        setInquiries(prev =>
          prev.map(inq =>
            inq.id === id ? { ...inq, status: status as Inquiry['status'] } : inq
          )
        )
        toast.success('Status aktualizován')
      } else {
        toast.error(data.error || 'Nepodařilo se aktualizovat status')
      }
    } catch (error) {
      toast.error('Nepodařilo se aktualizovat status')
    }
  }

  const filteredInquiries = inquiries.filter(inq => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      inq.clientName.toLowerCase().includes(term) ||
      inq.clientEmail.toLowerCase().includes(term) ||
      (inq.venue?.name?.toLowerCase().includes(term) ?? false)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Poptávky</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Správa poptávek z booking widgetu</p>
        </div>
        <Link href="/admin/settings/widget">
          <Button variant="outline">
            Nastavení widgetu
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Inbox className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.new}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Nových</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.converted}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Převedených</p>
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
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.thisMonth}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Tento měsíc</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.conversionRate}%</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Konverze</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Hledat poptávky..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Všechny stavy</option>
              <option value="NEW">Nové</option>
              <option value="REVIEWED">Zkontrolované</option>
              <option value="CONVERTED">Převedené</option>
              <option value="REJECTED">Zamítnuté</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiry list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Inbox className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              {search || statusFilter ? 'Žádné poptávky nenalezeny' : 'Zatím nemáte žádné poptávky'}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4 text-center max-w-md">
              {search || statusFilter
                ? 'Zkuste změnit vyhledávání nebo filtry'
                : 'Nastavte si booking widget a sdílejte odkaz na svém webu nebo sociálních sítích'}
            </p>
            {!search && !statusFilter && (
              <Link href="/admin/settings/widget">
                <Button>
                  Nastavit widget
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInquiries.map((inquiry) => {
            const status = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.NEW
            const eventTypeLabel = EVENT_TYPE_LABELS[inquiry.eventType] || inquiry.eventType

            return (
              <Card key={inquiry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{inquiry.clientName}</h3>
                        <Badge className={status.color}>{status.label}</Badge>
                        <Badge variant="outline">{eventTypeLabel}</Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-neutral-400" />
                          <a href={`mailto:${inquiry.clientEmail}`} className="hover:text-primary-600">
                            {inquiry.clientEmail}
                          </a>
                        </div>
                        {inquiry.clientPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-neutral-400" />
                            <a href={`tel:${inquiry.clientPhone}`} className="hover:text-primary-600">
                              {inquiry.clientPhone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          <span>
                            {new Date(inquiry.eventDate).toLocaleDateString('cs-CZ', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {inquiry.venue?.name && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-neutral-400" />
                            <span>
                              {inquiry.venue.name}
                              {inquiry.venue.city && `, ${inquiry.venue.city}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {inquiry.message && (
                        <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-950 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{inquiry.message}</p>
                          </div>
                        </div>
                      )}

                      {inquiry.gig && (
                        <div className="mt-3">
                          <Link
                            href={`/admin/gigs/${inquiry.gig.id}`}
                            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline"
                          >
                            <FileText className="w-4 h-4" />
                            Převedeno na gig: {inquiry.gig.title}
                          </Link>
                        </div>
                      )}

                      <p className="mt-2 text-xs text-neutral-400">
                        Přijato: {new Date(inquiry.createdAt).toLocaleDateString('cs-CZ', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:flex-col">
                      {inquiry.status === 'NEW' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConvert(inquiry.id)}
                            isLoading={converting === inquiry.id}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Převést na gig
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(inquiry.id, 'REVIEWED')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Zkontrolováno
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(inquiry.id, 'REJECTED')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Zamítnout
                          </Button>
                        </>
                      )}
                      {inquiry.status === 'REVIEWED' && !inquiry.gig && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConvert(inquiry.id)}
                            isLoading={converting === inquiry.id}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            Převést na gig
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleUpdateStatus(inquiry.id, 'REJECTED')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Zamítnout
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
