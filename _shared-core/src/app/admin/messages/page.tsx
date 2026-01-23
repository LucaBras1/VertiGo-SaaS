/**
 * Contact Messages Admin Page
 * Displays all contact form submissions with status tracking
 */
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Eye, Mail, MailWarning, CheckCircle, MessageSquare, RefreshCw, Send, Reply } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface ReplyRecord {
  id: string
  subject: string
  message: string
  sentAt: string
  sentBy: string
  emailSent: boolean
  emailError: string | null
}

interface ContactMessage {
  id: string
  createdAt: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'received' | 'email_sent' | 'email_failed' | 'read' | 'replied'
  emailSentAt: string | null
  emailError: string | null
  readAt: string | null
  repliedAt: string | null
  notes: string | null
  replies: ReplyRecord[] | null
}

const subjectLabels: Record<string, string> = {
  info: 'Dotaz na představení',
  technical: 'Technické požadavky',
  collaboration: 'Spolupráce',
  other: 'Něco jiného',
  // Legacy values for old messages
  reservation: 'Objednávka představení',
  price: 'Cenová nabídka',
}

const statusLabels: Record<string, string> = {
  received: 'Přijato',
  email_sent: 'Email odeslán',
  email_failed: 'Email selhal',
  read: 'Přečteno',
  replied: 'Odpovězeno',
}

