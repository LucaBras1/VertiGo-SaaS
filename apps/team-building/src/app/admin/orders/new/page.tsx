/**
 * New Order Page
 * Create a new order
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  firstName: string
  lastName: string
  organization: string | null
}

interface Program {
  id: string
  title: string
  price: number | null
}

export default function NewOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [formData, setFormData] = useState({
    customerId: '',
    source: 'manual',
    status: 'new',
    sessionName: '',
    teamSize: '',
    industryType: '',
    customObjectives: '',
    internalNotes: '',
    items: [] as { programId: string; date: string; price: number }[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [customersRes, programsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/programs'),
      ])
      const [customersData, programsData] = await Promise.all([
        customersRes.json(),
        programsRes.json(),
      ])

      if (customersData.success) setCustomers(customersData.data)
      if (programsData.success) setPrograms(programsData.data)
    } catch (error) {
      toast.error('Nepodařilo se načíst data')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
          dates: formData.items.map(i => i.date),
          venue: {},
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Objednávka byla vytvořena')
        router.push('/admin/orders')
      } else {
        toast.error(data.error || 'Nepodařilo se vytvořit objednávku')
      }
    } catch (error) {
      toast.error('Chyba při vytváření objednávky')
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { programId: '', date: '', price: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nová objednávka</h1>
          <p className="text-gray-600">Vytvořte novou objednávku</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Základní informace</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zákazník
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="input-field"
              >
                <option value="">Vyberte zákazníka</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.organization || `${customer.firstName} ${customer.lastName}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stav
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="input-field"
              >
                <option value="new">Nová</option>
                <option value="confirmed">Potvrzená</option>
                <option value="in_progress">Probíhá</option>
                <option value="completed">Dokončená</option>
                <option value="cancelled">Zrušená</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Název workshopu
              </label>
              <input
                type="text"
                value={formData.sessionName}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionName: e.target.value }))}
                className="input-field"
                placeholder="např. Team Building Q1 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Velikost týmu
              </label>
              <input
                type="number"
                value={formData.teamSize}
                onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                className="input-field"
                placeholder="např. 25"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cíle a poznámky
            </label>
            <textarea
              value={formData.customObjectives}
              onChange={(e) => setFormData(prev => ({ ...prev, customObjectives: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Specifické cíle a požadavky klienta..."
            />
          </div>
        </div>

        {/* Items */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Položky objednávky</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Přidat položku
            </Button>
          </div>

          {formData.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Zatím nemáte žádné položky. Klikněte na "Přidat položku".
            </p>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program
                    </label>
                    <select
                      value={item.programId}
                      onChange={(e) => {
                        updateItem(index, 'programId', e.target.value)
                        const program = programs.find(p => p.id === e.target.value)
                        if (program?.price) {
                          updateItem(index, 'price', program.price)
                        }
                      }}
                      className="input-field"
                    >
                      <option value="">Vyberte program</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-40">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Datum
                    </label>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => updateItem(index, 'date', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cena (Kč)
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                      className="input-field"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Internal Notes */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Interní poznámky</h2>
          <textarea
            value={formData.internalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
            className="input-field"
            rows={4}
            placeholder="Interní poznámky (neviditelné pro zákazníka)..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/orders">
            <Button variant="outline">Zrušit</Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Ukládám...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Vytvořit objednávku
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
