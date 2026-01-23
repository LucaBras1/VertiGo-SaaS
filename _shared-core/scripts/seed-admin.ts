/**
 * Seed Admin User Script
 *
 * Creates an initial admin user for the application
 * Run with: npx tsx scripts/seed-admin.ts
 */

export {}

import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@divadlostudna.cz'
  const password = process.env.ADMIN_PASSWORD || 'DivadloStudna2024!'
  const name = process.env.ADMIN_NAME || 'Admin'

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log(`User ${email} already exists. Skipping seed.`)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
  })

  console.log(`Admin user created successfully!`)
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`Please change the password after first login!`)
}

main()
  .catch((e: Error) => {
    console.error('Error seeding admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
