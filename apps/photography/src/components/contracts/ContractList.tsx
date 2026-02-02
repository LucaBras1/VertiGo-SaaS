'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
  FileText,
  Send,
  Eye,
  MoreVertical,
  Trash2,
  XCircle,
  Download,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContractStatusBadge } from './ContractStatusBadge'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import toast from 'react-hot-toast'
import type { Contract, Client, Package } from '@/generated/prisma'

interface ContractWithRelations extends Contract {
  client: Client | null
  package: Package | null
}

interface ContractListProps {
  contracts: ContractWithRelations[]
  onRefresh: () => void
}

export function ContractList({ contracts, onRefresh }: ContractListProps) {
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; contract: ContractWithRelations | null }>({
    open: false,
    contract: null,
  })
  const [loading, setLoading] = useState<string | null>(null)

  const handleSend = async (contract: ContractWithRelations) => {
    if (!contract.client?.email) {
      toast.error('Client email is required to send contract')
      return
    }

    setLoading(contract.id)
    try {
      const res = await fetch(`/api/contracts/${contract.id}?action=send`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send contract')
      }

      toast.success('Contract sent successfully')
      onRefresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send contract')
    } finally {
      setLoading(null)
    }
  }

  const handleCancel = async (contract: ContractWithRelations) => {
    setLoading(contract.id)
    try {
      const res = await fetch(`/api/contracts/${contract.id}?action=cancel`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to cancel contract')

      toast.success('Contract cancelled')
      onRefresh()
    } catch {
      toast.error('Failed to cancel contract')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.contract) return

    setLoading(deleteModal.contract.id)
    try {
      const res = await fetch(`/api/contracts/${deleteModal.contract.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete contract')

      toast.success('Contract deleted')
      setDeleteModal({ open: false, contract: null })
      onRefresh()
    } catch {
      toast.error('Failed to delete contract')
    } finally {
      setLoading(null)
    }
  }

  const getSigningUrl = (contract: ContractWithRelations) => {
    if (!contract.signToken) return null
    return `${window.location.origin}/sign/${contract.signToken}`
  }

  if (contracts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts yet</h3>
        <p className="text-gray-500 mb-4">
          Create your first contract to send to clients for signing.
        </p>
        <Link href="/dashboard/contracts/new">
          <Button>Create Contract</Button>
        </Link>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={`/dashboard/contracts/${contract.id}`}
                    className="font-medium text-gray-900 hover:text-amber-600 truncate"
                  >
                    {contract.title}
                  </Link>
                  <ContractStatusBadge status={contract.status} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  {contract.client && (
                    <span>Client: {contract.client.name}</span>
                  )}
                  {contract.package && (
                    <span>Package: {contract.package.title}</span>
                  )}
                  <span>Created: {format(new Date(contract.createdAt), 'd. M. yyyy', { locale: cs })}</span>
                  {contract.signedAt && (
                    <span className="text-green-600">
                      Signed: {format(new Date(contract.signedAt), 'd. M. yyyy', { locale: cs })}
                    </span>
                  )}
                  {contract.expiresAt && contract.status !== 'SIGNED' && (
                    <span className={new Date(contract.expiresAt) < new Date() ? 'text-red-600' : 'text-amber-600'}>
                      Expires: {format(new Date(contract.expiresAt), 'd. M. yyyy', { locale: cs })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {contract.status === 'DRAFT' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(contract)}
                      disabled={loading === contract.id}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                    <Link href={`/dashboard/contracts/${contract.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </>
                )}

                {(contract.status === 'SENT' || contract.status === 'VIEWED') && (
                  <>
                    {getSigningUrl(contract) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(getSigningUrl(contract)!)
                          toast.success('Signing link copied!')
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(contract)}
                      disabled={loading === contract.id}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}

                {contract.status === 'SIGNED' && (
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                )}

                <Link href={`/dashboard/contracts/${contract.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>

                {contract.status === 'DRAFT' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteModal({ open: true, contract })}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, contract: null })}
        onConfirm={handleDelete}
        title="Delete Contract"
        itemName={deleteModal.contract?.title || 'Contract'}
        itemType="contract"
      />
    </>
  )
}
