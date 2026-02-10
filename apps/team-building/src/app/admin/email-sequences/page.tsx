'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Plus, Play, Pause, Trash2, Users, Send, Loader2, Clock, CheckCircle2, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ListPageHeader, StatusBadge, ActionButtons } from '@vertigo/admin'
import { staggerContainer, staggerItem } from '@vertigo/ui'

interface SequenceStep { id: string; stepOrder: number; delayDays: number; delayHours: number; subject: string }
interface SequenceStats { totalEnrollments: number; activeEnrollments: number; completedEnrollments: number; totalEmailsSent: number; openRate: number; clickRate: number }
interface EmailSequence { id: string; name: string; description: string | null; triggerType: string; isActive: boolean; createdAt: string; steps: SequenceStep[]; _count: { enrollments: number }; stats: SequenceStats }
interface Template { key: string; name: string; description: string; triggerType: string; stepsCount: number }

const triggerLabels: Record<string, string> = {
  session_completed: 'Po dokončení session',
  days_after_session: 'X dní po session',
  no_booking_days: 'Re-engagement',
  invoice_paid: 'Po zaplacení faktury',
  quote_sent: 'Follow-up nabídky',
  manual: 'Manuální spuštění',
}

export default function EmailSequencesPage() {
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchSequences(); fetchTemplates() }, [])

  const fetchSequences = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/email-sequences')
      if (res.ok) { setSequences(await res.json()) }
    } catch (error) { console.error('Error fetching sequences:', error) }
    finally { setLoading(false) }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/email-sequences/templates')
      if (res.ok) { setTemplates(await res.json()) }
    } catch (error) { console.error('Error fetching templates:', error) }
  }

  const toggleSequenceActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/email-sequences/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      if (res.ok) { setSequences((prev) => prev.map((seq) => (seq.id === id ? { ...seq, isActive: !currentActive } : seq))) }
    } catch (error) { console.error('Error toggling sequence:', error) }
  }

  const deleteSequence = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto sekvenci?')) return
    try {
      const res = await fetch(`/api/email-sequences/${id}`, { method: 'DELETE' })
      if (res.ok) { setSequences((prev) => prev.filter((seq) => seq.id !== id)) }
    } catch (error) { console.error('Error deleting sequence:', error) }
  }

  const createFromTemplate = async (templateKey: string) => {
    setCreating(true)
    try {
      const res = await fetch('/api/email-sequences/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey }),
      })
      if (res.ok) { setShowTemplateModal(false); fetchSequences() }
    } catch (error) { console.error('Error creating from template:', error) }
    finally { setCreating(false) }
  }
  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Email Sequences"
        description="Automatické follow-up kampaně"
        actionLabel="Nová sekvence"
        actionHref="/admin/email-sequences/new"
        actionIcon={Plus}
      />

      {/* Extra action button for templates */}
      <div className="flex justify-end -mt-4">
        <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
          <FileText className="h-4 w-4" />
          Ze šablony
        </Button>
      </div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-4" variants={staggerContainer} initial="hidden" animate="visible">
        {[
          { label: 'Celkem sekvencí', value: sequences.length, icon: Mail, color: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
          { label: 'Aktivní', value: sequences.filter((s) => s.isActive).length, icon: Play, color: 'bg-success-50 dark:bg-success-950/30', iconColor: 'text-success-600 dark:text-success-400' },
          { label: 'Enrollováno', value: sequences.reduce((sum, s) => sum + s.stats.activeEnrollments, 0), icon: Users, color: 'bg-violet-50 dark:bg-violet-950/30', iconColor: 'text-violet-600 dark:text-violet-400' },
          { label: 'Odesláno emailů', value: sequences.reduce((sum, s) => sum + s.stats.totalEmailsSent, 0), icon: Send, color: 'bg-orange-50 dark:bg-orange-950/30', iconColor: 'text-orange-600 dark:text-orange-400' },
        ].map((s) => (
          <motion.div key={s.label} variants={staggerItem}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{s.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {/* Sequences Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : sequences.length === 0 ? (
        <Card className="p-12 text-center">
          <Mail className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Žádné email sekvence</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Vytvořte první sekvenci pro automatické follow-up emaily.</p>
          <Button onClick={() => setShowTemplateModal(true)}>Vytvořit ze šablony</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-800/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Sekvence</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Trigger</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Kroky</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Enrollováno</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Odesláno</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {sequences.map((sequence) => (
                  <tr key={sequence.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/email-sequences/${sequence.id}`} className="block">
                        <p className="font-medium text-neutral-900 dark:text-neutral-50 hover:text-brand-600 dark:hover:text-brand-400">{sequence.name}</p>
                        {sequence.description && (<p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-xs">{sequence.description}</p>)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Clock className="h-3 w-3" />
                        {triggerLabels[sequence.triggerType] || sequence.triggerType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-900 dark:text-neutral-100">{sequence.steps.length}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-neutral-900 dark:text-neutral-100">{sequence.stats.activeEnrollments}</span>
                      <span className="text-neutral-400 text-sm"> / {sequence.stats.totalEnrollments}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-900 dark:text-neutral-100">{sequence.stats.totalEmailsSent}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={sequence.isActive ? 'active' : 'inactive'} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleSequenceActive(sequence.id, sequence.isActive)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${sequence.isActive ? "text-warning-600" : "text-success-600"}`}
                          title={sequence.isActive ? 'Pozastavit' : 'Aktivovat'}
                        >
                          {sequence.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => deleteSequence(sequence.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-error-600 transition-colors hover:bg-error-50 dark:hover:bg-error-950/50"
                          title="Smazat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-lg w-full mx-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">Vytvořit ze šablony</h2>
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.key}
                  onClick={() => createFromTemplate(template.key)}
                  disabled={creating}
                  className="w-full text-left p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-700 dark:hover:bg-brand-950/20 transition-colors disabled:opacity-50"
                >
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">{template.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{template.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-neutral-400">
                    <span>{template.stepsCount} kroků</span>
                    <span>•</span>
                    <span>{triggerLabels[template.triggerType]}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>Zrušit</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
