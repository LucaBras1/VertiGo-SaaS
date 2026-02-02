/**
 * Contract Service - ShootFlow
 * Contract management for photography packages
 */

import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import type { Contract, ContractStatus, ContractTemplate, Client, Package, Tenant, Prisma } from '@/generated/prisma'

// Type for contract with relations
export type ContractWithRelations = Contract & {
  client: Client | null
  package: Package | null
  template?: ContractTemplate | null
  tenant?: Pick<Tenant, 'id' | 'name' | 'settings'> | null
}

// Types
export interface CreateContractInput {
  tenantId: string
  packageId?: string
  clientId?: string
  templateId?: string
  title: string
  content: string
  clauses?: Prisma.InputJsonValue
  expiresAt?: Date
}

export interface UpdateContractInput {
  title?: string
  content?: string
  clauses?: Prisma.InputJsonValue
  status?: ContractStatus
  expiresAt?: Date | null
}

export interface SignContractInput {
  signedByName: string
  signedByEmail: string
  signatureData?: string
  signatureType: 'draw' | 'type' | 'checkbox'
  ipAddress?: string
}

export interface ContractTemplateInput {
  tenantId: string
  name: string
  eventType?: string
  content: string
  clauses?: Prisma.InputJsonValue
  isDefault?: boolean
}

// Contract CRUD
export async function createContract(input: CreateContractInput): Promise<Contract> {
  const signToken = nanoid(32)

  return prisma.contract.create({
    data: {
      tenantId: input.tenantId,
      packageId: input.packageId,
      clientId: input.clientId,
      templateId: input.templateId,
      title: input.title,
      content: input.content,
      clauses: input.clauses || {},
      signToken,
      expiresAt: input.expiresAt,
      status: 'DRAFT',
    },
    include: {
      client: true,
      package: true,
      template: true,
    },
  })
}

export async function getContract(
  id: string,
  tenantId: string
): Promise<Contract | null> {
  return prisma.contract.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      client: true,
      package: true,
      template: true,
    },
  })
}

export async function getContractByToken(signToken: string): Promise<ContractWithRelations | null> {
  return prisma.contract.findUnique({
    where: { signToken },
    include: {
      client: true,
      package: true,
      tenant: {
        select: {
          id: true,
          name: true,
          settings: true,
        },
      },
    },
  }) as Promise<ContractWithRelations | null>
}

export async function listContracts(
  tenantId: string,
  filters?: {
    packageId?: string
    clientId?: string
    status?: ContractStatus
    search?: string
  }
): Promise<Contract[]> {
  const where: Record<string, unknown> = { tenantId }

  if (filters?.packageId) {
    where.packageId = filters.packageId
  }
  if (filters?.clientId) {
    where.clientId = filters.clientId
  }
  if (filters?.status) {
    where.status = filters.status
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { client: { name: { contains: filters.search, mode: 'insensitive' } } },
    ]
  }

  return prisma.contract.findMany({
    where,
    include: {
      client: true,
      package: true,
      template: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateContract(
  id: string,
  tenantId: string,
  input: UpdateContractInput
): Promise<Contract> {
  const { title, content, clauses, status, expiresAt } = input

  return prisma.contract.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(clauses !== undefined && { clauses }),
      ...(status !== undefined && { status }),
      ...(expiresAt !== undefined && { expiresAt }),
      updatedAt: new Date(),
    },
    include: {
      client: true,
      package: true,
      template: true,
    },
  })
}

export async function deleteContract(id: string, tenantId: string): Promise<void> {
  await prisma.contract.deleteMany({
    where: {
      id,
      tenantId,
    },
  })
}

// Contract Actions
export async function sendContract(id: string, tenantId: string): Promise<ContractWithRelations> {
  const contract = await getContract(id, tenantId)
  if (!contract) {
    throw new Error('Contract not found')
  }

  if (contract.status !== 'DRAFT') {
    throw new Error('Contract can only be sent from DRAFT status')
  }

  return prisma.contract.update({
    where: { id },
    data: {
      status: 'SENT',
      updatedAt: new Date(),
    },
    include: {
      client: true,
      package: true,
    },
  }) as Promise<ContractWithRelations>
}

export async function markContractViewed(signToken: string): Promise<Contract> {
  const contract = await getContractByToken(signToken)
  if (!contract) {
    throw new Error('Contract not found')
  }

  if (contract.status === 'SENT') {
    return prisma.contract.update({
      where: { signToken },
      data: {
        status: 'VIEWED',
        updatedAt: new Date(),
      },
    })
  }

  return contract
}

