/**
 * TeamForge Database Seed Script
 * Creates initial data for development and production deployment
 */

import { PrismaClient } from '../src/generated/prisma'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting TeamForge database seed...')

  // ========================================
  // 1. Admin User
  // ========================================
  console.log('Creating admin user...')

  const adminPassword = await hash(process.env.ADMIN_PASSWORD || 'admin123', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@teamforge.cz' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@teamforge.cz',
      name: 'Admin TeamForge',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log(`✅ Admin user: ${adminUser.email}`)

  // ========================================
  // 2. Settings
  // ========================================
  console.log('Creating settings...')

  const settings = await prisma.settings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      siteTitle: 'TeamForge',
      siteDescription: 'Professional team building management platform',
      contactEmail: 'info@teamforge.cz',
      contactPhone: '+420 123 456 789',
      address: {
        street: 'Hlavní 123',
        city: 'Praha',
        postalCode: '110 00',
        country: 'Česká republika',
      },
      socialLinks: {
        facebook: 'https://facebook.com/teamforge',
        linkedin: 'https://linkedin.com/company/teamforge',
        instagram: 'https://instagram.com/teamforge',
      },
      companyIco: '12345678',
      companyDic: 'CZ12345678',
      companyBankAccount: '123456789/0100',
    },
  })
  console.log(`✅ Settings created`)

  // ========================================
  // 3. Programs
  // ========================================
  console.log('Creating programs...')

  const programs = await Promise.all([
    prisma.program.upsert({
      where: { slug: 'team-building-essentials' },
      update: {},
      create: {
        title: 'Team Building Essentials',
        slug: 'team-building-essentials',
        subtitle: 'Základní program pro budování týmu',
        excerpt: 'Ideální program pro týmy, které chtějí posílit spolupráci a komunikaci.',
        status: 'active',
        featured: true,
        order: 1,
        duration: 240,
        minTeamSize: 8,
        maxTeamSize: 25,
        teamSize: 15,
        physicalLevel: 'MEDIUM',
        indoorOutdoor: 'BOTH',
        objectives: ['COMMUNICATION', 'TRUST', 'COLLABORATION'],
        price: 4500000, // 45,000 CZK in hellers
        pricePerPerson: 180000, // 1,800 CZK
        description: {
          intro: 'Komplexní program zaměřený na budování silnějších týmů.',
          highlights: [
            'Interaktivní skupinové aktivity',
            'Profesionální facilitace',
            'Závěrečný debrief s akcemi',
          ],
        },
        debriefIncluded: true,
        facilitationRequired: true,
        includesCatering: false,
      },
    }),
    prisma.program.upsert({
      where: { slug: 'leadership-challenge' },
      update: {},
      create: {
        title: 'Leadership Challenge',
        slug: 'leadership-challenge',
        subtitle: 'Program rozvoje leadershipu',
        excerpt: 'Intenzivní program zaměřený na rozvoj leadershipových dovedností.',
        status: 'active',
        featured: true,
        order: 2,
        duration: 480,
        minTeamSize: 6,
        maxTeamSize: 15,
        teamSize: 10,
        physicalLevel: 'MEDIUM',
        indoorOutdoor: 'INDOOR',
        objectives: ['LEADERSHIP', 'PROBLEM_SOLVING', 'COMMUNICATION'],
        price: 7500000, // 75,000 CZK
        pricePerPerson: 500000, // 5,000 CZK
        description: {
          intro: 'Program pro rozvoj leaderů a budoucích manažerů.',
          highlights: [
            'Leadership simulace',
            'Koučovací session',
            'Individuální zpětná vazba',
          ],
        },
        debriefIncluded: true,
        facilitationRequired: true,
        includesCatering: true,
      },
    }),
    prisma.program.upsert({
      where: { slug: 'creative-workshop' },
      update: {},
      create: {
        title: 'Creative Workshop',
        slug: 'creative-workshop',
        subtitle: 'Kreativní dílna pro inovátory',
        excerpt: 'Rozvíjejte kreativitu a inovativní myšlení vašeho týmu.',
        status: 'active',
        featured: false,
        order: 3,
        duration: 180,
        minTeamSize: 5,
        maxTeamSize: 20,
        teamSize: 12,
        physicalLevel: 'LOW',
        indoorOutdoor: 'INDOOR',
        objectives: ['CREATIVITY', 'COLLABORATION', 'PROBLEM_SOLVING'],
        price: 3500000, // 35,000 CZK
        pricePerPerson: 175000, // 1,750 CZK
        description: {
          intro: 'Workshop zaměřený na rozvoj kreativního myšlení.',
          highlights: [
            'Brainstorming techniky',
            'Design thinking',
            'Prototypování nápadů',
          ],
        },
        debriefIncluded: true,
        facilitationRequired: true,
        includesCatering: false,
      },
    }),
    prisma.program.upsert({
      where: { slug: 'outdoor-adventure' },
      update: {},
      create: {
        title: 'Outdoor Adventure',
        slug: 'outdoor-adventure',
        subtitle: 'Dobrodružný program v přírodě',
        excerpt: 'Zažijte dobrodružství a posílte týmového ducha v přírodě.',
        status: 'active',
        featured: true,
        order: 4,
        duration: 360,
        minTeamSize: 10,
        maxTeamSize: 40,
        teamSize: 25,
        physicalLevel: 'HIGH',
        indoorOutdoor: 'OUTDOOR',
        objectives: ['TRUST', 'COLLABORATION', 'MOTIVATION'],
        price: 6000000, // 60,000 CZK
        pricePerPerson: 150000, // 1,500 CZK
        description: {
          intro: 'Intenzivní outdoorový program plný výzev.',
          highlights: [
            'Týmové výzvy v přírodě',
            'Orientační běh',
            'Lezecké aktivity',
          ],
        },
        debriefIncluded: true,
        facilitationRequired: true,
        includesCatering: true,
      },
    }),
  ])
  console.log(`✅ Created ${programs.length} programs`)

  // ========================================
  // 4. Activities
  // ========================================
  console.log('Creating activities...')

  const activities = await Promise.all([
    prisma.activity.upsert({
      where: { slug: 'trust-fall' },
      update: {},
      create: {
        title: 'Trust Fall',
        slug: 'trust-fall',
        subtitle: 'Klasická aktivita budování důvěry',
        excerpt: 'Účastníci se učí důvěřovat svým kolegům.',
        status: 'active',
        order: 1,
        duration: 30,
        minParticipants: 6,
        maxParticipants: 30,
        idealGroupSize: 15,
        physicalDemand: 'MEDIUM',
        indoorOutdoor: 'BOTH',
        objectives: ['TRUST', 'COLLABORATION'],
        difficultyLevel: 'easy',
        scalable: true,
        canCombine: true,
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'escape-room' },
      update: {},
      create: {
        title: 'Escape Room Challenge',
        slug: 'escape-room',
        subtitle: 'Týmová úniková hra',
        excerpt: 'Vyřešte záhady a unikněte z místnosti jako tým.',
        status: 'active',
        order: 2,
        duration: 60,
        minParticipants: 4,
        maxParticipants: 8,
        idealGroupSize: 6,
        physicalDemand: 'LOW',
        indoorOutdoor: 'INDOOR',
        objectives: ['PROBLEM_SOLVING', 'COMMUNICATION', 'COLLABORATION'],
        difficultyLevel: 'medium',
        scalable: false,
        canCombine: true,
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'bridge-building' },
      update: {},
      create: {
        title: 'Bridge Building',
        slug: 'bridge-building',
        subtitle: 'Stavba mostu z limitovaných materiálů',
        excerpt: 'Týmy soutěží ve stavbě funkčního mostu.',
        status: 'active',
        order: 3,
        duration: 45,
        minParticipants: 8,
        maxParticipants: 40,
        idealGroupSize: 20,
        physicalDemand: 'LOW',
        indoorOutdoor: 'INDOOR',
        objectives: ['PROBLEM_SOLVING', 'CREATIVITY', 'COLLABORATION'],
        difficultyLevel: 'medium',
        scalable: true,
        canCombine: true,
        materialsNeeded: ['kartón', 'lepidlo', 'nůžky', 'provázek', 'papír'],
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'blind-navigation' },
      update: {},
      create: {
        title: 'Blind Navigation',
        slug: 'blind-navigation',
        subtitle: 'Navigace poslepu',
        excerpt: 'Jeden člen naviguje ostatní se zavázanýma očima.',
        status: 'active',
        order: 4,
        duration: 40,
        minParticipants: 4,
        maxParticipants: 20,
        idealGroupSize: 10,
        physicalDemand: 'MEDIUM',
        indoorOutdoor: 'BOTH',
        objectives: ['TRUST', 'COMMUNICATION', 'LEADERSHIP'],
        difficultyLevel: 'medium',
        scalable: true,
        canCombine: true,
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'tower-challenge' },
      update: {},
      create: {
        title: 'Tower Challenge',
        slug: 'tower-challenge',
        subtitle: 'Stavba nejvyšší věže',
        excerpt: 'Soutěž o nejvyšší samostojnou věž z dostupných materiálů.',
        status: 'active',
        order: 5,
        duration: 30,
        minParticipants: 6,
        maxParticipants: 50,
        idealGroupSize: 25,
        physicalDemand: 'LOW',
        indoorOutdoor: 'INDOOR',
        objectives: ['CREATIVITY', 'PROBLEM_SOLVING', 'COLLABORATION'],
        difficultyLevel: 'easy',
        scalable: true,
        canCombine: true,
        materialsNeeded: ['špejle', 'plastelína', 'brčka', 'páska'],
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'human-knot' },
      update: {},
      create: {
        title: 'Human Knot',
        slug: 'human-knot',
        subtitle: 'Lidský uzel',
        excerpt: 'Tým se musí rozmotat bez rozpojení rukou.',
        status: 'active',
        order: 6,
        duration: 20,
        minParticipants: 6,
        maxParticipants: 15,
        idealGroupSize: 10,
        physicalDemand: 'MEDIUM',
        indoorOutdoor: 'BOTH',
        objectives: ['COMMUNICATION', 'PROBLEM_SOLVING', 'COLLABORATION'],
        difficultyLevel: 'easy',
        scalable: false,
        canCombine: true,
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'debate-challenge' },
      update: {},
      create: {
        title: 'Debate Challenge',
        slug: 'debate-challenge',
        subtitle: 'Debatní výzva',
        excerpt: 'Strukturovaná debata na kontroverzní témata.',
        status: 'active',
        order: 7,
        duration: 45,
        minParticipants: 6,
        maxParticipants: 24,
        idealGroupSize: 12,
        physicalDemand: 'LOW',
        indoorOutdoor: 'INDOOR',
        objectives: ['COMMUNICATION', 'LEADERSHIP', 'CONFLICT'],
        difficultyLevel: 'hard',
        scalable: true,
        canCombine: true,
      },
    }),
    prisma.activity.upsert({
      where: { slug: 'rope-course' },
      update: {},
      create: {
        title: 'Rope Course',
        slug: 'rope-course',
        subtitle: 'Lanové centrum',
        excerpt: 'Překonávejte překážky ve výškách s podporou týmu.',
        status: 'active',
        order: 8,
        duration: 120,
        minParticipants: 8,
        maxParticipants: 30,
        idealGroupSize: 15,
        physicalDemand: 'HIGH',
        indoorOutdoor: 'OUTDOOR',
        objectives: ['TRUST', 'MOTIVATION', 'COLLABORATION'],
        difficultyLevel: 'hard',
        scalable: false,
        canCombine: false,
      },
    }),
  ])
  console.log(`✅ Created ${activities.length} activities`)

  // ========================================
  // 5. Extras
  // ========================================
  console.log('Creating extras...')

  const extras = await Promise.all([
    prisma.extra.upsert({
      where: { slug: 'professional-facilitation' },
      update: {},
      create: {
        title: 'Profesionální facilitace',
        slug: 'professional-facilitation',
        category: 'facilitation',
        status: 'active',
        order: 1,
        excerpt: 'Zkušený facilitátor pro vedení vašeho programu.',
        priceFrom: 500000, // 5,000 CZK
        priceUnit: 'per_session',
      },
    }),
    prisma.extra.upsert({
      where: { slug: 'catering-basic' },
      update: {},
      create: {
        title: 'Základní catering',
        slug: 'catering-basic',
        category: 'catering',
        status: 'active',
        order: 2,
        excerpt: 'Občerstvení včetně kávy, čaje a lehkých snacků.',
        priceFrom: 35000, // 350 CZK
        priceUnit: 'per_person',
      },
    }),
    prisma.extra.upsert({
      where: { slug: 'catering-premium' },
      update: {},
      create: {
        title: 'Premium catering',
        slug: 'catering-premium',
        category: 'catering',
        status: 'active',
        order: 3,
        excerpt: 'Kompletní stravování včetně oběda a nápojů.',
        priceFrom: 75000, // 750 CZK
        priceUnit: 'per_person',
      },
    }),
    prisma.extra.upsert({
      where: { slug: 'transport-bus' },
      update: {},
      create: {
        title: 'Autobusová doprava',
        slug: 'transport-bus',
        category: 'transport',
        status: 'active',
        order: 4,
        excerpt: 'Zajištění autobusové dopravy pro váš tým.',
        priceFrom: 1500000, // 15,000 CZK
        priceUnit: 'per_session',
      },
    }),
    prisma.extra.upsert({
      where: { slug: 'equipment-rental' },
      update: {},
      create: {
        title: 'Pronájem vybavení',
        slug: 'equipment-rental',
        category: 'equipment',
        status: 'active',
        order: 5,
        excerpt: 'Speciální vybavení pro aktivity (stany, lana, atd.).',
        priceFrom: 300000, // 3,000 CZK
        priceUnit: 'per_day',
      },
    }),
  ])
  console.log(`✅ Created ${extras.length} extras`)

  // ========================================
  // 6. Customers
  // ========================================
  console.log('Creating sample customers...')

  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'kontakt@techcorp.cz' },
      update: {},
      create: {
        email: 'kontakt@techcorp.cz',
        firstName: 'Jan',
        lastName: 'Novák',
        phone: '+420 777 123 456',
        organization: 'TechCorp s.r.o.',
        organizationType: 'corporation',
        industryType: 'TECHNOLOGY',
        teamSize: 50,
        billingInfo: {
          ico: '12345678',
          dic: 'CZ12345678',
          address: {
            street: 'Technologická 1',
            city: 'Praha',
            postalCode: '110 00',
          },
        },
      },
    }),
    prisma.customer.upsert({
      where: { email: 'hr@financeplus.cz' },
      update: {},
      create: {
        email: 'hr@financeplus.cz',
        firstName: 'Eva',
        lastName: 'Svobodová',
        phone: '+420 602 987 654',
        organization: 'Finance Plus a.s.',
        organizationType: 'corporation',
        industryType: 'FINANCE',
        teamSize: 120,
        billingInfo: {
          ico: '87654321',
          dic: 'CZ87654321',
          address: {
            street: 'Bankovní 10',
            city: 'Brno',
            postalCode: '602 00',
          },
        },
      },
    }),
    prisma.customer.upsert({
      where: { email: 'vedeni@startup.io' },
      update: {},
      create: {
        email: 'vedeni@startup.io',
        firstName: 'Petr',
        lastName: 'Horák',
        phone: '+420 733 555 888',
        organization: 'StartupIO',
        organizationType: 'corporation',
        industryType: 'TECHNOLOGY',
        teamSize: 15,
        billingInfo: {
          ico: '11223344',
          address: {
            street: 'Inovační hub 5',
            city: 'Ostrava',
            postalCode: '702 00',
          },
        },
      },
    }),
  ])
  console.log(`✅ Created ${customers.length} customers`)

  // ========================================
  // 7. Sessions
  // ========================================
  console.log('Creating sample sessions...')

  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 10)

  const sessions = await Promise.all([
    prisma.session.create({
      data: {
        programId: programs[0].id,
        date: nextMonth,
        venue: {
          name: 'Konferenční centrum Praha',
          city: 'Praha',
          address: 'Hlavní 100, Praha 1',
          indoorOutdoor: 'INDOOR',
        },
        teamSize: 20,
        companyName: 'TechCorp s.r.o.',
        status: 'confirmed',
        objectives: ['COMMUNICATION', 'TRUST'],
        customObjectives: 'Zlepšení komunikace mezi odděleními',
        notes: 'Klient preferuje aktivity bez fyzické náročnosti',
      },
    }),
    prisma.session.create({
      data: {
        programId: programs[3].id,
        date: lastMonth,
        venue: {
          name: 'Outdoorové centrum Šumava',
          city: 'Kašperské Hory',
          address: 'Lesní 50',
          indoorOutdoor: 'OUTDOOR',
        },
        teamSize: 25,
        companyName: 'Finance Plus a.s.',
        status: 'completed',
        objectives: ['TRUST', 'MOTIVATION'],
        debriefCompleted: true,
        debriefReport: {
          summary: 'Úspěšný outdoor program s vysokou účastí.',
          highlights: ['Výborná týmová spolupráce', 'Překonání osobních limitů'],
          recommendations: ['Pokračovat v budování důvěry', 'Naplánovat follow-up'],
        },
      },
    }),
  ])
  console.log(`✅ Created ${sessions.length} sessions`)

  // ========================================
  // 8. Orders & Invoices
  // ========================================
  console.log('Creating sample orders and invoices...')

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${now.getFullYear()}-001`,
      customerId: customers[0].id,
      status: 'confirmed',
      sessionName: 'Team Building Q1 2025',
      teamSize: 20,
      objectives: ['COMMUNICATION', 'TRUST'],
      dates: [nextMonth.toISOString()],
      venue: {
        name: 'Konferenční centrum Praha',
        city: 'Praha',
      },
      linkedSessionId: sessions[0].id,
      items: {
        create: [
          {
            programId: programs[0].id,
            date: nextMonth.toISOString().split('T')[0],
            price: 4500000,
          },
          {
            extraId: extras[0].id,
            date: nextMonth.toISOString().split('T')[0],
            price: 500000,
          },
        ],
      },
    },
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${now.getFullYear()}-002`,
      customerId: customers[1].id,
      status: 'completed',
      sessionName: 'Outdoor Adventure 2024',
      teamSize: 25,
      objectives: ['TRUST', 'MOTIVATION'],
      dates: [lastMonth.toISOString()],
      venue: {
        name: 'Outdoorové centrum Šumava',
        city: 'Kašperské Hory',
      },
      linkedSessionId: sessions[1].id,
      items: {
        create: [
          {
            programId: programs[3].id,
            date: lastMonth.toISOString().split('T')[0],
            price: 6000000,
          },
          {
            extraId: extras[2].id,
            date: lastMonth.toISOString().split('T')[0],
            price: 1875000, // 25 * 750 CZK
          },
        ],
      },
    },
  })

  console.log(`✅ Created 2 orders`)

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${now.getFullYear()}-001`,
      customerId: customers[0].id,
      orderId: order1.id,
      status: 'sent',
      issueDate: new Date(),
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Team Building Essentials', quantity: 1, unitPrice: 4500000, totalPrice: 4500000 },
        { description: 'Profesionální facilitace', quantity: 1, unitPrice: 500000, totalPrice: 500000 },
      ],
      subtotal: 5000000,
      vatRate: 21,
      vatAmount: 1050000,
      totalAmount: 6050000,
      currency: 'CZK',
    },
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${now.getFullYear() - 1}-015`,
      customerId: customers[1].id,
      orderId: order2.id,
      status: 'paid',
      issueDate: lastMonth,
      dueDate: new Date(lastMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
      paidDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      items: [
        { description: 'Outdoor Adventure', quantity: 1, unitPrice: 6000000, totalPrice: 6000000 },
        { description: 'Premium catering (25 osob)', quantity: 25, unitPrice: 75000, totalPrice: 1875000 },
      ],
      subtotal: 7875000,
      vatRate: 21,
      vatAmount: 1653750,
      totalAmount: 9528750,
      paidAmount: 9528750,
      currency: 'CZK',
    },
  })

  console.log(`✅ Created 2 invoices`)

  // Update customer analytics
  await prisma.customer.update({
    where: { id: customers[1].id },
    data: {
      totalInvoiced: 9528750,
      totalPaid: 9528750,
      invoiceCount: 1,
      lastInvoiceDate: lastMonth,
      lastPaymentDate: new Date(lastMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('Summary:')
  console.log(`  - 1 admin user`)
  console.log(`  - 1 settings record`)
  console.log(`  - ${programs.length} programs`)
  console.log(`  - ${activities.length} activities`)
  console.log(`  - ${extras.length} extras`)
  console.log(`  - ${customers.length} customers`)
  console.log(`  - ${sessions.length} sessions`)
  console.log(`  - 2 orders`)
  console.log(`  - 2 invoices`)
  console.log('')
  console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@teamforge.cz'}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
