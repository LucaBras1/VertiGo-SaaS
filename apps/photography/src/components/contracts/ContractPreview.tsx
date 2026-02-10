'use client'

import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { ContractStatusBadge } from './ContractStatusBadge'
import type { Contract, Client, Package, Tenant } from '@/generated/prisma'
import { Card } from '@vertigo/ui'

interface ContractPreviewProps {
  contract: Contract & {
    client?: Client | null
    package?: Package | null
    tenant?: Pick<Tenant, 'id' | 'name' | 'settings'> | null
  }
  showSignature?: boolean
}

export function ContractPreview({ contract, showSignature = true }: ContractPreviewProps) {
  const tenantSettings = contract.tenant?.settings as Record<string, string> | null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            {contract.package && (
              <p className="text-gray-600 mt-1">Package: {contract.package.title}</p>
            )}
          </div>
          <ContractStatusBadge status={contract.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-700">From:</h3>
            <p className="text-gray-900">{contract.tenant?.name || 'Photographer'}</p>
            {tenantSettings?.email && <p className="text-gray-600">{tenantSettings.email}</p>}
            {tenantSettings?.phone && <p className="text-gray-600">{tenantSettings.phone}</p>}
          </div>
          {contract.client && (
            <div>
              <h3 className="font-medium text-gray-700">To:</h3>
              <p className="text-gray-900">{contract.client.name}</p>
              <p className="text-gray-600">{contract.client.email}</p>
              {contract.client.phone && <p className="text-gray-600">{contract.client.phone}</p>}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm text-gray-500">
          <span>Created: {format(new Date(contract.createdAt), 'd. MMMM yyyy', { locale: cs })}</span>
          {contract.expiresAt && (
            <span className={new Date(contract.expiresAt) < new Date() ? 'text-red-600' : ''}>
              Expires: {format(new Date(contract.expiresAt), 'd. MMMM yyyy', { locale: cs })}
            </span>
          )}
          {contract.signedAt && (
            <span className="text-green-600">
              Signed: {format(new Date(contract.signedAt), 'd. MMMM yyyy HH:mm', { locale: cs })}
            </span>
          )}
        </div>
      </Card>

      {/* Content */}
      <Card className="p-8 mb-6">
        <div
          className="prose prose-gray max-w-none"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {contract.content}
        </div>
      </Card>

      {/* Signature */}
      {showSignature && contract.status === 'SIGNED' && (
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Signature</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Signed by:</p>
              <p className="font-medium text-gray-900">{contract.signedByName}</p>
              <p className="text-sm text-gray-600">{contract.signedByEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Signed on:</p>
              <p className="font-medium text-gray-900">
                {contract.signedAt &&
                  format(new Date(contract.signedAt), 'd. MMMM yyyy, HH:mm', { locale: cs })}
              </p>
              {contract.ipAddress && (
                <p className="text-sm text-gray-600">IP: {contract.ipAddress}</p>
              )}
            </div>
          </div>
          {contract.signatureData && contract.signatureType === 'draw' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={contract.signatureData}
                alt="Signature"
                className="max-h-24"
              />
            </div>
          )}
          {contract.signatureType === 'type' && contract.signatureData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p
                className="text-2xl font-cursive"
                style={{ fontFamily: 'cursive' }}
              >
                {contract.signatureData}
              </p>
            </div>
          )}
          {contract.signatureType === 'checkbox' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700">
                Agreement confirmed by {contract.signedByName}
              </span>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
