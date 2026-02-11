import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createPrismaProxy } from '@vertigo/database/factory'

const { prisma, db } = createPrismaProxy({
  createClient: () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  },
  globalKey: 'musicians',
})

export { prisma, db }
export default prisma
