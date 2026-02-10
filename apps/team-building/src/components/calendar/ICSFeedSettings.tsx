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
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Rss className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">ICS Feed (Apple Calendar, Outlook)</h3>
      </div>

      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
        Přidejte ICS feed do Apple Calendar, Outlook nebo jiné kalendářové aplikace pro automatickou synchronizaci.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400" />
        </div>
      ) : feedUrl ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={feedUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 font-mono"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              {copied ? <Check className="h-4 w-4 text-success-600 dark:text-success-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Zkopírováno' : 'Kopírovat'}
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={generateNewFeed}
              disabled={generating}
              className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Vygenerovat nový odkaz
            </button>
            <a
              href={feedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-300"
            >
              <ExternalLink className="h-4 w-4" />
              Otevřít feed
            </a>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Jak přidat do kalendáře:</p>
            <ul className="text-sm text-neutral-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
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
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Zatím nemáte vygenerovaný ICS feed.</p>
          <button
            onClick={generateNewFeed}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rss className="h-4 w-4" />}
            Vygenerovat ICS feed
          </button>
        </div>
      )}
    </div>
  )
}
