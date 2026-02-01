# TeamForge Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/teamforge"

# NextAuth
NEXTAUTH_URL="http://localhost:3009"
NEXTAUTH_SECRET="generate-random-secret-key"

# Admin User
ADMIN_EMAIL="admin@teamforge.local"
ADMIN_PASSWORD="your-secure-password"

# OpenAI (for AI features)
OPENAI_API_KEY="your-openai-api-key"

# Email (Resend - optional but recommended)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="TeamForge <noreply@teamforge.ai>"
```

### 3. Initialize Database

```bash
# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Create admin user
npx tsx scripts/create-admin.ts
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at: **http://localhost:3009**

---

## Login to Admin Panel

After completing the setup, navigate to:

**http://localhost:3009/admin/login**

Login credentials:
- **Email**: `admin@teamforge.local` (or your ADMIN_EMAIL)
- **Password**: `admin123` (or your ADMIN_PASSWORD)

---

## Project Structure

```
apps/team-building/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page with pricing
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── login/          # Login page
│   │   │   ├── programs/       # Programs management
│   │   │   ├── activities/     # Activities management
│   │   │   ├── sessions/       # Sessions management
│   │   │   ├── customers/      # Customers management
│   │   │   ├── orders/         # Orders management
│   │   │   ├── invoices/       # Invoices management
│   │   │   ├── reports/        # Reports & analytics
│   │   │   └── settings/       # Application settings
│   │   └── api/                # API routes
│   │       ├── programs/       # Programs CRUD
│   │       ├── activities/     # Activities CRUD
│   │       ├── sessions/       # Sessions CRUD
│   │       ├── customers/      # Customers CRUD
│   │       └── ai/             # AI endpoints
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── landing/            # Landing page components
│   │   │   └── Navigation.tsx  # Mobile navigation menu
│   │   └── ui/                 # Reusable UI components
│   └── lib/
│       ├── auth.ts             # NextAuth configuration
│       ├── db.ts               # Prisma client
│       ├── email.ts            # Resend email service
│       └── ai-client.ts        # AI services
├── prisma/
│   └── schema.prisma           # Database schema
├── scripts/
│   └── create-admin.ts         # Admin user creation script
└── package.json
```

---

## Branding Colors

TeamForge uses the following brand colors:

- **Corporate Blue**: `#0EA5E9` (Cyan 500) - Primary color
- **Trust Green**: `#22C55E` (Green 500) - Secondary color

These are configured in `tailwind.config.ts` as:
- `brand-primary`
- `brand-secondary`

---

## Available Scripts

```bash
# Development
pnpm dev              # Start development server (port 3009)

# Build
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma:studio    # Open Prisma Studio (database GUI)
pnpm prisma:migrate   # Run database migrations
pnpm prisma:generate  # Generate Prisma client

# Linting & Type Checking
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript compiler check
```

---

## Features Implemented

### Authentication System
- NextAuth.js with credentials provider
- Password hashing with bcrypt
- JWT sessions (30-day expiration)
- Protected admin routes via middleware

### Landing Page
- Hero section with gradient background
- AI features showcase (4 modules)
- 3-tier pricing (Starter, Professional, Enterprise)
- Mobile navigation with HeadlessUI Dialog
- Footer with links

### CRUD Operations
- **Programs**: Full CRUD with activity linking
- **Activities**: Full CRUD with objectives and difficulty levels
- **Sessions**: Full CRUD with AI debrief generation
- **Customers**: Full CRUD with organization tracking
- **Orders**: Full CRUD with invoicing
- **Invoices**: Full CRUD with PDF generation

### Admin Dashboard
- Program management
- Activity management
- Session management with debrief generator
- Customer management
- Orders management
- Invoices management
- Reports & analytics (Recharts + PDF export)
- Settings page

### AI Features
- Debrief generation (GPT-4o)
- Difficulty calibration
- Objective matching
- AI usage tracking

### Email Integration (Resend)
- Welcome emails for new customers
- Session confirmation emails
- Debrief report delivery emails
- Invoice emails with line items
- Graceful fallback when RESEND_API_KEY not set

### UI Components
- Reusable Button component with variants
- Card component
- Input component with error states
- Form components for all entities
- Toast notifications (react-hot-toast)
- Mobile navigation menu

---

## Email Configuration

TeamForge uses [Resend](https://resend.com) for email delivery.

### Setup

1. Create a Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add to `.env`:
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxx"
   EMAIL_FROM="TeamForge <noreply@teamforge.ai>"
   ```

### Email Templates

| Template | When Sent | Contains |
|----------|-----------|----------|
| Welcome | Customer registration | Login link, features overview |
| Session Confirmation | Session created | Date, venue, program, objectives |
| Debrief Report | AI debrief generated | Executive summary, insights, recommendations |
| Invoice | Invoice created | Line items, total, payment due date |

### Testing Emails

If `RESEND_API_KEY` is not set, emails will be logged to console instead of being sent. This is useful for development.

---

## Next Steps

### Add Sample Data (Optional)

You can add sample programs and activities via the admin panel:

1. Login to admin panel
2. Navigate to "Programs" → "New Program"
3. Create a test program
4. Navigate to "Activities" → "New Activity"
5. Create test activities
6. Link activities to programs

### Configure OpenAI (For AI Features)

To enable AI features (debrief generation):

1. Get an OpenAI API key from https://platform.openai.com/
2. Add it to `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```
3. AI features will now work in the admin panel

### Production Deployment

Before deploying to production:

1. Change `NEXTAUTH_SECRET` to a strong random value
2. Change admin credentials
3. Use PostgreSQL (update DATABASE_URL)
4. Set proper CORS and security headers
5. Enable HTTPS (required for NextAuth)
6. Configure Resend with your domain

---

## Troubleshooting

### Database Errors

If you encounter database errors:

```bash
# Reset database (development only)
pnpm prisma migrate reset

# Or manually
rm -rf prisma/migrations
pnpm prisma migrate dev
npx tsx scripts/create-admin.ts
```

### NextAuth Errors

If you get NextAuth errors:

1. Check that `NEXTAUTH_SECRET` is set in `.env`
2. Check that `NEXTAUTH_URL` matches your app URL (http://localhost:3009)
3. Clear browser cookies and try again

### Email Not Sending

If emails are not being sent:

1. Check `RESEND_API_KEY` is set correctly
2. Verify your Resend account is active
3. Check console for error messages
4. Ensure `EMAIL_FROM` domain is verified in Resend

### TypeScript Errors

If you get TypeScript errors:

```bash
# Regenerate Prisma client
pnpm prisma:generate

# Check types
pnpm type-check
```

---

## Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [React Hook Form](https://react-hook-form.com/)

---

## You're All Set!

TeamForge is now ready for development. Visit the admin panel at:

**http://localhost:3009/admin**

Happy building!
