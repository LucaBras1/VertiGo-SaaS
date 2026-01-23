# Divadlo Studna - Nový Web

Moderní, responzivní web pro Divadlo Studna s kompletním administračním rozhraním.

## 🚀 Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **CMS:** Sanity.io (headless CMS)
- **UI Komponenty:** shadcn/ui
- **Formuláře:** React Hook Form + Zod
- **Email:** Resend
- **Hosting:** Vercel

## 📁 Struktura projektu

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React komponenty
│   │   ├── ui/             # shadcn/ui komponenty
│   │   ├── layout/         # Header, Footer, Nav
│   │   ├── home/           # Homepage komponenty
│   │   ├── performance/    # Repertoár komponenty
│   │   ├── program/        # Program/Ferman komponenty
│   │   ├── forms/          # Formuláře
│   │   └── shared/         # Sdílené komponenty
│   ├── lib/                # Utility funkce
│   │   ├── sanity/         # Sanity client & queries
│   │   ├── utils.ts        # Helper funkce
│   │   └── constants.ts    # Konstanty
│   └── types/              # TypeScript typy
├── public/                 # Statické soubory
├── sanity/                 # Sanity CMS (bude vytvořeno)
└── package.json
```

## 🛠️ Instalace

```bash
# Nainstalovat dependencies
npm install

# Vytvořit .env.local soubor (zkopírovat z .env.local.example)
cp .env.local.example .env.local

# Spustit dev server
npm run dev
```

Web poběží na `http://localhost:3000`

## 📝 Fáze vývoje

### ✅ Fáze 0: Setup projektu (HOTOVO)
- [x] Next.js projekt vytvořen
- [x] Tailwind CSS nakonfigurován
- [x] Design tokens nastaveny
- [x] Základní struktura složek
- [ ] Dependencies nainstalovány
- [ ] Sanity projekt vytvořen

### 🔄 Fáze 1: Sanity Schema & Admin (V PŘÍPRAVĚ)
- [ ] Vytvoření schemas (Performance, Event, Game, Post, TeamMember, Page, Settings)
- [ ] Konfigurace Sanity Studio
- [ ] Import obsahu ze starého webu
- [ ] Testování admin panelu

### ⏳ Fáze 2-9: Následující fáze
Viz `/docs/plan.md` pro kompletní plán

## 🎨 Design System

### Barvy
- **Primary Red:** `#D32F2F` (hlavní akcent)
- **Primary Dark:** `#B71C1C` (hover stavy)
- **Secondary Warm:** `#FFA726` (zvýraznění)
- **Neutral Black:** `#1A1A1A` (text)
- **Neutral Gray:** `#757575` (sekundární text)

### Typografie
- **Sans-serif:** Inter (primární font)
- **Serif:** Playfair Display (nadpisy, hero)

### Breakpointy
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px
- **2xl:** 1536px

## 📚 Dostupné scripty

```bash
npm run dev          # Spustit dev server
npm run build        # Build pro produkci
npm run start        # Spustit production build
npm run lint         # Spustit ESLint
npm run type-check   # TypeScript type checking
```

## 🔐 Environment Variables

Vytvořte `.env.local` soubor s následujícími proměnnými:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
SANITY_REVALIDATE_SECRET=your_webhook_secret

# Email (Resend)
RESEND_API_KEY=re_your_api_key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📖 Dokumentace

- [Kompletní plán projektu](../docs/plan.md)
- [Design systém a audit](../docs/audit-and-design.md)
- [Sanity schemas](./sanity/schemas/)

## 👥 Kontakty

- **Produkce:** Klaudie Kašparová - produkce@divadlo-studna.cz
- **Ředitel:** Pepíno Kašpar - pepino@divadlo-studna.cz

---

## 🚧 Status projektu

**Aktuální fáze:** Fáze 0 - Setup projektu
**Poslední update:** ${new Date().toLocaleDateString('cs-CZ')}
**Verze:** 1.0.0

Projekt je ve vývoji podle schváleného plánu. Viz todo list v kódu pro aktuální progres.
