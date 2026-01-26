#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Firewall Configuration
# Fáze 7: UFW firewall setup
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Firewall Configuration"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}VAROVÁNÍ: Tento skript konfiguruje firewall.${NC}"
echo "Ujistěte se, že máte alternativní přístup k serveru (console)."
echo ""
read -p "Pokračovat? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Přerušeno uživatelem"
    exit 1
fi

echo ""
echo -e "${YELLOW}[1/6] Instalace UFW (pokud není nainstalován)...${NC}"
apt install ufw -y

echo ""
echo -e "${YELLOW}[2/6] Reset UFW na výchozí nastavení...${NC}"
ufw --force reset

echo ""
echo -e "${YELLOW}[3/6] Nastavení výchozích pravidel...${NC}"
ufw default deny incoming
ufw default allow outgoing

echo ""
echo -e "${YELLOW}[4/6] Povolení potřebných portů...${NC}"

# SSH (critical - always first!)
ufw allow 22/tcp
echo -e "  Port 22 (SSH): ${GREEN}ALLOWED${NC}"

# HTTP
ufw allow 80/tcp
echo -e "  Port 80 (HTTP): ${GREEN}ALLOWED${NC}"

# HTTPS
ufw allow 443/tcp
echo -e "  Port 443 (HTTPS): ${GREEN}ALLOWED${NC}"

# PostgreSQL - only from localhost (no external access needed)
# ufw allow from 127.0.0.1 to any port 5432
echo -e "  Port 5432 (PostgreSQL): ${YELLOW}LOCALHOST ONLY (default)${NC}"

# Redis - only from localhost
# ufw allow from 127.0.0.1 to any port 6379
echo -e "  Port 6379 (Redis): ${YELLOW}LOCALHOST ONLY (default)${NC}"

# Node.js app ports - NOT exposed externally (nginx handles this)
echo -e "  Ports 3002-3009 (Apps): ${YELLOW}NOT EXPOSED (nginx proxy)${NC}"

echo ""
echo -e "${YELLOW}[5/6] Aktivace firewallu...${NC}"
echo "y" | ufw enable

echo ""
echo -e "${YELLOW}[6/6] Kontrola stavu firewallu...${NC}"
ufw status verbose

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Firewall configuration completed${NC}"
echo ""
echo "  Povolené porty:"
echo "    - 22/tcp (SSH)"
echo "    - 80/tcp (HTTP)"
echo "    - 443/tcp (HTTPS)"
echo ""
echo "  Interní služby (localhost only):"
echo "    - PostgreSQL (5432)"
echo "    - Redis (6379)"
echo "    - Node.js apps (3002-3009)"
echo "═══════════════════════════════════════════════════════════════════"
