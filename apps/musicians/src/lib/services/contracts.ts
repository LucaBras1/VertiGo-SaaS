/**
 * Contract Service
 * Manages contracts, templates, and clauses
 */

import { prisma } from '@/lib/db'
import { ContractStatus, ContractLanguage } from '@/generated/prisma'

// ========================================
// TYPES
// ========================================

export interface PerformerInfo {
  name: string
  address?: string
  ico?: string
  dic?: string
  phone?: string
  email?: string
}

export interface ClientInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  company?: string
}

export interface EventDetails {
  title: string
  date: string
  time?: string
  venue?: string
  duration?: number
  description?: string
}

export interface FinancialTerms {
  totalPrice: number
  deposit?: number
  depositDue?: string
  paymentDue?: string
  currency: string
}

export interface ContractSection {
  id: string
  title: string
  content: string
  order: number
}

export interface ContractClauseData {
  clauseId: string
  title: string
  content: string
  order: number
}

// ========================================
// CONTRACT CRUD
// ========================================

export interface CreateContractInput {
  tenantId: string
  templateId?: string
  gigId?: string
  language?: ContractLanguage
  title: string
  performerInfo: PerformerInfo
  clientInfo: ClientInfo
  eventDetails: EventDetails
  financialTerms: FinancialTerms
  sections: ContractSection[]
  clauses: ContractClauseData[]
  aiGenerated?: boolean
  aiPrompt?: string
}

export interface UpdateContractInput {
  title?: string
  status?: ContractStatus
  language?: ContractLanguage
  performerInfo?: PerformerInfo
  clientInfo?: ClientInfo
  eventDetails?: EventDetails
  financialTerms?: FinancialTerms
  sections?: ContractSection[]
  clauses?: ContractClauseData[]
  pdfUrl?: string
}

async function generateContractNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.contract.count({
    where: {
      tenantId,
      createdAt: {
        gte: new Date(year, 0, 1),
      }
    }
  })

  return `SMV-${year}-${String(count + 1).padStart(4, '0')}`
}

export async function getContracts(tenantId: string, options?: {
  status?: ContractStatus
  gigId?: string
  limit?: number
  offset?: number
}) {
  const where: any = { tenantId }

  if (options?.status) where.status = options.status
  if (options?.gigId) where.gigId = options.gigId

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      include: {
        template: { select: { id: true, name: true } },
        gig: { select: { id: true, title: true, eventDate: true } },
      }
    }),
    prisma.contract.count({ where })
  ])

  return { contracts, total }
}

export async function getContractById(id: string, tenantId: string) {
  return prisma.contract.findFirst({
    where: { id, tenantId },
    include: {
      template: true,
      gig: true,
      versions: {
        select: { id: true, version: true, createdAt: true },
        orderBy: { version: 'desc' }
      }
    }
  })
}

export async function createContract(input: CreateContractInput) {
  const contractNumber = await generateContractNumber(input.tenantId)

  return prisma.contract.create({
    data: {
      tenantId: input.tenantId,
      contractNumber,
      templateId: input.templateId,
      gigId: input.gigId,
      language: input.language || 'CS',
      title: input.title,
      performerInfo: JSON.parse(JSON.stringify(input.performerInfo)),
      clientInfo: JSON.parse(JSON.stringify(input.clientInfo)),
      eventDetails: JSON.parse(JSON.stringify(input.eventDetails)),
      financialTerms: JSON.parse(JSON.stringify(input.financialTerms)),
      sections: JSON.parse(JSON.stringify(input.sections)),
      clauses: JSON.parse(JSON.stringify(input.clauses)),
      aiGenerated: input.aiGenerated || false,
      aiPrompt: input.aiPrompt,
    }
  })
}

