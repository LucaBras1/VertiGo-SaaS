/**
 * Customer Form Component
 * Form for creating and editing customers
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button, Card, staggerContainer, staggerItem } from '@vertigo/ui'

const industryTypes = [
  { value: 'TECHNOLOGY', label: 'Technologie' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HEALTHCARE', label: 'Zdravotnictví' },
  { value: 'EDUCATION', label: 'Vzdělávání' },
  { value: 'MANUFACTURING', label: 'Výroba' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'HOSPITALITY', label: 'Pohostinství' },
  { value: 'CONSULTING', label: 'Konzultace' },
  { value: 'GOVERNMENT', label: 'Vláda' },
  { value: 'NONPROFIT', label: 'Nezisková' },
  { value: 'OTHER', label: 'Jiné' },
]

const organizationTypes = [
  { value: 'corporation', label: 'Korporace' },
  { value: 'nonprofit', label: 'Nezisková organizace' },
  { value: 'government', label: 'Vládní instituce' },
  { value: 'education', label: 'Vzdělávací instituce' },
]

const customerSchema = z.object({
  email: z.string().email('Neplatný email'),
  firstName: z.string().min(1, 'Jméno je povinné'),
  lastName: z.string().min(1, 'Příjmení je povinné'),
  phone: z.string().optional(),
  organization: z.string().optional(),
  organizationType: z.string().optional().nullable(),
  industryType: z.string().optional().nullable(),
  teamSize: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  initialData?: any
  onSubmit: (data: CustomerFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {},
  })

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)} className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Contact Information */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Kontaktní údaje</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Jméno *
              </label>
              <input
                {...register('firstName')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                placeholder="Jan"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Příjmení *
              </label>
              <input
                {...register('lastName')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                placeholder="Novák"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="jan.novak@firma.cz"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="+420 123 456 789"
            />
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Organization Information */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Organizace</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Název organizace
            </label>
            <input
              {...register('organization')}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="Acme Corporation"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Typ organizace
              </label>
              <select
                {...register('organizationType')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">Vyberte...</option>
                {organizationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Průmysl
              </label>
              <select
                {...register('industryType')}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">Vyberte...</option>
                {industryTypes.map((industry) => (
                  <option key={industry.value} value={industry.value}>
                    {industry.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Velikost týmu
            </label>
            <input
              type="number"
              {...register('teamSize', { valueAsNumber: true })}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              placeholder="50"
            />
          </div>
        </div>
      </Card>
      </motion.div>

      {/* Notes */}
      <motion.div variants={staggerItem}>
      <Card>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Poznámky</h3>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Interní poznámky
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            placeholder="Poznámky o zákazníkovi..."
          />
        </div>
      </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={staggerItem}>
      <div className="flex gap-4">
        <Button type="submit" loading={isLoading} className="flex-1">
          <Save className="w-5 h-5 mr-2" />
          {initialData ? 'Uložit změny' : 'Vytvořit zákazníka'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-5 h-5 mr-2" />
            Zrušit
          </Button>
        )}
      </div>
      </motion.div>
    </motion.form>
  )
}
