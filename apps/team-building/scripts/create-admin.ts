/**
 * Create Admin User Script
 * Usage: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@teamforge.local'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  console.log('Creating admin user...')

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log(`User with email ${email} already exists.`)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  })

  console.log('Admin user created successfully!')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('User ID:', user.id)
}

main()
  .catch((error) => {
    console.error('Error creating admin user:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
