'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Edit, XCircle, Download, ExternalLink, Loader2, Copy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContractPreview } from '@/components/contracts/ContractPreview'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'
import toast from 'react-hot-toast'
import type { Contract, Client, Package, ContractTemplate, Tenant } from '@/generated/prisma'

interface ContractWithRelations extends Contract {
  client: Client | null
  package: Package | null
  template: ContractTemplate | null
  tenant?: Pick<Tenant, 'id' | 'name' | 'settings'>
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ContractDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const [contract, setContract] = useState<ContractWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/contracts/${id}`)
        if (!res.ok) throw new Error('Failed to fetch contract')
        const data = await res.json()
        setContract(data)
      } catch (error) {
        toast.error('Failed to load contract')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContract()
  }, [id])

  const handleSend = async () => {
    if (!contract?.client?.email) {
      toast.error('Client email is required to send contract')
      return
    }

    setActionLoading('send')
    try {
      const res = await fetch(`/api/contracts/${id}?action=send`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send contract')
      }

      const updated = await res.json()
      setContract(updated)
      toast.success('Contract sent successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send contract')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading('cancel')
    try {
      const res = await fetch(`/api/contracts/${id}?action=cancel`, {
        method: 'POST',
      })

      if (!res.ok) throw new Error('Failed to cancel contract')

      const updated = await res.json()
      setContract(updated)
      toast.success('Contract cancelled')
    } catch {
      toast.error('Failed to cancel contract')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    setActionLoading('delete')
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete contract')

      toast.success('Contract deleted')
      router.push('/admin/contracts')
    } catch {
      toast.error('Failed to delete contract')
    } finally {
      setActionLoading(null)
    }
  }

  const copySigningLink = () => {
    if (!contract?.signToken) return
    const url = `${window.location.origin}/sign/${contract.signToken}`
    navigator.clipboard.writeText(url)
    toast.success('Signing link copied!')
  }

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="text-neutral-500 dark:text-neutral-400 mt-4">Loading contract...</p>
      </Card>
    )
  }

  if (!contract) {
    return (
      <Card className="p-12 text-center">
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">Contract not found</p>
        <Link href="/admin/contracts">
          <Button>Back to Contracts</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/contracts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{contract.title}</h1>
            {contract.client && (
              <p className="text-neutral-600 dark:text-neutral-400">Client: {contract.client.name}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {contract.status === 'DRAFT' && (
            <>
              <Button
                variant="outline"
                onClick={handleSend}
                disabled={actionLoading === 'send'}
              >
                <Send className="w-4 h-4 mr-2" />
                {actionLoading === 'send' ? 'Sending...' : 'Send to Client'}
              </Button>
              <Link href={`/admin/contracts/${id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => setDeleteModal(true)}
              >
                Delete
              </Button>
            </>
          )}

          {(contract.status === 'SENT' || contract.status === 'VIEWED') && (
            <>
              <Button variant="outline" onClick={copySigningLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Signing Link
              </Button>
              <Link
                href={`/sign/${contract.signToken}`}
                target="_blank"
              >
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Signing Page
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel'}
              </Button>
            </>
          )}

          {contract.status === 'SIGNED' && (
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Contract Preview */}
      <ContractPreview contract={contract} />

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Contract"
        itemName={contract?.title || 'Contract'}
        itemType="contract"
      />
    </div>
  )
}
