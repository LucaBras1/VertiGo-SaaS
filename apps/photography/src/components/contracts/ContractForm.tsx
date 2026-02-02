'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import type { Contract, ContractTemplate, Client, Package } from '@/generated/prisma'

interface ContractFormProps {
  contract?: Contract & { client?: Client | null; package?: Package | null }
  templates?: ContractTemplate[]
  clients?: Client[]
  packages?: Package[]
  packageId?: string
  clientId?: string
}

export function ContractForm({
  contract,
  templates = [],
  clients = [],
  packages = [],
  packageId: initialPackageId,
  clientId: initialClientId,
}: ContractFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: contract?.title || '',
    content: contract?.content || '',
    packageId: contract?.packageId || initialPackageId || '',
    clientId: contract?.clientId || initialClientId || '',
    templateId: '',
    expiresAt: contract?.expiresAt
      ? new Date(contract.expiresAt).toISOString().split('T')[0]
      : '',
  })

  // Auto-fill client when package is selected
  useEffect(() => {
    if (formData.packageId && !formData.clientId) {
      const selectedPackage = packages.find((p) => p.id === formData.packageId)
      if (selectedPackage) {
        setFormData((prev) => ({ ...prev, clientId: selectedPackage.clientId }))
      }
    }
  }, [formData.packageId, packages])

  // Load template content when selected
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateId,
        content: template.content,
        title: prev.title || template.name,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      toast.error('Title and content are required')
      return
    }

    setLoading(true)
    try {
      const url = contract ? `/api/contracts/${contract.id}` : '/api/contracts'
      const method = contract ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          packageId: formData.packageId || null,
          clientId: formData.clientId || null,
          templateId: formData.templateId || null,
          expiresAt: formData.expiresAt || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save contract')
      }

      const saved = await res.json()
      toast.success(contract ? 'Contract updated' : 'Contract created')
      router.push(`/dashboard/contracts/${saved.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contract Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Wedding Photography Contract"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date (optional)
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package (optional)
              </label>
              <select
                value={formData.packageId}
                onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select package...</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Select client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Template Selection */}
        {!contract && templates.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Use Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    formData.templateId === template.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.name}</div>
                  {template.eventType && (
                    <div className="text-sm text-gray-500 capitalize">{template.eventType}</div>
                  )}
                  {template.isDefault && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Contract Content */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Content</h3>
          <p className="text-sm text-gray-500 mb-4">
            You can use variables like {'{{clientName}}'}, {'{{eventDate}}'}, {'{{packageTitle}}'} that will be replaced when sending.
          </p>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
            placeholder="Enter your contract content here..."
            required
          />
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : contract ? 'Update Contract' : 'Create Contract'}
          </Button>
        </div>
      </div>
    </form>
  )
}
