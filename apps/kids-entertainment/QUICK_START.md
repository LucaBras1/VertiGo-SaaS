# PartyPal - Quick Start Guide

Get PartyPal running in 5 minutes!

## Prerequisites Check

```bash
node --version   # Should be 18+
pnpm --version   # Should be 8+
psql --version   # PostgreSQL should be installed
```

## Step 1: Install Dependencies

```bash
cd apps/kids-entertainment
pnpm install
```

## Step 2: Setup Database

### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE partypal;

# Exit psql
\q
```

### Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

Add your credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/partypal"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-random-secret-here"
OPENAI_API_KEY="sk-your-openai-key"
```

Generate NextAuth secret:
```bash
openssl rand -base64 32
```

### Initialize Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# (Optional) Seed with sample data
pnpm prisma:seed
```

## Step 3: Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3002`

## Step 4: Access Admin Panel (Coming Soon)

```bash
# Create first admin user (run this script after auth is implemented)
pnpm tsx scripts/create-admin.ts
```

Then login at `http://localhost:3002/admin/login`

## Quick Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build               # Build for production
pnpm start               # Start production server

# Database
pnpm prisma:studio       # Open database GUI
pnpm prisma:generate     # Regenerate Prisma client
pnpm prisma:migrate      # Run migrations

# Quality
pnpm lint                # Run ESLint
pnpm type-check          # Run TypeScript checks
```

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Port Already in Use
```bash
# Kill process on port 3002
npx kill-port 3002

# Or use a different port
pnpm dev -- -p 3003
```

### Prisma Client Not Found
```bash
# Regenerate Prisma client
pnpm prisma:generate
```

### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear TypeScript cache
rm -f tsconfig.tsbuildinfo

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## What's Next?

1. **Explore the Landing Page** - Check out the beautiful homepage at `/`
2. **Read the README** - Full documentation in `README.md`
3. **Check Implementation Status** - See progress in `IMPLEMENTATION_STATUS.md`
4. **Start Building** - Follow the Phase 1 tasks to build admin panel

## Need Help?

- Documentation: `/README.md`
- Implementation Status: `/IMPLEMENTATION_STATUS.md`
- AI Integration Guide: `/../../_docs/AI-INTEGRATION.md`
- Master Guide: `/../../_docs/MASTER-GUIDE.md`

## Test the Landing Page

After starting the dev server, you should see:
- ✅ Colorful gradient background (pink/yellow)
- ✅ Animated party popper icon
- ✅ "Magical Moments, Zero Stress" hero section
- ✅ 6 feature cards
- ✅ 8 popular theme cards
- ✅ Call-to-action sections
- ✅ Full footer

If everything looks good, you're ready to start building! 🎉

---

**Happy Building!** 🚀
