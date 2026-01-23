import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function for multi-tenant queries
export function withTenant<T extends { tenantId: string }>(
  tenantId: string,
  data: Omit<T, 'tenantId'>
): T {
  return { ...data, tenantId } as T;
}

// Type-safe tenant filter
export function tenantFilter(tenantId: string) {
  return { tenantId };
}
