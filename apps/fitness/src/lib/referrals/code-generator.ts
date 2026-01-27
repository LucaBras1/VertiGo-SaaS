/**
 * Referral Code Generator
 *
 * Generates unique, user-friendly referral codes.
 */

import { prisma } from '@/lib/prisma'

// Characters used in referral codes (avoiding ambiguous characters like 0, O, I, l)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const DEFAULT_CODE_LENGTH = 8

/**
 * Generate a random referral code
 */
function generateRandomCode(length: number = DEFAULT_CODE_LENGTH): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

/**
 * Generate a unique referral code
 */
export async function generateUniqueReferralCode(
  options?: {
    prefix?: string
    length?: number
    maxAttempts?: number
  }
): Promise<string> {
  const { prefix = '', length = DEFAULT_CODE_LENGTH, maxAttempts = 10 } = options || {}

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const randomPart = generateRandomCode(length - prefix.length)
    const code = prefix + randomPart

    // Check if code already exists
    const existing = await prisma.referral.findUnique({
      where: { referralCode: code },
    })

    if (!existing) {
      return code
    }
  }

  // If we couldn't find a unique code, try with longer length
  const longerCode = prefix + generateRandomCode(length + 2)
  return longerCode
}

/**
 * Generate a personalized referral code based on client name
 */
export async function generatePersonalizedCode(
  clientName: string,
  tenantId: string
): Promise<string> {
  // Create a prefix from client name (first 3-4 chars, uppercase, no spaces)
  const cleanName = clientName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)

  const prefix = cleanName.length >= 3 ? cleanName : 'REF'

  return generateUniqueReferralCode({ prefix, length: 8 })
}

/**
 * Get or create referral code for a client
 */
export async function getOrCreateClientReferralCode(
  clientId: string,
  tenantId: string
): Promise<string> {
  // Check if client already has a referral code
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { referralCode: true, name: true },
  })

  if (client?.referralCode) {
    return client.referralCode
  }

  // Generate new code
  const code = await generatePersonalizedCode(client?.name || 'Client', tenantId)

  // Update client with the new code
  await prisma.client.update({
    where: { id: clientId },
    data: { referralCode: code },
  })

  return code
}

/**
 * Regenerate referral code for a client
 */
export async function regenerateClientReferralCode(
  clientId: string,
  tenantId: string
): Promise<string> {
  const client = await prisma.client.findFirst({
    where: { id: clientId, tenantId },
    select: { name: true },
  })

  if (!client) {
    throw new Error('Client not found')
  }

  const newCode = await generatePersonalizedCode(client.name, tenantId)

  await prisma.client.update({
    where: { id: clientId },
    data: { referralCode: newCode },
  })

  return newCode
}

/**
 * Validate a referral code
 */
export async function validateReferralCode(
  code: string
): Promise<{
  valid: boolean
  referral?: {
    id: string
    referrerId: string
    referrerName: string
    tenantId: string
  }
  error?: string
}> {
  // Find referral by code
  const referral = await prisma.referral.findUnique({
    where: { referralCode: code },
    include: {
      referrer: {
        select: {
          id: true,
          name: true,
          tenantId: true,
        },
      },
    },
  })

  if (referral) {
    // Check if referral is expired
    if (referral.expiresAt && referral.expiresAt < new Date()) {
      return { valid: false, error: 'Referral code has expired' }
    }

    // Check if referral is already used
    if (referral.status !== 'pending') {
      return { valid: false, error: 'Referral code has already been used' }
    }

    return {
      valid: true,
      referral: {
        id: referral.id,
        referrerId: referral.referrerId,
        referrerName: referral.referrer.name,
        tenantId: referral.tenantId,
      },
    }
  }

  // Check if it's a client's personal referral code
  const client = await prisma.client.findUnique({
    where: { referralCode: code },
    select: {
      id: true,
      name: true,
      tenantId: true,
    },
  })

  if (client) {
    return {
      valid: true,
      referral: {
        id: '', // New referral will be created
        referrerId: client.id,
        referrerName: client.name,
        tenantId: client.tenantId,
      },
    }
  }

  return { valid: false, error: 'Invalid referral code' }
}

/**
 * Create a referral invitation
 */
export async function createReferralInvitation(data: {
  tenantId: string
  referrerId: string
  referredEmail?: string
  referredName?: string
  referredPhone?: string
  expiresInDays?: number
  source?: 'link' | 'email' | 'social' | 'qr'
}): Promise<{
  referral: { id: string; referralCode: string }
  isNew: boolean
}> {
  const code = await generateUniqueReferralCode()

  const expiresAt = data.expiresInDays
    ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
    : null

  const referral = await prisma.referral.create({
    data: {
      tenantId: data.tenantId,
      referrerId: data.referrerId,
      referralCode: code,
      referredEmail: data.referredEmail,
      referredName: data.referredName,
      referredPhone: data.referredPhone,
      expiresAt,
      source: data.source,
      status: 'pending',
    },
  })

  return {
    referral: {
      id: referral.id,
      referralCode: referral.referralCode,
    },
    isNew: true,
  }
}
