/**
 * Create Customer Modal - Dialog for creating a new customer from OrderForm
 */
'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface CreateCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onCustomerCreated: (customer: { _id: string; firstName: string; lastName: string; organization?: string }) => void
}

export function CreateCustomerModal({ isOpen, onClose, onCustomerCreated }: CreateCustomerModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Basic info
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Organization
  const [organization, setOrganization] = useState('')
  const [organizationType, setOrganizationType] = useState('')

  // Address
  const [addressStreet, setAddressStreet] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressPostalCode, setAddressPostalCode] = useState('')

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setOrganization('')
    setOrganizationType('')
    setAddressStreet('')
    setAddressCity('')
    setAddressPostalCode('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName || !lastName || !email) {
      toast('Vyplňte povinná pole (Jméno, Příjmení, Email)', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const address = addressStreet || addressCity || addressPostalCode
        ? {
            street: addressStreet || undefined,
            city: addressCity || undefined,
            postalCode: addressPostalCode || undefined,
          }
        : null

      const customerData = {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        organization: organization || undefined,
        organizationType: organizationType || undefined,
        address,
      }

      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        const result = await response.json()
        toast('Zákazník úspěšně vytvořen', 'success')

        // Call the callback with the new customer
        // API returns { success: true, data: customer } where customer has _id field
        const customer = result.data
        onCustomerCreated({
          _id: customer._id || customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          organization: customer.organization,
        })

        resetForm()
        onClose()
      } else {
        const error = await response.json()
        toast(error.error || 'Chyba při vytváření zákazníka', 'error')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast('Chyba při vytváření zákazníka', 'error')
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all text-gray-900">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900"
                  >
                    Nový zákazník
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jméno <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Příjmení <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                  </div>

                  {/* Organization */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Organizace
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Typ organizace
                      </label>
                      <select
                        value={organizationType}
                        onChange={(e) => setOrganizationType(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                      >
                        <option value="">Vyberte typ...</option>
                        <option value="elementary_school">Základní škola</option>
                        <option value="kindergarten">Mateřská škola</option>
                        <option value="high_school">Střední škola</option>
                        <option value="cultural_center">Kulturní centrum</option>
                        <option value="municipality">Městský úřad</option>
                        <option value="private_company">Soukromá firma</option>
                        <option value="nonprofit">Nezisková organizace</option>
                        <option value="other">Jiné</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Adresa</h4>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Ulice a číslo popisné
                        </label>
                        <input
                          type="text"
                          value={addressStreet}
                          onChange={(e) => setAddressStreet(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          placeholder="Třídní 123"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          PSČ
                        </label>
                        <input
                          type="text"
                          value={addressPostalCode}
                          onChange={(e) => setAddressPostalCode(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          placeholder="123 45"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Město
                        </label>
                        <input
                          type="text"
                          value={addressCity}
                          onChange={(e) => setAddressCity(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          placeholder="Praha"
                        />
                      </div>
                    </div>
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
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Ukládám...' : 'Vytvořit zákazníka'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
