'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Package,
  Edit,
  Trash2,
  X,
  FileText,
} from 'lucide-react'
import { Shoot, useDeleteShoot, SHOOT_STATUS_COLORS } from '@/hooks/useShoots'
import { Badge, Button, Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@vertigo/ui'

interface ShootDetailModalProps {
  isOpen: boolean
  onClose: () => void
  shoot: Shoot | null
  onShootUpdated: () => void
  onEditClick: () => void
}

const STATUS_LABELS: Record<string, string> = {
  INQUIRY: 'Inquiry',
  QUOTE_SENT: 'Quote Sent',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const VENUE_TYPE_LABELS: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  mixed: 'Mixed',
}

export function ShootDetailModal({
  isOpen,
  onClose,
  shoot,
  onShootUpdated,
  onEditClick,
}: ShootDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteShootMutation = useDeleteShoot()

  if (!shoot) return null

  const handleDelete = () => {
    deleteShootMutation.mutate(shoot.id, {
      onSuccess: () => {
        onShootUpdated()
        onClose()
      },
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'INQUIRY': return 'default'
      case 'QUOTE_SENT': return 'info'
      case 'CONFIRMED': return 'success'
      case 'COMPLETED': return 'default'
      case 'CANCELLED': return 'danger'
      default: return 'default'
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose() }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Shoot Details</ModalTitle>
          </ModalHeader>
          <ModalBody>
      {showDeleteConfirm ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this shoot? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleteShootMutation.isPending}
            >
              Delete Shoot
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header with status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {shoot.package.title}
              </h3>
              <p className="text-gray-600">{shoot.package.client.name}</p>
            </div>
            <Badge variant={getStatusVariant(shoot.package.status)}>
              {STATUS_LABELS[shoot.package.status] || shoot.package.status}
            </Badge>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {format(parseISO(shoot.date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">
                  {shoot.startTime} - {shoot.endTime}
                </p>
              </div>
            </div>
          </div>

          {/* Venue */}
          {(shoot.venueName || shoot.venueAddress || shoot.venueType) && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  {shoot.venueName && (
                    <p className="font-medium">{shoot.venueName}</p>
                  )}
                  {shoot.venueAddress && (
                    <p className="text-gray-600 text-sm">{shoot.venueAddress}</p>
                  )}
                  {shoot.venueType && (
                    <Badge variant="default" size="sm" className="mt-1">
                      {VENUE_TYPE_LABELS[shoot.venueType] || shoot.venueType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {shoot.notes && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{shoot.notes}</p>
            </div>
          )}

          {/* Lighting Notes */}
          {shoot.lightingNotes && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Lighting Notes</p>
              <p className="text-gray-700 whitespace-pre-wrap">{shoot.lightingNotes}</p>
            </div>
          )}

          {/* Links */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <Link
              href={`/dashboard/packages/${shoot.packageId}`}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
            >
              <Package className="w-4 h-4" />
              View Package
            </Link>
            <Link
              href={`/dashboard/clients/${shoot.package.client.id}`}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
            >
              <User className="w-4 h-4" />
              View Client
            </Link>
            {shoot.shotList && (
              <Link
                href={`/dashboard/shot-lists/${shoot.shotList.id}`}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
              >
                <FileText className="w-4 h-4" />
                View Shot List
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4 flex justify-between">
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onEditClick}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </ModalBody>
        </ModalContent>
      </Modal>
  )
}
