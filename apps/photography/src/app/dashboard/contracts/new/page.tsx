'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ContractForm } from '@/components/contracts/ContractForm'
import type { ContractTemplate, Client, Package } from '@/generated/prisma'

function NewContractPageContent() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('packageId') || undefined
  const clientId = searchParams.get('clientId') || undefined

  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, clientsRes, packagesRes] = await Promise.all([
          fetch('/api/contracts/templates'),
          fetch('/api/clients'),
          fetch('/api/packages'),
        ])

        if (templatesRes.ok) {
          const data = await templatesRes.json()
          setTemplates(data.data || [])
        }

        if (clientsRes.ok) {
          const data = await clientsRes.json()
          setClients(data.data || [])
        }

        if (packagesRes.ok) {
          const data = await packagesRes.json()
          setPackages(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        <p className="text-gray-500 mt-4">Loading...</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/contracts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Contract</h1>
          <p className="text-gray-600">Create a new contract for your client</p>
        </div>
      </div>

      {/* Form */}
      <ContractForm
        templates={templates}
        clients={clients}
        packages={packages}
        packageId={packageId}
        clientId={clientId}
      />
    </div>
  )
}

export default function NewContractPage() {
  return (
    <Suspense
      fallback={
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-gray-500 mt-4">Loading...</p>
        </Card>
      }
    >
      <NewContractPageContent />
    </Suspense>
  )
}
