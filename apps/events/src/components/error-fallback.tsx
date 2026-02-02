'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  error?: Error
  reset?: () => void
}

export function ErrorFallback({ error, reset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-red-500 mb-4">
        <AlertCircle className="w-16 h-16" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-gray-900">
        Neco se pokazilo
      </h2>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        {error?.message || 'Doslo k neocekavane chybe.'}
      </p>
      {reset && (
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Zkusit znovu
        </button>
      )}
    </div>
  )
}
