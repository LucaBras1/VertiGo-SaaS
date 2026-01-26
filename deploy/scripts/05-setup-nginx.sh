#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Nginx Configuration
# Fáze 5: Nastavení Nginx reverse proxy
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Nginx Configuration"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DEPLOY_DIR="/var/www/vertigo-saas"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Subdomains configuration
declare -A SUBDOMAINS=(
    ["gigbook.muzx.cz"]="3007"
    ["fitadmin.muzx.cz"]="3006"
    ["shootflow.muzx.cz"]="3003"
    ["teamforge.muzx.cz"]="3009"
    ["eventpro.muzx.cz"]="3005"
    ["partypal.muzx.cz"]="3002"
)

echo -e "${YELLOW}[1/4] Kopírování Nginx konfiguračních souborů...${NC}"

# Copy nginx configs from deploy folder
if [ -d "$DEPLOY_DIR/deploy/nginx" ]; then
    for domain in "${!SUBDOMAINS[@]}"; do
        if [ -f "$DEPLOY_DIR/deploy/nginx/$domain" ]; then
            cp "$DEPLOY_DIR/deploy/nginx/$domain" "$NGINX_AVAILABLE/"
            echo -e "  $domain: ${GREEN}COPIED${NC}"
        else
            echo -e "  $domain: ${YELLOW}NOT FOUND in deploy/nginx${NC}"
        fi
    done
else
    echo -e "${RED}Deploy nginx folder not found!${NC}"
    echo "Creating basic nginx configs..."

    for domain in "${!SUBDOMAINS[@]}"; do
        PORT=${SUBDOMAINS[$domain]}
        cat > "$NGINX_AVAILABLE/$domain" << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $domain;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        echo -e "  $domain: ${GREEN}CREATED (basic)${NC}"
    done
fi

echo ""
echo -e "${YELLOW}[2/4] Vytváření symbolických linků...${NC}"

for domain in "${!SUBDOMAINS[@]}"; do
    if [ -f "$NGINX_AVAILABLE/$domain" ]; then
        # Remove existing symlink if exists
        rm -f "$NGINX_ENABLED/$domain"
        # Create new symlink
        ln -s "$NGINX_AVAILABLE/$domain" "$NGINX_ENABLED/"
        echo -e "  $domain: ${GREEN}LINKED${NC}"
    fi
done

echo ""
echo -e "${YELLOW}[3/4] Testování Nginx konfigurace...${NC}"
if nginx -t; then
    echo -e "${GREEN}Nginx konfigurace je validní${NC}"
else
    echo -e "${RED}Nginx konfigurace obsahuje chyby!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}[4/4] Reload Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}Nginx reloaded${NC}"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Nginx configuration completed${NC}"
echo ""
echo "  Nakonfigurované subdomény:"
for domain in "${!SUBDOMAINS[@]}"; do
    echo "    - $domain → localhost:${SUBDOMAINS[$domain]}"
done
echo ""
echo "  Další krok: Nastavte DNS A záznamy a spusťte SSL setup"
echo "═══════════════════════════════════════════════════════════════════"
