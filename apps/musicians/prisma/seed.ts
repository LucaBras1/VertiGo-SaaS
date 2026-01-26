import { PrismaClient, Vertical, GigStatus, SetlistStatus } from '../src/generated/prisma'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-band' },
    update: {},
    create: {
      name: 'Demo Kapela',
      slug: 'demo-band',
      vertical: Vertical.MUSICIANS,
      email: 'info@demokapela.cz',
      phone: '+420 777 999 888',
      website: 'https://demokapela.cz',
      bandName: 'Demo Kapela',
      bandBio: 'Profesionální coverband s 10letou zkušeností. Hrajeme rock, pop a taneční hity.',
      bandGenres: ['Rock', 'Pop', 'Dance', 'Disco'],
      bandSize: 5,
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/demo',
        youtube: 'https://youtube.com/@demokapela',
        facebook: 'https://facebook.com/demokapela',
        instagram: 'https://instagram.com/demokapela',
      },
      settings: {
        companyAddress: {
          street: 'Hlavní 123',
          city: 'Praha',
          zip: '11000',
          country: 'Česká republika',
        },
        bankAccount: '123456789/0100',
        iban: 'CZ65 0800 0000 1920 0014 5399',
        ico: '12345678',
        dic: 'CZ12345678',
        currency: 'CZK',
        taxRate: 21,
      },
      plan: 'professional',
      isActive: true,
    },
  })
  console.log('✅ Created tenant:', tenant.name)

  // 2. Create demo user
  const hashedPassword = await hashPassword('demo123456')
  const user = await prisma.user.upsert({
    where: { email: 'demo@gigbook.cz' },
    update: {},
    create: {
      email: 'demo@gigbook.cz',
      name: 'Demo Uživatel',
      password: hashedPassword,
      tenantId: tenant.id,
      role: 'admin',
      emailVerified: new Date(),
    },
  })
  console.log('✅ Created user:', user.email, '(password: demo123456)')

  // 3. Create sample customers
  const customersData = [
    {
      email: 'info@zlaty-lev.cz',
      firstName: 'Jan',
      lastName: 'Novák',
      phone: '+420 777 111 222',
      company: 'Hospoda U Zlatého Lva',
      address: { street: 'Náměstí 5', city: 'Praha', zip: '11000', country: 'CZ' },
      tags: ['restaurant', 'regular'],
    },
    {
      email: 'booking@openair.cz',
      firstName: 'Petra',
      lastName: 'Svobodová',
      phone: '+420 777 222 333',
      company: 'Festival Open Air',
      address: { street: 'Výstaviště 1', city: 'Brno', zip: '60300', country: 'CZ' },
      tags: ['festival', 'large-event'],
    },
    {
      email: 'akce@podkastanem.cz',
      firstName: 'Martin',
      lastName: 'Dvořák',
      phone: '+420 777 333 444',
      company: 'Restaurace Pod Kaštanem',
      address: { street: 'Zahradní 23', city: 'Ostrava', zip: '70200', country: 'CZ' },
      tags: ['restaurant', 'wedding-venue'],
    },
    {
      email: 'events@panorama.cz',
      firstName: 'Eva',
      lastName: 'Procházková',
      phone: '+420 777 444 555',
      company: 'Hotel Panorama',
      address: { street: 'Lázeňská 15', city: 'Karlovy Vary', zip: '36001', country: 'CZ' },
      tags: ['hotel', 'corporate'],
    },
    {
      email: 'music@rockcafe.cz',
      firstName: 'Tomáš',
      lastName: 'Černý',
      phone: '+420 777 555 666',
      company: 'Klub Rock Café',
      address: { street: 'Americká 10', city: 'Plzeň', zip: '30100', country: 'CZ' },
      tags: ['club', 'regular'],
    },
  ]

  const customers = []
  for (const customerData of customersData) {
    const customer = await prisma.customer.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: customerData.email,
        }
      },
      update: {},
      create: {
        ...customerData,
        tenantId: tenant.id,
      },
    })
    customers.push(customer)
  }
  console.log('✅ Created', customers.length, 'customers')

  // 4. Create 30 sample songs in repertoire
  const songsData = [
    { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', mood: 'energetic', duration: 355, bpm: 72, key: 'Bb', difficulty: 'hard', vocals: 'harmony' },
    { title: 'Hotel California', artist: 'Eagles', genre: 'Rock', mood: 'chill', duration: 391, bpm: 75, key: 'Bm', difficulty: 'medium', vocals: 'lead' },
    { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', genre: 'Rock', mood: 'energetic', duration: 356, bpm: 125, key: 'D', difficulty: 'hard', vocals: 'lead' },
    { title: 'I Want to Break Free', artist: 'Queen', genre: 'Rock', mood: 'party', duration: 258, bpm: 112, key: 'E', difficulty: 'easy', vocals: 'lead' },
    { title: 'Livin\' on a Prayer', artist: 'Bon Jovi', genre: 'Rock', mood: 'party', duration: 249, bpm: 123, key: 'Em', difficulty: 'medium', vocals: 'lead' },
    { title: 'Don\'t Stop Believin\'', artist: 'Journey', genre: 'Rock', mood: 'party', duration: 251, bpm: 119, key: 'E', difficulty: 'easy', vocals: 'lead' },
    { title: 'Summer of \'69', artist: 'Bryan Adams', genre: 'Rock', mood: 'party', duration: 215, bpm: 139, key: 'D', difficulty: 'easy', vocals: 'lead' },
    { title: 'Every Breath You Take', artist: 'The Police', genre: 'Rock', mood: 'romantic', duration: 253, bpm: 117, key: 'Ab', difficulty: 'medium', vocals: 'lead' },
    { title: 'Wonderwall', artist: 'Oasis', genre: 'Rock', mood: 'chill', duration: 258, bpm: 87, key: 'F#m', difficulty: 'easy', vocals: 'lead' },
    { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: 'Funk', mood: 'party', duration: 269, bpm: 115, key: 'Dm', difficulty: 'medium', vocals: 'lead' },
    { title: 'Shape of You', artist: 'Ed Sheeran', genre: 'Pop', mood: 'party', duration: 233, bpm: 96, key: 'C#m', difficulty: 'easy', vocals: 'lead' },
    { title: 'Get Lucky', artist: 'Daft Punk', genre: 'Disco', mood: 'party', duration: 248, bpm: 116, key: 'F#m', difficulty: 'medium', vocals: 'lead' },
    { title: 'Dancing Queen', artist: 'ABBA', genre: 'Disco', mood: 'party', duration: 230, bpm: 100, key: 'A', difficulty: 'easy', vocals: 'harmony' },
    { title: 'September', artist: 'Earth, Wind & Fire', genre: 'Disco', mood: 'party', duration: 215, bpm: 126, key: 'Ab', difficulty: 'medium', vocals: 'harmony' },
    { title: 'I Wanna Dance with Somebody', artist: 'Whitney Houston', genre: 'Pop', mood: 'party', duration: 291, bpm: 119, key: 'F', difficulty: 'hard', vocals: 'lead' },
    { title: 'Valerie', artist: 'Amy Winehouse', genre: 'Soul', mood: 'party', duration: 227, bpm: 110, key: 'Eb', difficulty: 'medium', vocals: 'lead' },
    { title: 'Sex on Fire', artist: 'Kings of Leon', genre: 'Rock', mood: 'energetic', duration: 203, bpm: 150, key: 'E', difficulty: 'medium', vocals: 'lead' },
    { title: 'Use Somebody', artist: 'Kings of Leon', genre: 'Rock', mood: 'chill', duration: 231, bpm: 132, key: 'C', difficulty: 'easy', vocals: 'lead' },
    { title: 'Rolling in the Deep', artist: 'Adele', genre: 'Pop', mood: 'energetic', duration: 228, bpm: 105, key: 'Cm', difficulty: 'hard', vocals: 'lead' },
    { title: 'Someone Like You', artist: 'Adele', genre: 'Pop', mood: 'romantic', duration: 285, bpm: 67, key: 'A', difficulty: 'medium', vocals: 'lead' },
    { title: 'Mr. Brightside', artist: 'The Killers', genre: 'Rock', mood: 'party', duration: 222, bpm: 148, key: 'D', difficulty: 'medium', vocals: 'lead' },
    { title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', genre: 'Rock', mood: 'party', duration: 284, bpm: 98, key: 'D', difficulty: 'easy', vocals: 'harmony' },
    { title: 'Born to Run', artist: 'Bruce Springsteen', genre: 'Rock', mood: 'energetic', duration: 270, bpm: 145, key: 'E', difficulty: 'medium', vocals: 'lead' },
    { title: 'All of Me', artist: 'John Legend', genre: 'Pop', mood: 'romantic', duration: 269, bpm: 120, key: 'Ab', difficulty: 'easy', vocals: 'lead' },
    { title: 'Thinking Out Loud', artist: 'Ed Sheeran', genre: 'Pop', mood: 'romantic', duration: 281, bpm: 79, key: 'D', difficulty: 'easy', vocals: 'lead' },
    { title: 'Dám dělat', artist: 'Chinaski', genre: 'Czech Rock', mood: 'party', duration: 235, bpm: 128, key: 'G', difficulty: 'easy', vocals: 'lead' },
    { title: 'Trable', artist: 'Wohnout', genre: 'Czech Rock', mood: 'party', duration: 245, bpm: 140, key: 'A', difficulty: 'easy', vocals: 'lead' },
    { title: 'Holky z naší školky', artist: 'Kabát', genre: 'Czech Rock', mood: 'party', duration: 264, bpm: 165, key: 'E', difficulty: 'medium', vocals: 'lead' },
    { title: 'Cesta', artist: 'Lucie', genre: 'Czech Rock', mood: 'chill', duration: 308, bpm: 92, key: 'Am', difficulty: 'medium', vocals: 'lead' },
    { title: 'Malá dáma', artist: 'Olympic', genre: 'Czech Rock', mood: 'chill', duration: 242, bpm: 110, key: 'D', difficulty: 'easy', vocals: 'lead' },
  ]

  // Check if songs already exist for this tenant
  const existingSongsCount = await prisma.repertoireSong.count({
    where: { tenantId: tenant.id },
  })

  if (existingSongsCount === 0) {
    for (const songData of songsData) {
      await prisma.repertoireSong.create({
        data: {
          ...songData,
          tenantId: tenant.id,
          instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
          tags: [songData.genre.toLowerCase(), songData.mood],
          timesPerformed: Math.floor(Math.random() * 20),
        },
      })
    }
    console.log('✅ Created', songsData.length, 'repertoire songs')
  } else {
    console.log('⏭️  Skipped repertoire songs (already exist)')
  }

  // 5. Create 10 sample gigs (mix of statuses and types)
  const gigsData = [
    {
      title: 'Svatba Nováků',
      slug: 'svatba-novaku-2026-07',
      status: GigStatus.CONFIRMED,
      clientName: 'Jan a Marie Novákovi',
      clientEmail: 'jan.novak@email.cz',
      clientPhone: '+420 777 888 999',
      eventType: 'wedding',
      eventDate: new Date('2026-07-15T16:00:00'),
      eventDuration: 300,
      venue: {
        name: 'Zámek Loučeň',
        address: 'Loučeň 1',
        city: 'Nymburk',
        zip: '28937',
        type: 'indoor',
      },
      audienceSize: 120,
      audienceAge: '25-65',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Rock', 'Pop', 'Dance'],
      setDuration: 60,
      numberOfSets: 3,
      breakDuration: 30,
      basePrice: 3500000, // 35,000 CZK in cents
      travelCosts: 50000, // 500 CZK
      totalPrice: 3550000,
      deposit: 1000000,
      depositPaid: true,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Svatební hostina s tanečním parketem. Klienti chtějí mix moderních hitů a klasických českých písní.' }] }] },
      internalNotes: 'Nevěsta miluje Adele, ženich chce rock. First dance: All of Me.',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: false,
    },
    {
      title: 'Firemní Večírek TechCorp',
      slug: 'firemni-vecirek-techcorp-2026-06',
      status: GigStatus.CONFIRMED,
      clientName: 'Petra Svobodová',
      clientEmail: 'petra.svobodova@techcorp.cz',
      clientPhone: '+420 777 123 456',
      eventType: 'corporate',
      eventDate: new Date('2026-06-20T19:00:00'),
      eventDuration: 180,
      venue: {
        name: 'Hotel Clarion Congress',
        address: 'Freyova 33',
        city: 'Praha',
        zip: '19000',
        type: 'indoor',
      },
      audienceSize: 200,
      audienceAge: '30-50',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Pop', 'Dance', 'Funk'],
      setDuration: 45,
      numberOfSets: 3,
      breakDuration: 15,
      basePrice: 4000000, // 40,000 CZK
      travelCosts: 0,
      totalPrice: 4000000,
      deposit: 1500000,
      depositPaid: true,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Firemní party s mezinárodními hosty. Angličtina preferována.' }] }] },
      internalNotes: 'VIP klient - extra profesionální přístup. Sound check v 17:00.',
      hasOwnPA: false,
      backlineNeeded: false,
      soundSystemProvided: true,
    },
    {
      title: 'Summer Festival 2026',
      slug: 'summer-festival-2026',
      status: GigStatus.CONFIRMED,
      clientName: 'Festival Open Air',
      clientEmail: 'booking@openair.cz',
      clientPhone: '+420 777 222 333',
      eventType: 'festival',
      eventDate: new Date('2026-08-10T20:00:00'),
      eventDuration: 90,
      venue: {
        name: 'Výstaviště Brno',
        address: 'Výstaviště 1',
        city: 'Brno',
        zip: '64700',
        type: 'outdoor',
      },
      audienceSize: 1500,
      audienceAge: '18-35',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Rock', 'Pop'],
      setDuration: 90,
      numberOfSets: 1,
      breakDuration: 0,
      basePrice: 5000000, // 50,000 CZK
      travelCosts: 100000,
      totalPrice: 5100000,
      deposit: 2000000,
      depositPaid: false,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Velký letní festival, main stage v 20:00. Před námi 2 kapely, po nás headliner.' }] }] },
      internalNotes: 'Potřebujeme kompletní backline - nic nevozíme. Sound check 15:00-16:00.',
      hasOwnPA: false,
      backlineNeeded: true,
      soundSystemProvided: true,
    },
    {
      title: 'Hospoda U Zlatého Lva - Pravidelný Pátek',
      slug: 'zlaty-lev-2026-05-23',
      status: GigStatus.COMPLETED,
      clientName: 'Jan Novák',
      clientEmail: 'info@zlaty-lev.cz',
      clientPhone: '+420 777 111 222',
      eventType: 'party',
      eventDate: new Date('2026-05-23T20:00:00'),
      eventDuration: 240,
      venue: {
        name: 'Hospoda U Zlatého Lva',
        address: 'Náměstí 5',
        city: 'Praha',
        zip: '11000',
        type: 'indoor',
      },
      audienceSize: 80,
      audienceAge: '35-60',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals'],
      genres: ['Rock', 'Czech Rock'],
      setDuration: 60,
      numberOfSets: 3,
      breakDuration: 20,
      basePrice: 1500000, // 15,000 CZK
      travelCosts: 0,
      totalPrice: 1500000,
      deposit: 0,
      depositPaid: false,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pravidelný páteční večer. Místní publikum, české hity a rock klasiky.' }] }] },
      internalNotes: 'Pravidelný klient - platba v hotovosti po akci. Skvělá atmosféra.',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: false,
    },
    {
      title: 'Narozeninová Party - 50tka',
      slug: 'narozeniny-dvorak-2026-09',
      status: GigStatus.QUOTE_SENT,
      clientName: 'Martin Dvořák',
      clientEmail: 'martin.dvorak@email.cz',
      clientPhone: '+420 777 333 444',
      eventType: 'party',
      eventDate: new Date('2026-09-12T18:00:00'),
      eventDuration: 240,
      venue: {
        name: 'Zahradní restaurace Pod Kaštanem',
        address: 'Zahradní 23',
        city: 'Ostrava',
        zip: '70200',
        type: 'outdoor',
      },
      audienceSize: 60,
      audienceAge: '45-55',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Rock', 'Pop', 'Czech Rock'],
      setDuration: 60,
      numberOfSets: 3,
      breakDuration: 30,
      basePrice: 2000000, // 20,000 CZK
      travelCosts: 80000,
      totalPrice: 2080000,
      deposit: 500000,
      depositPaid: false,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Oslava padesátin v zahradě restaurace. Klient chce 80s a 90s hity.' }] }] },
      internalNotes: 'Čeká na potvrzení - konkuruje další kapela.',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: false,
    },
    {
      title: 'Lázeňský Koncert Karlovy Vary',
      slug: 'lazensky-koncert-kv-2026-07',
      status: GigStatus.INQUIRY,
      clientName: 'Eva Procházková',
      clientEmail: 'events@panorama.cz',
      clientPhone: '+420 777 444 555',
      eventType: 'concert',
      eventDate: new Date('2026-07-25T19:00:00'),
      eventDuration: 120,
      venue: {
        name: 'Hotel Panorama - Lázeňská kolonáda',
        address: 'Lázeňská 15',
        city: 'Karlovy Vary',
        zip: '36001',
        type: 'outdoor',
      },
      audienceSize: 150,
      audienceAge: '50-70',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Pop', 'Rock'],
      setDuration: 60,
      numberOfSets: 2,
      breakDuration: 15,
      basePrice: 2500000, // 25,000 CZK
      travelCosts: 120000,
      totalPrice: 2620000,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Venkovní koncert na kolonádě. Starší publikum - klidnější repertoár.' }] }] },
      internalNotes: 'První dotaz - čeká na naše představení.',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: false,
    },
    {
      title: 'Rock Café - Tribute Night',
      slug: 'rock-cafe-tribute-2026-10',
      status: GigStatus.CONFIRMED,
      clientName: 'Tomáš Černý',
      clientEmail: 'music@rockcafe.cz',
      clientPhone: '+420 777 555 666',
      eventType: 'concert',
      eventDate: new Date('2026-10-15T21:00:00'),
      eventDuration: 120,
      venue: {
        name: 'Klub Rock Café',
        address: 'Americká 10',
        city: 'Plzeň',
        zip: '30100',
        type: 'indoor',
      },
      audienceSize: 200,
      audienceAge: '20-45',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals'],
      genres: ['Rock'],
      setDuration: 60,
      numberOfSets: 2,
      breakDuration: 15,
      basePrice: 1800000, // 18,000 CZK
      travelCosts: 50000,
      totalPrice: 1850000,
      deposit: 500000,
      depositPaid: true,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tribute večer - pouze rocková klasika. Queens, GnR, Bon Jovi apod.' }] }] },
      internalNotes: 'Třetí akce s tímto klubem - vždy skvělá spolupráce.',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: true,
    },
    {
      title: 'Adventní Trhy - Vánoční Koncert',
      slug: 'adventni-trhy-2026-12',
      status: GigStatus.CANCELLED,
      clientName: 'Městský úřad Brno',
      clientEmail: 'kultura@brno.cz',
      clientPhone: '+420 777 666 777',
      eventType: 'concert',
      eventDate: new Date('2026-12-20T17:00:00'),
      eventDuration: 90,
      venue: {
        name: 'Náměstí Svobody',
        address: 'Náměstí Svobody',
        city: 'Brno',
        zip: '60200',
        type: 'outdoor',
      },
      audienceSize: 500,
      audienceAge: '0-100',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Pop', 'Christmas'],
      setDuration: 90,
      numberOfSets: 1,
      breakDuration: 0,
      basePrice: 3000000, // 30,000 CZK
      travelCosts: 80000,
      totalPrice: 3080000,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Vánoční koncert na adventních trzích. Mix vánočních písní a populárních hitů.' }] }] },
      internalNotes: 'Zrušeno z důvodu špatného počasí - budou nás kontaktovat pro příští rok.',
      hasOwnPA: false,
      backlineNeeded: false,
      soundSystemProvided: true,
    },
    {
      title: 'Firemní Team Building',
      slug: 'team-building-2026-08',
      status: GigStatus.INQUIRY,
      clientName: 'Auto Group CZ',
      clientEmail: 'hr@autogroup.cz',
      clientPhone: '+420 777 234 567',
      eventType: 'corporate',
      eventDate: new Date('2026-08-28T18:00:00'),
      eventDuration: 180,
      venue: {
        name: 'Chata Orlice',
        address: 'Horská 45',
        city: 'Špindlerův Mlýn',
        zip: '54351',
        type: 'indoor',
      },
      audienceSize: 80,
      audienceAge: '25-55',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Rock', 'Pop', 'Dance'],
      setDuration: 60,
      numberOfSets: 2,
      breakDuration: 30,
      basePrice: 2800000, // 28,000 CZK
      travelCosts: 150000,
      totalPrice: 2950000,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Team building ve Špindlu. Večerní program po celodenních aktivitách.' }] }] },
      internalNotes: 'Dobře platící firma - čekají na rozpočet.',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: false,
    },
    {
      title: 'Výroční Ples Gymnázia',
      slug: 'vyrocni-ples-gympl-2026-02',
      status: GigStatus.COMPLETED,
      clientName: 'Gymnázium J. A. Komenského',
      clientEmail: 'ples@gympl.cz',
      clientPhone: '+420 777 345 678',
      eventType: 'party',
      eventDate: new Date('2026-02-14T19:00:00'),
      eventDuration: 300,
      venue: {
        name: 'Dům kultury',
        address: 'Hlavní třída 88',
        city: 'Olomouc',
        zip: '77900',
        type: 'indoor',
      },
      audienceSize: 300,
      audienceAge: '15-60',
      bandMembers: 5,
      instruments: ['guitar', 'bass', 'drums', 'vocals', 'keyboard'],
      genres: ['Pop', 'Dance', 'Rock'],
      setDuration: 60,
      numberOfSets: 4,
      breakDuration: 15,
      basePrice: 3200000, // 32,000 CZK
      travelCosts: 100000,
      totalPrice: 3300000,
      deposit: 1000000,
      depositPaid: true,
      description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Maturitní ples - mix generací. Mladí chtějí moderní hity, rodiče klasiku.' }] }] },
      internalNotes: 'Super akce - chtějí nás i na příští rok!',
      hasOwnPA: true,
      backlineNeeded: false,
      soundSystemProvided: true,
    },
  ]

  const createdGigs = []
  for (const gigData of gigsData) {
    const gig = await prisma.gig.upsert({
      where: { slug: gigData.slug },
      update: {},
      create: {
        ...gigData,
        tenantId: tenant.id,
        vertical: Vertical.MUSICIANS,
      },
    })
    createdGigs.push(gig)
  }
  console.log('✅ Created', createdGigs.length, 'gigs')

  // 6. Create 3 sample setlists
  const setlistsData = [
    {
      name: 'Svatební setlist - Univerzální',
      status: SetlistStatus.FINALIZED,
      gigId: createdGigs[0].id, // Svatba Nováků
      totalDuration: 180,
      mood: 'mixed',
      songs: [
        { title: 'All of Me', artist: 'John Legend', duration: 269, key: 'Ab', bpm: 120, order: 1, notes: 'První tanec' },
        { title: 'Thinking Out Loud', artist: 'Ed Sheeran', duration: 281, key: 'D', bpm: 79, order: 2 },
        { title: 'Uptown Funk', artist: 'Bruno Mars', duration: 269, key: 'Dm', bpm: 115, order: 3 },
        { title: 'Dancing Queen', artist: 'ABBA', duration: 230, key: 'A', bpm: 100, order: 4 },
        { title: 'Valerie', artist: 'Amy Winehouse', duration: 227, key: 'Eb', bpm: 110, order: 5 },
        { title: 'Mr. Brightside', artist: 'The Killers', duration: 222, key: 'D', bpm: 148, order: 6 },
        { title: 'I Wanna Dance with Somebody', artist: 'Whitney Houston', duration: 291, key: 'F', bpm: 119, order: 7 },
        { title: 'Don\'t Stop Believin\'', artist: 'Journey', duration: 251, key: 'E', bpm: 119, order: 8 },
        { title: 'Livin\' on a Prayer', artist: 'Bon Jovi', duration: 249, key: 'Em', bpm: 123, order: 9 },
        { title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', duration: 284, key: 'D', bpm: 98, order: 10 },
      ],
      notes: 'První set pro svatbu - mix romantických a taneční',
    },
    {
      name: 'Rock Classics - Tribute Night',
      status: SetlistStatus.FINALIZED,
      gigId: createdGigs[6].id, // Rock Café
      totalDuration: 120,
      mood: 'energetic',
      songs: [
        { title: 'Bohemian Rhapsody', artist: 'Queen', duration: 355, key: 'Bb', bpm: 72, order: 1, notes: 'Opener' },
        { title: 'I Want to Break Free', artist: 'Queen', duration: 258, key: 'E', bpm: 112, order: 2 },
        { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', duration: 356, key: 'D', bpm: 125, order: 3 },
        { title: 'Livin\' on a Prayer', artist: 'Bon Jovi', duration: 249, key: 'Em', bpm: 123, order: 4 },
        { title: 'Hotel California', artist: 'Eagles', duration: 391, key: 'Bm', bpm: 75, order: 5 },
        { title: 'Sex on Fire', artist: 'Kings of Leon', duration: 203, key: 'E', bpm: 150, order: 6 },
        { title: 'Born to Run', artist: 'Bruce Springsteen', duration: 270, key: 'E', bpm: 145, order: 7 },
        { title: 'Summer of \'69', artist: 'Bryan Adams', duration: 215, key: 'D', bpm: 139, order: 8, notes: 'Closer' },
      ],
      notes: 'Pouze rockové klasiky - high energy!',
    },
    {
      name: 'Hospodský Mix - České Hity',
      status: SetlistStatus.PERFORMED,
      gigId: createdGigs[3].id, // Hospoda U Zlatého Lva
      totalDuration: 180,
      mood: 'party',
      songs: [
        { title: 'Dám dělat', artist: 'Chinaski', duration: 235, key: 'G', bpm: 128, order: 1 },
        { title: 'Trable', artist: 'Wohnout', duration: 245, key: 'A', bpm: 140, order: 2 },
        { title: 'Holky z naší školky', artist: 'Kabát', duration: 264, key: 'E', bpm: 165, order: 3 },
        { title: 'Malá dáma', artist: 'Olympic', duration: 242, key: 'D', bpm: 110, order: 4 },
        { title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', duration: 284, key: 'D', bpm: 98, order: 5 },
        { title: 'Summer of \'69', artist: 'Bryan Adams', duration: 215, key: 'D', bpm: 139, order: 6 },
        { title: 'Sex on Fire', artist: 'Kings of Leon', duration: 203, key: 'E', bpm: 150, order: 7 },
        { title: 'Mr. Brightside', artist: 'The Killers', duration: 222, key: 'D', bpm: 148, order: 8 },
      ],
      notes: 'První set - české hity + pár známých rockových klasik',
    },
  ]

  for (const setlistData of setlistsData) {
    await prisma.setlist.create({
      data: {
        ...setlistData,
        tenantId: tenant.id,
        vertical: Vertical.MUSICIANS,
      },
    })
  }
  console.log('✅ Created', setlistsData.length, 'setlists')

  // 7. Create 5 sample invoices
  const invoicesData = [
    {
      invoiceNumber: 'INV-2026-001',
      status: 'paid',
      customerId: customers[2].id, // Martin Dvořák
      gigId: createdGigs[0].id, // Svatba Nováků
      issueDate: new Date('2026-07-16'),
      dueDate: new Date('2026-07-30'),
      paidDate: new Date('2026-07-18'),
      subtotal: 3550000, // 35,500 CZK
      taxRate: 21,
      taxAmount: 745500, // DPH 21%
      totalAmount: 4295500, // Celkem s DPH
      paidAmount: 4295500,
      items: [
        { description: 'Hudební produkce - svatba (3 sety po 60 min)', quantity: 1, unitPrice: 3500000, total: 3500000 },
        { description: 'Cestovné', quantity: 1, unitPrice: 50000, total: 50000 },
      ],
      notes: 'Děkujeme za skvělou atmosféru na vaší svatbě!',
    },
    {
      invoiceNumber: 'INV-2026-002',
      status: 'sent',
      customerId: customers[3].id, // Eva Procházková
      gigId: createdGigs[1].id, // Firemní večírek
      issueDate: new Date('2026-06-21'),
      dueDate: new Date('2026-07-21'),
      paidDate: null,
      subtotal: 4000000, // 40,000 CZK
      taxRate: 21,
      taxAmount: 840000,
      totalAmount: 4840000,
      paidAmount: 0,
      items: [
        { description: 'Hudební produkce - firemní akce (3 sety po 45 min)', quantity: 1, unitPrice: 4000000, total: 4000000 },
      ],
      notes: 'Splatnost 30 dní od vystavení. Variabilní symbol: 2026002',
    },
    {
      invoiceNumber: 'INV-2026-003',
      status: 'paid',
      customerId: customers[0].id, // Jan Novák
      gigId: createdGigs[3].id, // Hospoda U Zlatého Lva
      issueDate: new Date('2026-05-24'),
      dueDate: new Date('2026-05-24'),
      paidDate: new Date('2026-05-24'),
      subtotal: 1500000, // 15,000 CZK
      taxRate: 21,
      taxAmount: 315000,
      totalAmount: 1815000,
      paidAmount: 1815000,
      items: [
        { description: 'Hudební produkce - páteční večer (3 sety po 60 min)', quantity: 1, unitPrice: 1500000, total: 1500000 },
      ],
      notes: 'Platba v hotovosti po skončení akce.',
    },
    {
      invoiceNumber: 'INV-2026-004',
      status: 'draft',
      customerId: customers[4].id, // Tomáš Černý
      gigId: createdGigs[6].id, // Rock Café
      issueDate: new Date('2026-10-16'),
      dueDate: new Date('2026-11-16'),
      paidDate: null,
      subtotal: 1850000, // 18,500 CZK
      taxRate: 21,
      taxAmount: 388500,
      totalAmount: 2238500,
      paidAmount: 0,
      items: [
        { description: 'Hudební produkce - Rock Tribute Night (2 sety po 60 min)', quantity: 1, unitPrice: 1800000, total: 1800000 },
        { description: 'Cestovné', quantity: 1, unitPrice: 50000, total: 50000 },
      ],
      notes: 'Koncept faktury - po akci.',
    },
    {
      invoiceNumber: 'INV-2026-005',
      status: 'overdue',
      customerId: customers[1].id, // Petra Svobodová
      gigId: createdGigs[2].id, // Festival
      issueDate: new Date('2026-08-11'),
      dueDate: new Date('2026-09-11'),
      paidDate: null,
      subtotal: 5100000, // 51,000 CZK
      taxRate: 21,
      taxAmount: 1071000,
      totalAmount: 6171000,
      paidAmount: 0,
      items: [
        { description: 'Hudební produkce - Summer Festival 2026 (90 min main stage)', quantity: 1, unitPrice: 5000000, total: 5000000 },
        { description: 'Cestovné a ubytování', quantity: 1, unitPrice: 100000, total: 100000 },
      ],
      notes: 'UPOMÍNKA: Faktura po splatnosti! Kontaktujte nás prosím.',
    },
  ]

  for (const invoiceData of invoicesData) {
    await prisma.invoice.create({
      data: {
        ...invoiceData,
        tenantId: tenant.id,
      },
    })
  }
  console.log('✅ Created', invoicesData.length, 'invoices')

  console.log('')
  console.log('🌱 Seed completed!')
  console.log('')
  console.log('📝 Demo credentials:')
  console.log('   Email: demo@gigbook.cz')
  console.log('   Password: demo123456')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
