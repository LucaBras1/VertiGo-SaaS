'use client'

import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { OrderForm } from './OrderForm'
import { OrderSuccess } from './OrderSuccess'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  performanceId?: string
  performanceTitle?: string
}

/**
 * Order Modal component
 * Displays the order form in a modal dialog
 */
export function OrderModal({
  isOpen,
  onClose,
  performanceId,
  performanceTitle,
}: OrderModalProps) {
  const [orderState, setOrderState] = useState<{
    success: boolean
    orderNumber: string
    email: string
  } | null>(null)

  const handleSuccess = (orderNumber: string, email: string) => {
    setOrderState({ success: true, orderNumber, email })
  }

  const handleClose = () => {
    // Reset state when closing
    setOrderState(null)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-neutral-gray-900 border border-neutral-gray-700 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray-700 bg-gradient-to-r from-primary/10 to-transparent">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-2xl">🎭</span>
                      {performanceTitle || 'Pozvěte nás k vám'}
                    </Dialog.Title>
                    {!orderState?.success && (
                      <p className="text-sm text-neutral-gray-300 mt-1">
                        Vyplňte formulář a my se vám ozveme s nabídkou
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 text-neutral-gray-400 hover:text-white hover:bg-neutral-gray-800 rounded-lg transition-colors"
                    aria-label="Zavřít"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                  {orderState?.success ? (
                    <OrderSuccess
                      orderNumber={orderState.orderNumber}
                      email={orderState.email}
                      onClose={handleClose}
                    />
                  ) : (
                    <OrderForm
                      performanceId={performanceId}
                      performanceTitle={performanceTitle}
                      onSuccess={handleSuccess}
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