export async function updateContract(id: string, tenantId: string, input: UpdateContractInput) {
  const existing = await prisma.contract.findFirst({
    where: { id, tenantId }
  })

  if (!existing) {
    throw new Error('Contract not found')
  }

  const updateData: any = {}

  if (input.title !== undefined) updateData.title = input.title
  if (input.status !== undefined) {
    updateData.status = input.status
    if (input.status === 'SENT' && !existing.sentAt) {
      updateData.sentAt = new Date()
    }
    if (input.status === 'SIGNED' && !existing.signedAt) {
      updateData.signedAt = new Date()
    }
  }
  if (input.language !== undefined) updateData.language = input.language
  if (input.performerInfo !== undefined) updateData.performerInfo = JSON.parse(JSON.stringify(input.performerInfo))
  if (input.clientInfo !== undefined) updateData.clientInfo = JSON.parse(JSON.stringify(input.clientInfo))
  if (input.eventDetails !== undefined) updateData.eventDetails = JSON.parse(JSON.stringify(input.eventDetails))
  if (input.financialTerms !== undefined) updateData.financialTerms = JSON.parse(JSON.stringify(input.financialTerms))
  if (input.sections !== undefined) updateData.sections = JSON.parse(JSON.stringify(input.sections))
  if (input.clauses !== undefined) updateData.clauses = JSON.parse(JSON.stringify(input.clauses))
  if (input.pdfUrl !== undefined) updateData.pdfUrl = input.pdfUrl

  return prisma.contract.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteContract(id: string, tenantId: string) {
  const existing = await prisma.contract.findFirst({
    where: { id, tenantId }
  })

  if (!existing) {
    throw new Error('Contract not found')
  }

  return prisma.contract.delete({ where: { id } })
}

export async function duplicateContract(id: string, tenantId: string) {
  const original = await prisma.contract.findFirst({
    where: { id, tenantId }
  })

  if (!original) {
    throw new Error('Contract not found')
  }

  const contractNumber = await generateContractNumber(tenantId)

  return prisma.contract.create({
    data: {
      tenantId,
      contractNumber,
      templateId: original.templateId,
      gigId: original.gigId,
      language: original.language,
      title: `${original.title} (kopie)`,
      performerInfo: original.performerInfo as object,
      clientInfo: original.clientInfo as object,
      eventDetails: original.eventDetails as object,
      financialTerms: original.financialTerms as object,
      sections: original.sections as object,
      clauses: original.clauses as object,
      parentId: original.id,
      version: original.version + 1,
    }
  })
}

// ========================================
// CONTRACT TEMPLATES
// ========================================

export interface CreateTemplateInput {
  tenantId: string
  name: string
  language?: ContractLanguage
  description?: string
  sections: ContractSection[]
  defaultClauses?: string[]
  isDefault?: boolean
}

export interface UpdateTemplateInput {
  name?: string
  language?: ContractLanguage
  description?: string
  sections?: ContractSection[]
  defaultClauses?: string[]
  isDefault?: boolean
}

export async function getTemplates(tenantId: string) {
  return prisma.contractTemplate.findMany({
    where: { tenantId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    include: {
      _count: { select: { contracts: true } }
    }
  })
}

export async function getTemplateById(id: string, tenantId: string) {
  return prisma.contractTemplate.findFirst({
    where: { id, tenantId }
  })
}

export async function createTemplate(input: CreateTemplateInput) {
  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.contractTemplate.updateMany({
      where: { tenantId: input.tenantId, isDefault: true },
      data: { isDefault: false }
    })
  }

  return prisma.contractTemplate.create({
    data: {
      tenantId: input.tenantId,
      name: input.name,
      language: input.language || 'CS',
      description: input.description,
      sections: JSON.parse(JSON.stringify(input.sections)),
      defaultClauses: input.defaultClauses || [],
      isDefault: input.isDefault || false,
    }
  })
}

export async function updateTemplate(id: string, tenantId: string, input: UpdateTemplateInput) {
  const existing = await prisma.contractTemplate.findFirst({
    where: { id, tenantId }
  })

  if (!existing) {
    throw new Error('Template not found')
  }

  // If setting as default, unset other defaults
  if (input.isDefault) {
    await prisma.contractTemplate.updateMany({
      where: { tenantId, isDefault: true, id: { not: id } },
      data: { isDefault: false }
    })
  }

  const updateData: any = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.language !== undefined) updateData.language = input.language
  if (input.description !== undefined) updateData.description = input.description
  if (input.sections !== undefined) updateData.sections = JSON.parse(JSON.stringify(input.sections))
  if (input.defaultClauses !== undefined) updateData.defaultClauses = input.defaultClauses
  if (input.isDefault !== undefined) updateData.isDefault = input.isDefault

  return prisma.contractTemplate.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteTemplate(id: string, tenantId: string) {
  const existing = await prisma.contractTemplate.findFirst({
    where: { id, tenantId }
  })

  if (!existing) {
    throw new Error('Template not found')
  }

  return prisma.contractTemplate.delete({ where: { id } })
}

// ========================================
// CONTRACT CLAUSES
// ========================================

export interface CreateClauseInput {
  tenantId: string
  title: string
  category: string
  contentCs: string
  contentEn: string
  variables?: string[]
  isRequired?: boolean
  isDefault?: boolean
}

export interface UpdateClauseInput {
  title?: string
  category?: string
  contentCs?: string
  contentEn?: string
  variables?: string[]
  isRequired?: boolean
  isDefault?: boolean
}

export async function getClauses(tenantId: string, options?: {
  category?: string
  includeSystem?: boolean
}) {
  const where: any = {
    OR: [
      { tenantId },
      { isSystem: true }
    ]
  }

  if (options?.category) {
    where.category = options.category
  }

  if (options?.includeSystem === false) {
    where.OR = [{ tenantId }]
  }

  return prisma.contractClause.findMany({
    where,
    orderBy: [{ category: 'asc' }, { title: 'asc' }]
  })
}

export async function getClauseById(id: string, tenantId: string) {
  return prisma.contractClause.findFirst({
    where: {
      id,
      OR: [{ tenantId }, { isSystem: true }]
    }
  })
}

export async function createClause(input: CreateClauseInput) {
  return prisma.contractClause.create({
    data: {
      tenantId: input.tenantId,
      title: input.title,
      category: input.category,
      contentCs: input.contentCs,
      contentEn: input.contentEn,
      variables: input.variables || [],
      isRequired: input.isRequired || false,
      isDefault: input.isDefault ?? true,
    }
  })
}

export async function updateClause(id: string, tenantId: string, input: UpdateClauseInput) {
  const existing = await prisma.contractClause.findFirst({
    where: { id, tenantId }
  })

  if (!existing) {
    throw new Error('Clause not found')
  }

  if (existing.isSystem) {
    throw new Error('Cannot modify system clause')
  }

  return prisma.contractClause.update({
    where: { id },
    data: input,
  })
}

export async function deleteClause(id: string, tenantId: string) {
  const existing = await prisma.contractClause.findFirst({
    where: { id, tenantId }
  })

  if (!existing) {
    throw new Error('Clause not found')
  }

  if (existing.isSystem) {
    throw new Error('Cannot delete system clause')
  }

  return prisma.contractClause.delete({ where: { id } })
}

// ========================================
// HELPER FUNCTIONS
// ========================================

export function substituteVariables(content: string, variables: Record<string, string>): string {
  let result = content

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value || '')
  }

  return result
}

export function extractVariables(content: string): string[] {
  const regex = /{{([A-Z_]+)}}/g
  const matches = content.matchAll(regex)
  return [...new Set([...matches].map(m => m[1]))]
}
