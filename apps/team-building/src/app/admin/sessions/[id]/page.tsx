/**
 * Session Detail/Edit Page with Debrief Generator
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionForm } from '@/components/admin/SessionForm'
import { ArrowLeft, Trash2, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@vertigo/ui'

export default function EditSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isGeneratingDebrief, setIsGeneratingDebrief] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [programs, setPrograms] = useState([])
  const [customers, setCustomers] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [debriefReport, setDebriefReport] = useState<any>(null)

  useEffect(() => {
    // Fetch session data, programs, and customers
    Promise.all([
      fetch(`/api/sessions/${params.id}`),
      fetch('/api/programs?status=active'),
      fetch('/api/customers'),
    ])
      .then(async ([sessionRes, programsRes, customersRes]) => {
        const sessionData = await sessionRes.json()
        const programsData = await programsRes.json()
        const customersData = await customersRes.json()

        if (sessionData.success) {
          setSession(sessionData.data)
          setDebriefReport(sessionData.data.debriefReport)
        } else {
          toast.error('Workshop nebyl nalezen')
          router.push('/admin/sessions')
        }

        if (programsData.success) {
          setPrograms(programsData.data)
        }

        if (customersData.success) {
          setCustomers(customersData.data)
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
        toast.error('Nepodařilo se načíst data')
      })
      .finally(() => {
        setIsLoadingData(false)
      })
  }, [params.id, router])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Workshop byl úspěšně aktualizován')
        setSession(result.data)
      } else {
        toast.error(result.error || 'Nepodařilo se aktualizovat workshop')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      toast.error('Nastala chyba při aktualizaci workshopu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tento workshop? Tuto akci nelze vrátit zpět.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Workshop byl úspěšně smazán')
        router.push('/admin/sessions')
      } else {
        toast.error(result.error || 'Nepodařilo se smazat workshop')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      toast.error('Nastala chyba při mazání workshopu')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGenerateDebrief = async () => {
    setIsGeneratingDebrief(true)
    try {
      const response = await fetch('/api/ai/generate-debrief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: params.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Debrief byl úspěšně vygenerován')
        setDebriefReport(result.data.report)
        // Reload session data to get updated debrief status
        const sessionRes = await fetch(`/api/sessions/${params.id}`)
        const sessionData = await sessionRes.json()
        if (sessionData.success) {
          setSession(sessionData.data)
        }
      } else {
        toast.error(result.error || 'Nepodařilo se vygenerovat debrief')
      }
    } catch (error) {
      console.error('Error generating debrief:', error)
      toast.error('Nastala chyba při generování debriefingu')
    } finally {
      setIsGeneratingDebrief(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Načítám data...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/sessions"
          className="inline-flex items-center text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zpět na workshopy
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Detail workshopu</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {session.teamName || session.companyName || 'Workshop'} •{' '}
              {format(new Date(session.date), 'dd.MM.yyyy')}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Smazat workshop
          </Button>
        </div>
      </div>

      {/* Debrief Generator Section */}
      {session.status === 'completed' && (
        <Card className="mb-6 border-2 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <FileText className="w-6 h-6" />
              AI Debrief Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debriefReport ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-emerald-200">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                    {debriefReport.title || 'Workshop Report'}
                  </h3>

                  {debriefReport.summary && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Shrnutí</h4>
                      <p className="text-neutral-600 dark:text-neutral-400">{debriefReport.summary}</p>
                    </div>
                  )}

                  {debriefReport.keyInsights && debriefReport.keyInsights.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Klíčové poznatky</h4>
                      <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                        {debriefReport.keyInsights.map((insight: string, idx: number) => (
                          <li key={idx}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {debriefReport.recommendations && debriefReport.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Doporučení</h4>
                      <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                        {debriefReport.recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {session.debriefGeneratedAt && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
                      Vygenerováno: {format(new Date(session.debriefGeneratedAt), 'dd.MM.yyyy HH:mm')}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleGenerateDebrief}
                  loading={isGeneratingDebrief}
                  variant="secondary"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Přegenerovat debrief
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Workshop byl dokončen. Můžete vygenerovat AI debrief report.
                </p>
                <Button
                  onClick={handleGenerateDebrief}
                  loading={isGeneratingDebrief}
                  variant="secondary"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Vygenerovat AI debrief
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <SessionForm
        initialData={session}
        programs={programs}
        customers={customers}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/sessions')}
        isLoading={isLoading}
      />
    </div>
  )
}
