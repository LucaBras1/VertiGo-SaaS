# VertiGo-SaaS Deployment Guide

Kompletní návod pro nasazení VertiGo-SaaS na VPS server dvi12.vas-server.cz.

## Přehled Aplikací a Subdomén

| Aplikace | Subdoména | Port | Priorita |
|----------|-----------|------|----------|
| GigBook (musicians) | gigbook.muzx.cz | 3007 | P1 |
| FitAdmin (fitness) | fitadmin.muzx.cz | 3006 | P1 |
| ShootFlow (photography) | shootflow.muzx.cz | 3003 | P2 |
| TeamForge (team-building) | teamforge.muzx.cz | 3009 | P2 |
| EventPro (events) | eventpro.muzx.cz | 3005 | P3 |
| PartyPal (kids-entertainment) | partypal.muzx.cz | 3002 | P3 |
| StageManager (performing-arts) | stagemanager.muzx.cz | 3008 | P4 (budoucnost) |

## Server Specifikace

- **Server:** dvi12.vas-server.cz
- **IP:** 46.234.101.65
- **OS:** Ubuntu/Debian
- **Node.js:** v20.20.0
- **PostgreSQL:** 15.15
- **Redis:** Nainstalován

## Quick Start

### 1. Připojení k serveru
```bash
ssh root@dvi12.vas-server.cz
```

### 2. Spuštění deployment skriptů (v pořadí)
```bash
# Naklonovat repozitář (nebo stáhnout skripty)
cd /var/www
git clone https://github.com/LucaBras1/VertiGo-SaaS.git vertigo-saas
cd vertigo-saas

# Učinit skripty spustitelnými
chmod +x deploy/scripts/*.sh

# Spustit skripty v pořadí
./deploy/scripts/01-check-server.sh      # Kontrola serveru a portů
./deploy/scripts/02-install-deps.sh       # Instalace závislostí
./deploy/scripts/03-setup-database.sh     # Nastavení PostgreSQL
./deploy/scripts/04-deploy-app.sh         # Deployment aplikace
./deploy/scripts/05-setup-nginx.sh        # Nginx konfigurace
./deploy/scripts/06-setup-ssl.sh          # SSL certifikáty
./deploy/scripts/07-start-pm2.sh          # Spuštění PM2
./deploy/scripts/08-setup-firewall.sh     # Firewall (volitelné)
```

## Podrobný Postup

### Fáze 1: Příprava Serveru

#### 1.1 Kontrola prostředí
```bash
./deploy/scripts/01-check-server.sh
```

Zkontroluje:
- Nainstalovaný software (Node.js, npm, PostgreSQL, Redis, Nginx)
- Běžící služby
- Obsazené porty
- Volné místo na disku
- Dostupnou paměť

#### 1.2 Instalace závislostí
```bash
./deploy/scripts/02-install-deps.sh
```

Nainstaluje:
- Nginx (pokud chybí)
- PM2 (process manager)
- pnpm
- Certbot (pro SSL)

### Fáze 2: Databáze

```bash
./deploy/scripts/03-setup-database.sh
```

Vytvoří:
- Databázi `vertigo_saas`
- Uživatele `vertigo_user`
- Nastaví práva

**DŮLEŽITÉ:** Zapamatujte si heslo, které zadáte!

### Fáze 3: Deployment Aplikace

**PŘED spuštěním:** Aktualizujte `.env.production` soubory v `apps/*/` s reálnými hodnotami:

```bash
# Vygenerovat NEXTAUTH_SECRET pro každou aplikaci
openssl rand -base64 32
```

Pak spusťte:
```bash
./deploy/scripts/04-deploy-app.sh
```

### Fáze 4: Nginx

```bash
./deploy/scripts/05-setup-nginx.sh
```

### Fáze 5: DNS

Přidejte A záznamy pro všechny subdomény:

```
gigbook.muzx.cz    → 46.234.101.65
fitadmin.muzx.cz   → 46.234.101.65
shootflow.muzx.cz  → 46.234.101.65
teamforge.muzx.cz  → 46.234.101.65
eventpro.muzx.cz   → 46.234.101.65
partypal.muzx.cz   → 46.234.101.65
```

