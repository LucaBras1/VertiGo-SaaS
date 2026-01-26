#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# VertiGo-SaaS Production Deployment Script
# ═══════════════════════════════════════════════════════════════════════════════
#
# POUŽITÍ:
# 1. Zkopírujte tento skript na server: scp deploy-production.sh root@dvi12.vas-server.cz:~
# 2. Nastavte proměnné prostředí níže
# 3. Spusťte: chmod +x deploy-production.sh && ./deploy-production.sh
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ═══════════════════════════════════════════════════════════════════════════════
# KONFIGURACE - VYPLŇTE PŘED SPUŠTĚNÍM
# ═══════════════════════════════════════════════════════════════════════════════

# GitHub token pro klonování repozitáře
# DŮLEŽITÉ: Nastavte před spuštěním: export GITHUB_TOKEN="váš_token"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# Databázové heslo (změňte na silné heslo!)
DB_PASSWORD="${DB_PASSWORD:-VertiGo_Saas_Prod_2026!Xyz}"

# OpenAI API klíč
OPENAI_API_KEY="${OPENAI_API_KEY:-}"

# SMTP heslo pro noreply@muzx.cz
SMTP_PASSWORD="${SMTP_PASSWORD:-Vg#2026NoReply!Sx8Zm@Qw}"

# ═══════════════════════════════════════════════════════════════════════════════
# KONSTANTY
# ═══════════════════════════════════════════════════════════════════════════════

