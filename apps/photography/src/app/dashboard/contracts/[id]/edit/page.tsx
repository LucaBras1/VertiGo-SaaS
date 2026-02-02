'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContractForm } from '@/components/contracts/ContractForm'
import toast from 'react-hot-toast'
import type { Contract, Client, Package, ContractTemplate } from '@/generated/prisma'

interface ContractWithRelations extends Contract {
  client: Client | null
  package: Package | null
  template: ContractTemplate | null
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditContractPage({ params }: PageProps) {
  const { id } = use(params)

  const [contract, setContract] = useState<ContractWithRelations | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractRes, clientsRes, packagesRes] = await Promise.all([
          fetch(`/api/contracts/${id}`),
          fetch('/api/clients'),
          fetch('/api/packages'),
        ])

        if (!contractRes.ok) throw new Error('Failed to fetch contract')
        const contractData = await contractRes.json()

        // Can only edit DRAFT contracts
        if (contractData.status !== 'DRAFT') {
          toast.error('Only draft contracts can be edited')
          window.location.href = `/dashboard/contracts/${id}`
          return
        }

        setContract(contractData)

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          setClients(data.data || [])
        }

        if (packagesRes.ok) {
          const data = await packagesRes.json()
          setPackages(data.data || [])
        }
      } catch (error) {
        toast.error('Failed to load contract')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="text-gray-500 mt-4">Loading contract...</p>
      </Card>
    )
  }

  if (!contract) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 mb-4">Contract not found</p>
        <Link href="/dashboard/contracts">
          <Button>Back to Contracts</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/contracts/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Contract</h1>
          <p className="text-gray-600">{contract.title}</p>
        </div>
      </div>

      {/* Form */}
      <ContractForm
        contract={contract}
        clients={clients}
        packages={packages}
      />
    </div>
  )
}
