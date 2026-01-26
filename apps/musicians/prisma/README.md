# Database Seed Documentation

## Overview

This seed script populates the GigBook musicians database with realistic Czech demo data for development and testing purposes.

## What Gets Created

### 1. Demo Tenant
- **Name**: Demo Kapela
- **Slug**: demo-band
- **Band Details**: 5-member professional coverband
- **Genres**: Rock, Pop, Dance, Disco
- **Complete business settings** (address, banking, tax info)

### 2. Demo User
- **Email**: `demo@gigbook.cz`
- **Password**: `demo123456`
- **Role**: Admin
- **Status**: Email verified

### 3. Sample Customers (5)
- Hospoda U Zlatého Lva (Prague) - Restaurant, regular client
- Festival Open Air (Brno) - Festival organizer
- Restaurace Pod Kaštanem (Ostrava) - Wedding venue
- Hotel Panorama (Karlovy Vary) - Corporate events
- Klub Rock Café (Plzeň) - Music club

### 4. Repertoire Songs (30)
Mix of:
- International rock classics (Queen, Eagles, Guns N' Roses)
- Pop hits (Ed Sheeran, Adele, Bruno Mars)
- Disco/Dance (ABBA, Earth Wind & Fire, Daft Punk)
- Czech rock favorites (Chinaski, Kabát, Lucie, Olympic)

Each song includes:
- Duration, BPM, musical key
- Difficulty level, mood
- Performance tracking stats

### 5. Sample Gigs (10)
Variety of event types and statuses:
- **Confirmed**: Weddings, corporate events, festivals
- **Completed**: Pub gigs, school prom
- **Quote Sent**: Birthday party, corporate team building
- **Inquiry**: Spa concert
- **Cancelled**: Christmas market (weather)

Price range: 15,000 - 50,000 CZK

### 6. Setlists (3)
- Wedding setlist (mixed romantic + party)
- Rock Tribute Night (high energy classics)
- Pub gig (Czech hits + international rock)

### 7. Invoices (5)
- **Paid**: Wedding, pub gig
- **Sent**: Corporate event
- **Draft**: Future rock concert
- **Overdue**: Festival (with reminder note)

All invoices include Czech VAT (21% DPH)

## Running the Seed

### Prerequisites
```bash
# Ensure database is set up
pnpm prisma migrate dev

# Generate Prisma client
pnpm prisma:generate
```

### Execute Seed
```bash
# Run the seed script
pnpm prisma:seed

# OR (alternative)
pnpm prisma db seed
```

### Reset and Re-seed
```bash
# Reset database and run migrations + seed
pnpm prisma migrate reset
```

## Seed Features

### Idempotent Design
The seed uses `upsert` operations where possible, making it safe to run multiple times:
- Tenant: Upserted by slug
- User: Upserted by email
- Customers: Upserted by (tenantId, email)
- Gigs: Upserted by slug
- Songs: Checked before creation to avoid duplicates

### Realistic Data
- Czech city names and addresses
- Czech phone format: `+420 777 XXX XXX`
- Czech currency (CZK) - prices in cents
- Czech business identifiers (IČO, DIČ, IBAN)
- Mix of Czech and international music
- Realistic event types and venues

### Data Relationships
All data is properly connected:
- Gigs linked to customers
- Setlists linked to gigs
- Invoices linked to both customers and gigs
- All records isolated by tenant

## Testing the Seed

After running the seed, you can verify:

```bash
# Open Prisma Studio to browse data
pnpm prisma:studio
```

Or log in to the app:
- URL: `http://localhost:3007`
- Email: `demo@gigbook.cz`
- Password: `demo123456`

## Customization

To customize the seed data, edit `prisma/seed.ts`:

- **Add more customers**: Extend `customersData` array
- **Add more songs**: Extend `songsData` array
- **Add more gigs**: Extend `gigsData` array
- **Change tenant details**: Modify tenant creation block
- **Adjust prices**: Update `basePrice`, `totalPrice` values (in cents)

## Troubleshooting

### Error: "unique constraint failed"
The seed is trying to create duplicate records. This usually means:
- Run `pnpm prisma migrate reset` to start fresh
- Or manually delete the conflicting records in Prisma Studio

### Error: "password hashing failed"
Ensure `bcryptjs` is installed:
```bash
pnpm add bcryptjs
```

### Error: "module not found"
Regenerate Prisma client:
```bash
pnpm prisma:generate
```

## Data Consistency

The seed ensures:
- All dates are in the future (2026) for upcoming gigs
- Completed gigs are in the past (May 2026)
- Invoice dates align with gig dates
- Deposit amounts are realistic (25-40% of total)
- Song durations match real track lengths
- BPM and musical keys are accurate

## Notes

- All currency amounts are stored in cents (1 CZK = 100 cents)
- Phone numbers use Czech format (+420)
- Addresses include Czech postal codes
- Tax rate is set to 21% (Czech DPH)
- All users have verified emails for easier testing
- Passwords are properly hashed with bcrypt (12 rounds)
