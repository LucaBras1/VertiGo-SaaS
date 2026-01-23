# VPS Setup Guide - Divadlo Studna

## Předpoklady

- Přístup k VPS přes SSH
- Ubuntu/Debian server
- Root nebo sudo přístup

## Automatický Setup

1. **Připojte se k VPS:**
   ```bash
   ssh username@your-vps-ip
   ```

2. **Stáhněte a spusťte setup script:**
   ```bash
   wget https://raw.githubusercontent.com/LucaBras1/divadlo-studna-web/main/setup-vps.sh
   chmod +x setup-vps.sh
   sudo ./setup-vps.sh
   ```

3. **Následujte pokyny na konci scriptu**

## Co script nainstaluje

- ✅ Node.js 20.x
- ✅ PM2 process manager
- ✅ Nginx reverse proxy (port 80/443 → 3000)
- ✅ Certbot pro SSL certifikáty
- ✅ Firewall pravidla (UFW)
- ✅ Složky pro aplikaci

## Po instalaci

### 1. Získejte SSL certifikát
```bash
sudo certbot --nginx -d divadlo-studna.cz -d www.divadlo-studna.cz
```

### 2. Upravte environment proměnné
```bash
nano /var/www/divadlostudna.cz/standalone/.env
```

Vyplňte:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=váš_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=váš_api_token
NODE_ENV=production
PORT=3000
```

### 3. Restartujte Nginx
```bash
sudo systemctl restart nginx
```

## GitHub Secrets

Na GitHubu nastavte tyto secrets: https://github.com/LucaBras1/divadlo-studna-web/settings/secrets/actions

| Secret | Hodnota |
|--------|---------|
| `VPS_HOST` | IP adresa nebo hostname vašeho VPS |
| `VPS_USER` | SSH uživatel (např. `root`) |
| `VPS_SSH_KEY` | Privátní SSH klíč pro přístup |
| `VPS_PORT` | SSH port (obvykle `22`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID Sanity projektu |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset (obvykle `production`) |
| `SANITY_API_TOKEN` | Sanity API token |

### Jak získat SSH klíč

**Na vašem lokálním počítači:**
```bash
# Vygenerujte nový SSH klíč (pokud ještě nemáte)
ssh-keygen -t ed25519 -C "github-actions@divadlo-studna"

# Zkopírujte veřejný klíč na VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub username@vps-ip

# Zobrazte privátní klíč pro GitHub Secret
cat ~/.ssh/id_ed25519
```

Obsah `id_ed25519` vložte do GitHub Secret `VPS_SSH_KEY`.

## Deployment

Po nastavení secrets se každý push do `main` větve automaticky deployuje:

1. GitHub Actions buildne aplikaci
2. Pošle na VPS
3. Restartuje PM2

## Užitečné příkazy

```bash
# Zobrazit status aplikace
pm2 status

# Zobrazit logy
pm2 logs divadlo-studna

# Restartovat aplikaci
pm2 restart divadlo-studna

# Zastavit aplikaci
pm2 stop divadlo-studna

# Zobrazit Nginx logy
sudo tail -f /var/www/divadlostudna.cz/logs/access.log
sudo tail -f /var/www/divadlostudna.cz/logs/error.log

# Testovat Nginx konfiguraci
sudo nginx -t

# Restartovat Nginx
sudo systemctl restart nginx

# Status Nginx
sudo systemctl status nginx
```

## Troubleshooting

### Aplikace nenastartuje
```bash
pm2 logs divadlo-studna
# Zkontrolujte .env soubor
cat /var/www/divadlostudna.cz/standalone/.env
```

### Nginx Error 502 Bad Gateway
```bash
# Zkontrolujte, zda běží Node.js app
pm2 status
# Zkontrolujte, zda naslouchá na portu 3000
sudo netstat -tulpn | grep 3000
```

### SSL problémy
```bash
# Obnovte certifikát
sudo certbot renew
sudo systemctl restart nginx
```

## Manuální první deploy

Pokud chcete otestovat před automatickým deploy:

```bash
cd /var/www/divadlostudna.cz/standalone
git clone https://github.com/LucaBras1/divadlo-studna-web.git temp
cd temp
npm ci
npm run build
cp -r .next/standalone/* /var/www/divadlostudna.cz/standalone/
cp -r .next/static /var/www/divadlostudna.cz/standalone/.next/
cp -r public /var/www/divadlostudna.cz/standalone/
cp ecosystem.config.js /var/www/divadlostudna.cz/standalone/
cd /var/www/divadlostudna.cz/standalone
pm2 start ecosystem.config.js
```
