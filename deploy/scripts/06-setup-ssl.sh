#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS SSL Certificate Setup
# Fáze 6.2: Vydání SSL certifikátů pomocí Let's Encrypt
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS SSL Certificate Setup"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
EMAIL="admin@muzx.cz"  # Change this to your email
DOMAINS=(
    "gigbook.muzx.cz"
    "fitadmin.muzx.cz"
    "shootflow.muzx.cz"
    "teamforge.muzx.cz"
    "eventpro.muzx.cz"
    "partypal.muzx.cz"
)

echo -e "${YELLOW}DŮLEŽITÉ: Před spuštěním tohoto skriptu se ujistěte, že:${NC}"
echo "  1. DNS A záznamy jsou nastaveny pro všechny subdomény"
echo "  2. DNS propagace proběhla (může trvat až 24 hodin)"
echo "  3. Nginx běží a je nakonfigurován"
echo ""
read -p "Pokračovat? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Přerušeno uživatelem"
    exit 1
fi

echo ""
echo -e "${YELLOW}[1/4] Kontrola DNS záznamů...${NC}"

SERVER_IP="46.234.101.65"
DNS_OK=true

for domain in "${DOMAINS[@]}"; do
    RESOLVED_IP=$(dig +short $domain | head -1)
    if [ "$RESOLVED_IP" == "$SERVER_IP" ]; then
        echo -e "  $domain → $RESOLVED_IP: ${GREEN}OK${NC}"
    else
        echo -e "  $domain → $RESOLVED_IP: ${RED}MISMATCH (expected $SERVER_IP)${NC}"
        DNS_OK=false
    fi
done

if [ "$DNS_OK" = false ]; then
    echo ""
    echo -e "${RED}Některé DNS záznamy nejsou správně nastaveny!${NC}"
    echo "Pokračovat přesto? (některé certifikáty mohou selhat)"
    read -p "(y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}[2/4] Kontrola připojení k doménám...${NC}"

for domain in "${DOMAINS[@]}"; do
    if curl -s --head "http://$domain" > /dev/null 2>&1; then
        echo -e "  $domain: ${GREEN}REACHABLE${NC}"
    else
        echo -e "  $domain: ${YELLOW}NOT REACHABLE (nginx may not be running)${NC}"
    fi
done

echo ""
echo -e "${YELLOW}[3/4] Vydávání SSL certifikátů...${NC}"
echo ""

# Option 1: All domains at once
echo "Možnost 1: Všechny domény najednou"
echo "certbot --nginx -d ${DOMAINS[*]// / -d } --non-interactive --agree-tos --email $EMAIL"
echo ""

# Option 2: Each domain separately
echo "Možnost 2: Každá doména zvlášť (bezpečnější)"
echo ""

for domain in "${DOMAINS[@]}"; do
    echo "Vydávám certifikát pro $domain..."
    certbot --nginx -d $domain --non-interactive --agree-tos --email $EMAIL --redirect || {
        echo -e "${RED}Certifikát pro $domain selhal${NC}"
        continue
    }
    echo -e "${GREEN}Certifikát pro $domain vydán${NC}"
    echo ""
done

echo ""
echo -e "${YELLOW}[4/4] Ověření automatické obnovy certifikátů...${NC}"
certbot renew --dry-run

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}SSL Certificate setup completed${NC}"
echo ""
echo "  Vydané certifikáty:"
certbot certificates
echo ""
echo "  Certifikáty se automaticky obnovují pomocí certbot timer"
echo "═══════════════════════════════════════════════════════════════════"
