#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Application Deployment
# Fáze 3: Deployment aplikace na server
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Application Deployment"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="/var/www/vertigo-saas"
REPO_URL="https://github.com/LucaBras1/VertiGo-SaaS.git"

echo -e "${YELLOW}[1/7] Vytváření deployment adresáře...${NC}"
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

echo -e "${YELLOW}[2/7] Klonování/aktualizace repozitáře...${NC}"
if [ -d ".git" ]; then
    echo "Repozitář již existuje, provádím pull..."
    git fetch origin
    git reset --hard origin/main
else
    echo "Klonování repozitáře..."
    git clone $REPO_URL .
fi

echo -e "${GREEN}Repozitář aktualizován${NC}"

echo ""
echo -e "${YELLOW}[3/7] Kopírování .env.production souborů...${NC}"
echo -e "${RED}DŮLEŽITÉ: Ujistěte se, že .env.production soubory jsou nakonfigurované!${NC}"
echo ""

# Check for .env.production files
APPS=("musicians" "fitness" "photography" "team-building" "events" "kids-entertainment")
for app in "${APPS[@]}"; do
    if [ -f "apps/$app/.env.production" ]; then
        echo -e "  apps/$app/.env.production: ${GREEN}EXISTS${NC}"
        # Copy to .env.local for Next.js
        cp "apps/$app/.env.production" "apps/$app/.env.local"
    else
        echo -e "  apps/$app/.env.production: ${RED}MISSING${NC}"
    fi
done

echo ""
echo -e "${YELLOW}[4/7] Instalace dependencies...${NC}"
pnpm install --frozen-lockfile

echo ""
echo -e "${YELLOW}[5/7] Generování Prisma clientů...${NC}"
cd packages/database
pnpm prisma generate
cd $DEPLOY_DIR

# Generate prisma client for each app with local schema
for app in "${APPS[@]}"; do
    if [ -f "apps/$app/prisma/schema.prisma" ]; then
        echo "Generating Prisma client for $app..."
        cd "apps/$app"
        npx prisma generate
        cd $DEPLOY_DIR
    fi
done

echo ""
echo -e "${YELLOW}[6/7] Build aplikací...${NC}"
pnpm run build

echo ""
echo -e "${YELLOW}[7/7] Inicializace databáze...${NC}"
cd packages/database

# Push schema to database
pnpm prisma db push

# Or run migrations if they exist
# pnpm prisma migrate deploy

cd $DEPLOY_DIR

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Application deployment completed${NC}"
echo ""
echo "  Další krok: Spusťte PM2 pomocí:"
echo "  cd $DEPLOY_DIR && pm2 start ecosystem.config.js"
echo "═══════════════════════════════════════════════════════════════════"
