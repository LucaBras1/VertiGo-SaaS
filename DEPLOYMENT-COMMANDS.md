# VertiGo-SaaS Deployment Commands

SSH to server: `ssh root@dvi12.vas-server.cz`

## Completed Steps (already done)
1. Local fixes committed and pushed
2. Git pull on server done
3. Prisma generate for all apps done
4. Build started with: `nohup pnpm run build > /tmp/vertigo-build2.log 2>&1 &`

## Check Build Status
```bash
# Check if build is still running
ps aux | grep pnpm

# View build log
tail -100 /tmp/vertigo-build2.log

# Check for errors
grep -i "error\|failed" /tmp/vertigo-build2.log
```

## After Build Completes - Start PM2
```bash
cd /var/www/vertigo-saas

# Create log directory
mkdir -p /var/log/pm2

# Stop any existing instances
pm2 kill

# Start all apps
pm2 start ecosystem.config.js

# Verify status
pm2 status

# Check logs
pm2 logs --lines 50

# Enable startup on reboot
pm2 startup
pm2 save
```

## Nginx Configuration (if not done)
```bash
# GigBook (musicians)
cat > /etc/nginx/sites-available/gigbook.muzx.cz << 'EOF'
server {
    listen 80;
    server_name gigbook.muzx.cz;

    location / {
        proxy_pass http://localhost:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# FitAdmin (fitness)
cat > /etc/nginx/sites-available/fitadmin.muzx.cz << 'EOF'
server {
    listen 80;
    server_name fitadmin.muzx.cz;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# ShootFlow (photography)
cat > /etc/nginx/sites-available/shootflow.muzx.cz << 'EOF'
server {
    listen 80;
    server_name shootflow.muzx.cz;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# TeamForge (team-building)
cat > /etc/nginx/sites-available/teamforge.muzx.cz << 'EOF'
server {
    listen 80;
    server_name teamforge.muzx.cz;

    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# EventPro (events)
cat > /etc/nginx/sites-available/eventpro.muzx.cz << 'EOF'
server {
    listen 80;
    server_name eventpro.muzx.cz;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# PartyPal (kids-entertainment)
cat > /etc/nginx/sites-available/partypal.muzx.cz << 'EOF'
server {
    listen 80;
    server_name partypal.muzx.cz;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable all sites
ln -sf /etc/nginx/sites-available/gigbook.muzx.cz /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/fitadmin.muzx.cz /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/shootflow.muzx.cz /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/teamforge.muzx.cz /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/eventpro.muzx.cz /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/partypal.muzx.cz /etc/nginx/sites-enabled/

# Test and reload
nginx -t && systemctl reload nginx
```

## SSL Certificates
```bash
certbot --nginx \
  -d gigbook.muzx.cz \
  -d fitadmin.muzx.cz \
  -d shootflow.muzx.cz \
  -d teamforge.muzx.cz \
  -d eventpro.muzx.cz \
  -d partypal.muzx.cz

# Test auto-renewal
certbot renew --dry-run
```

## DNS Records (via VPS Centrum or manually)
Add A records pointing to 46.234.101.65:
- gigbook.muzx.cz
- fitadmin.muzx.cz
- shootflow.muzx.cz
- teamforge.muzx.cz
- eventpro.muzx.cz
- partypal.muzx.cz

## Port Mapping
| App | Subdomain | Port |
|-----|-----------|------|
| GigBook (musicians) | gigbook.muzx.cz | 3007 |
| FitAdmin (fitness) | fitadmin.muzx.cz | 3006 |
| ShootFlow (photography) | shootflow.muzx.cz | 3003 |
| TeamForge (team-building) | teamforge.muzx.cz | 3009 |
| EventPro (events) | eventpro.muzx.cz | 3005 |
| PartyPal (kids-entertainment) | partypal.muzx.cz | 3010 |

## Verification Commands
```bash
# Check all apps are running
pm2 status

# Test local endpoints
for port in 3003 3005 3006 3007 3009 3010; do
  curl -s -o /dev/null -w "Port $port: %{http_code}\n" http://localhost:$port
done

# Test external endpoints (after DNS propagation)
for domain in gigbook fitadmin shootflow teamforge eventpro partypal; do
  curl -sI "https://${domain}.muzx.cz" | head -1
done
```
