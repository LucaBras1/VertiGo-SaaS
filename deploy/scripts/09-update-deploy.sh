#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Update Deployment Script
# Pro rutinní aktualizace po změnách v kódu
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Update Deployment"
echo "  $(date)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="/var/www/vertigo-saas"

cd $DEPLOY_DIR

echo -e "${YELLOW}[1/6] Stahování nejnovějších změn z Git...${NC}"
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}Git pull completed${NC}"

echo ""
echo -e "${YELLOW}[2/6] Instalace nových dependencies...${NC}"
pnpm install --frozen-lockfile
echo -e "${GREEN}Dependencies installed${NC}"

echo ""
echo -e "${YELLOW}[3/6] Generování Prisma clientů...${NC}"
cd packages/database
pnpm prisma generate
cd $DEPLOY_DIR

# Generate for each app
APPS=("musicians" "fitness" "photography" "team-building" "events" "kids-entertainment")
for app in "${APPS[@]}"; do
    if [ -f "apps/$app/prisma/schema.prisma" ]; then
        cd "apps/$app"
        npx prisma generate
        cd $DEPLOY_DIR
    fi
done
echo -e "${GREEN}Prisma clients generated${NC}"

echo ""
echo -e "${YELLOW}[4/6] Aplikace databázových migrací...${NC}"
cd packages/database
pnpm prisma migrate deploy 2>/dev/null || pnpm prisma db push
cd $DEPLOY_DIR
echo -e "${GREEN}Database migrations applied${NC}"

echo ""
echo -e "${YELLOW}[5/6] Build aplikací...${NC}"
pnpm run build
echo -e "${GREEN}Build completed${NC}"

echo ""
echo -e "${YELLOW}[6/6] Reload PM2 aplikací...${NC}"
pm2 reload all --update-env
echo -e "${GREEN}PM2 reloaded${NC}"

echo ""
echo -e "${YELLOW}Kontrola stavu aplikací...${NC}"
pm2 status

echo ""
echo -e "${YELLOW}Posledních 20 řádků z logů...${NC}"
pm2 logs --lines 20 --nostream

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Update deployment completed${NC}"
echo "  $(date)"
echo "═══════════════════════════════════════════════════════════════════"