export async function signContract(
  signToken: string,
  input: SignContractInput
): Promise<ContractWithRelations> {
  const contract = await getContractByToken(signToken)
  if (!contract) {
    throw new Error('Contract not found')
  }

  if (contract.status === 'SIGNED') {
    throw new Error('Contract is already signed')
  }

  if (contract.status === 'CANCELLED') {
    throw new Error('Contract has been cancelled')
  }

  if (contract.status === 'EXPIRED' || (contract.expiresAt && contract.expiresAt < new Date())) {
    throw new Error('Contract has expired')
  }

  return prisma.contract.update({
    where: { signToken },
    data: {
      status: 'SIGNED',
      signedAt: new Date(),
      signedByName: input.signedByName,
      signedByEmail: input.signedByEmail,
      signatureData: input.signatureData,
      signatureType: input.signatureType,
      ipAddress: input.ipAddress,
      updatedAt: new Date(),
    },
    include: {
      client: true,
      package: true,
      tenant: {
        select: {
          id: true,
          name: true,
          settings: true,
        },
      },
    },
  }) as Promise<ContractWithRelations>
}

export async function cancelContract(id: string, tenantId: string): Promise<ContractWithRelations> {
  return prisma.contract.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      updatedAt: new Date(),
    },
    include: {
      client: true,
      package: true,
    },
  }) as Promise<ContractWithRelations>
}

// Contract Templates
export async function createContractTemplate(
  input: ContractTemplateInput
): Promise<ContractTemplate> {
  // If setting as default, unset other defaults for this tenant/eventType
  if (input.isDefault) {
    await prisma.contractTemplate.updateMany({
      where: {
        tenantId: input.tenantId,
        eventType: input.eventType,
        isDefault: true,
      },
      data: { isDefault: false },
    })
  }

  return prisma.contractTemplate.create({
    data: {
      tenantId: input.tenantId,
      name: input.name,
      eventType: input.eventType,
      content: input.content,
      clauses: input.clauses || {},
      isDefault: input.isDefault || false,
    },
  })
}

export async function getContractTemplate(
  id: string,
  tenantId: string
): Promise<ContractTemplate | null> {
  return prisma.contractTemplate.findFirst({
    where: {
      id,
      tenantId,
    },
  })
}

export async function listContractTemplates(
  tenantId: string,
  eventType?: string
): Promise<ContractTemplate[]> {
  const where: Record<string, unknown> = { tenantId }
  if (eventType) {
    where.eventType = eventType
  }

  return prisma.contractTemplate.findMany({
    where,
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
}

export async function updateContractTemplate(
  id: string,
  tenantId: string,
  input: Partial<ContractTemplateInput>
): Promise<ContractTemplate> {
  // If setting as default, unset other defaults
  if (input.isDefault) {
    const template = await getContractTemplate(id, tenantId)
    if (template) {
      await prisma.contractTemplate.updateMany({
        where: {
          tenantId,
          eventType: template.eventType,
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      })
    }
  }

  const { name, eventType, content, clauses, isDefault } = input

  return prisma.contractTemplate.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(eventType !== undefined && { eventType }),
      ...(content !== undefined && { content }),
      ...(clauses !== undefined && { clauses }),
      ...(isDefault !== undefined && { isDefault }),
      updatedAt: new Date(),
    },
  })
}

export async function deleteContractTemplate(id: string, tenantId: string): Promise<void> {
  await prisma.contractTemplate.deleteMany({
    where: {
      id,
      tenantId,
    },
  })
}

export async function getDefaultTemplate(
  tenantId: string,
  eventType?: string
): Promise<ContractTemplate | null> {
  return prisma.contractTemplate.findFirst({
    where: {
      tenantId,
      eventType,
      isDefault: true,
    },
  })
}

// Helper: Generate contract from template
export async function generateContractFromTemplate(
  templateId: string,
  tenantId: string,
  variables: Record<string, string>
): Promise<string> {
  const template = await getContractTemplate(templateId, tenantId)
  if (!template) {
    throw new Error('Template not found')
  }

  let content = template.content

  // Replace variables in content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    content = content.replace(regex, value)
  }

  return content
}

// Helper: Check if contract is valid for signing
export function isContractSignable(contract: Contract): {
  valid: boolean
  reason?: string
} {
  if (contract.status === 'SIGNED') {
    return { valid: false, reason: 'Contract is already signed' }
  }

  if (contract.status === 'CANCELLED') {
    return { valid: false, reason: 'Contract has been cancelled' }
  }

  if (contract.status === 'DRAFT') {
    return { valid: false, reason: 'Contract has not been sent yet' }
  }

  if (contract.expiresAt && contract.expiresAt < new Date()) {
    return { valid: false, reason: 'Contract has expired' }
  }

  return { valid: true }
}
