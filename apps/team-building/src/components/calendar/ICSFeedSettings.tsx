'use client'

import { useState, useEffect } from 'react'
import { Rss, Copy, RefreshCw, Loader2, Check, ExternalLink } from 'lucide-react'

export function ICSFeedSettings() {
  const [feedUrl, setFeedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchFeedUrl()
  }, [])

  const fetchFeedUrl = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/calendar/feed/generate')
      if (res.ok) {
        const data = await res.json()
        setFeedUrl(data.feedUrl)
      }
    } catch (error) {
      console.error('Error fetching feed URL:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewFeed = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/calendar/feed/generate', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setFeedUrl(data.feedUrl)
      }
    } catch (error) {
      console.error('Error generating feed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!feedUrl) return
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Rss className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">ICS Feed (Apple Calendar, Outlook)</h3>
      </div>

      <p className="text-gray-600 mb-4">
        Přidejte ICS feed do Apple Calendar, Outlook nebo jiné kalendářové aplikace pro automatickou synchronizaci.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : feedUrl ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={feedUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Zkopírováno' : 'Kopírovat'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={generateNewFeed}
              disabled={generating}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Vygenerovat nový odkaz
            </button>
            <a
              href={feedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
              Otevřít feed
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Jak přidat do kalendáře:</p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>
                <strong>Apple Calendar:</strong> File → New Calendar Subscription → vložte URL
              </li>
              <li>
                <strong>Outlook:</strong> Add calendar → Subscribe from web → vložte URL
              </li>
              <li>
                <strong>Google Calendar:</strong> Other calendars → From URL → vložte URL
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-500 mb-4">Zatím nemáte vygenerovaný ICS feed.</p>
          <button
            onClick={generateNewFeed}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rss className="h-4 w-4" />}
            Vygenerovat ICS feed
          </button>
        </div>
      )}
    </div>
  )
}
