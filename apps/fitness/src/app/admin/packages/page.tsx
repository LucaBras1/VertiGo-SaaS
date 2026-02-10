'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Check, CreditCard, Clock, MoreHorizontal, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import { cn, formatCurrency } from '@/lib/utils'
import { PackageFormModal } from '@/components/packages/PackageFormModal'

interface PackageItem {
  id: string
  name: string
  description: string | null
  type: string
  price: number
  credits: number
  validityDays: number
  features: string[]
  isActive: boolean
}

const typeLabels: Record<string, string> = {
  sessions: 'Individuální tréninky',
  classes: 'Skupinové lekce',
  monthly: 'Měsíční členství',
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()
      if (response.ok) {
        setPackages(data.packages || [])
      }
    } catch {
      toast.error('Chyba při načítání balíčků')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (pkg?: PackageItem) => {
    setSelectedPackage(pkg || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPackage(null)
  }

  const handleToggleActive = async (pkg: PackageItem) => {
    try {
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      })

      if (!response.ok) {
        throw new Error('Chyba při aktualizaci')
      }

      toast.success(pkg.isActive ? 'Balíček deaktivován' : 'Balíček aktivován')
      fetchPackages()
    } catch {
      toast.error('Chyba při změně stavu')
    }
  }

  const handleDelete = async (packageId: string) => {
    if (!confirm('Opravdu chcete smazat tento balíček?')) return

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při mazání')
      }

      toast.success('Balíček byl smazán')
      fetchPackages()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Chyba při mazání')
    }
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Balíčky</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Správa členských balíčků a kreditů</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nový balíček
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Žádné balíčky</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Začněte vytvořením prvního balíčku</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-5 w-5" />
              Vytvořit balíček
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  'bg-white dark:bg-neutral-900 rounded-lg shadow-sm border overflow-hidden',
                  pkg.isActive ? 'border-neutral-200 dark:border-neutral-700' : 'border-neutral-200 dark:border-neutral-700 opacity-60'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        {typeLabels[pkg.type] || pkg.type}
                      </span>
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">{pkg.name}</h3>
                    </div>
                    <Menu as="div" className="relative">
                      <Menu.Button className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <MoreHorizontal className="h-5 w-5 text-neutral-400" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-lg bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleOpenModal(pkg)}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                    active ? 'bg-neutral-50 dark:bg-neutral-950' : ''
                                  )}
                                >
                                  <Edit className="h-4 w-4" />
                                  Upravit
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleToggleActive(pkg)}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-2 text-sm w-full',
                                    active ? 'bg-neutral-50 dark:bg-neutral-950' : ''
                                  )}
                                >
                                  {pkg.isActive ? (
                                    <>
                                      <ToggleLeft className="h-4 w-4" />
                                      Deaktivovat
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="h-4 w-4" />
                                      Aktivovat
                                    </>
                                  )}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(pkg.id)}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-2 text-sm w-full text-red-600',
                                    active ? 'bg-red-50' : ''
                                  )}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Smazat
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>

                  <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    {formatCurrency(pkg.price)}
                  </p>

                  {pkg.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">{pkg.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                      {pkg.credits} kreditů
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      {pkg.validityDays} dní
                    </div>
                  </div>

                  {pkg.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <Check className="h-4 w-4 text-primary-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                        pkg.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      )}
                    >
                      {pkg.isActive ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PackageFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchPackages}
        packageData={selectedPackage}
      />
    </>
  )
}
