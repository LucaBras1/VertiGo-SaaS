/**
 * Reset Admin Password Script
 *
 * Resets the admin user password
 * Run with: npx tsx scripts/reset-admin-password.ts
 */

export {}

import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@divadlostudna.cz'
  const newPassword = 'DivadloStudna2024!'

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.log(`User ${email} not found. Creating new admin user...`)

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    })

    console.log(`Admin user created!`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${newPassword}`)
    return
  }

  console.log(`User found: ${user.email}`)
  console.log(`Current password hash: ${user.password?.substring(0, 20)}...`)

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12)

  // Update password
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  })

  console.log(`Password reset successfully!`)
  console.log(`Email: ${email}`)
  console.log(`New password: ${newPassword}`)
}

main()
  .catch((e: Error) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
