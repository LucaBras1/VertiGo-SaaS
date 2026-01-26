#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Dependencies Installation
# Fáze 1.2: Instalace chybějících nástrojů
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Dependencies Installation"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Update package lists
echo -e "${YELLOW}[1/6] Aktualizace package lists...${NC}"
apt update

# Install Nginx if not present
echo -e "${YELLOW}[2/6] Kontrola a instalace Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    echo -e "${GREEN}Nginx nainstalován${NC}"
else
    echo -e "${GREEN}Nginx již nainstalován${NC}"
fi

# Install PM2 globally
echo -e "${YELLOW}[3/6] Instalace PM2 (process manager)...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}PM2 nainstalován${NC}"
else
    echo -e "${GREEN}PM2 již nainstalován${NC}"
fi

# Install pnpm
echo -e "${YELLOW}[4/6] Instalace pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@8.15.0
    echo -e "${GREEN}pnpm nainstalován${NC}"
else
    echo -e "${GREEN}pnpm již nainstalován${NC}"
fi

# Install certbot for SSL
echo -e "${YELLOW}[5/6] Instalace Certbot pro SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}Certbot nainstalován${NC}"
else
    echo -e "${GREEN}Certbot již nainstalován${NC}"
fi

# Create PM2 log directory
echo -e "${YELLOW}[6/6] Vytvoření adresářů pro logy...${NC}"
mkdir -p /var/log/pm2
chmod 755 /var/log/pm2

# Enable services
echo ""
echo -e "${YELLOW}Povolení služeb při startu...${NC}"
systemctl enable nginx
systemctl enable postgresql

# Start services
echo ""
echo -e "${YELLOW}Spouštění služeb...${NC}"
systemctl start nginx
systemctl start postgresql

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Dependencies installation completed${NC}"
echo "═══════════════════════════════════════════════════════════════════"
