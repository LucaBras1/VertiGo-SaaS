/**
 * Admin Invoices Page
 */

'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { FileText } from 'lucide-react'

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      const response = await fetch('/api/invoices')
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PAID: 'success',
      SENT: 'info',
      OVERDUE: 'danger',
      DRAFT: 'warning',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-partypal-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Faktury</h1>
        <p className="text-gray-600 mt-1">Správa faktur a plateb</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Číslo faktury
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Zákazník
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Datum vystavení
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Splatnost
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Částka
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Stav
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {invoice.customer.firstName} {invoice.customer.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString('cs-CZ')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {invoice.total.toLocaleString('cs-CZ')} Kč
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {invoices.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-gray-500">Žádné faktury</div>
        </Card>
      )}
    </div>
  )
}
