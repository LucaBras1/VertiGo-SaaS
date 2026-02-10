'use client'

import { useState, useEffect } from 'react'
import {
  LayoutGrid,
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  CreditCard,
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { format, parseISO } from 'date-fns'
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ClassFormModal } from '@/components/classes/ClassFormModal'

interface FitnessClass {
  id: string
  name: string
  description: string | null
  scheduledAt: string
  duration: number
  capacity: number
  location: string | null
  price: number
  status: string
  _count?: {
    bookings: number
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Naplánováno', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Probíhá', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Dokončeno', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Zrušeno', color: 'bg-red-100 text-red-800' },
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<FitnessClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/classes')
      const data = await response.json()
      if (response.ok) {
        setClasses(data.classes || [])
      }
    } catch {
      toast.error('Chyba při načítání lekcí')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (fitnessClass?: FitnessClass) => {
    setSelectedClass(fitnessClass || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClass(null)
  }

  const handleDelete = async (classId: string) => {
    if (!confirm('Opravdu chcete smazat tuto lekci?')) return

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Chyba při mazání')
      }

      toast.success('Lekce byla smazána')
      fetchClasses()
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
                <LayoutGrid className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Skupinové lekce</h1>
                <p className="text-neutral-600 dark:text-neutral-400">Správa skupinových fitness lekcí</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Nová lekce
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
        ) : classes.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center">
            <LayoutGrid className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Žádné lekce</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">Začněte přidáním první skupinové lekce</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-5 w-5" />
              Přidat lekci
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((fitnessClass) => (
              <div
                key={fitnessClass.id}
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-2',
                          statusConfig[fitnessClass.status]?.color || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        )}
                      >
                        {statusConfig[fitnessClass.status]?.label || fitnessClass.status}
                      </span>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{fitnessClass.name}</h3>
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
                                  onClick={() => handleOpenModal(fitnessClass)}
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
                                  onClick={() => handleDelete(fitnessClass.id)}
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

                  {fitnessClass.description && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2">
                      {fitnessClass.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      {format(parseISO(fitnessClass.scheduledAt), 'EEEE d. MMMM, HH:mm', {
                        locale: cs,
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      {fitnessClass.duration} minut
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-neutral-400" />
                      {fitnessClass._count?.bookings || 0} / {fitnessClass.capacity} míst
                    </div>
                    {fitnessClass.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-neutral-400" />
                        {fitnessClass.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                      {fitnessClass.price > 0 ? `${fitnessClass.price} Kč` : 'Zdarma'}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      (fitnessClass._count?.bookings || 0) >= fitnessClass.capacity
                        ? 'text-red-600'
                        : 'text-green-600'
                    )}
                  >
                    {(fitnessClass._count?.bookings || 0) >= fitnessClass.capacity
                      ? 'Plně obsazeno'
                      : `${fitnessClass.capacity - (fitnessClass._count?.bookings || 0)} volných míst`}
                  </span>
                  <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Zobrazit účastníky
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClassFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchClasses}
        classData={selectedClass}
      />
    </>
  )
}
