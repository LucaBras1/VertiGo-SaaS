/**
 * PartyPal Seed Script
 * Creates initial test data for development
 */

import { PrismaClient } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for seeding')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🎉 Seeding PartyPal database...')

  // Clean up existing data
  console.log('Cleaning up existing data...')
  await prisma.packageActivity.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.safetyChecklist.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.order.deleteMany()
  await prisma.party.deleteMany()
  await prisma.package.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.extra.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.entertainer.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  console.log('Creating admin user...')
  const hashedPassword = await hash('admin123', 12)
  await prisma.user.create({
    data: {
      email: 'admin@partypal.cz',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Create Settings
  console.log('Creating settings...')
  await prisma.settings.create({
    data: {
      siteName: 'PartyPal',
      siteDescription: 'Profesionální dětské oslavy a animace',
      contactEmail: 'info@partypal.cz',
      contactPhone: '+420 123 456 789',
      address: {
        street: 'Dětská 123',
        city: 'Praha',
        zip: '110 00',
      },
      companyName: 'PartyPal s.r.o.',
      companyIco: '12345678',
      defaultPartyDuration: 180,
      maxGuestsDefault: 15,
      advanceBookingDays: 14,
      cancellationPolicyDays: 7,
      depositPercentage: 30,
      requireAllergyDisclosure: true,
      requireEmergencyContact: true,
      backgroundCheckRequired: true,
      enableAgeOptimizer: true,
      enableSafetyChecker: true,
      enableThemeSuggester: true,
      enableParentComms: true,
      enablePhotoPredictor: true,
    },
  })

  // Create Activities
  console.log('Creating activities...')
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: 'Malování na obličej',
        slug: 'face-painting',
        category: 'creative',
        status: 'active',
        featured: true,
        subtitle: 'Profesionální umělecké designy',
        excerpt: 'Proměňte děti v jejich oblíbené postavy s profesionálním face paintingem',
        duration: 60,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12'],
        minChildren: 5,
        maxChildren: 15,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['trpělivost', 'kreativita', 'sebevyjádření'],
        allergensInvolved: ['face_paint'],
        indoorOutdoor: 'both',
        materials: ['face paint', 'štětce', 'zrcadla'],
        featuredImageUrl: '/images/activities/face-painting.jpg',
        featuredImageAlt: 'Malování na obličej',
        price: 150000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Balonkové modelování',
        slug: 'balloon-animals',
        category: 'skill_game',
        status: 'active',
        featured: true,
        subtitle: 'Naučte se tvořit balonkové zvířátka',
        excerpt: 'Děti se naučí vytvářet vlastní balonková zvířátka pod vedením expertů',
        duration: 45,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
        minChildren: 6,
        maxChildren: 12,
        safetyRating: 'SAFE',
        energyLevel: 'MODERATE',
        skillsDeveloped: ['jemná motorika', 'trpělivost', 'kreativita'],
        allergensInvolved: ['latex'],
        indoorOutdoor: 'indoor',
        materials: ['modelovací balonky', 'pumpičky'],
        featuredImageUrl: '/images/activities/balloon-animals.jpg',
        featuredImageAlt: 'Balonkové modelování',
        price: 120000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Hledání pokladu',
        slug: 'treasure-hunt',
        category: 'active',
        status: 'active',
        featured: true,
        subtitle: 'Vzrušující dobrodružství',
        excerpt: 'Sledujte stopy a řešte hádanky k nalezení ukrytého pokladu',
        duration: 60,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 20,
        safetyRating: 'REQUIRES_SUPERVISION',
        energyLevel: 'HIGH',
        skillsDeveloped: ['týmová práce', 'řešení problémů', 'fyzická aktivita'],
        indoorOutdoor: 'both',
        materials: ['mapa', 'hádanky', 'poklad'],
        featuredImageUrl: '/images/activities/treasure-hunt.jpg',
        featuredImageAlt: 'Hledání pokladu',
        price: 180000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Kouzelnické představení',
        slug: 'magic-show',
        category: 'performance',
        status: 'active',
        featured: true,
        subtitle: 'Úžasná kouzla a iluze',
        excerpt: 'Profesionální kouzelník předvede ohromující triky a zapojí děti',
        duration: 45,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 30,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['pozornost', 'představivost'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/magic-show.jpg',
        featuredImageAlt: 'Kouzelnické představení',
        price: 250000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Vědecká laboratoř',
        slug: 'science-lab',
        category: 'educational',
        status: 'active',
        featured: false,
        subtitle: 'Zábavné experimenty',
        excerpt: 'Praktické vědecké pokusy, které udivují a vzdělávají',
        duration: 60,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        minChildren: 4,
        maxChildren: 12,
        safetyRating: 'REQUIRES_SUPERVISION',
        energyLevel: 'MODERATE',
        skillsDeveloped: ['vědecké myšlení', 'zvědavost', 'spolupráce'],
        allergensInvolved: ['chemical'],
        indoorOutdoor: 'indoor',
        materials: ['zkumavky', 'chemikálie', 'ochranné brýle'],
        featuredImageUrl: '/images/activities/science-lab.jpg',
        featuredImageAlt: 'Vědecká laboratoř',
        price: 200000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Pohádkové čtení',
        slug: 'storytelling',
        category: 'educational',
        status: 'active',
        subtitle: 'Interaktivní vyprávění příběhů',
        excerpt: 'Kouzelné vyprávění pohádek s kostýmy a rekvizitami',
        duration: 30,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 20,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['představivost', 'slovní zásoba', 'naslouchání'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/storytelling.jpg',
        featuredImageAlt: 'Pohádkové čtení',
        price: 100000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Taneční workshop',
        slug: 'dance-workshop',
        category: 'active',
        status: 'active',
        subtitle: 'Naučte se taneční choreografii',
        excerpt: 'Zábavný taneční workshop s populární hudbou',
        duration: 45,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 15,
        safetyRating: 'SAFE',
        energyLevel: 'VERY_HIGH',
        skillsDeveloped: ['koordinace', 'rytmus', 'sebevědomí'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/dance-workshop.jpg',
        featuredImageAlt: 'Taneční workshop',
        price: 150000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Výtvarný ateliér',
        slug: 'art-studio',
        category: 'creative',
        status: 'active',
        subtitle: 'Tvořte vlastní umělecká díla',
        excerpt: 'Malování, modelování a další kreativní techniky',
        duration: 60,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 12,
        safetyRating: 'SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['kreativita', 'jemná motorika', 'estetika'],
        allergensInvolved: ['paint', 'glue'],
        indoorOutdoor: 'indoor',
        materials: ['barvy', 'štětce', 'papír', 'modelína'],
        featuredImageUrl: '/images/activities/art-studio.jpg',
        featuredImageAlt: 'Výtvarný ateliér',
        price: 140000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Sportovní hry',
        slug: 'sports-games',
        category: 'active',
        status: 'active',
        subtitle: 'Týmové sportovní aktivity',
        excerpt: 'Organizované sportovní hry a soutěže pro děti',
        duration: 60,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        minChildren: 8,
        maxChildren: 30,
        safetyRating: 'REQUIRES_SUPERVISION',
        energyLevel: 'VERY_HIGH',
        skillsDeveloped: ['týmová práce', 'koordinace', 'fair play'],
        indoorOutdoor: 'outdoor',
        materials: ['míče', 'kužely', 'dresy'],
        featuredImageUrl: '/images/activities/sports-games.jpg',
        featuredImageAlt: 'Sportovní hry',
        price: 160000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Šaškovské představení',
        slug: 'clown-show',
        category: 'performance',
        status: 'active',
        subtitle: 'Legrace s profesionálním klaunem',
        excerpt: 'Interaktivní šaškovské představení plné smíchu',
        duration: 45,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 25,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'MODERATE',
        skillsDeveloped: ['humor', 'interakce', 'odvaha'],
        indoorOutdoor: 'both',
        featuredImageUrl: '/images/activities/clown-show.jpg',
        featuredImageAlt: 'Šaškovské představení',
        price: 200000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Bublinková show',
        slug: 'bubble-show',
        category: 'performance',
        status: 'active',
        subtitle: 'Magické obří bubliny',
        excerpt: 'Ohromující show s obrovskými mýdlovými bublinami',
        duration: 30,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 30,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['údiv', 'pozornost'],
        allergensInvolved: ['soap'],
        indoorOutdoor: 'both',
        featuredImageUrl: '/images/activities/bubble-show.jpg',
        featuredImageAlt: 'Bublinková show',
        price: 180000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Pečení sladkostí',
        slug: 'baking-workshop',
        category: 'creative',
        status: 'active',
        subtitle: 'Zdobení cupcakes a cookies',
        excerpt: 'Děti si ozdobí vlastní sladkosti a vezmou domů',
        duration: 45,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 10,
        safetyRating: 'REQUIRES_SUPERVISION',
        energyLevel: 'CALM',
        skillsDeveloped: ['kreativita', 'trpělivost', 'gastronomie'],
        allergensInvolved: ['gluten', 'eggs', 'dairy', 'nuts'],
        indoorOutdoor: 'indoor',
        materials: ['cupcakes', 'zdobící hmoty', 'posypy'],
        featuredImageUrl: '/images/activities/baking-workshop.jpg',
        featuredImageAlt: 'Pečení sladkostí',
        price: 180000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Disco party',
        slug: 'disco-party',
        category: 'active',
        status: 'active',
        subtitle: 'Taneční párty s DJ',
        excerpt: 'Profesionální DJ, světla a taneční soutěže',
        duration: 90,
        ageAppropriate: ['TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 30,
        safetyRating: 'SAFE',
        energyLevel: 'VERY_HIGH',
        skillsDeveloped: ['tanec', 'socializace', 'sebevyjádření'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/disco-party.jpg',
        featuredImageAlt: 'Disco party',
        price: 300000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Loutková divadla',
        slug: 'puppet-theater',
        category: 'performance',
        status: 'active',
        subtitle: 'Interaktivní loutkové představení',
        excerpt: 'Klasické pohádky s krásnými loutkami',
        duration: 40,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 25,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['představivost', 'naslouchání'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/puppet-theater.jpg',
        featuredImageAlt: 'Loutková divadla',
        price: 180000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'LEGO stavební soutěž',
        slug: 'lego-building',
        category: 'skill_game',
        status: 'active',
        subtitle: 'Tvořte s LEGO kostkami',
        excerpt: 'Stavební výzvy a soutěže s LEGO sadami',
        duration: 60,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 15,
        safetyRating: 'SAFE',
        choking_hazard: true,
        energyLevel: 'MODERATE',
        skillsDeveloped: ['prostorová představivost', 'logika', 'kreativita'],
        indoorOutdoor: 'indoor',
        materials: ['LEGO sady', 'stavební podložky'],
        featuredImageUrl: '/images/activities/lego-building.jpg',
        featuredImageAlt: 'LEGO stavební soutěž',
        price: 160000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Karaoke show',
        slug: 'karaoke-show',
        category: 'performance',
        status: 'active',
        subtitle: 'Zpívejte své oblíbené písničky',
        excerpt: 'Karaoke s profesionálním vybavením a výběrem dětských písní',
        duration: 60,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 20,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'HIGH',
        skillsDeveloped: ['sebevědomí', 'zpěv', 'performace'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/karaoke-show.jpg',
        featuredImageAlt: 'Karaoke show',
        price: 180000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Fotografický ateliér',
        slug: 'photo-booth',
        category: 'creative',
        status: 'active',
        subtitle: 'Zábavný fotokoutek s rekvizitami',
        excerpt: 'Profesionální fotokoutek s kostýmy a rekvizitami',
        duration: 120,
        ageAppropriate: ['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 30,
        safetyRating: 'VERY_SAFE',
        energyLevel: 'CALM',
        skillsDeveloped: ['kreativita', 'sebevyjádření'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/photo-booth.jpg',
        featuredImageAlt: 'Fotografický ateliér',
        price: 200000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Outdoorové dobrodružství',
        slug: 'outdoor-adventure',
        category: 'active',
        status: 'active',
        subtitle: 'Přírodní výzvy a hry',
        excerpt: 'Aktivní program v přírodě s lanovou dráhou a překážkami',
        duration: 90,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        minChildren: 6,
        maxChildren: 20,
        safetyRating: 'REQUIRES_SUPERVISION',
        energyLevel: 'VERY_HIGH',
        skillsDeveloped: ['odvaha', 'fyzická zdatnost', 'týmová práce'],
        indoorOutdoor: 'outdoor',
        featuredImageUrl: '/images/activities/outdoor-adventure.jpg',
        featuredImageAlt: 'Outdoorové dobrodružství',
        price: 250000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Robotika workshop',
        slug: 'robotics-workshop',
        category: 'educational',
        status: 'active',
        subtitle: 'Stavba a programování robotů',
        excerpt: 'Úvod do robotiky s jednoduchými stavebnicemi',
        duration: 75,
        ageAppropriate: ['TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 10,
        safetyRating: 'SAFE',
        energyLevel: 'MODERATE',
        skillsDeveloped: ['logické myšlení', 'programování', 'technické dovednosti'],
        indoorOutdoor: 'indoor',
        featuredImageUrl: '/images/activities/robotics-workshop.jpg',
        featuredImageAlt: 'Robotika workshop',
        price: 280000,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Mini olympiáda',
        slug: 'mini-olympics',
        category: 'active',
        status: 'active',
        subtitle: 'Sportovní olympijské disciplíny',
        excerpt: 'Závodění v různých sportovních disciplínách s medailemi',
        duration: 90,
        ageAppropriate: ['KIDS_6_9', 'TWEENS_10_12'],
        minChildren: 10,
        maxChildren: 30,
        safetyRating: 'REQUIRES_SUPERVISION',
        energyLevel: 'VERY_HIGH',
        skillsDeveloped: ['sportovní duch', 'vytrvalost', 'fair play'],
        indoorOutdoor: 'outdoor',
        materials: ['sportovní vybavení', 'medaile', 'diplomy'],
        featuredImageUrl: '/images/activities/mini-olympics.jpg',
        featuredImageAlt: 'Mini olympiáda',
        price: 220000,
      },
    }),
  ])

  // Create Packages
  console.log('Creating packages...')
  const packages = await Promise.all([
    prisma.package.create({
      data: {
        title: 'Princeznovská párty Premium',
        slug: 'princess-party-premium',
        category: 'full_party',
        status: 'active',
        featured: true,
        subtitle: 'Kouzelný pohádkový zážitek',
        excerpt: 'Kompletní princeznovská oslava s kostýmy, aktivitami a královskými pochoutkami',
        ageGroupMin: 3,
        ageGroupMax: 9,
        ageGroups: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 15,
        duration: 180,
        themeName: 'Princezny',
        includesCharacter: true,
        characterName: 'Princezna',
        characterCostume: 'Luxusní princeznovské šaty s korunou',
        includesCake: true,
        includesGoodybags: true,
        includesDecoration: true,
        includesPhotos: true,
        includesCertificate: true,
        safetyNotes: 'Vhodné pro alergiky - upozorněte nás předem',
        allergens: ['gluten', 'dairy'],
        indoorOutdoor: 'indoor',
        spaceRequired: '4x4m',
        price: 899000,
        pricePerChild: 30000,
        featuredImageUrl: '/images/packages/princess-party.jpg',
        featuredImageAlt: 'Princeznovská párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Superhrdinské dobrodružství',
        slug: 'superhero-adventure',
        category: 'full_party',
        status: 'active',
        featured: true,
        subtitle: 'Akční superhrdinský trénink',
        excerpt: 'Staňte se superhrdiny s vzrušujícími výzvami a misemi',
        ageGroupMin: 5,
        ageGroupMax: 12,
        ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 20,
        duration: 180,
        themeName: 'Superhrdinové',
        includesCharacter: true,
        characterName: 'Superhrdina',
        includesCake: false,
        includesGoodybags: true,
        includesDecoration: true,
        safetyNotes: 'Fyzicky aktivní program',
        indoorOutdoor: 'both',
        spaceRequired: '5x5m',
        price: 849000,
        pricePerChild: 25000,
        featuredImageUrl: '/images/packages/superhero-party.jpg',
        featuredImageAlt: 'Superhrdinská párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Vědecká laboratoř party',
        slug: 'science-lab-party',
        category: 'workshop',
        status: 'active',
        featured: true,
        subtitle: 'Zábavné experimenty a objevy',
        excerpt: 'Praktické vědecké pokusy, které udivují a vzdělávají',
        ageGroupMin: 6,
        ageGroupMax: 12,
        ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 12,
        duration: 150,
        themeName: 'Věda',
        includesCharacter: false,
        includesGoodybags: true,
        safetyNotes: 'Ochranné brýle jsou součástí',
        allergens: ['chemical'],
        indoorOutdoor: 'indoor',
        price: 799000,
        featuredImageUrl: '/images/packages/science-party.jpg',
        featuredImageAlt: 'Vědecká párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Dinosauří safari',
        slug: 'dinosaur-safari',
        category: 'full_party',
        status: 'active',
        featured: false,
        subtitle: 'Cesta do pravěku',
        excerpt: 'Dobrodružství s dinosaury, vykopávky a paleontologie pro děti',
        ageGroupMin: 4,
        ageGroupMax: 10,
        ageGroups: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 15,
        duration: 150,
        themeName: 'Dinosauři',
        includesCharacter: true,
        characterName: 'Paleontolog',
        includesGoodybags: true,
        includesDecoration: true,
        indoorOutdoor: 'both',
        price: 749000,
        featuredImageUrl: '/images/packages/dinosaur-party.jpg',
        featuredImageAlt: 'Dinosauří párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Pirátská výprava',
        slug: 'pirate-adventure',
        category: 'full_party',
        status: 'active',
        featured: true,
        subtitle: 'Hledání ztraceného pokladu',
        excerpt: 'Pirátské dobrodružství s hledáním pokladu a námořnickými hrami',
        ageGroupMin: 5,
        ageGroupMax: 11,
        ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 18,
        duration: 180,
        themeName: 'Piráti',
        includesCharacter: true,
        characterName: 'Pirát Kapitán',
        includesGoodybags: true,
        includesDecoration: true,
        indoorOutdoor: 'outdoor',
        spaceRequired: '6x6m',
        price: 799000,
        featuredImageUrl: '/images/packages/pirate-party.jpg',
        featuredImageAlt: 'Pirátská párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Frozen ledové království',
        slug: 'frozen-party',
        category: 'full_party',
        status: 'active',
        featured: true,
        subtitle: 'Ledová pohádka s Elsou',
        excerpt: 'Kouzelná oslava s Elsou a Annou z Ledového království',
        ageGroupMin: 3,
        ageGroupMax: 9,
        ageGroups: ['TODDLER_3_5', 'KIDS_6_9'],
        maxChildren: 15,
        duration: 180,
        themeName: 'Frozen',
        includesCharacter: true,
        characterName: 'Elsa',
        characterCostume: 'Autentický kostým Elsy s parkou a korunou',
        includesCake: true,
        includesGoodybags: true,
        includesDecoration: true,
        includesPhotos: true,
        indoorOutdoor: 'indoor',
        price: 949000,
        featuredImageUrl: '/images/packages/frozen-party.jpg',
        featuredImageAlt: 'Frozen párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Sportovní akademie',
        slug: 'sports-academy',
        category: 'entertainment',
        status: 'active',
        featured: false,
        subtitle: 'Sportovní hry a soutěže',
        excerpt: 'Aktivní sportovní program s profesionálním trenérem',
        ageGroupMin: 6,
        ageGroupMax: 14,
        ageGroups: ['KIDS_6_9', 'TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 25,
        duration: 120,
        themeName: 'Sport',
        includesGoodybags: true,
        safetyNotes: 'Doporučena sportovní obuv a oblečení',
        indoorOutdoor: 'outdoor',
        spaceRequired: 'Hřiště nebo zahrada min. 10x10m',
        price: 649000,
        featuredImageUrl: '/images/packages/sports-party.jpg',
        featuredImageAlt: 'Sportovní párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Umělecký ateliér',
        slug: 'art-studio-party',
        category: 'workshop',
        status: 'active',
        featured: false,
        subtitle: 'Kreativní malování a tvorba',
        excerpt: 'Výtvarný workshop s profesionálním lektorem',
        ageGroupMin: 4,
        ageGroupMax: 12,
        ageGroups: ['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 12,
        duration: 120,
        themeName: 'Umění',
        includesGoodybags: true,
        allergens: ['paint'],
        indoorOutdoor: 'indoor',
        price: 599000,
        featuredImageUrl: '/images/packages/art-party.jpg',
        featuredImageAlt: 'Umělecká párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Disco dance party',
        slug: 'disco-dance-party',
        category: 'entertainment',
        status: 'active',
        featured: false,
        subtitle: 'Taneční párty s DJ',
        excerpt: 'Taneční oslava s profesionálním DJ, světly a soutěžemi',
        ageGroupMin: 8,
        ageGroupMax: 16,
        ageGroups: ['TWEENS_10_12', 'TEENS_13_PLUS'],
        maxChildren: 30,
        duration: 180,
        themeName: 'Disco',
        includesDecoration: true,
        electricityRequired: true,
        indoorOutdoor: 'indoor',
        spaceRequired: '5x5m taneční plocha',
        price: 899000,
        featuredImageUrl: '/images/packages/disco-party.jpg',
        featuredImageAlt: 'Disco párty',
      },
    }),
    prisma.package.create({
      data: {
        title: 'Minecraft dobrodružství',
        slug: 'minecraft-adventure',
        category: 'full_party',
        status: 'active',
        featured: false,
        subtitle: 'Svět Minecraftu ve skutečnosti',
        excerpt: 'Minecraft témata, crafting aktivity a stavební soutěže',
        ageGroupMin: 6,
        ageGroupMax: 12,
        ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
        maxChildren: 15,
        duration: 150,
        themeName: 'Minecraft',
        includesGoodybags: true,
        includesDecoration: true,
        indoorOutdoor: 'indoor',
        price: 749000,
        featuredImageUrl: '/images/packages/minecraft-party.jpg',
        featuredImageAlt: 'Minecraft párty',
      },
    }),
  ])

  // Create Package-Activity relationships
  console.log('Linking activities to packages...')
  const facepainting = activities.find(a => a.slug === 'face-painting')!
  const balloon = activities.find(a => a.slug === 'balloon-animals')!
  const magic = activities.find(a => a.slug === 'magic-show')!
  const treasure = activities.find(a => a.slug === 'treasure-hunt')!
  const science = activities.find(a => a.slug === 'science-lab')!
  const dance = activities.find(a => a.slug === 'dance-workshop')!
  const storytelling = activities.find(a => a.slug === 'storytelling')!
  const bubble = activities.find(a => a.slug === 'bubble-show')!
  const sports = activities.find(a => a.slug === 'sports-games')!
  const art = activities.find(a => a.slug === 'art-studio')!

  const princessPkg = packages.find(p => p.slug === 'princess-party-premium')!
  const superheroPkg = packages.find(p => p.slug === 'superhero-adventure')!
  const sciencePkg = packages.find(p => p.slug === 'science-lab-party')!
  const piratePkg = packages.find(p => p.slug === 'pirate-adventure')!
  const frozenPkg = packages.find(p => p.slug === 'frozen-party')!

  await prisma.packageActivity.createMany({
    data: [
      { packageId: princessPkg.id, activityId: facepainting.id, order: 1 },
      { packageId: princessPkg.id, activityId: storytelling.id, order: 2 },
      { packageId: princessPkg.id, activityId: dance.id, order: 3 },
      { packageId: superheroPkg.id, activityId: sports.id, order: 1 },
      { packageId: superheroPkg.id, activityId: treasure.id, order: 2 },
      { packageId: sciencePkg.id, activityId: science.id, order: 1 },
      { packageId: sciencePkg.id, activityId: bubble.id, order: 2 },
      { packageId: piratePkg.id, activityId: treasure.id, order: 1 },
      { packageId: piratePkg.id, activityId: balloon.id, order: 2 },
      { packageId: frozenPkg.id, activityId: facepainting.id, order: 1 },
      { packageId: frozenPkg.id, activityId: magic.id, order: 2 },
      { packageId: frozenPkg.id, activityId: dance.id, order: 3 },
    ],
  })

  // Create Extras
  console.log('Creating extras...')
  await prisma.extra.createMany({
    data: [
      {
        title: 'Narozeninový dort',
        slug: 'birthday-cake',
        category: 'food',
        status: 'active',
        excerpt: 'Výběr z několika druhů dortů dle tématu párty',
        allergens: ['gluten', 'dairy', 'eggs'],
        priceFrom: 80000,
        priceUnit: 'per_set',
        featuredImageUrl: '/images/extras/cake.jpg',
        featuredImageAlt: 'Narozeninový dort',
      },
      {
        title: 'Kostým pro oslavence',
        slug: 'birthday-costume',
        category: 'costume',
        status: 'active',
        excerpt: 'Prémiový kostým dle tématu pro narozeninové dítě',
        priceFrom: 50000,
        priceUnit: 'per_set',
        featuredImageUrl: '/images/extras/costume.jpg',
        featuredImageAlt: 'Kostým pro oslavence',
      },
      {
        title: 'Dekorace prostoru',
        slug: 'space-decoration',
        category: 'decoration',
        status: 'active',
        excerpt: 'Kompletní tematická výzdoba prostoru včetně balonků',
        priceFrom: 150000,
        priceUnit: 'per_set',
        featuredImageUrl: '/images/extras/decoration.jpg',
        featuredImageAlt: 'Dekorace',
      },
      {
        title: 'Profesionální fotograf',
        slug: 'professional-photographer',
        category: 'photo',
        status: 'active',
        excerpt: 'Profesionální fotograf na 2 hodiny + 50 upravených fotografií',
        priceFrom: 400000,
        priceUnit: 'per_set',
        featuredImageUrl: '/images/extras/photographer.jpg',
        featuredImageAlt: 'Profesionální fotograf',
      },
      {
        title: 'Dárkové balíčky',
        slug: 'goody-bags',
        category: 'other',
        status: 'active',
        excerpt: 'Dárkové balíčky pro hosty s hračkami a sladkostmi',
        allergens: ['various'],
        priceFrom: 15000,
        priceUnit: 'per_child',
        featuredImageUrl: '/images/extras/goody-bags.jpg',
        featuredImageAlt: 'Dárkové balíčky',
      },
    ],
  })

  // Create Entertainers
  console.log('Creating entertainers...')
  await prisma.entertainer.createMany({
    data: [
      {
        firstName: 'Jana',
        lastName: 'Veselá',
        stageName: 'Princezna Jana',
        role: 'animator',
        bio: { text: 'Profesionální animátorka s 5 lety zkušeností v dětské zábavě' },
        email: 'jana@partypal.cz',
        phone: '+420 111 222 333',
        specializations: ['princezny', 'pohádky', 'face_painting'],
        ageGroups: ['TODDLER_3_5', 'KIDS_6_9'],
        languages: ['čeština', 'angličtina'],
        backgroundCheckDate: new Date('2025-01-15'),
        backgroundCheckStatus: 'approved',
        firstAidCertified: true,
        firstAidExpiryDate: new Date('2027-01-15'),
        isActive: true,
      },
      {
        firstName: 'Tomáš',
        lastName: 'Hrdinský',
        stageName: 'Superhrdina Tom',
        role: 'animator',
        bio: { text: 'Bývalý sportovec specializující se na akční programy pro děti' },
        email: 'tomas@partypal.cz',
        phone: '+420 222 333 444',
        specializations: ['superhrdinové', 'sport', 'outdoor'],
        ageGroups: ['KIDS_6_9', 'TWEENS_10_12'],
        languages: ['čeština'],
        backgroundCheckDate: new Date('2025-02-01'),
        backgroundCheckStatus: 'approved',
        firstAidCertified: true,
        firstAidExpiryDate: new Date('2026-08-01'),
        isActive: true,
      },
      {
        firstName: 'Marek',
        lastName: 'Kouzelný',
        stageName: 'Kouzelník Marek',
        role: 'magician',
        bio: { text: 'Profesionální kouzelník s 10 lety zkušeností' },
        email: 'marek@partypal.cz',
        phone: '+420 333 444 555',
        specializations: ['magic', 'illusion', 'balloon_art'],
        ageGroups: ['TODDLER_3_5', 'KIDS_6_9', 'TWEENS_10_12'],
        languages: ['čeština', 'angličtina', 'němčina'],
        backgroundCheckDate: new Date('2024-12-01'),
        backgroundCheckStatus: 'approved',
        firstAidCertified: false,
        isActive: true,
      },
    ],
  })

  // Create sample customers
  console.log('Creating sample customers...')
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'novakova@email.cz',
        firstName: 'Marie',
        lastName: 'Nováková',
        phone: '+420 777 888 999',
        children: [
          { name: 'Adélka', birthday: '2019-05-15', interests: ['princezny', 'balet'], allergies: [] },
        ],
        preferredThemes: ['Princezny', 'Frozen'],
        totalPartiesBooked: 1,
      },
    }),
    prisma.customer.create({
      data: {
        email: 'svoboda@email.cz',
        firstName: 'Pavel',
        lastName: 'Svoboda',
        phone: '+420 666 555 444',
        children: [
          { name: 'Jakub', birthday: '2017-08-20', interests: ['superhrdinové', 'sport'], allergies: ['nuts'] },
          { name: 'Emma', birthday: '2020-03-10', interests: ['pohádky'], allergies: [] },
        ],
        preferredThemes: ['Superhrdinové'],
        totalPartiesBooked: 2,
      },
    }),
  ])

  // Create sample parties
  console.log('Creating sample parties...')
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  await prisma.party.create({
    data: {
      packageId: frozenPkg.id,
      date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15, 14, 0),
      endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15, 17, 0),
      venue: { name: 'Domov zákazníka', address: 'Hlavní 123', city: 'Praha', type: 'home' },
      childName: 'Adélka',
      childAge: 6,
      childGender: 'girl',
      childInterests: ['princezny', 'balet', 'Frozen'],
      guestCount: 10,
      ageRange: { min: 5, max: 7 },
      theme: 'Frozen',
      parentName: 'Marie Nováková',
      parentPhone: '+420 777 888 999',
      parentEmail: 'novakova@email.cz',
      status: 'confirmed',
      emergencyContact: { name: 'Jan Novák', phone: '+420 777 888 000', relation: 'otec' },
    },
  })

  await prisma.party.create({
    data: {
      packageId: superheroPkg.id,
      date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 22, 10, 0),
      endDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 22, 13, 0),
      venue: { name: 'Zahrada', address: 'Lesní 456', city: 'Brno', type: 'outdoor' },
      childName: 'Jakub',
      childAge: 8,
      childGender: 'boy',
      childInterests: ['superhrdinové', 'sport'],
      guestCount: 15,
      ageRange: { min: 7, max: 9 },
      theme: 'Superhrdinové',
      allergies: ['nuts'],
      parentName: 'Pavel Svoboda',
      parentPhone: '+420 666 555 444',
      parentEmail: 'svoboda@email.cz',
      status: 'inquiry',
      emergencyContact: { name: 'Eva Svobodová', phone: '+420 666 555 333', relation: 'matka' },
    },
  })

  console.log('✅ Seeding completed successfully!')
  console.log(`
📊 Created:
  - 1 Admin user (admin@partypal.cz / admin123)
  - 1 Settings record
  - ${activities.length} Activities
  - ${packages.length} Packages
  - 12 Package-Activity links
  - 5 Extras
  - 3 Entertainers
  - ${customers.length} Customers
  - 2 Sample parties
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
