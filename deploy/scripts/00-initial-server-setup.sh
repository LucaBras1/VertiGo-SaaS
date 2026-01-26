#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Initial Server Setup
# TENTO SKRIPT SPUSŤTE JEDNOU MANUÁLNĚ PŘED POUŽITÍM GITHUB ACTIONS
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Initial Server Setup"
echo "  Server: dvi12.vas-server.cz"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="/var/www/vertigo-saas"
REPO_URL="https://github.com/LucaBras1/VertiGo-SaaS.git"

echo -e "${YELLOW}Tento skript provede počáteční nastavení serveru pro VertiGo-SaaS.${NC}"
echo -e "${YELLOW}Po dokončení bude možné používat GitHub Actions pro automatický deployment.${NC}"
echo ""
read -p "Pokračovat? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Přerušeno uživatelem"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════
# FÁZE 1: Instalace závislostí
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[FÁZE 1/6] Instalace systémových závislostí${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

apt update

# Nginx
if ! command -v nginx &> /dev/null; then
    echo "Instaluji Nginx..."
    apt install nginx -y
fi
echo -e "Nginx: ${GREEN}OK${NC}"

# PM2
if ! command -v pm2 &> /dev/null; then
    echo "Instaluji PM2..."
    npm install -g pm2
fi
echo -e "PM2: ${GREEN}OK${NC}"

# pnpm
if ! command -v pnpm &> /dev/null; then
    echo "Instaluji pnpm..."
    npm install -g pnpm@8.15.0
fi
echo -e "pnpm: ${GREEN}OK${NC}"

# Certbot
if ! command -v certbot &> /dev/null; then
    echo "Instaluji Certbot..."
    apt install certbot python3-certbot-nginx -y
fi
echo -e "Certbot: ${GREEN}OK${NC}"

# Create log directories
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

# ═══════════════════════════════════════════════════════════════════
# FÁZE 2: Nastavení databáze
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[FÁZE 2/6] Nastavení PostgreSQL databáze${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DB_NAME="vertigo_saas"
DB_USER="vertigo_user"

echo -e "${YELLOW}Zadejte heslo pro databázového uživatele (nebo prázdné pro přeskočení):${NC}"
read -s DB_PASSWORD
echo ""

if [ -n "$DB_PASSWORD" ]; then
    sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
EOF
    echo -e "Databáze ${DB_NAME}: ${GREEN}VYTVOŘENA${NC}"

    # Store password for later use
    echo "DB_PASSWORD=$DB_PASSWORD" > /root/.vertigo_db_password
    chmod 600 /root/.vertigo_db_password
else
    echo -e "Databáze: ${YELLOW}PŘESKOČENO${NC}"
fi

# ═══════════════════════════════════════════════════════════════════
# FÁZE 3: Klonování repozitáře
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[FÁZE 3/6] Klonování repozitáře${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p $DEPLOY_DIR

if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Repozitář již existuje, aktualizuji..."
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/main
else
    echo "Klonuji repozitář..."
    git clone $REPO_URL $DEPLOY_DIR
fi
cd $DEPLOY_DIR
echo -e "Repozitář: ${GREEN}OK${NC}"

# ═══════════════════════════════════════════════════════════════════
# FÁZE 4: Konfigurace environment variables
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[FÁZE 4/6] Konfigurace environment variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Prompt for secrets
echo -e "${YELLOW}Zadejte OpenAI API klíč:${NC}"
read OPENAI_KEY
echo ""

echo -e "${YELLOW}Zadejte SMTP heslo pro noreply@muzx.cz:${NC}"
read -s SMTP_PASSWORD
echo ""

# Generate NEXTAUTH secrets
NEXTAUTH_SECRET_GIGBOOK=$(openssl rand -base64 32)
NEXTAUTH_SECRET_FITADMIN=$(openssl rand -base64 32)
NEXTAUTH_SECRET_SHOOTFLOW=$(openssl rand -base64 32)
NEXTAUTH_SECRET_TEAMFORGE=$(openssl rand -base64 32)
NEXTAUTH_SECRET_EVENTPRO=$(openssl rand -base64 32)
NEXTAUTH_SECRET_PARTYPAL=$(openssl rand -base64 32)

# Database URL
if [ -f /root/.vertigo_db_password ]; then
    source /root/.vertigo_db_password
fi
DATABASE_URL="postgresql://vertigo_user:${DB_PASSWORD}@localhost:5432/vertigo_saas"

# Create .env.local files for each app
APPS=("musicians:gigbook:3007:$NEXTAUTH_SECRET_GIGBOOK"
      "fitness:fitadmin:3006:$NEXTAUTH_SECRET_FITADMIN"
      "photography:shootflow:3003:$NEXTAUTH_SECRET_SHOOTFLOW"
      "team-building:teamforge:3009:$NEXTAUTH_SECRET_TEAMFORGE"
      "events:eventpro:3005:$NEXTAUTH_SECRET_EVENTPRO"
      "kids-entertainment:partypal:3002:$NEXTAUTH_SECRET_PARTYPAL")

for app_config in "${APPS[@]}"; do
    IFS=':' read -r app_dir app_name app_port app_secret <<< "$app_config"

    cat > "apps/$app_dir/.env.local" << EOF
# Auto-generated production environment
DATABASE_URL="${DATABASE_URL}"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_URL="https://${app_name}.muzx.cz"
NEXTAUTH_SECRET="${app_secret}"
NEXT_PUBLIC_SITE_URL="https://${app_name}.muzx.cz"
OPENAI_API_KEY="${OPENAI_KEY}"
SMTP_HOST="dvi12.vas-server.cz"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@muzx.cz"
SMTP_PASSWORD="${SMTP_PASSWORD}"
EMAIL_FROM="${app_name^} <noreply@muzx.cz>"
NODE_ENV="production"
PORT="${app_port}"
NEXT_PUBLIC_APP_URL="https://${app_name}.muzx.cz"
EOF
    echo -e "apps/$app_dir/.env.local: ${GREEN}VYTVOŘENO${NC}"
done

# ═══════════════════════════════════════════════════════════════════
# FÁZE 5: Build a spuštění
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[FÁZE 5/6] Build aplikací${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd $DEPLOY_DIR

echo "Instaluji dependencies..."
pnpm install --frozen-lockfile

echo "Generuji Prisma klienty..."
cd packages/database && pnpm prisma generate && cd ../..

echo "Inicializuji databázi..."
cd packages/database && pnpm prisma db push && cd ../..

echo "Builduji aplikace..."
pnpm run build

echo -e "Build: ${GREEN}DOKONČEN${NC}"

# ═══════════════════════════════════════════════════════════════════
# FÁZE 6: Nginx a PM2
# ═══════════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}[FÁZE 6/6] Konfigurace Nginx a PM2${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Copy nginx configs
for config in deploy/nginx/*; do
    cp "$config" /etc/nginx/sites-available/
    domain=$(basename "$config")
    ln -sf "/etc/nginx/sites-available/$domain" /etc/nginx/sites-enabled/
    echo -e "Nginx $domain: ${GREEN}OK${NC}"
done

# Test and reload nginx
nginx -t && systemctl reload nginx

# Start PM2
cd $DEPLOY_DIR
pm2 start ecosystem.config.js
pm2 startup systemd -u root --hp /root
pm2 save

echo -e "PM2: ${GREEN}SPUŠTĚNO${NC}"

# ═══════════════════════════════════════════════════════════════════
# HOTOVO
# ═══════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Initial server setup DOKONČEN!${NC}"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "  Další kroky:"
echo ""
echo "  1. Nastavte SSL certifikáty (až po DNS propagaci):"
echo "     ./deploy/scripts/06-setup-ssl.sh"
echo ""
echo "  2. Pro GitHub Actions, přidejte SSH klíč do GitHub Secrets:"
echo "     - Vytvořte SSH klíč: ssh-keygen -t ed25519 -f ~/.ssh/github_deploy"
echo "     - Přidejte veřejný klíč do authorized_keys"
echo "     - Přidejte privátní klíč do GitHub Secrets jako VPS_SSH_KEY"
echo ""
echo "  PM2 status:"
pm2 status
echo ""
echo "═══════════════════════════════════════════════════════════════════"