const statusColors: Record<string, string> = {
  received: 'bg-blue-100 text-blue-800',
  email_sent: 'bg-green-100 text-green-800',
  email_failed: 'bg-red-100 text-red-800',
  read: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-purple-100 text-purple-800',
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const response = await fetch(`/api/admin/messages?${params}`)
      if (!response.ok) throw new Error('Failed to fetch messages')

      const data = await response.json()
      setMessages(data.data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast('Nepodařilo se načíst zprávy', 'error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, toast])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      })

      if (!response.ok) throw new Error('Failed to update message')

      toast('Zpráva označena jako přečtená', 'success')
      fetchMessages()
    } catch (error) {
      toast('Nepodařilo se aktualizovat zprávu', 'error')
    }
  }

  const markAsReplied = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'replied' }),
      })

      if (!response.ok) throw new Error('Failed to update message')

      toast('Zpráva označena jako odpovězená', 'success')
      fetchMessages()
    } catch (error) {
      toast('Nepodařilo se aktualizovat zprávu', 'error')
    }
  }

  const openReplyModal = (message: ContactMessage) => {
    setReplyingTo(message)
    setReplySubject(`Re: ${subjectLabels[message.subject] || message.subject}`)
    setReplyMessage('')
  }

  const closeReplyModal = () => {
    setReplyingTo(null)
    setReplySubject('')
    setReplyMessage('')
  }

  const sendReply = async () => {
    if (!replyingTo || !replySubject.trim() || !replyMessage.trim()) {
      toast('Vyplňte předmět a zprávu', 'error')
      return
    }

    setSendingReply(true)
    try {
      const response = await fetch(`/api/admin/messages/${replyingTo.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: replySubject,
          message: replyMessage,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply')
      }

      toast('Odpověď byla úspěšně odeslána', 'success')
      closeReplyModal()
      setSelectedMessage(null)
      fetchMessages()
    } catch (error: any) {
      toast(error.message || 'Nepodařilo se odeslat odpověď', 'error')
    } finally {
      setSendingReply(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const unreadCount = messages.filter(m => m.status === 'received' || m.status === 'email_sent' || m.status === 'email_failed').length
  const failedCount = messages.filter(m => m.status === 'email_failed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontaktní zprávy</h1>
          <p className="text-gray-500 mt-1">
            Zprávy z kontaktního formuláře ({messages.length} celkem
            {unreadCount > 0 && <span className="text-yellow-600">, {unreadCount} nepřečtených</span>}
            {failedCount > 0 && <span className="text-red-600">, {failedCount} s chybou emailu</span>})
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Obnovit
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtr podle stavu:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Všechny</option>
            <option value="received">Přijato</option>
            <option value="email_sent">Email odeslán</option>
            <option value="email_failed">Email selhal</option>
            <option value="read">Přečteno</option>
            <option value="replied">Odpovězeno</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            Načítám zprávy...
          </div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Žádné zprávy</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Datum</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Odesílatel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Předmět</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stav</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      message.status === 'received' || message.status === 'email_sent' ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 font-medium">{message.name}</div>
                      <div className="text-sm text-gray-500">{message.email}</div>
                      {message.phone && (
                        <div className="text-sm text-gray-500">{message.phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{subjectLabels[message.subject] || message.subject}</div>
                      <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                        {message.status === 'email_failed' && <MailWarning className="w-3 h-3" />}
                        {message.status === 'email_sent' && <Mail className="w-3 h-3" />}
                        {message.status === 'replied' && <CheckCircle className="w-3 h-3" />}
                        {statusLabels[message.status]}
                      </span>
                      {message.emailError && (
                        <div className="text-xs text-red-400 mt-1" title={message.emailError}>
                          Chyba: {message.emailError.slice(0, 30)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Zobrazit detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(message.status === 'received' || message.status === 'email_sent' || message.status === 'email_failed') && (
                          <button
                            onClick={() => markAsRead(message.id)}
                            className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="Označit jako přečtené"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {message.status !== 'replied' && (
                          <button
                            onClick={() => openReplyModal(message)}
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Odpovědět"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl text-gray-900">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detail zprávy</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Jméno</label>
                  <div className="text-gray-900 font-medium">{selectedMessage.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Datum</label>
                  <div className="text-gray-900">{formatDate(selectedMessage.createdAt)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="text-gray-900">
                    <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefon</label>
                  <div className="text-gray-900">{selectedMessage.phone || '-'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Předmět</label>
                  <div className="text-gray-900">{subjectLabels[selectedMessage.subject] || selectedMessage.subject}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stav</label>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedMessage.status]}`}>
                      {statusLabels[selectedMessage.status]}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Zpráva</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap border border-gray-200">
                  {selectedMessage.message}
                </div>
              </div>
              {selectedMessage.emailError && (
                <div>
                  <label className="text-sm font-medium text-red-600">Chyba emailu</label>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg text-red-700 text-sm border border-red-200">
                    {selectedMessage.emailError}
                  </div>
                </div>
              )}
            </div>
            {/* Replies History */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="px-6 pb-4">
                <label className="text-sm font-medium text-gray-500 mb-2 block">Historie odpovědí</label>
                <div className="space-y-3">
                  {selectedMessage.replies.map((reply: ReplyRecord) => (
                    <div key={reply.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">
                          {reply.subject}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(reply.sentAt)} • {reply.sentBy}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                      {!reply.emailSent && (
                        <p className="text-xs text-red-500 mt-2">Email nebyl odeslán</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              {selectedMessage.status !== 'replied' && (
                <>
                  {(selectedMessage.status === 'received' || selectedMessage.status === 'email_sent' || selectedMessage.status === 'email_failed') && (
                    <button
                      onClick={() => {
                        markAsRead(selectedMessage.id)
                        setSelectedMessage(null)
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Označit jako přečtené
                    </button>
                  )}
                </>
              )}
              {selectedMessage.status !== 'replied' && (
                <button
                  onClick={() => {
                    openReplyModal(selectedMessage)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  Odpovědět
                </button>
              )}
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl text-gray-900">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Reply className="w-5 h-5 text-blue-600" />
                  Odpovědět na zprávu
                </h2>
                <button
                  onClick={closeReplyModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Recipient Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Příjemce</div>
                <div className="font-medium text-gray-900">{replyingTo.name}</div>
                <div className="text-sm text-gray-600">{replyingTo.email}</div>
              </div>

              {/* Original Message */}
              <div>
                <label className="text-sm font-medium text-gray-500 mb-1 block">Původní zpráva</label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200 max-h-32 overflow-y-auto">
                  <div className="font-medium mb-1">{subjectLabels[replyingTo.subject] || replyingTo.subject}</div>
                  <div className="whitespace-pre-wrap">{replyingTo.message}</div>
                </div>
              </div>

              {/* Reply Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Předmět odpovědi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Předmět"
                />
              </div>

              {/* Reply Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Vaše odpověď <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-none"
                  placeholder="Napište vaši odpověď..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={closeReplyModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={sendingReply}
              >
                Zrušit
              </button>
              <button
                onClick={sendReply}
                disabled={sendingReply || !replySubject.trim() || !replyMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingReply ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Odesílám...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Odeslat odpověď
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
