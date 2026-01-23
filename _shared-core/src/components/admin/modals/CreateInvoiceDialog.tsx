/**
 * Create Invoice Dialog - Create invoice from order in Vyfakturuj
 * Allows selecting invoice type and email options
 */
'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { FileText, X, Send, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface CreateInvoiceDialogProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderNumber?: string
  customerEmail?: string
  totalPrice?: number
  onInvoiceCreated: (invoiceData: InvoiceCreatedData) => void
}

interface InvoiceCreatedData {
  invoiceId: string
  vyfakturujId?: number
  vyfakturujNumber?: string
  pdfUrl?: string
  publicUrl?: string
}

type InvoiceType = 'invoice' | 'proforma' | 'advance'

const invoiceTypeLabels: Record<InvoiceType, string> = {
  invoice: 'Faktura',
  proforma: 'Proforma faktura',
  advance: 'Zálohová faktura',
}

const invoiceTypeDescriptions: Record<InvoiceType, string> = {
  invoice: 'Standardní daňový doklad',
  proforma: 'Nezávazná nabídka k platbě',
  advance: 'Faktura na zálohu před dodáním',
}

export function CreateInvoiceDialog({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  customerEmail,
  totalPrice,
  onInvoiceCreated,
}: CreateInvoiceDialogProps) {
  const { toast } = useToast()
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('invoice')
  const [sendEmail, setSendEmail] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState(customerEmail || '')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdInvoice, setCreatedInvoice] = useState<InvoiceCreatedData | null>(null)

  const handleClose = () => {
    if (!isSubmitting) {
      setInvoiceType('invoice')
      setSendEmail(false)
      setEmailRecipient(customerEmail || '')
      setNotes('')
      setCreatedInvoice(null)
      onClose()
    }
  }

  const handleCreateInvoice = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: invoiceType,
          sendEmail,
          emailRecipients: sendEmail && emailRecipient ? [emailRecipient] : undefined,
          notes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const invoiceData: InvoiceCreatedData = {
          invoiceId: data.data.invoiceId,
          vyfakturujId: data.data.vyfakturujId,
          vyfakturujNumber: data.data.vyfakturujNumber,
          pdfUrl: data.data.pdfUrl,
          publicUrl: data.data.publicUrl,
        }
        setCreatedInvoice(invoiceData)
        toast(
          `${invoiceTypeLabels[invoiceType]} ${data.data.vyfakturujNumber || ''} úspěšně vytvořena`,
          'success'
        )
        onInvoiceCreated(invoiceData)
      } else {
        toast(data.error || 'Chyba při vytváření faktury', 'error')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast('Chyba při vytváření faktury', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all text-gray-900">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                        {createdInvoice ? 'Faktura vytvořena' : 'Vystavit fakturu'}
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Objednávka #{orderNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {createdInvoice ? (
                  // Success state
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>{invoiceTypeLabels[invoiceType]}</strong> byla úspěšně vytvořena ve Vyfakturuj.cz
                      </p>
                      {createdInvoice.vyfakturujNumber && (
                        <p className="mt-1 text-sm text-green-700">
                          Číslo faktury: <strong>{createdInvoice.vyfakturujNumber}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {createdInvoice.pdfUrl && (
                        <a
                          href={createdInvoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          <FileText className="h-4 w-4" />
                          Stáhnout PDF
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      )}
                      {createdInvoice.publicUrl && (
                        <a
                          href={createdInvoice.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Zobrazit ve Vyfakturuj
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </a>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Zavřít
                      </button>
                    </div>
                  </div>
                ) : (
                  // Form state
                  <div className="space-y-6">
                    {/* Invoice Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typ dokladu
                      </label>
                      <div className="space-y-2">
                        {(Object.keys(invoiceTypeLabels) as InvoiceType[]).map((type) => (
                          <label
                            key={type}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              invoiceType === type
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="invoiceType"
                              value={type}
                              checked={invoiceType === type}
                              onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                              className="mt-0.5 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {invoiceTypeLabels[type]}
                              </p>
                              <p className="text-xs text-gray-500">
                                {invoiceTypeDescriptions[type]}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Total Price Info */}
                    {totalPrice !== undefined && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Celková částka:</span>
                          <span className="text-lg font-bold text-gray-900">
                            {totalPrice.toLocaleString('cs-CZ')} Kč
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Email Options */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendEmail}
                          onChange={(e) => setSendEmail(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Odeslat fakturu emailem
                        </span>
                      </label>

                      {sendEmail && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-500 mb-1">
                            Email příjemce
                          </label>
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-gray-400" />
                            <input
                              type="email"
                              value={emailRecipient}
                              onChange={(e) => setEmailRecipient(e.target.value)}
                              placeholder="email@example.com"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poznámka na fakturu (nepovinné)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Text se zobrazí na faktuře..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>Poznámka:</strong> Faktura bude vytvořena ve službě Vyfakturuj.cz
                        a propojena s touto objednávkou. Data zákazníka budou synchronizována automaticky.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      >
                        Zrušit
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateInvoice}
                        disabled={isSubmitting || (sendEmail && !emailRecipient)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Vytvářím...' : 'Vystavit fakturu'}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
