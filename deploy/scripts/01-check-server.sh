#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Server Check Script
# Fáze 1: Ověření serveru a kontrola portů
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Server Check"
echo "  Server: dvi12.vas-server.cz"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check versions
echo -e "${YELLOW}[1/5] Kontrola nainstalovaného software...${NC}"
echo ""

echo -n "Node.js: "
if command -v node &> /dev/null; then
    node --version
else
    echo -e "${RED}NOT INSTALLED${NC}"
fi

echo -n "npm: "
if command -v npm &> /dev/null; then
    npm --version
else
    echo -e "${RED}NOT INSTALLED${NC}"
fi

echo -n "pnpm: "
if command -v pnpm &> /dev/null; then
    pnpm --version
else
    echo -e "${YELLOW}NOT INSTALLED (will install)${NC}"
fi

echo -n "PM2: "
if command -v pm2 &> /dev/null; then
    pm2 --version
else
    echo -e "${YELLOW}NOT INSTALLED (will install)${NC}"
fi

echo -n "PostgreSQL: "
if command -v psql &> /dev/null; then
    psql --version
else
    echo -e "${RED}NOT INSTALLED${NC}"
fi

echo -n "Redis: "
if command -v redis-cli &> /dev/null; then
    redis-cli --version
else
    echo -e "${YELLOW}NOT INSTALLED (optional)${NC}"
fi

echo -n "Nginx: "
if command -v nginx &> /dev/null; then
    nginx -v 2>&1
else
    echo -e "${RED}NOT INSTALLED${NC}"
fi

echo -n "Certbot: "
if command -v certbot &> /dev/null; then
    certbot --version
else
    echo -e "${YELLOW}NOT INSTALLED (will install)${NC}"
fi

echo ""
echo -e "${YELLOW}[2/5] Kontrola běžících služeb...${NC}"
echo ""

systemctl is-active --quiet nginx && echo -e "Nginx: ${GREEN}RUNNING${NC}" || echo -e "Nginx: ${RED}STOPPED${NC}"
systemctl is-active --quiet postgresql && echo -e "PostgreSQL: ${GREEN}RUNNING${NC}" || echo -e "PostgreSQL: ${RED}STOPPED${NC}"
systemctl is-active --quiet redis-server 2>/dev/null && echo -e "Redis: ${GREEN}RUNNING${NC}" || echo -e "Redis: ${YELLOW}STOPPED or NOT INSTALLED${NC}"

echo ""
echo -e "${YELLOW}[3/5] Kontrola obsazených portů (kritické)...${NC}"
echo ""

# Define required ports
PORTS=(3002 3003 3005 3006 3007 3008 3009)
PORT_NAMES=("PartyPal" "ShootFlow" "EventPro" "FitAdmin" "GigBook" "StageManager" "TeamForge")

echo "Požadované porty pro VertiGo-SaaS aplikace:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}

    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PROCESS=$(lsof -Pi :$PORT -sTCP:LISTEN | awk 'NR>1 {print $1}' | head -1)
        echo -e "Port $PORT ($NAME): ${RED}OBSAZEN${NC} - služba: $PROCESS"
    else
        echo -e "Port $PORT ($NAME): ${GREEN}VOLNÝ${NC}"
    fi
done

echo ""
echo -e "${YELLOW}[4/5] Disk space check...${NC}"
echo ""
df -h / | tail -1

echo ""
echo -e "${YELLOW}[5/5] Memory check...${NC}"
echo ""
free -h

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "  Server check completed"
echo "═══════════════════════════════════════════════════════════════════"
