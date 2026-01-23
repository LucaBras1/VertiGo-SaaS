# TeamForge Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="generate-random-secret-key"
ADMIN_EMAIL="admin@teamforge.local"
ADMIN_PASSWORD="your-secure-password"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Create admin user
npx tsx scripts/create-admin.ts
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3002**

---

## 🔐 Login to Admin Panel

After completing the setup, navigate to:

**http://localhost:3002/admin/login**

Login credentials:
- **Email**: `admin@teamforge.local` (or your ADMIN_EMAIL)
- **Password**: `admin123` (or your ADMIN_PASSWORD)

---

## 📁 Project Structure

```
apps/team-building/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── login/          # Login page
│   │   │   ├── programs/       # Programs management
│   │   │   ├── activities/     # Activities management
│   │   │   ├── sessions/       # Sessions management
│   │   │   ├── customers/      # Customers management
│   │   │   ├── reports/        # Reports & analytics
│   │   │   └── settings/       # Application settings
│   │   ├── api/                # API routes
│   │   │   ├── programs/       # Programs CRUD
│   │   │   ├── activities/     # Activities CRUD
│   │   │   ├── sessions/       # Sessions CRUD
│   │   │   ├── customers/      # Customers CRUD
│   │   │   └── ai/             # AI endpoints
│   │   └── layout.tsx
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   │   ├── ProgramForm.tsx
│   │   │   ├── ActivityForm.tsx
│   │   │   ├── SessionForm.tsx
│   │   │   └── CustomerForm.tsx
│   │   └── ui/                 # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── db.ts               # Prisma client
│   │   ├── utils.ts
│   │   └── ai/                 # AI services
│   └── middleware.ts           # Route protection
├── prisma/
│   └── schema.prisma           # Database schema
├── scripts/
│   └── create-admin.ts         # Admin user creation script
└── package.json
```

---

## 🎨 Branding Colors

TeamForge uses the following brand colors:

- **Corporate Blue**: `#0EA5E9` (Cyan 500) - Primary color
- **Trust Green**: `#22C55E` (Green 500) - Secondary color

These are configured in `tailwind.config.ts` as:
- `brand-primary`
- `brand-secondary`

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma client

# Linting & Type Checking
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check
```

---

## 📊 Features Implemented

### ✅ Authentication System
- NextAuth.js with credentials provider
- Password hashing with bcrypt
- JWT sessions
- Protected admin routes via middleware

### ✅ CRUD Operations
- **Programs**: Full CRUD with activity linking
- **Activities**: Full CRUD with objectives and difficulty levels
- **Sessions**: Full CRUD with AI debrief generation
- **Customers**: Full CRUD with organization tracking

### ✅ Admin Dashboard
- Program management
- Activity management
- Session management with debrief generator
- Customer management
- Reports & analytics
- Settings page

### ✅ AI Features
- Debrief generation (GPT-4o)
- Difficulty calibration endpoint
- Objective matching endpoint
- AI usage tracking

### ✅ UI Components
- Reusable Button component with variants
- Card component
- Input component with error states
- Form components for all entities
- Toast notifications (react-hot-toast)

---

## 🔄 Next Steps

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
   ```
   OPENAI_API_KEY="sk-..."
   ```
3. AI features will now work in the admin panel

### Production Deployment

Before deploying to production:

1. ✅ Change `NEXTAUTH_SECRET` to a strong random value
2. ✅ Change admin credentials
3. ✅ Use PostgreSQL instead of SQLite (update DATABASE_URL)
4. ✅ Set proper CORS and security headers
5. ✅ Enable HTTPS (required for NextAuth)

---

## 🐛 Troubleshooting

### Database Errors

If you encounter database errors:

```bash
# Reset database
rm prisma/dev.db
npm run prisma:migrate
npx tsx scripts/create-admin.ts
```

### NextAuth Errors

If you get NextAuth errors:

1. Check that `NEXTAUTH_SECRET` is set in `.env`
2. Check that `NEXTAUTH_URL` matches your app URL
3. Clear browser cookies and try again

### TypeScript Errors

If you get TypeScript errors:

```bash
# Regenerate Prisma client
npm run prisma:generate

# Check types
npm run type-check
```

---

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)

---

## 🎉 You're All Set!

TeamForge is now ready for development. Visit the admin panel at:

**http://localhost:3002/admin**

Happy building! 🚀
