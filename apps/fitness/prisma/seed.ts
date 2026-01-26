import { PrismaClient, Vertical } from '../src/generated/prisma'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'fitadmin-demo' },
    update: {},
    create: {
      vertical: Vertical.FITNESS,
      name: 'FitAdmin Demo Studio',
      slug: 'fitadmin-demo',
      email: 'demo@fitadmin.app',
      phone: '+420 123 456 789',
      website: 'https://fitadmin.app',
      subscriptionTier: 'pro',
      aiCredits: 1000,
    },
  })

  console.log('✅ Created tenant:', tenant.name)

  // Create admin user
  const hashedPassword = await hash('demo123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@fitadmin.app' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Demo Admin',
      email: 'admin@fitadmin.app',
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create trainer user
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer@fitadmin.app' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Jan Trenér',
      email: 'trainer@fitadmin.app',
      password: hashedPassword,
      role: 'trainer',
    },
  })

  console.log('✅ Created trainer user:', trainerUser.email)

  // Create sample clients
  const clients = [
    {
      name: 'Petra Nováková',
      email: 'petra@example.com',
      phone: '+420 111 222 333',
      goals: ['weight_loss', 'endurance'],
      currentWeight: 72,
      targetWeight: 65,
      height: 168,
      fitnessLevel: 'intermediate',
      creditsRemaining: 8,
      membershipType: 'monthly',
      status: 'active',
    },
    {
      name: 'Martin Svoboda',
      email: 'martin@example.com',
      phone: '+420 222 333 444',
      goals: ['muscle_gain', 'strength'],
      currentWeight: 85,
      targetWeight: 90,
      height: 182,
      fitnessLevel: 'advanced',
      creditsRemaining: 12,
      membershipType: 'yearly',
      status: 'active',
    },
    {
      name: 'Lucie Dvořáková',
      email: 'lucie@example.com',
      phone: '+420 333 444 555',
      goals: ['flexibility', 'endurance'],
      currentWeight: 58,
      targetWeight: 55,
      height: 165,
      fitnessLevel: 'beginner',
      creditsRemaining: 5,
      membershipType: 'package',
      status: 'active',
    },
    {
      name: 'Tomáš Procházka',
      email: 'tomas@example.com',
      phone: '+420 444 555 666',
      goals: ['weight_loss', 'muscle_gain'],
      currentWeight: 95,
      targetWeight: 85,
      height: 178,
      fitnessLevel: 'beginner',
      creditsRemaining: 2,
      membershipType: 'monthly',
      status: 'active',
    },
    {
      name: 'Eva Horáková',
      email: 'eva@example.com',
      phone: '+420 555 666 777',
      goals: ['strength', 'flexibility'],
      currentWeight: 62,
      targetWeight: 60,
      height: 170,
      fitnessLevel: 'intermediate',
      creditsRemaining: 0,
      membershipType: 'package',
      status: 'inactive',
    },
  ]

  for (const clientData of clients) {
    const client = await prisma.client.upsert({
      where: {
        id: `client-${clientData.email.split('@')[0]}`
      },
      update: {},
      create: {
        id: `client-${clientData.email.split('@')[0]}`,
        tenantId: tenant.id,
        ...clientData,
        membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })
    console.log('✅ Created client:', client.name)
  }

  // Create sample packages
  const packages = [
    {
      name: '10 Sessions Package',
      description: 'Save 15% with our 10-session package',
      type: 'sessions',
      price: 8500,
      credits: 10,
      validityDays: 90,
      features: ['Personal training', 'Workout plan', 'Progress tracking'],
      isActive: true,
    },
    {
      name: 'Monthly Unlimited',
      description: 'Unlimited sessions for one month',
      type: 'monthly',
      price: 12000,
      credits: 30,
      validityDays: 30,
      features: ['Unlimited sessions', 'Group classes', 'Nutrition advice'],
      isActive: true,
    },
    {
      name: '5 Classes Pack',
      description: 'Access to 5 group fitness classes',
      type: 'classes',
      price: 2500,
      credits: 5,
      validityDays: 60,
      features: ['Yoga', 'Pilates', 'HIIT', 'Spin'],
      isActive: true,
    },
  ]

  for (const packageData of packages) {
    const pkg = await prisma.package.upsert({
      where: {
        id: `pkg-${packageData.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: {
        id: `pkg-${packageData.name.toLowerCase().replace(/\s+/g, '-')}`,
        tenantId: tenant.id,
        ...packageData,
      },
    })
    console.log('✅ Created package:', pkg.name)
  }

  // Create sample sessions
  const today = new Date()
  const sessions = [
    {
      clientId: 'client-petra',
      scheduledAt: new Date(today.setHours(9, 0, 0, 0)),
      duration: 60,
      status: 'scheduled',
      muscleGroups: ['legs', 'glutes'],
      price: 1000,
    },
    {
      clientId: 'client-martin',
      scheduledAt: new Date(today.setHours(11, 0, 0, 0)),
      duration: 90,
      status: 'scheduled',
      muscleGroups: ['chest', 'triceps'],
      price: 1500,
    },
    {
      clientId: 'client-lucie',
      scheduledAt: new Date(today.setHours(14, 0, 0, 0)),
      duration: 60,
      status: 'scheduled',
      muscleGroups: ['full_body'],
      price: 1000,
    },
    {
      clientId: 'client-tomas',
      scheduledAt: new Date(today.setHours(16, 0, 0, 0)),
      duration: 60,
      status: 'scheduled',
      muscleGroups: ['back', 'biceps'],
      price: 1000,
    },
  ]

  for (let i = 0; i < sessions.length; i++) {
    const sessionData = sessions[i]
    const session = await prisma.session.upsert({
      where: {
        id: `session-today-${i + 1}`
      },
      update: {},
      create: {
        id: `session-today-${i + 1}`,
        tenantId: tenant.id,
        ...sessionData,
        paid: false,
      },
    })
    console.log('✅ Created session for:', sessionData.clientId)
  }

  // Create sample classes
  const classes = [
    {
      name: 'Morning Yoga',
      description: 'Start your day with energizing yoga flow',
      type: 'yoga',
      scheduledAt: new Date(today.setHours(7, 0, 0, 0)),
      duration: 60,
      capacity: 15,
      instructor: 'Anna Yogová',
      location: 'Studio A',
      price: 300,
      isRecurring: true,
      recurrence: 'weekly',
      status: 'scheduled',
    },
    {
      name: 'HIIT Blast',
      description: 'High-intensity interval training for maximum results',
      type: 'hiit',
      scheduledAt: new Date(today.setHours(12, 0, 0, 0)),
      duration: 45,
      capacity: 20,
      instructor: 'Pavel Energický',
      location: 'Studio B',
      price: 350,
      isRecurring: true,
      recurrence: 'weekly',
      status: 'scheduled',
    },
    {
      name: 'Evening Pilates',
      description: 'Core strengthening and flexibility',
      type: 'pilates',
      scheduledAt: new Date(today.setHours(18, 0, 0, 0)),
      duration: 55,
      capacity: 12,
      instructor: 'Marie Pilatesová',
      location: 'Studio A',
      price: 350,
      isRecurring: true,
      recurrence: 'weekly',
      status: 'scheduled',
    },
  ]

  for (let i = 0; i < classes.length; i++) {
    const classData = classes[i]
    const fitnessClass = await prisma.class.upsert({
      where: {
        id: `class-${i + 1}`
      },
      update: {},
      create: {
        id: `class-${i + 1}`,
        tenantId: tenant.id,
        ...classData,
      },
    })
    console.log('✅ Created class:', fitnessClass.name)
  }

  console.log('')
  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📧 Demo credentials:')
  console.log('   Admin: admin@fitadmin.app / demo123')
  console.log('   Trainer: trainer@fitadmin.app / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
