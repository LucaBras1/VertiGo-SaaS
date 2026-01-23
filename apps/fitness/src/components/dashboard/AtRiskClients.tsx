'use client'

import { AlertTriangle, Clock, TrendingDown } from 'lucide-react'

const atRiskClients = [
  {
    id: 1,
    name: 'David Brown',
    riskLevel: 'high',
    lastSession: '21 days ago',
    reason: 'Extended absence',
    action: 'Call today',
  },
  {
    id: 2,
    name: 'Lisa Martinez',
    riskLevel: 'medium',
    lastSession: '10 days ago',
    reason: 'Progress plateau',
    action: 'Schedule check-in',
  },
  {
    id: 3,
    name: 'Tom Anderson',
    riskLevel: 'medium',
    lastSession: '8 days ago',
    reason: 'Low attendance rate',
    action: 'Send message',
  },
]

const riskColors = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
  },
}

export function AtRiskClients() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">At-Risk Clients</h2>
            <p className="text-sm text-gray-600">Needs attention</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {atRiskClients.map((client) => {
            const colors = riskColors[client.riskLevel as keyof typeof riskColors]
            return (
              <div
                key={client.id}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      {client.lastSession}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${colors.badge}`}>
                    {client.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                  <TrendingDown className="w-4 h-4 text-gray-500" />
                  {client.reason}
                </div>

                <button className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${colors.text} bg-white hover:bg-gray-50 border ${colors.border}`}>
                  {client.action}
                </button>
              </div>
            )
          })}
        </div>

        <button className="w-full mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 py-2">
          View All At-Risk Clients
        </button>
      </div>
    </div>
  )
}
