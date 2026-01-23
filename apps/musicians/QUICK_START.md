# GigBook Quick Start Guide 🚀

## 🎯 What You Have Now

A **fully functional frontend** for GigBook with:
- ✅ Landing page
- ✅ Dashboard with navigation
- ✅ All main pages (Gigs, Setlists, Repertoire, Clients, Invoices)
- ✅ AI modules ready for integration
- ✅ API routes structure
- ✅ Mock data for testing

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd apps/musicians
pnpm install
```

### 2. Run Development Server
```bash
pnpm dev
```

### 3. Open Browser
```
http://localhost:3002
```

**That's it!** The app is now running with mock data.

---

## 🧭 Navigation Guide

### Landing Page
- **URL:** `http://localhost:3002`
- **Features:** Hero section, features showcase, CTA buttons
- **Actions:** Click "Get Started" or "Sign In"

### Sign In (Mock)
- **URL:** `http://localhost:3002/auth/signin`
- **Credentials:** Any email + any password (mock auth)
- **Action:** Submit form → redirects to dashboard

### Dashboard
- **URL:** `http://localhost:3002/dashboard`
- **Features:**
  - Stats overview (4 cards)
  - Upcoming gigs list
  - AI suggestions widget
  - Quick actions (New Gig, Generate Setlist)

### Pages

| Page | URL | Features |
|------|-----|----------|
| **Gigs** | `/dashboard/gigs` | List view, filters, search, stats |
| **Setlists** | `/dashboard/setlists` | Grid view, AI badge, mood indicators |
| **Generate Setlist** | `/dashboard/setlists/generate` | AI form with event details |
| **Repertoire** | `/dashboard/repertoire` | Song catalog table |
| **Clients** | `/dashboard/clients` | CRM cards with revenue tracking |
| **Invoices** | `/dashboard/invoices` | Invoice list with status |

---

## 🎨 What to Test

### UI/UX Testing
1. **Responsive Design**
   - Resize browser window
   - Check mobile menu (hamburger icon)
   - Test on tablet/mobile devices

2. **Navigation**
   - Click all sidebar links
   - Check active state highlighting
   - Test back button behavior

3. **Interactions**
   - Hover states on cards
   - Button click feedback
   - Form input validation

### AI Features (Mock Data)
1. **Setlist Generator**
   - Go to `/dashboard/setlists/generate`
   - Fill form with event details
   - Click "Generate Setlist"
   - Check console for generated data

2. **API Endpoints (Test with curl/Postman)**
   ```bash
   # Generate Setlist
   curl -X POST http://localhost:3002/api/ai/setlist/generate \
     -H "Content-Type: application/json" \
     -d '{
       "eventType": "wedding",
       "duration": 180,
       "numberOfSets": 2,
       "breakDuration": 15,
       "mood": "romantic",
       "repertoire": [
         {"title": "Perfect", "artist": "Ed Sheeran", "duration": 263, "mood": "romantic"}
       ]
     }'

   # Calculate Pricing
   curl -X POST http://localhost:3002/api/ai/pricing/calculate \
     -H "Content-Type: application/json" \
     -d '{
       "eventType": "wedding",
       "location": {"city": "Prague", "country": "CZ"},
       "date": "2026-06-15",
       "duration": 240,
       "bandSize": 5,
       "experienceLevel": "professional"
     }'
   ```

---

## 🔧 Configuration

### Environment Variables (Optional for now)
```bash
# Copy example file
cp .env.example .env.local

# Edit with your values
DATABASE_URL="postgresql://..." # Not needed yet
NEXTAUTH_SECRET="your-secret"   # Not needed yet
OPENAI_API_KEY="sk-..."         # Not needed yet
```

### TypeScript Check
```bash
pnpm type-check
```

### Linting
```bash
pnpm lint
```

### Build for Production
```bash
pnpm build
```

---

## 📦 Mock Data Structure

All mock data is inline in components. Here's what's available:

