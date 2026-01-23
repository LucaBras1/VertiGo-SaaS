#!/bin/bash
set -e

echo "========================================"
echo "  Divadlo Studna VPS Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="divadlostudna.muzx.cz"
APP_DIR="/var/www/divadlostudna.cz"

# 1. Create directory structure
echo -e "${BLUE}[1/7] Creating directory structure...${NC}"
mkdir -p $APP_DIR/standalone
mkdir -p $APP_DIR/data
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/html  # For Let's Encrypt challenge

echo -e "${GREEN}  Directory structure created${NC}"

# 2. Install Node.js 20
echo -e "${BLUE}[2/7] Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${YELLOW}  Node.js already installed: $(node --version)${NC}"
fi

echo -e "${GREEN}  Node.js $(node --version)${NC}"
echo -e "${GREEN}  npm $(npm --version)${NC}"

# 3. Install PM2
echo -e "${BLUE}[3/7] Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp /home/$USER 2>/dev/null || pm2 startup systemd
    pm2 save
else
    echo -e "${YELLOW}  PM2 already installed${NC}"
fi

echo -e "${GREEN}  PM2 installed${NC}"

# 4. Configure Nginx
echo -e "${BLUE}[4/7] Configuring Nginx...${NC}"

# Install Nginx if not present
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx
fi

NGINX_CONFIG="/etc/nginx/sites-available/divadlostudna.cz"
sudo tee $NGINX_CONFIG > /dev/null <<EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root $APP_DIR/html;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log $APP_DIR/logs/access.log;
    error_log $APP_DIR/logs/error.log;

    # Next.js app on port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files cache
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
EOF

# Create symlink
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/

# Create temporary HTTP-only config for initial SSL setup
sudo tee /etc/nginx/sites-available/divadlostudna-temp.conf > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root $APP_DIR/html;
    }

    location / {
        return 200 'Server is being configured...';
        add_header Content-Type text/plain;
    }
}
EOF

echo -e "${GREEN}  Nginx configured${NC}"

# 5. Install Certbot
echo -e "${BLUE}[5/7] Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
else
    echo -e "${YELLOW}  Certbot already installed${NC}"
fi

echo -e "${GREEN}  Certbot installed${NC}"

# 6. Configure firewall
echo -e "${BLUE}[6/7] Configuring firewall...${NC}"
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable 2>/dev/null || true

echo -e "${GREEN}  Firewall configured${NC}"

# 7. Create .env template
echo -e "${BLUE}[7/7] Creating .env template...${NC}"
cat > $APP_DIR/standalone/.env <<EOF
# ===========================================
# Divadlo Studna - Production Environment
# ===========================================

# Database (SQLite)
DATABASE_URL=file:/var/www/divadlostudna.cz/data/database.db

# NextAuth.js
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=CHANGE_THIS_TO_YOUR_SECRET

# Site URL
NEXT_PUBLIC_SITE_URL=https://$DOMAIN

# SMTP Email (configure in admin panel or here)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
EMAIL_TO=

# Cron Jobs Security
CRON_SECRET=CHANGE_THIS_TO_RANDOM_STRING

# Node
NODE_ENV=production
PORT=3000
EOF

echo -e "${GREEN}  .env template created${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================"
echo -e "  VPS Setup Complete!"
echo -e "========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Configure DNS A record:"
echo "   Point $DOMAIN to this server's IP"
echo ""
echo "2. Wait for DNS propagation, then get SSL certificate:"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "3. Edit .env file with your values:"
echo "   nano $APP_DIR/standalone/.env"
echo ""
echo "4. Test Nginx configuration:"
echo "   sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo "5. Deploy from GitHub or run manually:"
echo "   cd $APP_DIR/standalone"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "6. Check status:"
echo "   pm2 status"
echo "   pm2 logs divadlo-studna"
echo ""
