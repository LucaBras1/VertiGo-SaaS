'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { usePackages } from '@/hooks/usePackages'
import { useCreateShoot, useUpdateShoot, VENUE_TYPE_OPTIONS, Shoot } from '@/hooks/useShoots'
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

const shootSchema = z.object({
  packageId: z.string().min(1, 'Package is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  venueType: z.string().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  lightingNotes: z.string().optional(),
  notes: z.string().optional(),
})

type ShootFormData = z.infer<typeof shootSchema>

interface ShootFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  defaultDate?: Date | null
  editShoot?: Shoot | null
}

export function ShootFormModal({
  isOpen,
  onClose,
  onSaved,
  defaultDate,
  editShoot,
}: ShootFormModalProps) {
  const { data: packagesData, isLoading: isLoadingPackages } = usePackages({
    statuses: ['INQUIRY', 'QUOTE_SENT', 'CONFIRMED'],
    limit: 100,
  })

  const createShootMutation = useCreateShoot()
  const updateShootMutation = useUpdateShoot()

  const isEditing = !!editShoot

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShootFormData>({
    resolver: zodResolver(shootSchema),
    defaultValues: {
      packageId: '',
      date: '',
      startTime: '10:00',
      endTime: '12:00',
      venueType: '',
      venueName: '',
      venueAddress: '',
      lightingNotes: '',
      notes: '',
    },
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editShoot) {
        reset({
          packageId: editShoot.packageId,
          date: format(new Date(editShoot.date), 'yyyy-MM-dd'),
          startTime: editShoot.startTime,
          endTime: editShoot.endTime,
          venueType: editShoot.venueType || '',
          venueName: editShoot.venueName || '',
          venueAddress: editShoot.venueAddress || '',
          lightingNotes: editShoot.lightingNotes || '',
          notes: editShoot.notes || '',
        })
      } else {
        reset({
          packageId: '',
          date: defaultDate ? format(defaultDate, 'yyyy-MM-dd') : '',
          startTime: '10:00',
          endTime: '12:00',
          venueType: '',
          venueName: '',
          venueAddress: '',
          lightingNotes: '',
          notes: '',
        })
      }
    }
  }, [isOpen, defaultDate, editShoot, reset])

  const onSubmit = async (data: ShootFormData) => {
    const payload = {
      ...data,
      venueType: data.venueType || undefined,
      venueName: data.venueName || undefined,
      venueAddress: data.venueAddress || undefined,
      lightingNotes: data.lightingNotes || undefined,
      notes: data.notes || undefined,
    }

    if (isEditing && editShoot) {
      updateShootMutation.mutate(
        { id: editShoot.id, ...payload },
        { onSuccess: onSaved }
      )
    } else {
      createShootMutation.mutate(payload, { onSuccess: onSaved })
    }
  }

  const packages = packagesData?.data || []

  return (
    <Modal open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose() }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{isEditing ? 'Edit Shoot' : 'Schedule New Shoot'}</ModalTitle>
          </ModalHeader>
          <ModalBody>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Package Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Package *
          </label>
          <select
            {...register('packageId')}
            disabled={isLoadingPackages}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100"
          >
            <option value="">Select a package...</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.title} - {pkg.client.name} ({pkg.status})
              </option>
            ))}
          </select>
          {errors.packageId && (
            <p className="text-red-500 text-sm mt-1">{errors.packageId.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <Input
            type="date"
            label="Date *"
            {...register('date')}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="time"
              label="Start Time *"
              {...register('startTime')}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
            )}
          </div>
          <div>
            <Input
              type="time"
              label="End Time *"
              {...register('endTime')}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        {/* Venue Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue Type
          </label>
          <select
            {...register('venueType')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select venue type...</option>
            {VENUE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Venue Name */}
        <Input
          label="Venue Name"
          {...register('venueName')}
          placeholder="e.g., Central Park, Grand Hotel"
        />

        {/* Venue Address */}
        <Input
          label="Venue Address"
          {...register('venueAddress')}
          placeholder="Full address"
        />

        {/* Lighting Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lighting Notes
          </label>
          <textarea
            {...register('lightingNotes')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={2}
            placeholder="Notes about lighting conditions..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows={3}
            placeholder="Additional notes about the shoot..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || createShootMutation.isPending || updateShootMutation.isPending}
          >
            {isEditing ? 'Update Shoot' : 'Schedule Shoot'}
          </Button>
        </div>
      </form>
          </ModalBody>
        </ModalContent>
      </Modal>
  )
}