### Gigs
```typescript
{
  id: '1',
  title: 'Wedding - Smith & Johnson',
  eventType: 'wedding',
  status: 'confirmed',
  date: '2026-02-15',
  venue: 'Grand Hotel Prague',
  price: 45000,
  client: 'Emma Smith'
}
```

### Setlists
```typescript
{
  id: '1',
  name: 'Wedding - Smith & Johnson',
  status: 'finalized',
  totalDuration: 180,
  songCount: 24,
  mood: 'romantic',
  aiGenerated: true
}
```

### Repertoire
```typescript
{
  id: '1',
  title: 'Thinking Out Loud',
  artist: 'Ed Sheeran',
  genre: 'Pop',
  mood: 'romantic',
  duration: 281,
  key: 'D',
  bpm: 79,
  timesPerformed: 45
}
```

### Clients
```typescript
{
  id: '1',
  name: 'Emma Smith',
  email: 'emma@example.com',
  type: 'individual',
  totalGigs: 3,
  totalRevenue: 135000,
  rating: 5
}
```

### Invoices
```typescript
{
  id: 'INV-001',
  gigTitle: 'Wedding - Smith & Johnson',
  amount: 45000,
  status: 'paid',
  dueDate: '2026-02-15'
}
```

---

## 🐛 Troubleshooting

### Port 3002 already in use
```bash
# Kill process on port 3002
npx kill-port 3002

# Or use different port
pnpm dev -- -p 3003
```

### Module not found errors
```bash
# Clean install
rm -rf node_modules .next
pnpm install
```

### TypeScript errors
```bash
# Check for errors
pnpm type-check

# Most common: missing dependencies
pnpm install
```

### Styles not loading
```bash
# Rebuild Tailwind
pnpm dev
# Then hard refresh browser (Ctrl+Shift+R)
```

---

## 🎯 Next Development Steps

### 1. Connect Database (Backend)
```bash
# Setup PostgreSQL
# Update DATABASE_URL in .env.local
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio # View database
```

### 2. Add Authentication (Backend)
```bash
# Configure NextAuth.js
# Add auth providers
# Protect routes with middleware
```

### 3. Replace Mock Data (Backend)
```typescript
// Example: Fetch real gigs
const gigs = await prisma.gig.findMany({
  where: { tenantId: session.user.tenantId },
  orderBy: { eventDate: 'desc' }
})
```

### 4. Integrate OpenAI (AI Engineer)
```typescript
// In AI modules, replace mock with:
import { createAIClient } from '@vertigo/ai-core'

const ai = createAIClient({ apiKey: process.env.OPENAI_API_KEY })
const response = await ai.chatStructured(...)
```

---

## 📚 File Structure Reference

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (signin, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/                # Reusable UI components
└── lib/                   # Utilities and logic
    ├── ai/                # AI modules
    └── utils.ts           # Helper functions
```

---

## 🎨 Design Tokens

### Colors
```css
--primary: #7C3AED      /* Purple */
--secondary: #3B82F6    /* Blue */
--success: #059669      /* Green */
--warning: #EAB308      /* Yellow */
--danger: #DC2626       /* Red */
```

### Typography
```css
font-family: 'Inter', sans-serif
font-sizes: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
```

### Spacing
```css
gap-3, gap-4, gap-6    /* Flex/Grid gaps */
p-4, p-6               /* Padding */
mb-4, mb-6, mb-8       /* Margins */
```

---

## 🚀 Performance Tips

### Current Bundle Size (Estimated)
- Next.js: ~180KB
- React: ~100KB
- Tailwind CSS: ~20KB (purged)
- **Total:** ~300KB (gzipped)

### Optimization
- Server Components by default
- Lazy loading with `next/dynamic`
- Image optimization with `next/image`
- Font optimization with `next/font`

---

## 📞 Support

### Common Issues
1. **Page not found** → Check URL spelling
2. **Styles broken** → Clear `.next` folder and rebuild
3. **API 500 error** → Check console logs
4. **Mock data not showing** → Hard refresh browser

### Resources
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

**Happy Coding! 🎸**

For detailed implementation status, see `IMPLEMENTATION_COMPLETE.md`