### Fáze 6: SSL

Po propagaci DNS (počkejte alespoň 30 minut):
```bash
./deploy/scripts/06-setup-ssl.sh
```

### Fáze 7: Spuštění Aplikací

```bash
./deploy/scripts/07-start-pm2.sh
```

### Fáze 8: Firewall (volitelné)

```bash
./deploy/scripts/08-setup-firewall.sh
```

## Aktualizace Aplikací

Pro rutinní aktualizace po změnách v kódu:

```bash
./deploy/scripts/09-update-deploy.sh
```

Nebo manuálně:
```bash
cd /var/www/vertigo-saas
git pull origin main
pnpm install
pnpm run build
pm2 reload all --update-env
```

## Monitoring

### PM2 příkazy
```bash
pm2 status           # Stav aplikací
pm2 logs             # Logy všech aplikací
pm2 logs gigbook     # Logy konkrétní aplikace
pm2 monit            # Real-time monitoring
pm2 restart all      # Restart všech aplikací
```

### Nginx logy
```bash
tail -f /var/log/nginx/gigbook.access.log
tail -f /var/log/nginx/gigbook.error.log
```

### PostgreSQL
```bash
sudo -u postgres psql -d vertigo_saas
```

## Troubleshooting

### Aplikace neběží
```bash
pm2 logs [app-name] --lines 100
pm2 restart [app-name]
```

### 502 Bad Gateway
```bash
nginx -t                    # Test konfigurace
pm2 status                  # Ověřit, že app běží
netstat -tuln | grep [PORT] # Ověřit port
```

### SSL problémy
```bash
certbot renew --force-renewal
nginx -t && systemctl reload nginx
```

### Databázové problémy
```bash
systemctl status postgresql
psql -U vertigo_user -d vertigo_saas -h localhost
```

## Struktura Souborů

```
deploy/
├── nginx/                    # Nginx konfigurace pro subdomény
│   ├── gigbook.muzx.cz
│   ├── fitadmin.muzx.cz
│   ├── shootflow.muzx.cz
│   ├── teamforge.muzx.cz
│   ├── eventpro.muzx.cz
│   └── partypal.muzx.cz
├── scripts/                  # Deployment skripty
│   ├── 01-check-server.sh
│   ├── 02-install-deps.sh
│   ├── 03-setup-database.sh
│   ├── 04-deploy-app.sh
│   ├── 05-setup-nginx.sh
│   ├── 06-setup-ssl.sh
│   ├── 07-start-pm2.sh
│   ├── 08-setup-firewall.sh
│   └── 09-update-deploy.sh
└── README.md                 # Tento soubor

ecosystem.config.js           # PM2 konfigurace (v rootu projektu)
apps/*/.env.production        # Production environment variables
```

## Environment Variables

Každá aplikace vyžaduje vlastní `.env.production` soubor. Šablona:

```env
# Database (sdílená)
DATABASE_URL=postgresql://vertigo_user:PASSWORD@localhost:5432/vertigo_saas

# Redis
REDIS_URL=redis://localhost:6379

# Auth (UNIKÁTNÍ pro každou aplikaci!)
NEXTAUTH_URL=https://[subdomain].muzx.cz
NEXTAUTH_SECRET=[UNIQUE_SECRET]

# OpenAI (sdílené)
OPENAI_API_KEY=sk-...

# Email (sdílené)
RESEND_API_KEY=re_...
EMAIL_FROM=AppName <noreply@muzx.cz>

# Stripe (per-app nebo sdílené)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
NODE_ENV=production
PORT=[APP_PORT]
NEXT_PUBLIC_APP_NAME=[APP_NAME]
NEXT_PUBLIC_APP_URL=https://[subdomain].muzx.cz
```

## Bezpečnost

- `.env.production` soubory NIKDY necommitovat do Gitu
- NEXTAUTH_SECRET musí být unikátní pro každou aplikaci
- PostgreSQL a Redis poslouchají pouze na localhost
- UFW firewall povoluje pouze 22, 80, 443

## Kontakt

V případě problémů kontaktujte administrátora.
