/**
 * @vertigo/database
 * Multi-tenant database package for VertiGo SaaS platform
 */

// Re-export Prisma client
export { prisma } from './client';
export type { PrismaClient } from '@prisma/client';

// Re-export all Prisma types
export type {
  Vertical,
  SubscriptionTier,
  OrderStatus,
  InvoiceStatus,
  PaymentMethod,
  Tenant,
  User,
  Customer,
  Performance,
  Activity,
  Service,
  Event,
  Order,
  OrderItem,
  Invoice,
  AILog,
} from '@prisma/client';

// Helper types for vertical-specific data
export * from './types';

// Database utilities
export * from './utils';

// Prisma proxy factory
export { createPrismaProxy } from './prisma-factory';
