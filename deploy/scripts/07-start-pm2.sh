#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS PM2 Startup Script
# Fáze 4: Spuštění aplikací přes PM2
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS PM2 Startup"
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

echo -e "${YELLOW}[1/5] Zastavení existujících PM2 procesů...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
echo -e "${GREEN}PM2 procesy zastaveny${NC}"

echo ""
echo -e "${YELLOW}[2/5] Spouštění aplikací z ecosystem.config.js...${NC}"
pm2 start ecosystem.config.js

echo ""
echo -e "${YELLOW}[3/5] Kontrola stavu aplikací...${NC}"
sleep 3
pm2 status

echo ""
echo -e "${YELLOW}[4/5] Nastavení PM2 autostart při restartu serveru...${NC}"
pm2 startup systemd -u root --hp /root
pm2 save

echo ""
echo -e "${YELLOW}[5/5] Test lokálních endpointů...${NC}"

declare -A APPS=(
    ["GigBook"]="3007"
    ["FitAdmin"]="3006"
    ["ShootFlow"]="3003"
    ["TeamForge"]="3009"
    ["EventPro"]="3005"
    ["PartyPal"]="3002"
)

for app in "${!APPS[@]}"; do
    PORT=${APPS[$app]}
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        echo -e "  $app (localhost:$PORT): ${GREEN}RESPONDING${NC}"
    else
        echo -e "  $app (localhost:$PORT): ${RED}NOT RESPONDING${NC}"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}PM2 startup completed${NC}"
echo ""
echo "  Užitečné PM2 příkazy:"
echo "    pm2 status       - Zobrazit stav aplikací"
echo "    pm2 logs         - Zobrazit logy všech aplikací"
echo "    pm2 logs gigbook - Zobrazit logy konkrétní aplikace"
echo "    pm2 restart all  - Restartovat všechny aplikace"
echo "    pm2 monit        - Real-time monitoring"
echo "═══════════════════════════════════════════════════════════════════"
