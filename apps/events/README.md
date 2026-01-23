# EventPro - Professional Event Management Platform

**Status**: ✅ **PRODUCTION READY**

EventPro is a comprehensive event management SaaS platform powered by AI, designed for professional event planners, venues, and entertainment coordinators.

## 🎨 Branding

- **Primary Color**: Professional Purple (#8b5cf6)
- **Accent Color**: Vibrant Orange (#f97316)
- **Target Audience**: Event planners, coordinators, entertainment agencies
- **Value Proposition**: AI-powered timeline optimization + seamless coordination

## ✨ Key Features

### 🤖 AI-Powered Features
- **Timeline Optimizer**: Generate optimized event schedules considering performer dependencies, setup times, and guest flow
- **Budget Optimizer**: Smart budget allocation across categories with cost-saving recommendations
- **Guest Experience Analyzer**: Predict satisfaction and get improvement suggestions

### 📅 Event Management
- Multi-event dashboard with status tracking
- Venue management with capacity and restrictions
- Client relationship management
- Task management with priorities and deadlines

### 🎭 Performer Management
- Comprehensive performer roster
- Availability tracking
- Booking coordination with call times
- Performance history and ratings

### 📊 Analytics & Reporting
- Event statistics and trends
- Budget tracking and cost analysis
- Guest satisfaction metrics
- Revenue reporting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key (for AI features)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials.

3. **Initialize database**:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3005](http://localhost:3005)

## 📁 Project Structure

```
apps/events/
├── prisma/
│   └── schema.prisma          # Database schema (multi-tenant)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page (purple/orange branding)
│   │   ├── login/             # Authentication
│   │   ├── signup/
│   │   └── dashboard/         # Main application
│   │       ├── page.tsx       # Dashboard overview
│   │       ├── events/        # Event management
│   │       ├── performers/    # Performer roster
│   │       ├── venues/        # Venue management
│   │       └── clients/       # Client management
│   ├── components/
│   │   └── timeline-generator.tsx  # AI timeline UI
│   └── lib/
│       └── ai/
│           ├── timeline-optimizer.ts        # AI timeline generation
│           ├── budget-optimizer.ts          # AI budget allocation
│           └── guest-experience-analyzer.ts # AI experience prediction
├── package.json
├── tailwind.config.js         # Purple/orange theme
├── next.config.js
└── tsconfig.json
```

## 🗄️ Database Schema

### Core Models
- **Tenant**: Multi-tenant isolation
- **User**: Authentication and authorization
- **Event**: Event details, status, timeline
- **Performer**: Talent roster with specialties
- **Booking**: Performer-event assignments
- **Venue**: Venue details and restrictions
- **Client**: Client management
- **EventTask**: Task tracking

## 🤖 AI Modules

### 1. Timeline Optimizer (`timeline-optimizer.ts`)
Generates optimized event schedules:
- Considers performer setup/breakdown times
- Manages dependencies between acts
- Optimizes guest experience flow
- Creates contingency plans
- Generates call sheets

**Input**: Event details, performers, venue constraints
**Output**: Complete timeline with call times and contingencies

### 2. Budget Optimizer (`budget-optimizer.ts`)
Smart budget allocation:
- Industry-standard percentage distribution
- Category-wise breakdown
- Cost-saving recommendations
- Alternative scenarios
- Per-guest cost analysis

**Input**: Total budget, event type, guest count
**Output**: Detailed allocation with recommendations

### 3. Guest Experience Analyzer (`guest-experience-analyzer.ts`)
Predicts guest satisfaction:
- Analyzes entertainment mix
- Evaluates venue comfort
- Assesses logistics
- Predicts NPS score
- Suggests improvements

**Input**: Event components, venue, timing
**Output**: Satisfaction score with improvement suggestions

## 🎨 UI Components

### Landing Page
- Hero with AI badge
- Feature grid (6 features)
- How it works (4 steps)
- Social proof section
- CTA sections
- Professional footer

### Dashboard
- Overview with stats
- Upcoming events list
- Quick actions
- Task management
- Activity feed

### Events Management
- Filterable event list
- Status tracking
- Budget monitoring
- Timeline generation

### Performers Management
- Visual performer cards
- Rating system
- Booking interface
- Contact management

## 🔐 Authentication

Authentication is handled via NextAuth.js with:
- Email/password login
- OAuth providers (Google, Microsoft)
- Session management
- Role-based access control

## 📱 Responsive Design

Fully responsive across:
- Desktop (1024px+)
- Tablet (640px - 1024px)
- Mobile (< 640px)

## 🚢 Deployment

### Build for production:
```bash
npm run build
```

### Database migrations:
```bash
npm run prisma:migrate
```

### Environment setup:
- Set `NODE_ENV=production`
- Configure `DATABASE_URL`
- Set `NEXTAUTH_SECRET`
- Add `OPENAI_API_KEY` for AI features

## 🔧 Configuration

### Tailwind Theme
Purple/orange color scheme configured in `tailwind.config.js`

### Next.js Config
- Transpiles shared packages
- Image optimization enabled
- Port: 3005

## 📄 License

Part of VertiGo SaaS Platform
© 2024 VertiGo. All rights reserved.

## 🤝 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@eventpro.com

---

**Built with**: Next.js 14, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL
