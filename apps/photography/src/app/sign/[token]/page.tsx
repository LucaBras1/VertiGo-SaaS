'use client'

import { useState, useEffect, use } from 'react'
import { CheckCircle, XCircle, Clock, Loader2, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContractSignature } from '@/components/contracts/ContractSignature'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface ContractData {
  id: string
  title: string
  content: string
  clauses: Record<string, unknown> | null
  status: string
  expiresAt: string | null
  signedAt: string | null
  signedByName: string | null
  canSign: boolean
  signabilityReason?: string
  client: {
    name: string
    email: string
  } | null
  package: {
    title: string
    eventType: string | null
    eventDate: string | null
  } | null
  tenant: {
    name: string
    settings: Record<string, string> | null
  } | null
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default function SignContractPage({ params }: PageProps) {
  const { token } = use(params)

  const [contract, setContract] = useState<ContractData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signingLoading, setSigningLoading] = useState(false)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await fetch(`/api/public/contracts/${token}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Contract not found')
        }
        const data = await res.json()
        setContract(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contract')
      } finally {
        setIsLoading(false)
      }
    }

    fetchContract()
  }, [token])

  const handleSign = async (signData: {
    signedByName: string
    signedByEmail: string
    signatureData?: string
    signatureType: 'draw' | 'type' | 'checkbox'
  }) => {
    setSigningLoading(true)
    try {
      const res = await fetch(`/api/public/contracts/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to sign contract')
      }

      setSigned(true)
      toast.success('Contract signed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign contract')
    } finally {
      setSigningLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-gray-500 mt-4">Loading contract...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Contract Not Found</h2>
          <p className="text-gray-600">This contract does not exist or has been removed.</p>
        </Card>
      </div>
    )
  }

  // Already signed
  if (contract.status === 'SIGNED' || signed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Signed</h2>
          <p className="text-gray-600 mb-4">
            {signed
              ? 'Thank you for signing! A confirmation email has been sent to you.'
              : `This contract was signed on ${contract.signedAt ? format(new Date(contract.signedAt), 'd. MMMM yyyy', { locale: cs }) : 'a previous date'}.`}
          </p>
          {contract.tenant && (
            <p className="text-sm text-gray-500">
              Contract with {contract.tenant.name}
            </p>
          )}
        </Card>
      </div>
    )
  }

  // Cannot sign
  if (!contract.canSign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          {contract.status === 'EXPIRED' ? (
            <Clock className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          ) : (
            <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          )}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {contract.status === 'EXPIRED' ? 'Contract Expired' : 'Cannot Sign'}
          </h2>
          <p className="text-gray-600">
            {contract.signabilityReason || 'This contract cannot be signed at this time.'}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {contract.tenant && (
            <p className="text-sm text-gray-500 mb-2">{contract.tenant.name}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
          {contract.package && (
            <p className="text-gray-600 mt-1">
              Package: {contract.package.title}
              {contract.package.eventDate && (
                <span className="ml-2">
                  ({format(new Date(contract.package.eventDate), 'd. MMMM yyyy', { locale: cs })})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Contract Content */}
        <Card className="p-8 mb-6">
          <div className="prose prose-gray max-w-none" style={{ whiteSpace: 'pre-wrap' }}>
            {contract.content}
          </div>
        </Card>

        {/* Expiry Warning */}
        {contract.expiresAt && (
          <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="w-5 h-5" />
              <span>
                This contract expires on{' '}
                {format(new Date(contract.expiresAt), 'd. MMMM yyyy', { locale: cs })}
              </span>
            </div>
          </Card>
        )}

        {/* Signature Section */}
        <ContractSignature
          onSign={handleSign}
          clientName={contract.client?.name}
          clientEmail={contract.client?.email}
          loading={signingLoading}
        />
      </div>
    </div>
  )
}