DEPLOY_DIR="/var/www/vertigo-saas"
REPO_URL="https://${GITHUB_TOKEN}@github.com/LucaBras1/VertiGo-SaaS.git"
DB_NAME="vertigo_saas"
DB_USER="vertigo_user"
SERVER_IP="46.234.101.65"

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ═══════════════════════════════════════════════════════════════════════════════
# FUNKCE
# ═══════════════════════════════════════════════════════════════════════════════

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[KROK $1] $2${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Tento skript musí být spuštěn jako root"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# VALIDACE
# ═══════════════════════════════════════════════════════════════════════════════

print_header "VertiGo-SaaS Production Deployment"

check_root

echo "Kontrola konfigurace..."

if [ -z "$GITHUB_TOKEN" ]; then
    print_error "GITHUB_TOKEN není nastaven!"
    echo "Nastavte: export GITHUB_TOKEN=\"váš_github_token\""
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    print_warning "OPENAI_API_KEY není nastaven - AI funkce nebudou fungovat"
    echo -n "Chcete pokračovat bez OpenAI? (y/n): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Zadejte OpenAI API klíč:"
        read -r OPENAI_API_KEY
    fi
fi

echo ""
echo "Konfigurace deploymentu:"
echo "  - Deploy adresář: $DEPLOY_DIR"
echo "  - Databáze: $DB_NAME"
echo "  - DB uživatel: $DB_USER"
echo "  - Server IP: $SERVER_IP"
echo "  - SMTP: noreply@muzx.cz"
echo ""
echo -n "Pokračovat s deploymentem? (y/n): "
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Deployment přerušen"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 1: INSTALACE ZÁVISLOSTÍ
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 1: Instalace Systémových Závislostí"

print_step "1.1" "Aktualizace systému..."
apt update -y

print_step "1.2" "Kontrola Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js není nainstalován!"
    exit 1
fi
node_version=$(node --version)
print_success "Node.js: $node_version"

print_step "1.3" "Kontrola PostgreSQL..."
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL není nainstalován!"
    exit 1
fi
pg_version=$(psql --version)
print_success "PostgreSQL: $pg_version"

print_step "1.4" "Instalace Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
fi
print_success "Nginx nainstalován"

print_step "1.5" "Instalace PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
print_success "PM2 nainstalován"

print_step "1.6" "Instalace pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@8.15.0
fi
print_success "pnpm nainstalován"

print_step "1.7" "Instalace Certbot..."
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
fi
print_success "Certbot nainstalován"

print_step "1.8" "Vytvoření log adresářů..."
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2
print_success "Log adresáře vytvořeny"

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 2: DATABÁZE
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 2: Konfigurace PostgreSQL Databáze"

print_step "2.1" "Vytváření databáze a uživatele..."

# Zkontrolovat jestli databáze existuje
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Databáze $DB_NAME již existuje"
else
    sudo -u postgres psql << EOF
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
EOF
    print_success "Databáze $DB_NAME vytvořena"
fi

print_step "2.2" "Konfigurace PostgreSQL pro localhost..."
PG_CONF=$(find /etc/postgresql -name "postgresql.conf" 2>/dev/null | head -1)
if [ -f "$PG_CONF" ]; then
    if ! grep -q "^listen_addresses = 'localhost'" "$PG_CONF"; then
        sed -i "s/^#listen_addresses.*/listen_addresses = 'localhost'/" "$PG_CONF"
        sed -i "s/^listen_addresses.*/listen_addresses = 'localhost'/" "$PG_CONF"
    fi
fi
print_success "PostgreSQL nakonfigurován"

print_step "2.3" "Restart PostgreSQL..."
systemctl restart postgresql
print_success "PostgreSQL restartován"

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 3: KLONOVÁNÍ REPOZITÁŘE
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 3: Klonování Repozitáře"

print_step "3.1" "Vytváření deployment adresáře..."
mkdir -p $DEPLOY_DIR

print_step "3.2" "Klonování/aktualizace repozitáře..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    print_warning "Repozitář již existuje, provádím aktualizaci..."
    cd $DEPLOY_DIR
    # Aktualizovat remote URL s tokenem
    git remote set-url origin "$REPO_URL"
    git fetch origin
    git reset --hard origin/main
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
fi
cd $DEPLOY_DIR
print_success "Repozitář naklonován/aktualizován"

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 4: ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 4: Konfigurace Environment Variables"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

# Generování NEXTAUTH secrets
NEXTAUTH_SECRET_GIGBOOK=$(openssl rand -base64 32)
NEXTAUTH_SECRET_FITADMIN=$(openssl rand -base64 32)
NEXTAUTH_SECRET_SHOOTFLOW=$(openssl rand -base64 32)
NEXTAUTH_SECRET_TEAMFORGE=$(openssl rand -base64 32)
NEXTAUTH_SECRET_EVENTPRO=$(openssl rand -base64 32)
NEXTAUTH_SECRET_PARTYPAL=$(openssl rand -base64 32)

# Aplikace a jejich konfigurace
declare -A APPS
APPS["musicians"]="gigbook:3007:$NEXTAUTH_SECRET_GIGBOOK"
APPS["fitness"]="fitadmin:3006:$NEXTAUTH_SECRET_FITADMIN"
APPS["photography"]="shootflow:3003:$NEXTAUTH_SECRET_SHOOTFLOW"
APPS["team-building"]="teamforge:3009:$NEXTAUTH_SECRET_TEAMFORGE"
APPS["events"]="eventpro:3005:$NEXTAUTH_SECRET_EVENTPRO"
APPS["kids-entertainment"]="partypal:3002:$NEXTAUTH_SECRET_PARTYPAL"

for app_dir in "${!APPS[@]}"; do
    IFS=':' read -r app_name app_port app_secret <<< "${APPS[$app_dir]}"

    # Capitalize first letter for email FROM
    app_name_cap="${app_name^}"

    print_step "4.x" "Vytváření .env.local pro $app_dir..."

    cat > "apps/$app_dir/.env.local" << EOF
# ═══════════════════════════════════════════════════════════════════
# Production Environment - ${app_name_cap}
# Auto-generated: $(date)
# ═══════════════════════════════════════════════════════════════════

# Database
DATABASE_URL="${DATABASE_URL}"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_URL="https://${app_name}.muzx.cz"
NEXTAUTH_SECRET="${app_secret}"
NEXT_PUBLIC_SITE_URL="https://${app_name}.muzx.cz"

# OpenAI
OPENAI_API_KEY="${OPENAI_API_KEY}"

# Email (SMTP)
SMTP_HOST="dvi12.vas-server.cz"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@muzx.cz"
SMTP_PASSWORD="${SMTP_PASSWORD}"
EMAIL_FROM="${app_name_cap} <noreply@muzx.cz>"

# App Configuration
NODE_ENV="production"
PORT="${app_port}"
NEXT_PUBLIC_APP_NAME="${app_name_cap}"
NEXT_PUBLIC_APP_URL="https://${app_name}.muzx.cz"
EOF

    print_success "apps/$app_dir/.env.local vytvořen"
done

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 5: BUILD
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 5: Build Aplikací"

cd $DEPLOY_DIR

print_step "5.1" "Instalace dependencies..."
pnpm install --frozen-lockfile

print_step "5.2" "Generování Prisma klientů..."
# Hlavní database package
if [ -f "packages/database/prisma/schema.prisma" ]; then
    cd packages/database
    pnpm prisma generate
    cd $DEPLOY_DIR
fi

# Per-app Prisma klienti
for app_dir in "${!APPS[@]}"; do
    if [ -f "apps/$app_dir/prisma/schema.prisma" ]; then
        print_step "5.2.x" "Generating Prisma client for $app_dir..."
        cd "apps/$app_dir"
        npx prisma generate 2>/dev/null || true
        cd $DEPLOY_DIR
    fi
done
print_success "Prisma klienti vygenerováni"

print_step "5.3" "Inicializace databáze..."
cd packages/database
export DATABASE_URL="$DATABASE_URL"
pnpm prisma db push --accept-data-loss 2>/dev/null || pnpm prisma db push
cd $DEPLOY_DIR
print_success "Databáze inicializována"

print_step "5.4" "Build všech aplikací..."
pnpm run build
print_success "Build dokončen"

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 6: NGINX KONFIGURACE
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 6: Nginx Konfigurace"

print_step "6.1" "Kopírování Nginx konfigurace..."
for config in deploy/nginx/*; do
    if [ -f "$config" ]; then
        domain=$(basename "$config")
        cp "$config" /etc/nginx/sites-available/
        ln -sf "/etc/nginx/sites-available/$domain" /etc/nginx/sites-enabled/
        print_success "Nginx config: $domain"
    fi
done

print_step "6.2" "Dočasná HTTP konfigurace pro SSL..."
# Vytvořit dočasné HTTP-only konfigurace pro certbot
for domain in gigbook fitadmin shootflow teamforge eventpro partypal; do
    cat > "/etc/nginx/sites-available/${domain}.muzx.cz.tmp" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${domain}.muzx.cz;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF
    # Aktivovat dočasnou konfiguraci
    rm -f "/etc/nginx/sites-enabled/${domain}.muzx.cz"
    ln -sf "/etc/nginx/sites-available/${domain}.muzx.cz.tmp" "/etc/nginx/sites-enabled/${domain}.muzx.cz"
done

print_step "6.3" "Test Nginx konfigurace..."
nginx -t

print_step "6.4" "Reload Nginx..."
systemctl reload nginx
print_success "Nginx nakonfigurován"

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 7: PM2 SPUŠTĚNÍ
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 7: PM2 Process Manager"

cd $DEPLOY_DIR

print_step "7.1" "Zastavení existujících procesů..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

print_step "7.2" "Spuštění aplikací..."
pm2 start ecosystem.config.js

print_step "7.3" "Nastavení PM2 autostart..."
pm2 startup systemd -u root --hp /root
pm2 save

print_step "7.4" "Čekání na spuštění aplikací (30s)..."
sleep 30

print_step "7.5" "Kontrola stavu aplikací..."
pm2 status

# Zkontrolovat, že aplikace běží
for port in 3002 3003 3005 3006 3007 3009; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        print_success "Port $port: běží"
    else
        print_warning "Port $port: není dostupný (může se stále spouštět)"
    fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 8: SSL CERTIFIKÁTY
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 8: SSL Certifikáty"

print_step "8.1" "Kontrola DNS záznamů..."
DNS_OK=true
for domain in gigbook fitadmin shootflow teamforge eventpro partypal; do
    RESOLVED_IP=$(dig +short ${domain}.muzx.cz 2>/dev/null | head -1)
    if [ "$RESOLVED_IP" == "$SERVER_IP" ]; then
        print_success "${domain}.muzx.cz → $RESOLVED_IP"
    else
        print_warning "${domain}.muzx.cz → $RESOLVED_IP (očekáváno $SERVER_IP)"
        DNS_OK=false
    fi
done

if [ "$DNS_OK" = true ]; then
    print_step "8.2" "Vydávání SSL certifikátů..."
    for domain in gigbook fitadmin shootflow teamforge eventpro partypal; do
        echo "Vydávám certifikát pro ${domain}.muzx.cz..."
        certbot --nginx -d ${domain}.muzx.cz --non-interactive --agree-tos --email admin@muzx.cz --redirect || {
            print_warning "Certifikát pro ${domain}.muzx.cz selhal (možná potřeba počkat na DNS propagaci)"
        }
    done

    print_step "8.3" "Obnovení plné Nginx konfigurace..."
    for domain in gigbook fitadmin shootflow teamforge eventpro partypal; do
        rm -f "/etc/nginx/sites-enabled/${domain}.muzx.cz"
        rm -f "/etc/nginx/sites-available/${domain}.muzx.cz.tmp"
        if [ -f "$DEPLOY_DIR/deploy/nginx/${domain}.muzx.cz" ]; then
            cp "$DEPLOY_DIR/deploy/nginx/${domain}.muzx.cz" /etc/nginx/sites-available/
            ln -sf "/etc/nginx/sites-available/${domain}.muzx.cz" /etc/nginx/sites-enabled/
        fi
    done
    nginx -t && systemctl reload nginx
else
    print_warning "DNS záznamy nejsou správně nastaveny. SSL certifikáty přeskočeny."
    print_warning "Po propagaci DNS spusťte: ./deploy/scripts/06-setup-ssl.sh"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# FÁZE 9: FIREWALL
# ═══════════════════════════════════════════════════════════════════════════════

print_header "FÁZE 9: Firewall (UFW)"

print_step "9.1" "Konfigurace UFW..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

print_step "9.2" "Aktivace UFW..."
echo "y" | ufw enable
print_success "Firewall aktivován"

ufw status

# ═══════════════════════════════════════════════════════════════════════════════
# HOTOVO
# ═══════════════════════════════════════════════════════════════════════════════

print_header "DEPLOYMENT DOKONČEN"

echo ""
echo "  Aplikace jsou dostupné na:"
echo ""
echo "  🎸 GigBook:    https://gigbook.muzx.cz"
echo "  💪 FitAdmin:   https://fitadmin.muzx.cz"
echo "  📷 ShootFlow:  https://shootflow.muzx.cz"
echo "  👥 TeamForge:  https://teamforge.muzx.cz"
echo "  🎉 EventPro:   https://eventpro.muzx.cz"
echo "  🎈 PartyPal:   https://partypal.muzx.cz"
echo ""
echo "  PM2 příkazy:"
echo "    pm2 status      - stav aplikací"
echo "    pm2 logs        - logy všech aplikací"
echo "    pm2 monit       - real-time monitoring"
echo "    pm2 restart all - restart všech aplikací"
echo ""
echo "  Aktualizace:"
echo "    cd $DEPLOY_DIR && ./deploy/scripts/09-update-deploy.sh"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════════${NC}"

# Finální status
pm2 status
