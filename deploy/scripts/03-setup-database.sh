#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# VertiGo-SaaS Database Setup
# Fáze 1.3: Konfigurace PostgreSQL databáze
# ═══════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  VertiGo-SaaS Database Setup"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DB_NAME="vertigo_saas"
DB_USER="vertigo_user"

# Prompt for password
echo -e "${YELLOW}Zadejte silné heslo pro databázového uživatele:${NC}"
read -s DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Heslo nemůže být prázdné!${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/4] Vytváření databáze a uživatele...${NC}"

# Create database and user
sudo -u postgres psql << EOF
-- Drop if exists (for re-running)
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};

-- Create user with password
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';

-- Create database
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Connect to database and grant schema privileges
\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
EOF

echo -e "${GREEN}Databáze ${DB_NAME} vytvořena${NC}"
echo -e "${GREEN}Uživatel ${DB_USER} vytvořen${NC}"

echo ""
echo -e "${YELLOW}[2/4] Konfigurace PostgreSQL pro localhost...${NC}"

# Ensure PostgreSQL only listens on localhost
PG_CONF="/etc/postgresql/15/main/postgresql.conf"
if grep -q "^listen_addresses" $PG_CONF; then
    sed -i "s/^listen_addresses.*/listen_addresses = 'localhost'/" $PG_CONF
else
    echo "listen_addresses = 'localhost'" >> $PG_CONF
fi
echo -e "${GREEN}PostgreSQL nakonfigurován pro localhost${NC}"

echo ""
echo -e "${YELLOW}[3/4] Restart PostgreSQL...${NC}"
systemctl restart postgresql
echo -e "${GREEN}PostgreSQL restartován${NC}"

echo ""
echo -e "${YELLOW}[4/4] Test připojení...${NC}"
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -c "SELECT 1 as connection_test;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Připojení k databázi funguje!${NC}"
else
    echo -e "${RED}Připojení k databázi selhalo!${NC}"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Database setup completed${NC}"
echo ""
echo "  DATABASE_URL pro .env soubory:"
echo "  postgresql://${DB_USER}:YOUR_PASSWORD@localhost:5432/${DB_NAME}"
echo "═══════════════════════════════════════════════════════════════════"
